const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Configuration
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'uploads.json');

// Ensure storage folders and JSON database exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

// Setup Multer for unrestricted file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(express.static('public'));
app.use('/files', express.static(UPLOADS_DIR));
app.use(express.json());

// API: Get all files
app.get('/api/files', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

// API: Handle file upload
app.post('/api/upload', upload.single('note'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const { subject, semester } = req.body;
    const newData = {
        id: Date.now(),
        originalName: req.file.originalname,
        serverName: req.file.filename,
        subject: subject || "General",
        semester: semester || "N/A",
        date: new Date().toLocaleDateString()
    };

    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.push(newData);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    
    res.redirect('/'); // Refresh page after upload
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});