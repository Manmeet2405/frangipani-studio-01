# Run Firangi Locally

This guide is for running the GitHub project on your own machine.

## What this repo contains

- `frontend/` → React app (this is the main Firangi prototype)
- `backend/` → FastAPI starter backend with MongoDB connection

**Important:** the current Firangi app is primarily a **frontend-only prototype** using mock data and browser `localStorage`. That means the **frontend is enough** to view and use the project locally.

---

## Option A — Quickest way: run the frontend only

Use this if you just want to open Firangi locally and explore the UI.

### 1) Prerequisites

Install these first:

- **Git**
- **Node.js 20**
- **Yarn 1.22.22**

You can check your versions with:

```bash
node -v
yarn -v
git --version
```

Recommended versions for this repo:

- Node: `v20.x`
- Yarn: `1.22.22`

If Yarn is missing, install it with:

```bash
npm install -g yarn@1.22.22
```

### 2) Clone the repo

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 3) Create a local frontend env override

The checked-in `frontend/.env` is configured for the cloud preview environment.

For local development, create `frontend/.env.local` with:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=false
```

Even if you do **not** run the backend, this is fine.

### 4) Install frontend dependencies

```bash
cd frontend
yarn install
```

### 5) Start the frontend

```bash
yarn start
```

Open:

```text
http://localhost:3000
```

---

## Option B — Run frontend + backend locally

Use this if you want the whole repo running on your machine, even though the current Firangi experience does not depend on the backend.

### 1) Prerequisites

Install:

- **Python 3.11**
- **MongoDB**
- **Node.js 20**
- **Yarn 1.22.22**

Check versions:

```bash
python3 --version
node -v
yarn -v
```

### 2) Start MongoDB

If you already have MongoDB installed locally, start it normally.

If not, the easiest Docker option is:

```bash
docker run -d --name firangi-mongo -p 27017:27017 mongo:7
```

### 3) Backend env

The repo already includes `backend/.env` pointing to local MongoDB:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
```

You can keep these values for local use.

### 4) Set the frontend to talk to your local backend

Create `frontend/.env.local`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=false
```

### 5) Install backend dependencies

From the project root:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

On Windows PowerShell:

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 6) Start the backend

From `backend/`:

```bash
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend URLs:

- API root: `http://localhost:8001/api/`
- Example endpoint: `http://localhost:8001/api/status`

### 7) Start the frontend

In a new terminal:

```bash
cd frontend
yarn install
yarn start
```

Open:

```text
http://localhost:3000
```

---

## Recommended local workflow

### Frontend only

Terminal 1:

```bash
cd frontend
yarn start
```

### Full local stack

Terminal 1:

```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Terminal 2:

```bash
cd frontend
yarn start
```

---

## Build locally

To verify the frontend production build:

```bash
cd frontend
yarn build
```

The build output will be in:

```text
frontend/build
```

---

## Common issues

### 1) `yarn` command not found

Install Yarn 1:

```bash
npm install -g yarn@1.22.22
```

### 2) Port 3000 already in use

Stop the process using that port, or run the frontend on another port:

```bash
PORT=3001 yarn start
```

### 3) Hot reload / WebSocket warning locally

Make sure `frontend/.env.local` contains:

```env
WDS_SOCKET_PORT=3000
```

### 4) MongoDB connection error

Make sure MongoDB is running on:

```text
mongodb://localhost:27017
```

### 5) You want a clean demo state

Because Firangi uses browser `localStorage`, wishlist/request mock data may persist between sessions.

In the browser devtools, clear local storage for `localhost:3000` if you want to reset the UI state.

---

## Quick start summary

If you only want the app running locally:

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd <YOUR_PROJECT_FOLDER>
cd frontend
yarn install
yarn start
```

Then open `http://localhost:3000`.

---

## Notes

- Use **Yarn**, not npm, for the frontend in this repo.
- The current Firangi prototype works without the backend.
- If you later connect the frontend to a real local backend, keep `REACT_APP_BACKEND_URL=http://localhost:8001` in `frontend/.env.local`.