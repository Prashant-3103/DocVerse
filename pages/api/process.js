
import * as PDFJS from "pdfjs-dist/legacy/build/pdf";
import MyFileModel from "@/src/models/myFile";
import { connectDB } from "@/src/db";
import { getEmbeddings } from "@/src/openAiServices";
import pinecone, { initialize } from "@/src/pinecone";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(400).json({ message: "HTTP method not allowed" });
  }

  try {
    await connectDB();

    const { id } = req.body;

    const myFile = await MyFileModel.findById(id);

    if (!myFile) {
      return res.status(400).json({ message: "File not found" });
    }

    if (myFile.isProcessed) {
      return res.status(400).json({ message: "File is already processed" });
    }

    let vectors = [];

    const myFileData = await fetch(myFile.fileUrl);

    if (myFileData.ok) {
      const pdfDoc = await PDFJS.getDocument(await myFileData.arrayBuffer()).promise;
      const numPages = pdfDoc.numPages;

      for (let i = 0; i < numPages; i++) {
        const page = await pdfDoc.getPage(i + 1);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join("");

        const embedding = await getEmbeddings(text);

        vectors.push({
          id: `page${i + 1}`,
          values: embedding,
          metadata: {
            pageNum: i + 1,
            text,
          },
        });
      }

     
      await initialize();

      const indexName = myFile.vectorIndex;
      const listIndexesResponse = await pinecone.listIndexes();

      // Ensure `listIndexesResponse.indexes` is an array
      if (!Array.isArray(listIndexesResponse.indexes)) {
        throw new Error("Indexes list is not in the expected format");
      }

      // Extract the names of the indexes
      const indexNames = listIndexesResponse.indexes.map((item) => item.name);

      // Validate if the target index exists
      console.log("Available indexes:", indexNames);
      if (!indexNames.includes(indexName)) {
        throw new Error(`Index \"${indexName}\" does not exist`);
      }

      const targetIndex = listIndexesResponse.indexes.find((idx) => idx.name === indexName);
      const indexHost = targetIndex.host;

      if (!indexHost) {
        throw new Error(`Index host for \"${indexName}\" not found`);
      }

      const index = pinecone.index(indexName, indexHost);

      console.log("Preparing to upsert vectors:", JSON.stringify(vectors, null, 2));

      // Validate vectors format
      if (!Array.isArray(vectors) || vectors.length === 0) {
        throw new Error("Vectors array is invalid or empty");
      }

      vectors.forEach((vector, idx) => {
        console.log(`Vector ${idx} length: ${vector.values.length}`);
        if (!vector.id || !Array.isArray(vector.values) || vector.values.length === 0) {
          console.error(`Invalid vector at index ${idx}:`, JSON.stringify(vector, null, 2));
          throw new Error("Each vector must have a valid id and non-empty values array.");
        }
        if (vector.values.length !== 768) {
          throw new Error(`Vector ${idx} dimension mismatch: expected 768, got ${vector.values.length}`);
        }
      });

      // Perform the upsert
      try {
        await index.upsert(vectors);
        console.log("Upsert successful");
      } catch (upsertError) {
        console.error("Upsert failed:", upsertError.message || upsertError);
        throw upsertError;
      }

      myFile.isProcessed = true;
      await myFile.save();

      return res.status(200).json({ message: "File processed successfully" });
    } else {
      return res.status(500).json({ message: "Error getting file contents" });
    }
  } catch (error) {
    console.error("Error processing the file:", error.message || error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

