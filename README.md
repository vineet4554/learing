# LearnAI - Intelligent Document Companion & Study Assistant

LearnAI is a full-stack RAG-powered (Retrieval-Augmented Generation) educational application designed to transform static study documents (PDFs, text) into interactive learning workspaces. Upload a document to instantly generate study material, chat with its contents, or test your comprehension.

---

## 🚀 Key Features

* 📄 **Document Viewer & Processing**: Upload and display PDF/text files side-by-side with interactive study panels.
* 🤖 **Immersive AI Help Mode**: Switch to a distraction-free fullscreen workspace:
  * **Chat with Document**: Ask contextual questions directly answered by the document content (powered by vector chunk search).
  * **Explain Concept**: Enter specific terms (e.g. recursion, algorithms) to extract precise explanations anchored in your file, with persistent search histories.
* 📝 **AI Quizzes & Spaced-Repetition Flashcards**:
  * Generate customized multiple-choice quizzes focused on specific topics directly from document contexts.
  * Auto-generate study flashcards with difficulty scoring, starred collections, and progress logs.
* 🔄 **Adaptive Gemini Quota Fallbacks**: Bypasses daily/minute Free-Tier limits (`429 Too Many Requests`) by automatically routing calls through a fallback model queue (`gemini-2.5-flash` ➔ `gemini-2.0-flash` ➔ `gemini-2.5-pro` ➔ `gemini-2.0-flash-lite` ➔ `gemini-flash-latest`).
* 🌓 **Premium UI & Dark Mode**: Responsive split-screen layouts, glassmorphic headers, and native dark theme toggles.

---

## 🛠️ Technology Stack

### Backend
* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB (Atlas) with Mongoose ORM
* **AI Engine**: Google Generative AI (Gemini SDK)
* **Helpers**: `pdfjs-dist` (text extraction), `jsonwebtoken` (auth), `multer` (uploads)

### Frontend
* **Build Tool**: Vite
* **Library**: React (18+)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Markdown Renderer**: Remark Markdown with low-contrast adaptive code themes

---

## ⚙️ Installation & Configuration

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* MongoDB connection string (Atlas or local instance)
* Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` root directory and populate it:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/learnai
   JWT_SECRET=your_jwt_signing_secret_key
   JWT_EXPIRE=7d
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify or set the API base path in `src/utils/apiPaths.js`:
   ```javascript
   export const BASE_URL = "http://localhost:5000";
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173`.

---

## 📂 Project Structure

```
├── backend/
│   ├── config/             # Database connection setups
│   ├── controllers/        # Express API request controllers (AI, auth, docs, quizzes)
│   ├── middleware/         # JWT protection & validation filters
│   ├── models/             # Mongoose schemas (Document, ChatHistory, ConceptHistory, Quiz, User)
│   ├── routes/             # REST routing tables
│   ├── utils/              # PDF parsing, text chunking, and Gemini SDK service fallbacks
│   └── server.js           # Server startup script
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable layout and document viewer components
    │   ├── context/        # Global state (Theme, Layout, Auth)
    │   ├── pages/          # Flashcard review, Quiz modules, and Document Detail views
    │   ├── services/       # axios API bindings for communicating with backend
    │   └── utils/          # Global configs and API pathways
```

---

## 🧪 Running Integration Tests
To verify all AI endpoints and route bindings, run the following command within the `backend/` directory:
```bash
node test_all_endpoints.js
```
This tests document text parsing, summarization, flashcard creation, and quiz generation under mock JWT authorization scopes.
