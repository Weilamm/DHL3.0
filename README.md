# DHL Knowledge Base Automation: AI-Powered Logistics KB

An end-to-end automation system designed to transform unstructured logistics data (emails, chats, notes) into standardized, searchable, and versioned Knowledge Base articles.

---

## 🛠 Technology Stack
- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: Local JSON Storage (`articles.json`)
- **Document Parsing**: Mammoth (.docx), PDF-Parse (.pdf)
- **Design**: Premium Dark-Mode with Glassmorphism

---

## 🏗 System Architecture
The application follows a **RESTful Client-Server** architecture optimized for RPA (UiPath) ingestion and human curation.

### Key Components:
1.  **Ingestion Engine**: Captures raw text or documents via API or manual upload.
2.  **Duplicate Checker**: Uses SHA-256 hashing to skip redundant data within a 14-day window.
3.  **Sanitization Middleware**: Automatically repairs malformed JSON logs with unescaped control characters.
4.  **Curation Dashboard**: A high-performance UI for editors to review, tag, and publish articles.

---

## 👥 User Roles (RBAC)
The system enforces Role-Based Access Control to manage operations securely:

### 👑 Admin
- Manages the knowledge base system.
- Reviews and approves draft articles.
- Edits or deletes incorrect articles and manages tags/categories.
- Monitors RPA automation logs.
- Can ingest new documents or manual uploads.
- **Demo Credentials**: `admin` / `admin`

### 👁 Viewer
- End-user role to access and read published operational knowledge.
- Read-only access: Cannot edit, delete, ingest, or approve articles.
- Can search and filter articles by tag, creator, and date (limited to Published status).
- **Demo Credentials**: `viewer` / `viewer`

---

## 📡 API Reference

### Article Management
- `GET /api/articles`: Fetch all archived records.
- `POST /api/articles`: Create a record (supports RPA metadata).
- `PUT /api/articles/:id`: Update article content, tags, or steps.
- `PATCH /api/articles/:id/status`: Change status (Draft -> Reviewed -> Published).
- `DELETE /api/articles/:id`: Remove a record.

### File Ingestion
- `POST /api/upload`: Upload `.pdf`, `.docx`, or `.txt` files for automatic text extraction.

---

## 📄 Data Schema (JSON)
Each record is stored as a structured JSON object:
```json
{
  "id": "uuid-v4",
  "title": "Extracted Designation",
  "rawText": "Raw Content",
  "textHash": "sha256-hash",
  "status": "draft | reviewed | published",
  "tags": ["Category1", "Category2"],
  "steps": ["Step 1", "Step 2"],
  "rpaMetadata": { "jobId": "...", "machine": "..." },
  "version": 1,
  "history": [{ "version": 1, "changes": "Initial Ingestion" }]
}
```

---

## 🤖 RPA Workflow (UiPath)
The system is designed to integrate seamlessly with UiPath Studio:
1.  **Read**: Polls Google Drive/Inbox for new logistics logs.
2.  **Verify**: Computes content hash and checks with backend for duplicates.
3.  **Post**: Ingests the data into the Web Console via the API.
4.  **Report**: Sends an SMTP summary email to administrators upon completion.

---

## 🚀 Getting Started
1. **Backend**: `cd knowledge-base-app/backend && node server.js`
2. **Frontend**: `cd knowledge-base-app/frontend && npm run dev`

*Developed for DHL Logistics Operations Teams.*
