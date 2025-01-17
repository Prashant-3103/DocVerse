// import formidable from "formidable-serverless";
// import { connectDB } from "@/src/db";
// import MyFileModel from "@/src/models/myFile";
// import slugify from "slugify";
// import pinecone, { initialize } from "@/src/pinecone";
// import { s3Upload } from "@/src/s3services";
// import XLSX from "xlsx";
// import fs from "fs";
// import os from "os";
// import path from "path";
// import * as PDFJS from "pdfjs-dist/legacy/build/pdf";
// import fetch from "node-fetch";


// // Set worker source to a public path
// PDFJS.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS.version}/legacy/build/pdf.worker.js`;

// export const config = {
//   api: {
//     bodyParser: false, // Disable default body parsing
//   },
// };

// // Function to create a Pinecone index
// const createIndex = async (indexName) => {
//   const response = await pinecone.listIndexes();
//   const indexes = response?.indexes || [];
//   if (!indexes.includes(indexName)) {
//     await pinecone.createIndex({
//       name: indexName,
//       dimension: 768, // OpenAI embeddings dimension
//       spec: {
//         serverless: {
//           cloud: "aws",
//           region: "us-east-1",
//         },
//       },
//     });
//     console.log("[API] Index created:", indexName);
//   } else {
//     console.log(`[API] Index with name ${indexName} already exists`);
//   }
// };

// // Function to process and validate files
// const processFile = async (filePath, mimeType) => {
//   console.log("[API] Processing file with MIME type:", mimeType);

//   try {
//     if (mimeType === "text/csv") {
//       const csvContent = fs.readFileSync(filePath, "utf-8");
//       const rows = csvContent.split("\n").map((row) => row.split(","));
//       return rows;
//     } else if (
//       ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(mimeType)
//     ) {
//       const workbook = XLSX.readFile(filePath);
//       const sheetName = workbook.SheetNames[0];
//       const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//       return sheet;
//     } else if (mimeType === "application/pdf") {
//       const pdfDoc = await PDFJS.getDocument(fs.readFileSync(filePath)).promise;
//       const numPages = pdfDoc.numPages;
//       let content = "";

//       for (let i = 0; i < numPages; i++) {
//         const page = await pdfDoc.getPage(i + 1);
//         const textContent = await page.getTextContent();
//         content += textContent.items.map((item) => item.str).join(" ") + "\n";
//       }

//       return content;
//     } else {
//       throw new Error("[API] Unsupported file type");
//     }
//   } catch (error) {
//     console.error("[API] Error processing file:", error);
//     throw error;
//   }
// };

// // Function to download file from Google Drive
// const downloadFileFromGoogleDrive = async (googleDriveLink) => {
//   const fileIdMatch = googleDriveLink.match(/[-\w]{25,}/);
//   const fileId = fileIdMatch ? fileIdMatch[0] : null;

//   if (!fileId) {
//     throw new Error("Invalid Google Drive link");
//   }

//   const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${process.env.MY_GOOGLE_API_KEY}&fields=name,mimeType`;
//   const metadataResponse = await fetch(metadataUrl);
//   const metadata = await metadataResponse.json();

//   if (!metadata || !metadata.mimeType) {
//     throw new Error("Unable to fetch file metadata from Google Drive");
//   }

//   const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${process.env.MY_GOOGLE_API_KEY}`;
//   const response = await fetch(downloadUrl);

//   if (!response.ok) {
//     throw new Error("Failed to download file from Google Drive");
//   }

//   const buffer = await response.buffer();
//   const tempPath = path.join(os.tmpdir(), metadata.name);

//   fs.writeFileSync(tempPath, buffer);
//   return { tempPath, mimeType: metadata.mimeType, name: metadata.name };
// };

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     console.log("[API] Connecting to MongoDB...");
//     await connectDB();
//     console.log("[API] MongoDB connected");

//     const form = new formidable.IncomingForm();

//     form.parse(req, async (error, fields, files) => {
//       if (error) {
//         console.error("[API] Form parsing error:", error);
//         return res.status(500).json({ error: "Failed to parse form data" });
//       }

//       console.log("[API] Fields:", fields);
//       console.log("[API] Files:", files);

//       const { driveLink } = fields;
//       let filePath, mimeType, fileName, processedData;

//       if (driveLink) {
//         try {
//           console.log("[API] Processing Google Drive link...");
//           const downloadResult = await downloadFileFromGoogleDrive(driveLink);
//           filePath = downloadResult.tempPath;
//           mimeType = downloadResult.mimeType;
//           fileName = downloadResult.name;

//           processedData = await processFile(filePath, mimeType);

//           console.log("[API] File processed successfully from Google Drive:", processedData);
//         } catch (error) {
//           console.error("[API] Error processing Google Drive link:", error);
//           return res.status(400).json({ error: error.message });
//         }
//       } else {
//         const uploadedFile = files.file;

//         if (!uploadedFile || !uploadedFile.name || !uploadedFile.path || !uploadedFile.type) {
//           console.error("[API] Invalid file data");
//           return res.status(400).json({ error: "Invalid file data" });
//         }

//         filePath = uploadedFile.path;
//         mimeType = uploadedFile.type;
//         fileName = uploadedFile.name;

//         try {
//           processedData = await processFile(filePath, mimeType);
//           console.log("[API] File processed successfully:", processedData);
//         } catch (error) {
//           console.error("[API] Error processing uploaded file:", error);
//           return res.status(400).json({ error: error.message });
//         }
//       }

//       try {
//         const s3Response = await s3Upload(process.env.S3_BUCKET, {
//           path: filePath,
//           name: fileName,
//         });

//         console.log("[API] File uploaded to S3:", s3Response.Location);

//         await initialize();
//         console.log("[API] Pinecone initialized");

//         const filenameSlug = slugify(fileName.split(".")[0], { lower: true, strict: true });

//         await createIndex(filenameSlug);

//         const myFile = new MyFileModel({
//           fileName,
//           fileUrl: s3Response.Location,
//           vectorIndex: filenameSlug,
//           processedData,
//         });

//         await myFile.save();

//         if (driveLink) {
//           fs.unlinkSync(filePath);
//           console.log("[API] Temporary file deleted:", filePath);
//         }

//         return res.status(200).json({
//           message: "File uploaded successfully and index created",
//           fileUrl: s3Response.Location,
//           indexName: filenameSlug,
//         });
//       } catch (uploadError) {
//         console.error("[API] Error uploading file or creating index:", uploadError);
//         return res.status(500).json({ error: uploadError.message });
//       }
//     });
//   } catch (error) {
//     console.error("[API] Internal server error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }
import formidable from "formidable-serverless";
import { connectDB } from "@/src/db";
import MyFileModel from "@/src/models/myFile";
import slugify from "slugify";
import pinecone, { initialize } from "@/src/pinecone";
import { s3Upload } from "@/src/s3services";
import XLSX from "xlsx";
import fs from "fs";
import os from "os";
import path from "path";
import pdfParse from "pdf-parse";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

// Function to create a Pinecone index
const createIndex = async (indexName) => {
  const response = await pinecone.listIndexes();
  const indexes = response?.indexes || [];
  if (!indexes.includes(indexName)) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 768, // OpenAI embeddings dimension
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    console.log("[API] Index created:", indexName);
  } else {
    console.log(`[API] Index with name ${indexName} already exists`);
  }
};

// Function to process and validate files
const processFile = async (filePath, mimeType) => {
  console.log("[API] Processing file with MIME type:", mimeType);

  try {
    if (mimeType === "text/csv") {
      const csvContent = fs.readFileSync(filePath, "utf-8");
      const rows = csvContent.split("\n").map((row) => row.split(","));
      return rows;
    } else if (
      ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(mimeType)
    ) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      return sheet;
    } else if (mimeType === "application/pdf") {
      const pdfBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(pdfBuffer);
      return data.text;
    } else {
      throw new Error("[API] Unsupported file type");
    }
  } catch (error) {
    console.error("[API] Error processing file:", error);
    throw error;
  }
};

// Function to download file from Google Drive
const downloadFileFromGoogleDrive = async (googleDriveLink) => {
  const fileIdMatch = googleDriveLink.match(/[-\w]{25,}/);
  const fileId = fileIdMatch ? fileIdMatch[0] : null;

  if (!fileId) {
    throw new Error("Invalid Google Drive link");
  }

  const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${process.env.MY_GOOGLE_API_KEY}&fields=name,mimeType`;
  const metadataResponse = await fetch(metadataUrl);
  const metadata = await metadataResponse.json();

  if (!metadata || !metadata.mimeType) {
    throw new Error("Unable to fetch file metadata from Google Drive");
  }

  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${process.env.MY_GOOGLE_API_KEY}`;
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error("Failed to download file from Google Drive");
  }

  const buffer = await response.buffer();
  const tempPath = path.join(os.tmpdir(), metadata.name);

  fs.writeFileSync(tempPath, buffer);
  return { tempPath, mimeType: metadata.mimeType, name: metadata.name };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("[API] Connecting to MongoDB...");
    await connectDB();
    console.log("[API] MongoDB connected");

    const form = new formidable.IncomingForm();

    form.parse(req, async (error, fields, files) => {
      if (error) {
        console.error("[API] Form parsing error:", error);
        return res.status(500).json({ error: "Failed to parse form data" });
      }

      console.log("[API] Fields:", fields);
      console.log("[API] Files:", files);

      const { driveLink } = fields;
      let filePath, mimeType, fileName, processedData;

      if (driveLink) {
        try {
          console.log("[API] Processing Google Drive link...");
          const downloadResult = await downloadFileFromGoogleDrive(driveLink);
          filePath = downloadResult.tempPath;
          mimeType = downloadResult.mimeType;
          fileName = downloadResult.name;

          processedData = await processFile(filePath, mimeType);

          console.log("[API] File processed successfully from Google Drive:", processedData);
        } catch (error) {
          console.error("[API] Error processing Google Drive link:", error);
          return res.status(400).json({ error: error.message });
        }
      } else {
        const uploadedFile = files.file;

        if (!uploadedFile || !uploadedFile.name || !uploadedFile.path || !uploadedFile.type) {
          console.error("[API] Invalid file data");
          return res.status(400).json({ error: "Invalid file data" });
        }

        filePath = uploadedFile.path;
        mimeType = uploadedFile.type;
        fileName = uploadedFile.name;

        try {
          processedData = await processFile(filePath, mimeType);
          console.log("[API] File processed successfully:", processedData);
        } catch (error) {
          console.error("[API] Error processing uploaded file:", error);
          return res.status(400).json({ error: error.message });
        }
      }

      try {
        const s3Response = await s3Upload(process.env.S3_BUCKET, {
          path: filePath,
          name: fileName,
        });

        console.log("[API] File uploaded to S3:", s3Response.Location);

        await initialize();
        console.log("[API] Pinecone initialized");

        const filenameSlug = slugify(fileName.split(".")[0], { lower: true, strict: true });

        await createIndex(filenameSlug);

        const myFile = new MyFileModel({
          fileName,
          fileUrl: s3Response.Location,
          vectorIndex: filenameSlug,
          processedData,
        });

        await myFile.save();

        if (driveLink) {
          fs.unlinkSync(filePath);
          console.log("[API] Temporary file deleted:", filePath);
        }

        return res.status(200).json({
          message: "File uploaded successfully and index created",
          fileUrl: s3Response.Location,
          indexName: filenameSlug,
        });
      } catch (uploadError) {
        console.error("[API] Error uploading file or creating index:", uploadError);
        return res.status(500).json({ error: uploadError.message });
      }
    });
  } catch (error) {
    console.error("[API] Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
