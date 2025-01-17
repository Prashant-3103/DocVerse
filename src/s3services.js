// import AWS from "aws-sdk";
// import fs from "fs";

// const s3 = new AWS.S3({
// 	accessKeyId: process.env.MY_AWS_ACCESS_ID,
// 	secretAccessKey: process.env.MY_AWS_ACCESS_KEY,
// 	region: process.env.MY_AWS_REGION,
// });

// export const s3Upload = async (bucket, file) => {
// 	const params = {
// 		Bucket: bucket,
// 		Key: file.name,
// 		Body: fs.createReadStream(file.path),
// 	};

// 	return await s3.upload(params).promise()
// }
import AWS from "aws-sdk";
import fs from "fs";

const s3 = new AWS.S3({
  accessKeyId: process.env.MY_AWS_ACCESS_ID,
  secretAccessKey: process.env.MY_AWS_ACCESS_KEY,
  region: process.env.MY_AWS_REGION,
});

// Upload file to S3
export const s3Upload = async (bucket, file) => {
  const params = {
    Bucket: bucket,
    Key: file.name,
    Body: fs.createReadStream(file.path),
  };

  return await s3.upload(params).promise();
};

// Generate a signed URL for secure access
export const getSignedUrl = async (bucket, key, expiresIn = 900) => {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expiresIn, // URL expiration time in seconds (default: 15 minutes)
    };
    return s3.getSignedUrlPromise("getObject", params);
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
};
