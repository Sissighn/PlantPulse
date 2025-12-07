# PlantPulse

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38BDF8?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Framework-Express-black?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-044a64?logo=sqlite&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)

PlantPulse is a comprehensive plant care management application designed to help users track watering schedules and maintain plant health. The application combines a traditional task-management interface with advanced AI integration to provide personalized care advice and interactive assistance.

---

## Project Overview

This project serves as a digital assistant for plant enthusiasts. It allows users to build a digital inventory of their plants, automatically calculating watering needs based on seasonal factors. The latest update introduces a conversational AI interface powered by the Google Gemini API, enabling users to receive instant care tips and troubleshoot plant issues through a chat interface.

---

## Key Features

### Plant Management

- **Inventory Tracking:** Users can add plants from a predefined list or customize their own entries.

- **Dynamic Scheduling:** Watering intervals automatically adjust based on the current season (e.g., more frequent watering in summer, less in winter).

- **Visual Indicators:** The UI visually represents plant status (e.g., "thirsty" states, grayscale filters) to provide immediate feedback on care urgency.

### AI Integration

- **Contextual Care Tips:** Users can generate specific, concise care instructions (Watering, Light, Fertilizer) for any plant directly from the dashboard.

- **Interactive Chatbot:** A dedicated AI assistant allows users to ask complex questions regarding plant health and diagnosis.

- **Image Analysis:** Support for image-based queries, allowing users to upload context for the AI to analyze.

---

## Technical Implementation

- **Modern Frontend:** Built with React and Vite for high performance, utilizing Tailwind CSS for a responsive, clean design.

- **Robust Backend:** Node.js and Express server handling API requests, managing a local SQLite database for persistence.

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
│   │   └── plantController.js  # Request logic handling
│   ├── db
│   │   ├── database.js         # Database connection setup
│   │   └── plants.db           # SQLite storage
│   ├── public
│   │   ├── icons               # Static assets
│   │   └── plantImages         # Uploaded plant imagery
│   ├── routes
│   │   └── plantRoutes.js      # API endpoint definitions
│   ├── services
│   │   ├── aiService.js        # Logic for AI prompts and formatting
│   │   └── plantService.js     # Business logic for plant data
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server entry point
│   └── .env                    # Environment variables
│
└── frontend
    ├── src
    │   ├── components
    │   │   ├── AddPlantForm.jsx
    │   │   ├── PixelBot.jsx        # AI Chat Interface
    │   │   ├── PlantAssistant.jsx  # AI Logic wrapper
    │   │   ├── PlantCard.jsx       # Individual plant display
    │   │   ├── PlantSelect.jsx
    │   │   └── SeasonSelector.jsx
    │   ├── App.jsx                 # Main application layout
    │   ├── constants.js            # Global configuration
    │   └── main.jsx                # React entry point
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React

- **Backend:** Node.js, Express.js

- **Database:** SQLite / JSON-based persistence

- **AI:** Google Gemini API

---

## Roadmap & Future Development

- **Notification System:** Implementation of push notifications or emails to remind users when watering is overdue.

- **Advanced Image Recognition:** Enhancing the AI's ability to automatically identify plant species and diagnose diseases from uploaded photos.

- **User Authentication:** Adding multi-user support to allow cloud-based synchronization across devices.

- **Enhanced Chatbot Context:** Improving the chatbot's memory to reference previous interactions and specific plant history.

---

## Installation & Setup

### Clone the repository

    ```bash
    git clone <repository-url>
    ```

### Backend Setup

```bash
cd backend
npm install
# Configure .env with GEMINI_API_KEY
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## License

MIT License © 2025 Setayesh Golshan
