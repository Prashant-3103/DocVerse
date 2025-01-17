import AWS from "aws-sdk";
import fs from "fs";

const s3 = new AWS.S3({
	accessKeyId: process.env.MY_AWS_ACCESS_ID,
	secretAccessKey: process.env.MY_AWS_ACCESS_KEY,
	region: process.env.MY_AWS_REGION,
});

export const s3Upload = async (bucket, file) => {
	const params = {
		Bucket: bucket,
		Key: file.name,
		Body: fs.createReadStream(file.path),
	};

	return await s3.upload(params).promise()
}
