const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

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

// Simulated AI Processing Function
const generateAIContent = (rawText) => {
    // A simple mock simulation
    const words = rawText.split(' ').length;
    const title = rawText.split(' ').slice(0, 5).join(' ') + (words > 5 ? '...' : '');
    const summary = `Generated summary for text with ${words} words. The content revolves around standard knowledge base topics.`;
    
    // Simulate some steps
    const steps = [
        "Review the initial concept.",
        "Identify key action items.",
        "Implement necessary changes.",
        "Verify results."
    ];
    
    // Simulate tags based on text length or random keywords
    const potentialTags = ['Documentation', 'Setup', 'Guide', 'Troubleshooting', 'Overview'];
    const tags = potentialTags.sort(() => 0.5 - Math.random()).slice(0, 2);

    return { title, summary, steps, tags };
};

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

// POST /api/articles
app.post('/api/articles', (req, res) => {
    const { rawText, creator } = req.body;
    if (!rawText) return res.status(400).json({ error: 'rawText is required' });

    const articles = readDB();
    const textHash = generateHash(rawText);

    // Duplicate detection
    const isDuplicate = articles.some(a => a.textHash === textHash);
    if (isDuplicate) {
        return res.status(409).json({ error: 'Duplicate content detected.' });
    }

    // AI Generation
    const aiData = generateAIContent(rawText);

    // Conflict detection (same title)
    const hasConflict = articles.some(a => a.title.toLowerCase() === aiData.title.toLowerCase());
    if (hasConflict) {
        aiData.title += ' (Copy)';
    }

    const newArticle = {
        id: uuidv4(),
        title: aiData.title,
        rawText,
        textHash,
        summary: aiData.summary,
        steps: aiData.steps,
        tags: aiData.tags,
        status: 'draft',
        creator: creator || 'System',
        createdAt: new Date().toISOString(),
        version: 1,
        history: [{
            version: 1,
            updatedAt: new Date().toISOString(),
            changes: 'Initial creation'
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
        steps: steps || article.steps,
        tags: tags || article.tags,
        status: status || article.status,
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
