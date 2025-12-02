## News Frontend (React + Vite)

This is the React frontend for the **AI News Recommender** project.  
It talks to the FastAPI backend defined under the `app/` directory and provides:

- **Auth**: Login / signup with JWT-based backend auth
- **Browse**: Topic-based news browsing using the `/news/{topic}` API
- **Recommendations**: Personalized feed powered by the hybrid recommender
- **Admin snapshot**: Optional quick view into users, interactions, profiles, and Redis cache keys

---

### 1. Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **Backend**: FastAPI server running on `http://127.0.0.1:8000`
  - Start with:
    - `uvicorn app.main:app --reload`
  - Make sure MongoDB and Redis are running (see the root `FIXES_SUMMARY.md` and `DATABASE_FIX_SUMMARY.md` for details).

---

### 2. Install dependencies

From the `news_frontend` folder:

```bash
npm install
```

---

### 3. Environment variables

Create a `.env` file in `news_frontend` if you want to use the admin dashboard:

```bash
VITE_ADMIN_KEY=your-admin-secret-here
```

- This value must match `ADMIN_SECRET` in the backend config (`app/core/config.py` / `.env`).
- If you don’t need the admin page, you can ignore this; the rest of the app will work fine.

The Axios client is configured in `src/api/axiosClient.js` with:

- `baseURL: "http://127.0.0.1:8000/api/v1"`
- It automatically attaches `Authorization: Bearer <access_token>` from `localStorage`.

---

### 4. Running the frontend

From the `news_frontend` folder:

```bash
npm run dev
```

Then open the URL printed in the terminal (typically `http://localhost:5173`).

---

### 5. Main routes & flows

- **`/` – Login**
  - Uses `/api/v1/users/login`
  - On success stores user object and JWT (`access_token`) in `localStorage` and global `userStore`.

- **`/signup` – Register**
  - Uses `/api/v1/users/register`
  - On success prompts you to log in.

- **`/home` – Browse news (protected)**
  - Fetches topic-based news from `/api/v1/news/{topic}`.
  - Clicking an article:
    - Opens an article details view.
    - “Open article” records an interaction via `/api/v1/interactions/add`.

- **`/recommendations` – Personalized feed (protected)**
  - Fetches recommendations from:
    - `GET /api/v1/recommendations/recommend/{user_id}`
  - Shows whether results came from `live`, `redis`, `content_based`, or `cold_start`.

- **`/profile` – User profile (protected)**
  - Displays the current user’s ID, name, email, and token type from the login/register response.

- **`/article` – Article details (protected)**
  - Shows a focused view of a single article, with an explanation of why it may have been recommended.

- **`/admin` – Admin dashboard (protected)**
  - Uses admin API endpoints:
    - `/api/v1/admin/users`
    - `/api/v1/admin/interactions`
    - `/api/v1/admin/profiles`
    - `/api/v1/admin/cache/keys`
  - Requires a valid `VITE_ADMIN_KEY` matching the backend admin secret.

All protected routes are wrapped in a small `ProtectedRoute` component inside `src/App.jsx` that checks `useUserStore().isAuthenticated`.

---

### 6. Project structure (frontend)

Key folders under `news_frontend/src`:

- **`api/`**: Axios client and API helpers (`axiosClient.js`, `newsApi.js`, `recommendationApi.js`, `interactionApi.js`)
- **`components/`**: Reusable UI pieces (`Navbar`, `ArticleCard`, `RecommendationCard`, `Footer`, `LoadingSpinner`)
- **`hooks/`**: Custom hooks (`useInteractions`, `useRecommendations`)
- **`pages/`**: Top-level routes (`Login`, `Signup`, `Home`, `Recommendations`, `Profile`, `Article`, `AdminDashboard`)
- **`state/`**: Global stores (Zustand `userStore.js`)
- **`styles/`**: Global styling (`global.css`)
- **`utils/`**: Small helpers (`truncateText.js`, `formDate.js`)

---

### 7. Linting & build

- **Lint**:

```bash
npm run lint
```

- **Build**:

```bash
npm run build
```

This uses Vite with React, React Compiler, and a flat ESLint config (see `eslint.config.js`).
