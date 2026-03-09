# MediLink - AI-Powered Healthcare Platform

MediLink is a comprehensive healthcare platform designed for Ethiopia, featuring AI-powered health advice, symptom tracking, medication management, and appointment scheduling.

## Features

- **AI Health Advisor**: Powered by DeepSeek API with multilingual support (English/Amharic)
- **Symptom Tracker**: Analyze symptoms with AI-powered recommendations
- **Medication Manager**: Track medications, dosages, and reminders
- **Appointment Scheduler**: Schedule and manage healthcare appointments
- **Health Dashboard**: Comprehensive view of health metrics and recommendations
- **Emergency Alert**: Quick access to emergency services
- **Multilingual Support**: English and Amharic interface

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI) with styled-components
- **State Management**: React Context + useReducer
- **Internationalization**: i18next
- **Routing**: React Router v6
- **AI Integration**: DeepSeek API + Hugging Face
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- DeepSeek API key (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medl
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Create a `.env` file in the **repo root** (one level above `frontend/`):
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## Test Credentials (Development Mode)

For testing without a backend, the app includes mock authentication. Use these credentials:

### Patient Account
- **Email:** `patient@medilink.test`
- **Password:** `patient123`

### Provider Account
- **Email:** `provider@medilink.test`
- **Password:** `provider123`

### Admin Account
- **Email:** `admin@medilink.test`
- **Password:** `admin123`

> **Note:** These credentials work in development mode only (when no backend API is configured). In production, use the registration form or your backend API.

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── layout/                # Layout components
│   └── features/              # Feature-specific components
│       ├── auth/
│       ├── patient/
│       ├── provider/
│       ├── shared/
│       └── admin/
├── contexts/                  # React Context providers
├── services/                  # API and service integrations
├── types/                     # TypeScript type definitions
├── i18n/                      # Internationalization files
└── utils/                     # Utility functions
```

## Key Components

### HealthDashboard
Main dashboard showing health metrics, AI recommendations, medications, and appointments.

### SymptomTracker
Track symptoms with severity ratings and get AI-powered analysis with possible conditions and recommendations.

### MedicationManager
Manage current medications with dosage, frequency, and reminder settings.

### AIHealthAdvisor
Chat interface with AI health advisor powered by DeepSeek API.

### EmergencyAlert
Quick access to trigger emergency alerts with location and patient details.

## Development

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_DEEPSEEK_API_URL`: DeepSeek API endpoint
- `VITE_DEEPSEEK_API_KEY`: DeepSeek API key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For support, please contact [your contact information]

