# Firangi PRD

## Original problem statement

Firangi is a premium prop-rental studio prototype with a polished editorial customer experience and a connected admin dashboard, built primarily as a frontend-only React application using mock data and browser state.

## Current architecture

- Frontend: React + CRACO + Tailwind + shadcn/ui
- Routing: React Router
- State: local React context + browser localStorage
- Backend template: FastAPI + MongoDB
- Current product scope: frontend-first prototype; backend is not required for the main experience

## Implemented

- Customer-facing routes and admin routes for the Firangi prototype
- Local-state wishlist and rental-request behavior
- Root documentation updated with local run guidance
- Added `/app/RUN_LOCALLY.md` with frontend-only and full local stack instructions

## Current priorities

### P0
- Continue functional QA of customer and admin flows
- Verify latest admin categories rewrite and recent UI changes in-browser

### P1
- Full responsive review across customer and admin screens
- Confirm localStorage persistence behavior end-to-end

### P2
- Additional visual refinement and content consistency pass

## Latest update

- Added a dedicated local setup guide so the project can be cloned from GitHub and run outside the cloud preview environment.