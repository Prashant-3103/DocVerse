
import formidable from 'formidable-serverless';
import { connectDB } from '@/src/db';
import MyFileModel from "@/src/models/myFile";
import slugify from 'slugify';
import pinecone, { initialize } from "@/src/pinecone";
import { s3Upload } from "@/src/s3services";
import XLSX from 'xlsx';
import fs from 'fs';
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

// Function to create a Pinecone index
const createIndex = async (indexName) => {
  const response = await pinecone.listIndexes();
  const indexes = response?.indexes || []; // Extract indexes from the response
  if (!indexes.includes(indexName)) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 768, // OpenAI embeddings dimension
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });
    console.log("Index created:", indexName);
  } else {
    console.log(`Index with name ${indexName} already exists`);
  }
};

// Function to process and validate files
const processFile = async (file) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (fileExtension === 'csv') {
    const csvContent = fs.readFileSync(file.path, 'utf-8');
    const rows = csvContent.split('\n').map((row) => row.split(','));
    return rows;
  } else if (['xls', 'xlsx'].includes(fileExtension)) {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return sheet;
  } else if (fileExtension === 'pdf') {
    const pdfDoc = await PDFJS.getDocument(fs.readFileSync(file.path)).promise;
    const numPages = pdfDoc.numPages;
    let content = '';

    for (let i = 0; i < numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const textContent = await page.getTextContent();
      content += textContent.items.map((item) => item.str).join(' ') + '\n';
    }

    return content;
  } else {
    throw new Error('Unsupported file type');
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Parse the incoming form data
    const form = new formidable.IncomingForm();

    form.parse(req, async (error, fields, files) => {
      if (error) {
        console.error("Form parsing error:", error);
        return res.status(500).json({ error: 'Failed to parse form data' });
      }

      const file = files.file;

      // Validate the uploaded file
      if (!file || !file.name || !file.path || !file.type) {
        return res.status(400).json({ error: 'Invalid file data' });
      }

      let processedData;

      try {
        processedData = await processFile(file);
        console.log("File processed successfully:", processedData);
      } catch (processError) {
        console.error("Error processing file:", processError);
        return res.status(400).json({ error: processError.message });
      }

      // Upload the file to S3
      const s3Response = await s3Upload(process.env.S3_BUCKET, file);
      console.log("File uploaded to S3:", s3Response.Location);

      // Initialize Pinecone
      await initialize();

      // Generate a unique index name
      const filenameWithoutExt = file.name.split('.')[0];
      const filenameSlug = slugify(filenameWithoutExt, { lower: true, strict: true });

      // Create a Pinecone index
      await createIndex(filenameSlug);

      // Save file info to MongoDB
      const myFile = new MyFileModel({
        fileName: file.name,
        fileUrl: s3Response.Location,
        vectorIndex: filenameSlug,
        processedData, // Optionally save processed data for debugging
      });

      await myFile.save();

      // Return success response
      return res.status(200).json({
        message: 'File uploaded successfully and index created',
        fileUrl: s3Response.Location,
        indexName: filenameSlug,
      });
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
