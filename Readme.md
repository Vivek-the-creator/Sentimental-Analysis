# 🏛️ GovSentinel — AI-Powered Government E-Consultation Sentiment Platform

> A full-stack, production-ready platform where citizens interact with government schemes and administrators analyse public sentiment using a pre-trained Multilingual BERT model.

---

## 🧠 Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS + Recharts       |
| Backend     | Python FastAPI + SQLAlchemy                     |
| Database    | MySQL 8 (via PyMySQL)                           |
| AI Model    | HuggingFace Multilingual BERT (local)           |
| Auth        | JWT (python-jose) + bcrypt (passlib)            |

---

## 📁 Project Structure

```
Sentimental-Analysis/
├── backend/
│   ├── .env                          # Environment variables
│   ├── requirements.txt
│   └── app/
│       ├── main.py                   # FastAPI entry point
│       ├── core/config.py            # Settings from .env
│       ├── db/database.py            # SQLAlchemy engine + session
│       ├── models/models.py          # ORM: User, Post, Comment, Like
│       ├── schemas/schemas.py        # Pydantic v2 schemas
│       ├── services/
│       │   ├── auth_service.py       # JWT + bcrypt helpers
│       │   └── ml_service.py        # BERT singleton inference
│       └── routes/
│           ├── auth.py              # POST /api/register, /api/login
│           ├── posts.py             # CRUD /api/posts
│           ├── comments.py          # /api/comments (AI sentiment on create)
│           ├── likes.py             # /api/like (toggle)
│           ├── analytics.py         # /api/analytics, /api/wordcloud
│           └── predict.py           # /api/predict
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  # Router + AuthProvider
│       ├── index.css                # Tailwind + custom components
│       ├── context/AuthContext.jsx  # JWT + user global state
│       ├── services/api.js          # Axios instance + all API calls
│       ├── hooks/
│       │   ├── useAuth.js
│       │   └── usePosts.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── PostCard.jsx
│       │   ├── CommentSection.jsx
│       │   ├── SentimentBadge.jsx
│       │   ├── LikeButton.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── charts/
│       │       ├── SentimentPieChart.jsx
│       │       ├── SentimentBarChart.jsx
│       │       ├── GenderAnalysis.jsx
│       │       ├── AgeGroupAnalysis.jsx
│       │       └── WordCloudChart.jsx
│       └── pages/
│           ├── HomePage.jsx
│           ├── PostDetailPage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           └── admin/
│               ├── AdminDashboard.jsx
│               ├── CreatePost.jsx
│               └── PostAnalytics.jsx
│
└── Readme.md
```

---

## 🗄️ Database Schema (MySQL — govsentinel)

| Table      | Key Columns                                                       |
|------------|-------------------------------------------------------------------|
| `users`    | user_id, name, email, password (hashed), role, gender, age        |
| `posts`    | post_id, title, thumbnail, beneficial_for, short/detailed_description, created_by, created_at |
| `comments` | comment_id, post_id, user_id, comment_text, **sentiment**, created_at |
| `likes`    | like_id, user_id, post_id, created_at                            |

Tables are created automatically by SQLAlchemy on backend startup.

---

## ⚙️ Environment Variables (`backend/.env`)

```env
DATABASE_URL=mysql+pymysql://root:Vivek%402006@localhost:3306/govsentinel
SECRET_KEY=govsentinel-super-secret-jwt-key-2024-xyz
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MODEL_PATH=C:/Users/Vivek/OneDrive/Desktop/sentiment_project/models/bert_model/bert_final_model
```

---

## 🚀 Running the Application

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open Swagger UI: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## 🔌 API Endpoints

| Method | Endpoint                     | Auth         | Description                              |
|--------|------------------------------|--------------|------------------------------------------|
| POST   | /api/register                | None         | Register new citizen                     |
| POST   | /api/login                   | None         | Login, returns JWT                       |
| GET    | /api/posts                   | None         | List all scheme posts (paginated)        |
| GET    | /api/posts/{id}              | None         | Get single post detail                   |
| POST   | /api/posts                   | Admin only   | Create new scheme post                   |
| DELETE | /api/posts/{id}              | Admin only   | Delete a post                            |
| POST   | /api/comments                | User/Admin   | Post comment (AI sentiment auto-tagged)  |
| GET    | /api/comments/{post_id}      | None         | Get comments for a post (paginated)      |
| POST   | /api/like                    | User/Admin   | Toggle like on a post                    |
| GET    | /api/like/{post_id}/status   | User/Admin   | Check if current user liked a post       |
| GET    | /api/analytics/{post_id}     | Admin only   | Full sentiment/gender/age breakdown      |
| GET    | /api/wordcloud/{post_id}     | Admin only   | Top keywords from comments               |
| POST   | /api/predict                 | None         | Direct BERT sentiment prediction         |

---

## 👥 User Roles

### Citizen (role: `user`)
- Browse all government scheme posts
- Like / Unlike posts
- Comment on posts (AI-classified sentiment shown instantly)
- Share post link

### Administrator (role: `admin`)
- All citizen features
- Create new scheme posts
- Delete posts
- View analytics dashboard per post:
  - Sentiment pie chart & bar chart
  - Gender analysis chart
  - Age group analysis chart
  - Interactive word cloud

> **Note:** Use your database client to manually set `role = 'admin'` for an admin account, or register first and update via SQL:
> ```sql
> UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
> ```

---

## 🤖 AI Model Integration

- **Model:** Multilingual BERT for sequence classification
- **Path:** `C:/Users/Vivek/OneDrive/Desktop/sentiment_project/models/bert_model/bert_final_model`
- **Pattern:** Singleton — loaded **once** at startup via FastAPI lifespan event
- **Labels:** `Positive | Neutral | Negative`
- **Auto-triggers:** Every comment creation calls `predict_sentiment()` before DB insert

---

## 🎨 UI Features

- 🌑 Dark glassmorphic design with blur effects
- ✨ Smooth animations (fade-in, slide-up)
- 📱 Fully responsive (mobile-first)
- 🎯 Sentiment badges on every comment (emoji + color-coded)
- 📊 4 interactive analytics charts
- ☁️ Click-to-inspect word cloud

---

## 📦 Dependencies

### Backend
```
fastapi, uvicorn, sqlalchemy, pymysql, python-jose[cryptography],
passlib[bcrypt], python-multipart, transformers, torch,
python-dotenv, pydantic-settings, pydantic[email]
```

### Frontend
```
react, react-dom, react-router-dom, axios, recharts,
tailwindcss, postcss, autoprefixer, @vitejs/plugin-react, vite
```
