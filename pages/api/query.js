

import pinecone, { initialize } from "@/src/pinecone";
import { getCompletion, getEmbeddings } from "@/src/openAiServices";
import { connectDB } from "@/src/db";
import MyFileModel from "@/src/models/myFile";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(400).json({ message: "HTTP method not allowed" });
    }

    const { query, ids } = req.body;

    if (!query || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Query and file IDs are required." });
    }

    console.log("Received query:", query);
    console.log("Received file IDs:", ids);

    // Connect to MongoDB
    await connectDB();

    // Find files by IDs
    const files = await MyFileModel.find({ _id: { $in: ids } });

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Invalid file IDs." });
    }

    console.log("Found files:", files.map((file) => file.fileName));

    // Generate embeddings for the query
    const questionEmb = await getEmbeddings(query);
    console.log("Generated query embeddings.");

    // Initialize Pinecone
    await initialize();
    console.log("Initialized Pinecone.");

    let allContexts = "";

    for (const file of files) {
      try {
        console.log(`Querying Pinecone index for file: ${file.fileName}, ID: ${file._id}`);

        const indexName = file.vectorIndex;

        const listIndexesResponse = await pinecone.listIndexes();
        if (!Array.isArray(listIndexesResponse.indexes)) {
          throw new Error("Indexes list is not in the expected format");
        }

        const targetIndex = listIndexesResponse.indexes.find((idx) => idx.name === indexName);
        if (!targetIndex) {
          throw new Error(`Index \"${indexName}\" does not exist.`);
        }

        const indexHost = targetIndex.host;
        const index = pinecone.index(indexName, indexHost);

        // Perform the query
        const queryParams = {
          vector: questionEmb,
          topK: 5,
          includeValues: true,
          includeMetadata: true,
        };

        console.log("Querying with parameters:", queryParams);

        const result = await index.query(queryParams);

        if (result.matches.length > 0) {
          const contexts = result.matches.map((item) => item.metadata.text).join("\n\n---\n\n");
          allContexts += `\n\n### Context from ${file.fileName} ###\n\n${contexts}`;
          console.log(`Context added for file: ${file.fileName}`);
        } else {
          console.warn(`No matches found for file: ${file.fileName}`);
        }
      } catch (error) {
        console.error(`Error querying file: ${file.fileName}`, error.message || error);
      }
    }

    if (!allContexts) {
      return res.status(400).json({ message: "No relevant context found in the provided files." });
    }

    // Build the prompt for completion
    const promptStart = `Answer the question based on the context below:\n\n`;
    const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;

    const prompt = `${promptStart}${allContexts}${promptEnd}`;

    console.log("Generated prompt:", prompt);

    // Get completion from the OpenAI API
    const response = await getCompletion(prompt);

    console.log("Generated completion response:", response);

    // Return the response
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error processing the query:", error.message || error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
