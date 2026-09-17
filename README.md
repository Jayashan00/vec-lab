# LearnHub — Online Learning Platform with ChatGPT Integration

**Live demo:** http://13.203.231.165

A full-stack MERN application (MongoDB, Express, React, Node.js) that lets
students browse and enroll in courses, watch lesson videos and track their
progress, lets instructors create and manage courses and lecture content,
and uses the OpenAI GPT API to give students personalized course
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
- **Lessons are YouTube links, not uploaded files.** Lecture videos are
  stored as a parsed YouTube video ID inside each course's `lessons` array
  rather than as uploaded video files. This avoids needing file storage or
  a CDN entirely — the free-tier server disk stays small, video playback
  and bandwidth costs nothing (YouTube serves it), and thumbnails are
  generated for free via YouTube's public thumbnail CDN
  (`img.youtube.com/vi/<id>/hqdefault.jpg`).

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
| lessons         | [Lesson]   | embedded subdocuments, see below    |

**Embedded `Lesson` subdocument** (one per YouTube lecture, in display order):
| Field           | Type     | Notes                                          |
|-----------------|----------|--------------------------------------------------|
| title           | String   | required                                          |
| description     | String   | optional                                          |
| youtubeUrl      | String   | required, the URL as pasted by the instructor    |
| youtubeVideoId  | String   | parsed server-side from `youtubeUrl` on save     |
| order           | Number   | display order within the course                  |

### `enrollments`
| Field            | Type         | Notes                                         |
|------------------|--------------|--------------------------------------------------|
| student          | ObjectId     | ref → `User`                                    |
| course           | ObjectId     | ref → `Course`                                  |
| status           | String       | `"active"` \| `"completed"` (default: active)   |
| completedLessons | [ObjectId]   | ids of completed `Lesson` subdocuments; status auto-flips to `"completed"` once this covers every lesson in the course |

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
| GET    | `/courses/:id`               | Private (any role)      | Get one course's details (includes `lessons`) |
| POST   | `/courses`                  | Private (instructor)    | Create a new course                    |
| PUT    | `/courses/:id`               | Private (instructor, owner) | Update own course                   |
| DELETE | `/courses/:id`               | Private (instructor, owner) | Delete own course                   |
| GET    | `/courses/mine/list`         | Private (instructor)    | List courses created by current user   |
| GET    | `/courses/:id/students`      | Private (instructor, owner) | View students enrolled in a course  |
| POST   | `/courses/:id/lessons`       | Private (instructor, owner) | Add a YouTube lesson to a course    |
| PUT    | `/courses/:id/lessons/:lessonId` | Private (instructor, owner) | Edit a lesson's title/description/URL |
| DELETE | `/courses/:id/lessons/:lessonId` | Private (instructor, owner) | Remove a lesson (also purges it from every student's progress) |

### Enrollments
| Method | Endpoint                                        | Access             | Description                        |
|--------|---------------------------------------------------|---------------------|--------------------------------------|
| POST   | `/enrollments/:courseId`                          | Private (student)   | Enroll in a course                   |
| GET    | `/enrollments/my`                                 | Private (student)   | List my enrolled courses             |
| GET    | `/enrollments/course/:courseId`                   | Private (student)   | Get my enrollment (incl. progress) for one course |
| PUT    | `/enrollments/:courseId/lessons/:lessonId/toggle` | Private (student)   | Mark a lesson complete/incomplete    |

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

This project is deployed as a **single AWS EC2 instance** running the
entire stack — MongoDB, the Node/Express backend, and the built React
frontend — all on one free-tier `t2.micro` Ubuntu server, fronted by nginx.

**Live at: http://13.203.231.165**

### Server setup (one-time)
1. Launch an Ubuntu 24.04 EC2 instance (`t2.micro`, free tier eligible).
2. Open inbound ports **22 (SSH)** and **80 (HTTP)** in the instance's
   security group.
3. SSH in and install: Node.js 20, MongoDB 7.0, nginx, git, and PM2
   (process manager that keeps the backend running and restarts it on
   crash/reboot).
4. `git clone` this repository onto the server.

### Backend
```bash
cd backend
npm install
nano .env     # MONGO_URI=mongodb://localhost:27017/learnhub, JWT_SECRET,
              # OPENAI_API_KEY, PORT=5000, NODE_ENV=production
pm2 start npm --name "learnhub-backend" -- start
pm2 save
pm2 startup   # then run the command it prints, so it survives a reboot
```

### Frontend
```bash
cd frontend
npm install
npm run build          # outputs to frontend/dist
```

No `VITE_API_URL` is needed — the frontend calls the API at the relative
path `/api`, and nginx forwards that to the backend on the same machine
(see below), so frontend and backend are always same-origin.

### nginx (serves the built frontend, proxies `/api` to the backend)
```nginx
server {
    listen 80;
    server_name _;

    root /home/ubuntu/vec-lab/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Redeploying after a code change
```bash
cd ~/vec-lab
git pull

# if backend code changed:
cd backend && pm2 restart learnhub-backend

# if frontend code changed:
cd frontend && npm install && npm run build
```
nginx always serves whatever is currently in `frontend/dist`, so a
frontend change requires re-running `npm run build`; a backend change
requires a PM2 restart. Neither requires touching nginx itself unless the
server block configuration changes.

### Alternative: MongoDB Atlas + Render + Vercel
If you'd rather split the three pieces across separate free-tier managed
services instead of one server, that works too and needs no code changes:
1. **Database** — create a free M0 cluster at mongodb.com/cloud/atlas,
   allow network access from `0.0.0.0/0`, and use its connection string as
   `MONGO_URI`.
2. **Backend** — deploy the `backend` folder to Render/Railway as a Web
   Service (`npm install` / `npm start`), setting the same environment
   variables as above.
3. **Frontend** — deploy the `frontend` folder to Vercel/Netlify
   (`npm run build`, output directory `dist`), setting `VITE_API_URL` to
   the backend's public URL, and setting the backend's `CLIENT_URL` env
   var to the frontend's URL so CORS allows it.

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
│   │   ├── models/            (User, Course [with embedded Lesson], Enrollment)
│   │   ├── middleware/        (auth + RBAC, error handling)
│   │   ├── controllers/       (auth, course + lessons, enrollment + progress, gpt)
│   │   ├── routes/
│   │   ├── utils/             (JWT helper, GPT usage tracker, YouTube URL parser, seed script)
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/        (Navbar, ProtectedRoute, CourseCard, AnimatedBot)
│   │   ├── pages/              (Home, Login, Register, CourseList, CourseDetail,
│   │   │                        CourseLearn, ManageLessons, MyEnrollments,
│   │   │                        InstructorDashboard, CourseForm, CourseStudents,
│   │   │                        Recommendations)
│   │   └── styles/             (index.css, animations.css, theme-classic.css, lessons.css)
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 9. Version Control

This project is designed to be pushed to a GitHub repository as-is. Both
`backend/.gitignore` and `frontend/.gitignore` already exclude `node_modules`
and `.env` files so no secrets or bulky dependency folders are committed.
