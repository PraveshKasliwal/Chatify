const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const Message = require("../models/Message");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

exports.uploadBase64ImageMessage = async (req, res) => {
  try {
    const { base64Image, senderId, chatId } = req.body;

    if (!base64Image || !senderId || !chatId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const type = base64Image.split(";")[0].split("/")[1];
    const fileName = `chat-images/${uuidv4()}.${type}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    const uploadResult = await s3.upload(params).promise();
    // console.log("Image uploaded to S3:", uploadResult.Location);
    const newMessage = new Message({
      text: uploadResult.Location, // the S3 URL
      senderId,
      chatId,
      type: "image",
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
};