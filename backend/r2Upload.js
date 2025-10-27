// r2Upload.js - R2 upload handlers
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const handleGenerateUploadUrl = async (req, res) => {
  const { fileName, contentType } = req.body;

  if (!fileName || !contentType) {
    return res.status(400).json({
      success: false,
      message: "fileName and contentType are required",
    });
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(contentType.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Only PNG, JPG, JPEG, and WEBP files are allowed",
    });
  }

  // Generate unique file key
  const fileExtension = fileName.split(".").pop();
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const fileKey = `uploads/${timestamp}_${uniqueId}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 180 });
  const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileKey}`;

  res.json({
    success: true,
    signedUrl,
    fileKey,
    publicUrl,
    expiresAt: new Date(Date.now() + 180000).toISOString(),
  });
};

const handleVerifyUpload = async (req, res) => {
  const { fileKey } = req.body;

  if (!fileKey) {
    return res.status(400).json({
      success: false,
      message: "fileKey is required",
    });
  }

  const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileKey}`;
  res.json({ success: true, publicUrl });
};

module.exports = {
  handleGenerateUploadUrl,
  handleVerifyUpload,
};
