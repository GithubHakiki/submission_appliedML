// server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { predictImage } from './predict.js';  // Pastikan ini sesuai dengan path dan ekspor dari predict.js
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
global.fetch = fetch;  // Tetap menggunakan fetch untuk TensorFlow.js

const port = 8080;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

app.post('/predict', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            status: 'fail',
            message: 'File tidak ditemukan atau tidak sesuai',
        });
    }

    try {
        const result = await predictImage(req.file);
        const isCancer = result === 'Cancer';

        res.status(200).json({
            status: 'success',
            message: 'Model is predicted successfully',
            data: {
                id: uuidv4(),
                result: isCancer ? 'Cancer' : 'Non-cancer',
                suggestion: isCancer ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.',
                createdAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi',
            error: error.message,
        });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
