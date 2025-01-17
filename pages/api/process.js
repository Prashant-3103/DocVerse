
import pdfParse from "pdf-parse";
import XLSX from "xlsx";
import MyFileModel from "@/src/models/myFile";
import { connectDB } from "@/src/db";
import { getEmbeddings } from "@/src/openAiServices";
import pinecone, { initialize } from "@/src/pinecone";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "HTTP method not allowed" });
  }

  try {
    await connectDB();

    const { ids } = req.body; // Expecting multiple file IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "File IDs are required." });
    }

    // Initialize Pinecone
    await initialize();

    const results = [];

    for (const id of ids) {
      const myFile = await MyFileModel.findById(id);

      if (!myFile) {
        results.push({ fileId: id, status: "error", message: "File not found" });
        continue;
      }

      if (myFile.isProcessed) {
        results.push({ fileId: id, status: "error", message: "File is already processed" });
        continue;
      }

      try {
        // Fetch file data from S3
        const myFileData = await fetch(myFile.fileUrl);

        if (!myFileData.ok) {
          throw new Error("Error fetching file data");
        }

        const fileUrl = myFile.fileUrl;
        const fileExtension = fileUrl.split(".").pop().toLowerCase();

        let content = "";

        // Process content based on file type
        if (fileExtension === "pdf") {
          const buffer = await myFileData.arrayBuffer();
          const pdfData = await pdfParse(Buffer.from(buffer));
          content = pdfData.text;
        } else if (fileExtension === "csv") {
          const csvContent = await myFileData.text();
          const rows = csvContent.split("\n").map((row) => row.split(","));
          content = rows.map((row) => row.join(" ")).join(" \n");
        } else if (["xls", "xlsx"].includes(fileExtension)) {
          const buffer = await myFileData.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
          content = sheet.map((row) => row.join(" ")).join(" \n");
        } else {
          throw new Error("Unsupported file type");
        }

        if (!content.trim()) {
          throw new Error("File content is empty or invalid");
        }

        console.log(`Extracted content for file: ${myFile.fileName}`);

        // Generate embeddings
        const embedding = await getEmbeddings(content);

        // Upsert to Pinecone
        const indexName = myFile.vectorIndex;
        const index = pinecone.Index(indexName);
        await index.upsert([{ id: id.toString(), values: embedding, metadata: { text: content } }]);

        // Update database
        myFile.isProcessed = true;
        await myFile.save();

        results.push({ fileId: id, status: "processed" });
      } catch (error) {
        console.error(`Error processing file: ${myFile.fileName}`, error);
        results.push({ fileId: id, status: "error", message: error.message });
      }
    }

    res.status(200).json({ message: "File processing completed", results });
  } catch (error) {
    console.error("Error processing files:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
}
