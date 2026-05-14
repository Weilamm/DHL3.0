const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
app.use(cors());
// Custom JSON parser to handle bad control characters (e.g. from RPA logs)
app.use(express.text({ type: 'application/json', limit: '50mb' }));
app.use((req, res, next) => {
    if (req.is('json') && typeof req.body === 'string') {
        try {
            const sanitizedData = req.body.replace(/"(?:[^"\\]|\\.)*"/g, function(match) {
                return match
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t')
                    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
            });
            req.body = JSON.parse(sanitizedData);
        } catch (err) {
            console.error('Failed to parse JSON:', err.message);
            return res.status(400).json({ error: 'Invalid JSON payload' });
        }
    } else if (req.is('json') && Object.keys(req.body).length === 0 && typeof req.body !== 'object') {
        req.body = {};
    }
    next();
});
const upload = multer({ storage: multer.memoryStorage() });

const DB_FILE = path.join(__dirname, 'articles.json');

// Helper to read DB
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Simple hash generator for duplicate detection
const generateHash = (text) => {
    return crypto.createHash('sha256').update(text || '').digest('hex');
};

// AI Simulation Removed
// ---- ENDPOINTS ----

// POST /api/login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Mock login logic
    if (username === 'admin' && password === 'admin') {
        return res.json({ token: 'mock-jwt-admin', role: 'Admin', username });
    } else if (username === 'editor' && password === 'editor') {
        return res.json({ token: 'mock-jwt-editor', role: 'Editor', username });
    } else if (username === 'reviewer' && password === 'reviewer') {
        return res.json({ token: 'mock-jwt-reviewer', role: 'Reviewer', username });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
});

// GET /api/articles
app.get('/api/articles', (req, res) => {
    const articles = readDB();
    res.json(articles);
});

// POST /api/upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const { creator } = req.body;
        const file = req.file;

        if (!file && !req.body.rawText) {
            return res.status(400).json({ error: 'Either file or rawText is required' });
        }

        let rawText = req.body.rawText || '';

        // Extract text if a file is uploaded
        if (file) {
            const ext = path.extname(file.originalname).toLowerCase();
            if (ext === '.pdf') {
                const pdfData = await pdfParse(file.buffer);
                rawText = pdfData.text;
            } else if (ext === '.docx') {
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                rawText = result.value;
            } else if (ext === '.txt') {
                rawText = file.buffer.toString('utf8');
            } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
                rawText = `[Image data extracted from ${file.originalname}]\n\n*Simulated OCR content for UI visualization...*`;
            } else {
                return res.status(400).json({ error: 'Unsupported file type' });
            }
        }

        // Generate Hash
        const textHash = generateHash(rawText);

        const articles = readDB();
        
        // 14-day recency check
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const isDuplicate = articles.some(a => 
            a.textHash === textHash && new Date(a.createdAt) > fourteenDaysAgo
        );

        if (isDuplicate) {
            return res.status(409).json({ error: 'Duplicate content detected within the last 14 days.' });
        }

        // Title Extraction
        const words = rawText.split(' ').length;
        let title = rawText.split(' ').slice(0, 5).join(' ') + (words > 5 ? '...' : '');

        // Conflict detection (same title)
        const hasConflict = articles.some(a => a.title.toLowerCase() === title.toLowerCase());
        if (hasConflict) {
            title += ' (Copy)';
        }

        const newArticle = {
            id: uuidv4(),
            title: title,
            rawText,
            textHash,
            summary: rawText,
            status: 'draft',
            creator: creator || 'System',
            sourceFile: file ? file.originalname : null,
            createdAt: new Date().toISOString(),
            version: 1,
            history: [{
                version: 1,
                updatedAt: new Date().toISOString(),
                changes: 'Initial creation via upload'
            }]
        };

        articles.push(newArticle);
        writeDB(articles);

        res.status(201).json(newArticle);
    } catch (err) {
        console.error('Upload processing error:', err);
        res.status(500).json({ error: 'Processing failure' });
    }
});

// POST /api/articles
app.post('/api/articles', (req, res) => {
    console.log('\n--- NEW REQUEST RECEIVED ---');
    console.log('Headers:', req.headers['content-type']);
    console.log('Body:', req.body);
    
    // Map RPA JSON format to our internal variables, falling back to older format if used
    const rawText = req.body.message || req.body.rawText;
    const creator = req.body.robotName || req.body.creator || 'System';
    
    if (!rawText) return res.status(400).json({ error: 'message or rawText is required in the payload' });

    const articles = readDB();
    const textHash = generateHash(rawText);

    // 14-day recency check
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const isDuplicate = articles.some(a => a.textHash === textHash && new Date(a.createdAt) > fourteenDaysAgo);

    // Title Extraction
    const words = rawText.split(' ').length;
    let title = rawText.split(' ').slice(0, 5).join(' ') + (words > 5 ? '...' : '');

    if (isDuplicate) {
        title = "[DUPLICATE] " + title;
    }

        // Conflict detection (same title)
        const hasConflict = articles.some(a => a.title.toLowerCase() === title.toLowerCase());
        if (hasConflict) {
            title += ' (Copy)';
        }

        // Capture RPA specific metadata dynamically
        const { message, rawText: ignoredRaw, robotName, creator: ignoredCreator, ...otherMetadata } = req.body;
        const rpaMetadata = Object.keys(otherMetadata).length > 0 ? otherMetadata : null;

        const newArticle = {
            id: uuidv4(),
            title: title,
            rawText,
            textHash,
            summary: rawText,
            status: 'draft',
            creator: creator,
            tags: req.body.tags || [],
            steps: req.body.steps || [],
            rpaMetadata: rpaMetadata,
            createdAt: new Date().toISOString(),
            version: 1,
            history: [{
                version: 1,
                updatedAt: new Date().toISOString(),
                changes: 'Initial creation via RPA'
            }]
        };

    articles.push(newArticle);
    writeDB(articles);

    res.status(201).json(newArticle);
});

// PUT /api/articles/:id
app.put('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    const { title, summary, steps, tags, status } = req.body;
    
    let articles = readDB();
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Article not found' });

    const article = articles[index];
    const newVersion = article.version + 1;

    // Update article fields
    const updatedArticle = {
        ...article,
        title: title || article.title,
        summary: summary || article.summary,
        status: status || article.status,
        tags: tags || article.tags || [],
        steps: steps || article.steps || [],
        version: newVersion,
        history: [
            ...article.history,
            {
                version: newVersion,
                updatedAt: new Date().toISOString(),
                changes: 'Article details updated'
            }
        ]
    };

    articles[index] = updatedArticle;
    writeDB(articles);

    res.json(updatedArticle);
});

// PATCH /api/articles/:id/status
app.patch('/api/articles/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // draft, reviewed, published

    if (!['draft', 'reviewed', 'published'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    let articles = readDB();
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Article not found' });

    const article = articles[index];
    article.status = status;
    article.history.push({
        version: article.version, // Status change doesn't increment content version in this simple design
        updatedAt: new Date().toISOString(),
        changes: `Status changed to ${status}`
    });

    articles[index] = article;
    writeDB(articles);

    res.json(article);
});

// DELETE /api/articles/:id
app.delete('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    let articles = readDB();
    const newArticles = articles.filter(a => a.id !== id);
    
    if (articles.length === newArticles.length) {
        return res.status(404).json({ error: 'Article not found' });
    }

    writeDB(newArticles);
    res.status(204).send();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
