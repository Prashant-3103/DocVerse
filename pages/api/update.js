
import AWS from "aws-sdk";
import MyFileModel from "@/src/models/myFile";
import { connectDB } from "@/src/db";
import pinecone, { initialize } from "@/src/pinecone";

const s3 = new AWS.S3({
  accessKeyId: process.env.MY_AWS_ACCESS_ID,
  secretAccessKey: process.env.MY_AWS_ACCESS_KEY,
  region: process.env.MY_AWS_REGION,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    await connectDB();
    await initialize();

    const { action, id, newName } = req.body;

    if (!id) {
      return res.status(400).json({ error: "File ID is required." });
    }

    const myFile = await MyFileModel.findById(id);

    if (!myFile) {
      return res.status(404).json({ error: "File not found." });
    }

    if (action === "edit") {
      // Update only the file name in MongoDB
      if (!newName) {
        return res.status(400).json({ error: "New name is required." });
      }

      myFile.fileName = newName;
      await myFile.save();

      return res.status(200).json({ message: "File name updated successfully in the database." });
    } else if (action === "delete") {
      // Delete the entire Pinecone index
      await pinecone.deleteIndex(myFile.vectorIndex);
      console.log("[API] Deleted Pinecone index:", myFile.vectorIndex);

      // Delete from S3
      const s3Params = {
        Bucket: process.env.S3_BUCKET,
        Key: myFile.fileUrl.split("/").pop(), // Extract key from the URL
      };
      await s3.deleteObject(s3Params).promise();
      console.log("[API] Deleted from S3:", myFile.fileUrl);

      // Delete from MongoDB
      await MyFileModel.deleteOne({ _id: id });
      console.log("[API] Deleted from MongoDB:", id);

      return res.status(200).json({ message: "File deleted successfully." });
    } else {
      return res.status(400).json({ error: "Invalid action." });
    }
  } catch (error) {
    console.error("[API] Error:", error.message || error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
