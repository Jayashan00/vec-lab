# LearnHub — Online Learning Platform with ChatGPT Integration

A full-stack MERN application (MongoDB, Express, React, Node.js) that lets
students browse and enroll in courses, lets instructors create and manage
courses, and uses the OpenAI GPT API to give students personalized course
recommendations based on a free-text career goal.

Built for the Full Stack Developer Assessment.

---

## 1. Tech Stack

| Layer      | Technology                                            |
|------------|--------------------------------------------------------|
| Frontend   | React 18 (Vite), React Router, Axios, plain CSS         |
| Backend    | Node.js, Express.js                                     |
| Database   | MongoDB with Mongoose ODM                               |
| Auth       | JWT (JSON Web Tokens) + bcrypt password hashing          |
| AI         | OpenAI GPT API (`gpt-3.5-turbo`)                        |
| Security   | Helmet, CORS, express-rate-limit, input validation      |

---

## 2. System Architecture

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────────┐        ┌───────────────┐
│   React SPA      │ ───────────────────────▶ │   Express REST API    │ ─────▶ │   MongoDB      │
│  (Vite, Router)   │ ◀─────────────────────── │  (JWT + RBAC guarded)  │ ◀───── │  (Mongoose)    │
└─────────────────┘                          └──────────┬───────────┘        └───────────────┘
                                                          │
                                                          │ single, non-looped call
                                                          ▼
                                                ┌──────────────────────┐
                                                │   OpenAI GPT API      │
                                                └──────────────────────┘
```

**Design choices worth noting for reviewers:**

- **Role-based access control (RBAC)** is enforced server-side via an
  `authorize(...roles)` middleware factory, not just hidden in the UI. Every
  instructor-only endpoint checks both the JWT role claim *and* course
  ownership (`course.instructor === req.user._id`) before allowing edits/
  deletes.
- **GPT recommendations are grounded in real data.** Rather than letting the
  model invent course names, the backend sends GPT the titles/descriptions of
  courses that actually exist in the database and asks it to rank the most
  relevant ones as strict JSON. This avoids the AI recommending courses that
  don't exist on the platform.
- **GPT usage tracking.** Per the assessment's API guidelines (max 250
  requests, no calls inside loops), a small JSON-backed counter
  (`backend/src/data/gpt-usage.json`) persists the number of GPT calls made
  and blocks further calls once the configurable limit (`GPT_MAX_REQUESTS`)
  is hit, returning a clean `429` error instead of crashing.
- **Centralized error handling** on the backend converts Mongoose errors
  (validation, duplicate key, bad ObjectId) into consistent JSON error
  responses instead of leaking stack traces.

---

## 3. Database Structure (Schema)

### `users`
| Field      | Type    | Notes                                   |
|------------|---------|------------------------------------------|
| username   | String  | unique, required                         |
| email      | String  | unique, required                         |
| password   | String  | hashed with bcrypt, never returned by default |
| role       | String  | `"student"` \| `"instructor"` (default: student) |
| createdAt / updatedAt | Date | timestamps                    |

### `courses`
| Field           | Type       | Notes                              |
|-----------------|------------|-------------------------------------|
| title           | String     | required                            |
| description     | String     | required                            |
| content         | String     | required — outline/lessons          |
| category        | String     | default `"General"`                 |
| instructor      | ObjectId   | ref → `User`                        |
| enrollmentCount | Number     | denormalized count, kept in sync    |

### `enrollments`
| Field    | Type     | Notes                                         |
|----------|----------|-------------------------------------------------|
| student  | ObjectId | ref → `User`                                    |
| course   | ObjectId | ref → `Course`                                  |
| status   | String   | `"active"` \| `"completed"` (default: active)   |

A compound unique index on `(student, course)` prevents duplicate enrollments.

**Entity relationship:**
```
User (instructor) 1 ──── * Course
User (student)    * ──── * Course   (through Enrollment join collection)
```

---

## 4. API Endpoints

Base URL: `/api`

### Auth
| Method | Endpoint            | Access        | Description                     |
|--------|----------------------|---------------|-----------------------------------|
| POST   | `/auth/register`     | Public        | Register as student or instructor |
| POST   | `/auth/login`        | Public        | Login, returns JWT                |
| GET    | `/auth/me`           | Private       | Get current logged-in profile     |

### Courses
| Method | Endpoint                  | Access                  | Description                          |
|--------|-----------------------------|--------------------------|----------------------------------------|
| GET    | `/courses`                  | Private (any role)      | List all courses                       |
| GET    | `/courses/:id`               | Private (any role)      | Get one course's details               |
| POST   | `/courses`                  | Private (instructor)    | Create a new course                    |
| PUT    | `/courses/:id`               | Private (instructor, owner) | Update own course                   |
| DELETE | `/courses/:id`               | Private (instructor, owner) | Delete own course                   |
| GET    | `/courses/mine/list`         | Private (instructor)    | List courses created by current user   |
| GET    | `/courses/:id/students`      | Private (instructor, owner) | View students enrolled in a course  |

### Enrollments
| Method | Endpoint                    | Access             | Description                        |
|--------|-------------------------------|---------------------|--------------------------------------|
| POST   | `/enrollments/:courseId`      | Private (student)   | Enroll in a course                   |
| GET    | `/enrollments/my`             | Private (student)   | List my enrolled courses             |

### GPT Recommendations
| Method | Endpoint          | Access             | Description                                         |
|--------|--------------------|----------------------|--------------------------------------------------------|
| POST   | `/gpt/recommend`   | Private (student)   | Body: `{ "prompt": "..." }` → ranked course suggestions |

All `Private` routes require an `Authorization: Bearer <token>` header.

---

## 5. Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally, or a free MongoDB Atlas cluster
- An OpenAI API key (see the assessment's GPT API instructions document)

### Backend
```bash
cd backend
cp .env.example .env
# edit .env and fill in MONGO_URI, JWT_SECRET, OPENAI_API_KEY
npm install
npm run seed     # optional: creates a demo instructor + sample courses
npm run dev       # starts on http://localhost:5000
```

Demo seeded instructor login (if you ran `npm run seed`):
- Email: `instructor@demo.com`
- Password: `password123`

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no
extra CORS configuration is needed locally.

### Try it out
1. Open `http://localhost:5173`
2. Register a new **instructor** account and create a couple of courses
   (or just use the seeded demo courses).
3. Register a new **student** account, browse `/courses`, and enroll.
4. Go to "Ask GPT" and try a prompt like *"I want to be a software engineer,
   what courses should I follow?"*.
5. Log back in as the instructor and open "Students" on a course to see who
   enrolled.

---

## 6. Deployment Guide

Any cloud host works; below is a simple, free-tier-friendly path.

### Database — MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas
2. Add a database user and allow network access from anywhere (`0.0.0.0/0`)
   for simplicity, or your host's specific IP range.
3. Copy the connection string into `MONGO_URI`.

### Backend — Render / Railway / Heroku
1. Push this repo to GitHub.
2. Create a new Web Service pointing at the `backend` folder.
3. Set the build command to `npm install` and start command to `npm start`.
4. Add environment variables from `.env.example` (`MONGO_URI`, `JWT_SECRET`,
   `OPENAI_API_KEY`, `GPT_MAX_REQUESTS`, `CLIENT_URL`, `NODE_ENV=production`).
5. Deploy — note the public backend URL, e.g. `https://learnhub-api.onrender.com`.

### Frontend — Vercel / Netlify
1. Create a new project pointing at the `frontend` folder.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add environment variable `VITE_API_URL=https://<your-backend-url>/api`.
4. Deploy — you'll get a public URL, e.g. `https://learnhub.vercel.app`.
5. Go back to your backend's environment variables and set `CLIENT_URL` to
   this frontend URL so CORS allows it.

---

## 7. GPT API Usage Notes

Per the assessment's API guidelines:
- Exactly **one** GPT API call is made per recommendation request (no loops).
- A persisted counter (`backend/src/data/gpt-usage.json`) tracks total calls
  made and enforces the 250-request ceiling via `GPT_MAX_REQUESTS`.
- An additional per-user rate limit (5 requests/minute) guards against
  accidental bursts from the UI.
- The API key is **never committed to source control** — it is read from an
  environment variable (`OPENAI_API_KEY`) that must be set locally in `.env`
  or in your cloud host's environment variable settings.

---

## 8. Project Structure

```
learnhub/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/            (User, Course, Enrollment)
│   │   ├── middleware/        (auth + RBAC, error handling)
│   │   ├── controllers/       (auth, course, enrollment, gpt)
│   │   ├── routes/
│   │   ├── utils/             (JWT helper, GPT usage tracker, seed script)
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/        (Navbar, ProtectedRoute, CourseCard)
│   │   ├── pages/              (Home, Login, Register, Courses, Instructor pages, GPT page)
│   │   └── styles/index.css
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 9. Version Control

This project is designed to be pushed to a GitHub repository as-is. Both
`backend/.gitignore` and `frontend/.gitignore` already exclude `node_modules`
and `.env` files so no secrets or bulky dependency folders are committed.
