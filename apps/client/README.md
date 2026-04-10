# TripLinker Mobile App

TripLinker is a high-performance React application designed for the modern traveler. It bridges the gap between social networking and travel planning, offering seamless booking experiences alongside community engagement.

## Features

### User Ecosystem
- **Dual Interface:** Toggle between standard 'Traveler' and 'Business' profiles.
- **Social Graph:** Follow fellow travelers, share stories, and build your travel network.
- **Community Groups:** Join "Style-based" travel groups (e.g., Solo Backpackers, Luxury Seekers).

### AI-Powered Exploration (Premium UI)
- **Smart Itinerary Generator:** Generates custom travel plans based on real-time listing data and user preferences.
- **AI Recommendations:** Personalized activity suggestions using mock-AI logic for a futuristic UX.

### Business & Booking
- **Unified Explore Page:** Real-time search for properties (stays) and activities.
- **Interactive Maps:** Visualized locations using Leaflet/Mapbox (integrated with backend geocoding).
- **Review System:** High-fidelity rating and review interaction.

### Travel Feed
- **Visual Stories:** Post journey photos, write travelogues, and interact with the community feed.

## Tech Stack

- **Framework:** React / React Native
- **State Management:** Redux Toolkit / Context API
- **Networking:** Axios (with Interceptors for JWT handling)
- **Styling:** Tailwind CSS / NativeWind
- **Animations:** Framer Motion / Reanimated (for premium AI loading states)

## Project Structure

```text
├── src/
│   ├── api/            # Axios instance & API services
│   ├── components/     # Reusable UI (Cards, Loaders, Modals)
│   ├── context/        # Auth & Theme State
│   ├── hooks/          # Custom hooks (useAuth, useLocation)
│   ├── screens/        # Main App Screens (Feed, Explore, AI Planner)
│   └── utils/          # Formatting & Helpers

```

## 🏁 Getting Started

1. **Clone the repo:**
```bash
git clone https://github.com/Parmendra-Panwar/TripLinkerApp.git

```


2. **Install dependencies:**
```bash
npm install

```


3. **Environment Setup:**
Create a `.env` file:
* `REACT_APP_API_URL=your_backend_url`


4. **Run Project:**
```bash
npm start

```

*Developed by Paras - AI & ML Enthusiast*