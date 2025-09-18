// Steganography.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const extractChunks = require('png-chunks-extract');
const encodeChunks = require('png-chunks-encode');
const textChunk = require('png-chunk-text');
// import .env variables
require('dotenv').config();


const UPLOADS_DIR = path.join(__dirname, 'uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
}

function saveDecodedImage(base64Str, filename) {
  const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
}

async function encodeImage(req, res) {
  const { mainImageBase64, secretImageBase64 } = req.body;

  const mainImageBuffer = Buffer.from(
    mainImageBase64.replace(/^data:image\/png;base64,/, ''),
    'base64'
  );

  const chunks = extractChunks(mainImageBuffer);
  const secretChunk = textChunk.encode('secret', secretImageBase64);
  chunks.splice(-1, 0, secretChunk);

  const encodedBuffer = Buffer.from(encodeChunks(chunks));
  const tempFile = path.join(UPLOADS_DIR, `temp_encoded_${Date.now()}.png`);
  fs.writeFileSync(tempFile, encodedBuffer);

  try {
    const formData = new FormData();
    formData.append('source', fs.createReadStream(tempFile));

    const response = await axios.post('https://im.ge/api/1/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-API-Key': process.env.IMAGE_API_KEY,
      },
    });

    fs.unlinkSync(tempFile);
    const uploadedUrl = response.data?.image?.url;
    console.log('📤 Uploaded to im.ge:', uploadedUrl);

    res.json({ success: true, uploadedUrl });
  } catch (err) {
    console.error('Upload failed:', err.message);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

async function decodeFromImageUrl(req, res) {
  const { imageUrl } = req.body;

  if (!imageUrl) return res.status(400).json({ error: 'No image URL provided' });

  try {
    // const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const https = require('https');

      const agent = new https.Agent({ rejectUnauthorized: false }); // 👈 only skip cert check here

      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        httpsAgent: agent,
    });

    const buffer = Buffer.from(response.data);

    const encodedFilename = `downloaded_encoded_${Date.now()}.png`;
    const encodedPath = path.join(UPLOADS_DIR, encodedFilename);
    fs.writeFileSync(encodedPath, buffer);

    const chunks = extractChunks(buffer);
    const secretChunk = chunks.find((c) => c.name === 'tEXt');

    if (!secretChunk) {
      console.error('❌ No hidden image found');
      return res.status(400).json({ error: 'No hidden image found' });
    }

    const decoded = textChunk.decode(secretChunk);
    const decodedFilename = `decoded_${Date.now()}.png`;
    saveDecodedImage(decoded.text, decodedFilename);

    console.log('✅ Decoded image saved as:', decodedFilename);

    res.json({
      success: true,
      savedEncoded: `/uploads/${encodedFilename}`,
      decodedFile: `/uploads/${decodedFilename}`,
    });
  } catch (err) {
    console.error('Decode failed:', err.message);
    res.status(500).json({ error: 'Failed to decode from URL' });
  }
}

module.exports = {
  encodeImage,
  decodeFromImageUrl,
  ensureUploadsDir,
};
