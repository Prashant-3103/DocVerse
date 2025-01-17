
const { Pinecone } = require('@pinecone-database/pinecone');
const apiKey = process.env.MY_PDB_KEY
const pinecone = new Pinecone({
  apiKey: apiKey,
});

export const initialize = async () => {
  try {
    if (!pinecone) {
      throw new Error("Pinecone client initialization failed. Please check your API key.");
    }

    console.log("Pinecone initialized successfully!");
  } catch (error) {
    console.error("Error initializing Pinecone:", error.message || error);
    throw error;
  }
};

export default pinecone;
