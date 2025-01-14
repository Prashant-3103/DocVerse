
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);

// Function to generate embeddings
export const getEmbeddings = async (text) => {
    try {
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      return embedding;

    } catch (error) {
      console.error("Error generating embeddings:", error.message || error);
      throw error;
    }
  };

  // Function to generate a completion
  export const getCompletion = async (prompt) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const chat = model.startChat({
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      // Return the completion text
      return text;
    } catch (error) {
      console.error("Error generating completion:", error.message || error);
      throw error;
    }
  };

  export default genAI;
