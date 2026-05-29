# HireForge AI 🚀

An AI-powered interview preparation platform that analyzes resumes and job descriptions to generate personalized interview strategies, technical questions, behavioral questions, skill gap analysis, and preparation roadmaps.

---

# ✨ Features

* 🔐 JWT Authentication
* 📄 Resume Upload & PDF Parsing
* 🤖 AI-Powered Interview Preparation
* 📊 Match Score Analysis
* 🧠 Technical Questions with Model Answers
* 💬 Behavioral Questions
* 📈 Skill Gap Detection
* 🗺 Personalized Preparation Roadmap
* ⚡ Background Job Processing using BullMQ
* 🔄 Redis Queue System
* 📥 Resume PDF Download
* 🎨 Modern Dark UI

---

# 🖼 Screenshots

## Home Page

<img width="100%" src="screenshots\home.png.png" />

---

## Technical Questions Dashboard

<img width="100%" src="screenshots\technical.png.png" />

---

## Preparation Roadmap

<img width="100%" src="screenshots\roadmap.png.png" />

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* SCSS
* Axios
* React Router

## Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* BullMQ
* Redis
* JWT Authentication
* Multer
* pdf-parse

## AI

* Google Gemini API

---

# 🧠 System Architecture

```txt
Frontend (React)
      ↓
Backend API (Express)
      ↓
BullMQ Queue
      ↓
Worker Service
      ↓
Gemini AI
      ↓
MongoDB
```

---

# 📂 Project Structure

```txt
hireforge-ai/
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── workers/
│   │   ├── queues/
│   │   ├── services/
│   │   └── middlewares/
│
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
```

---

# ⚙️ Environment Variables

## Backend `.env`

```env
PORT=3000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

REDIS_URL=your_redis_url

GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

---

# 🚀 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/prakhar051/hireforge-ai.git

cd hireforge-ai
```

---

# 🔥 Backend Setup

```bash
cd Backend

npm install
```

## Start Backend

```bash
npm run dev
```

---

# ⚡ Start Worker

Open another terminal:

```bash
cd Backend

npm run worker
```

---

# 🎨 Frontend Setup

```bash
cd Frontend

npm install

npm run dev
```

---

# 🌐 Deployment

## Frontend

* Vercel

## Backend

* Render Web Service

## Worker

* Render Background Worker

---

# 📌 Important Notes

* Worker service must run separately for BullMQ jobs.
* Redis is mandatory for queue processing.
* MongoDB Atlas IP must be whitelisted.
* Gemini API key is required.

---

# 🧪 Future Improvements

* Mock Interview Voice AI
* Real-time Interview Simulation
* ATS Resume Scoring
* AI Resume Builder
* Email Notifications
* Analytics Dashboard

---

# 👨‍💻 Author

## Prakhar Yadav

GitHub: https://github.com/prakhar051

---

# 📜 License

This project is licensed under the MIT License.
