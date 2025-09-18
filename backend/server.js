// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { encodeImage, decodeFromImageUrl, ensureUploadsDir } = require('./Steganography');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));

ensureUploadsDir();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/encode', encodeImage);
app.post('/decodeFromUrl', decodeFromImageUrl);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
