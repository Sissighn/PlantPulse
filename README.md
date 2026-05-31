# PlantPulse

[![CI](https://github.com/Sissighn/PlantPulse/actions/workflows/ci.yml/badge.svg)](https://github.com/Sissighn/PlantPulse/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38BDF8?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Framework-Express-black?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-044a64?logo=sqlite&logoColor=white)
![i18next](https://img.shields.io/badge/i18n-i18next-26A69A?logo=i18next&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)
![Open Plantbook](https://img.shields.io/badge/Plant%20Data-Open%20Plantbook-2F855A)
![License](https://img.shields.io/badge/License-MIT-green.svg)

PlantPulse is a comprehensive plant care management application designed to help users track watering schedules, browse plant care data, and maintain plant health. The application combines a traditional task-management interface with Open Plantbook plant data and AI integration for personalized care advice and interactive assistance.

---

## Project Overview

This project serves as a digital assistant for plant enthusiasts. It allows users to build a digital inventory of their plants, automatically calculating watering needs based on plant-specific profiles and seasonal factors. The app also includes a Plant Book powered by Open Plantbook, so users can search plants before buying them and inspect care data such as light, temperature, humidity, watering, soil, and fertilization. Google Gemini powers optional care tips and the conversational plant assistant.

---

## Screenshots

### Plant Management View

![PlantPulse Plant Management](docs/3.png)

### Different types of plants

![PlantPulse plant types](docs/1.png)

### AI Assistant Chat

![PlantPulse AI Assistant](docs/2.png)

---

## Key Features

### Plant Management

- **Inventory Tracking:** Users can add plants from a predefined list or customize their own entries.

- **User Accounts:** Registered users and guests receive separate plant inventories backed by the API.

- **Plant-Specific Scheduling:** Known plants use deterministic watering profiles, while the displayed interval adjusts by season and plant type (e.g., cactus, succulent, moisture-loving, tropical).

- **Visual Indicators:** The UI visually represents plant status (e.g., "thirsty" states, grayscale filters) to provide immediate feedback on care urgency.

### Plant Book

- **Open Plantbook Search:** Users can search the Open Plantbook database from inside the app.

- **Real Plant Images:** Search results are enriched with actual plant images from Open Plantbook detail records, making visual identification easier.

- **Care Details:** Plant detail pages show available data for temperature, light, soil moisture, air humidity, watering, sunlight, soil, fertilization, pruning, and origin.

- **Add From Plant Book:** Users can add a discovered plant directly to their personal inventory.

### AI Integration

- **Contextual Care Tips:** Users can generate specific, concise care instructions (Watering, Light, Fertilizer) for any plant directly from the dashboard.

- **Interactive Chatbot:** A dedicated AI assistant allows users to ask complex questions regarding plant health and diagnosis.

- **Image Analysis:** Support for image-based queries, allowing users to upload context for the AI to analyze.

---

## Technical Implementation

- **Modern Frontend:** Built with React and Vite for high performance, utilizing Tailwind CSS for a responsive, clean design.

- **Robust Backend:** Node.js and Express server handling API requests, managing a local SQLite database for persistence.

- **Authentication:** Email/password login uses server-side password hashing and an HTTP-only JWT cookie; guest sessions stay isolated from registered accounts.

- **Open Plantbook Proxy:** The backend handles Open Plantbook OAuth credentials, token refresh, response caching, search, and detail lookups so secrets never reach the browser.

- **API Integration:** Seamless connection with Google Gemini for natural language processing and content generation.

---

## Project Structure

The project is organized into a clear separation of concerns between the client (frontend) and server (backend).

```
PLANTPULSE
├── backend
│   ├── config
│   │   └── gemini.js           # AI Model configuration
│   ├── controllers
│   │   ├── plantBookController.js # Open Plantbook request handling
│   │   └── plantController.js     # Plant inventory request handling
│   ├── db
│   │   ├── database.js         # Database connection setup
│   │   └── schema.js           # Drizzle ORM schema
│   ├── middleware
│   │   ├── errorHandler.js     # Central Express error handling
│   │   └── validateRequest.js  # Zod request validation middleware
│   ├── domain
│   │   └── wateringProfiles.js # Deterministic plant watering profiles
│   ├── public
│   │   ├── icons               # Static assets
│   │   └── plantImages         # Uploaded plant imagery
│   ├── routes
│   │   └── plantRoutes.js      # API endpoint definitions
│   ├── services
│   │   ├── aiService.js        # Logic for AI prompts and formatting
│   │   ├── openPlantbookService.js # Open Plantbook API client/proxy
│   │   └── plantService.js     # Business logic for plant data
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server entry point
│   ├── tsconfig.json           # TypeScript checking configuration
│   └── .env                    # Environment variables
│
└── frontend
    ├── e2e
    │   └── plant-care.spec.ts  # Playwright user journey tests
    ├── src
    │   ├── components
    │   │   ├── AddPlantForm.jsx
    │   │   ├── PlantCardContainer.jsx
    │   │   ├── PlantCardView.jsx
    │   │   ├── PlantBook.jsx
    │   │   ├── PlantSelectContainer.jsx
    │   │   ├── PlantSelectView.jsx
    │   │   └── SeasonSelector.jsx
    │   ├── domain
    │   │   ├── plantStatus.ts
    │   │   ├── wateringProfiles.ts
    │   │   └── wateringSchedule.ts
    │   ├── hooks
    │   │   ├── useNotifications.js
    │   │   └── usePlantStatus.js
    │   ├── features
    │   │   ├── pixelBot/
    │   │   └── plantAssistant/
    │   ├── locales
    │   │   ├── de/
    │   │   └── en/
    │   ├── App.jsx                 # Main application layout
    │   ├── i18n.js                 # Internationalization setup
    │   ├── constants.ts            # Global configuration
    │   └── main.jsx                # React entry point
    ├── playwright.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.js
```

---

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide React

- **Backend:** Node.js, Express.js, TypeScript type checking

- **Database:** SQLite with Drizzle ORM

- **Plant Data:** Open Plantbook API

- **AI:** Google Gemini API

---

## Roadmap & Future Development

- **Notification System:** Implementation of push notifications or emails to remind users when watering is overdue.

- **Advanced Image Recognition:** Enhancing the AI's ability to automatically identify plant species and diagnose diseases from uploaded photos.

- **Enhanced Chatbot Context:** Improving the chatbot's memory to reference previous interactions and specific plant history.

---

## Installation & Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Clone the repository

```bash
git clone <repository-url>
cd plantpulse
```

### Environment variables (Backend)

Create [backend/.env](backend/.env) with:

```env
GEMINI_API_KEY=your_api_key_here
JWT_SECRET=replace_with_at_least_32_random_bytes
FRONTEND_ORIGINS=http://localhost:5173,http://localhost

# Open Plantbook credentials stay server-side.
OPEN_PLANTBOOK_CLIENT_ID=your_client_id_here
OPEN_PLANTBOOK_CLIENT_SECRET=your_client_secret_here
```

Generate a long `JWT_SECRET` before deploying, for example with `openssl rand -hex 32`. In production the backend refuses to start if `JWT_SECRET` is shorter than 32 bytes.

Open Plantbook uses OAuth client credentials. Prefer `OPEN_PLANTBOOK_CLIENT_ID` and `OPEN_PLANTBOOK_CLIENT_SECRET`; the backend caches and refreshes access tokens automatically. A pre-generated bearer token can also be supplied with `OPEN_PLANTBOOK_ACCESS_TOKEN`, but it may expire and should not be committed.

### Docker Setup (Recommended)

You can run the entire application (Frontend & Backend) with a single command using Docker.

**Prerequisites:**
- Docker and Docker Compose installed.

**Run with Docker Compose:**
```bash
# Build and start the containers in the background
docker-compose up -d --build
```

The application will be available at:
- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000

To stop the application:
```bash
docker-compose down
```

---

### Manual Local Setup

#### Backend Setup

```bash
cd backend
npm install
npm start
```

Alternative (watch mode):

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

- If you see `pm run dev: command not found`, use `npm run dev`.
- If frontend shows "Backend offline", make sure backend is running on `http://localhost:3000`.
- If AI features fail, verify `GEMINI_API_KEY` in [backend/.env](backend/.env).
- If Plant Book search or details fail, verify `OPEN_PLANTBOOK_CLIENT_ID` and `OPEN_PLANTBOOK_CLIENT_SECRET` in [backend/.env](backend/.env), then restart the backend.
- If Plant Book details return `HTTP 401`, remove an expired `OPEN_PLANTBOOK_ACCESS_TOKEN` and use the client credentials instead.

---

## License

MIT License © 2026 Setayesh Golshan
