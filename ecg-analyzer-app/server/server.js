// server/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// ============================================================================
// CONFIGURATION
// ============================================================================
const APNEA_URL = 'https://merry-ewe-endlessly.ngrok-free.app';  // ✅ Removed trailing slash
const DIABETES_URL = 'https://seaworthy-superadequate-rebekah.ngrok-free.dev';

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

// Multer configuration
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        apnea_url: APNEA_URL,
        diabetes_url: DIABETES_URL
    });
});

// ============================================================================
// PREDICT ENDPOINT
// ============================================================================
app.post('/api/predict', upload.array('files'), async (req, res) => {
    const startTime = Date.now();
    
    try {
        // 1. Validate model type
        const { modelType } = req.query;
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📥 NEW REQUEST - Model: ${modelType}`);
        console.log(`${'='.repeat(60)}`);
        
        let targetUrl = '';
        if (modelType === 'apnea') targetUrl = APNEA_URL;
        else if (modelType === 'diabetes') targetUrl = DIABETES_URL;
        else {
            console.error('❌ Invalid model type:', modelType);
            return res.status(400).json({ 
                success: false,
                error: "Invalid model type. Use 'apnea' or 'diabetes'" 
            });
        }

        // 2. Validate files
        if (!req.files || req.files.length === 0) {
            console.error('❌ No files uploaded');
            return res.status(400).json({ 
                success: false,
                error: "Please upload both .hea and .dat files." 
            });
        }

        console.log(`📂 Received ${req.files.length} files:`);
        req.files.forEach(f => console.log(`   - ${f.originalname} (${f.size} bytes)`));

        // 3. Prepare FormData
        const formData = new FormData();
        req.files.forEach((file) => {
            formData.append('files', fs.createReadStream(file.path), file.originalname);
        });

        // 4. Forward to Kaggle/Ngrok
        console.log(`🚀 Forwarding to: ${targetUrl}/predict`);
        
        const response = await axios.post(`${targetUrl}/predict`, formData, {
            headers: {
                ...formData.getHeaders(),
                'ngrok-skip-browser-warning': 'true'
            },
            timeout: 30000, // 30 second timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const duration = Date.now() - startTime;
        console.log(`✅ Request successful (${duration}ms)`);
        console.log(`📊 Response:`, JSON.stringify(response.data, null, 2));

        res.json(response.data);

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`\n❌ ERROR (${duration}ms):`);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('   Connection refused - Is Kaggle notebook running?');
            console.error(`   Target URL: ${error.config?.url}`);
            return res.status(503).json({ 
                success: false,
                error: 'Kaggle model server is not running. Please check the notebook.' 
            });
        }
        
        if (error.code === 'ETIMEDOUT') {
            console.error('   Request timeout - Kaggle might be processing');
            return res.status(504).json({ 
                success: false,
                error: 'Request timeout. The model is taking too long to respond.' 
            });
        }

        if (error.response) {
            // Kaggle responded with error
            console.error('   Kaggle Error Status:', error.response.status);
            console.error('   Kaggle Error Data:', error.response.data);
            return res.status(error.response.status).json({ 
                success: false,
                error: error.response.data?.error || 'Model inference failed',
                details: error.response.data
            });
        }

        // Unknown error
        console.error('   Unknown Error:', error.message);
        console.error('   Stack:', error.stack);
        res.status(500).json({ 
            success: false,
            error: `Server error: ${error.message}` 
        });

    } finally {
        // Cleanup uploaded files
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️  Cleaned up: ${file.originalname}`);
                } catch (err) {
                    console.error(`⚠️  Failed to delete: ${file.originalname}`);
                }
            });
        }
    }
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
app.use((err, req, res, next) => {
    console.error('💥 Unhandled Error:', err);
    res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: err.message 
    });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 PROXY SERVER STARTED');
    console.log('='.repeat(60));
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Apnea URL: ${APNEA_URL}`);
    console.log(`🔗 Diabetes URL: ${DIABETES_URL}`);
    console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠️  Shutting down gracefully...');
    process.exit(0);
});