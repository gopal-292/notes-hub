const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();

// 1. YOUR CLOUDINARY KEYS (Paste them here)
cloudinary.config({
  cloud_name: 'INSERT_CLOUD_NAME_HERE',
  api_key: 'INSERT_API_KEY_HERE',
  api_secret: 'INSERT_API_SECRET_HERE'
});

// 2. SETUP CLOUD STORAGE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'exam_notes',
    resource_type: 'auto' // Important: This allows PDFs and Docs
  },
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());

// 3. API: FETCH FILES FROM THE CLOUD
app.get('/api/files', async (req, res) => {
    try {
        // This asks Cloudinary for all files in your folder
        const { resources } = await cloudinary.search
            .expression('folder:exam_notes')
            .execute();
        
        const files = resources.map(file => ({
            originalName: file.public_id.split('/').pop(),
            serverName: file.secure_url, // This is the web link to the file
            date: new Date(file.created_at).toLocaleDateString()
        }));
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch files" });
    }
});

// 4. API: UPLOAD TO CLOUD
app.post('/api/upload', upload.single('note'), (req, res) => {
    res.redirect('/');
});

module.exports = app;
