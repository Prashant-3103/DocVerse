// import pinecone, {initialize} from "@/src/pinecone";
// import {getCompletion, getEmbeddings} from "@/src/openAiServices";
// import {connectDB} from "@/src/db";
// import MyFileModel from "@/src/models/myFile";

// export default async function handler(req, res) {

// 	// 1. check for POST call

// 	const {query, id} = req.body

// 	// 2. connect to mongodb
// 	await connectDB()

// 	// 3. query the file by id
// 	const myFile = await MyFileModel.findById(id)

// 	if(!myFile) {
// 		return res.status(400).send({message: 'invalid file id'})
// 	}

// 	// 4. get embeddings for the query
// 	const questionEmb = await getEmbeddings(query)

// 	// 5. initialize pinecone
// 	await initialize()

// 	// 6. connect to index
// 	const index = pinecone.Index(myFile.vectorIndex)

// 	// 7. query the pinecone db
// 	const queryRequest = {
// 		vector: questionEmb,
// 		topK: 5,
// 		includeValues: true,
// 		includeMetadata: true,
// 	};

// 	let result = await index.query({queryRequest})

// 	// 8. get the metadata from the results
// 	let contexts = result['matches'].map(item => item['metadata'].text)

// 	contexts = contexts.join("\n\n---\n\n")

// 	console.log('--contexts--', contexts)

// 	// 9. build the prompt
// 	const promptStart = `Answer the question based on the context below:\n\n`
// 	const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`

// 	const prompt = `${promptStart} ${contexts} ${promptEnd}`

// 	console.log('--prompt--', prompt)

// 	// 10. get the completion from openai
// 	let response = await getCompletion(prompt)

// 	console.log('--completion--', response)

// 	// 11. return the response
// 	res.status(200).json({response})
// }

import pinecone, { initialize } from "@/src/pinecone";
import { getCompletion, getEmbeddings } from "@/src/openAiServices";
import { connectDB } from "@/src/db";
import MyFileModel from "@/src/models/myFile";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(400).json({ message: "HTTP method not allowed" });
    }

    const { query, id } = req.body;

    if (!query || !id) {
      return res.status(400).json({ message: "Query and file ID are required." });
    }

    // Connect to MongoDB
    await connectDB();

    // Find the file by ID
    const myFile = await MyFileModel.findById(id);

    if (!myFile) {
      return res.status(400).json({ message: "Invalid file ID." });
    }

    // Generate embeddings for the query
    const questionEmb = await getEmbeddings(query);

    // Initialize Pinecone
    await initialize();

    // Retrieve the Pinecone index
    const indexName = myFile.vectorIndex;
    const listIndexesResponse = await pinecone.listIndexes();

    if (!Array.isArray(listIndexesResponse.indexes)) {
      throw new Error("Indexes list is not in the expected format");
    }

    const targetIndex = listIndexesResponse.indexes.find((idx) => idx.name === indexName);
    if (!targetIndex) {
      throw new Error(`Index "${indexName}" does not exist.`);
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

    // Extract metadata from the results
    const contexts = result.matches.map((item) => item.metadata.text).join("\n\n---\n\n");

    console.log("--Contexts--", contexts);

    // Build the prompt for completion
    const promptStart = `Answer the question based on the context below:\n\n`;
    const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;

    const prompt = `${promptStart}${contexts}${promptEnd}`;

    console.log("--Prompt--", prompt);

    // Get completion from the OpenAI API
    const response = await getCompletion(prompt);

    console.log("--Completion--", response);

    // Return the response
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error processing the query:", error.message || error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
