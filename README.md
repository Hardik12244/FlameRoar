# FlameRoar 🔥 | Gamified DSA & Software Engineering Learning Platform

![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Clerk Auth](https://img.shields.io/badge/Clerk_Auth-5.0-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Tutor-4285F4?style=for-the-badge&logo=google&logoColor=white)

> **An interactive RPG world where developers master Data Structures & Algorithms by exploring regions, defeating coding bosses, solving algorithmic challenges, and leveling up their Hero.**

---

## ⚡ Instant Evaluation (Recruiter & Reviewer Demo Mode)

We know technical recruiters, hiring managers, and interviewers have limited time. We built a zero-configuration **Instant Demo Mode** so you can evaluate the entire application in under 30 seconds without creating an account or configuring API keys!

### 🚀 How to Launch in 30 Seconds:
1. **Clone & Install**:
   ```bash
   git clone https://github.com/yourusername/flameroar.dev.git
   cd flameroar.dev
   npm install
   ```
2. **Start the Platform**:
   ```bash
   npm run dev:all
   ```
   *(This concurrently boots the API server on **Port 5055** and the frontend application on **Port 5173**).*
3. **Experience the Game**:
   - Open [http://localhost:5173](http://localhost:5173) in your browser.
   - Click the **"⚡ Launch Instant Demo (Guest Mode)"** button on the authentication screen.
   - **You're in!** The backend runs in `MOCK_MODE=true` by default, providing instant access to a fully leveled hero profile with pre-populated activity history, unlocked map zones, and active challenges.

---

## 🌟 Key Features & Highlights

### 🗺️ Interactive RPG World & Exploration
- **Dynamic Zones**: Progress through curated territories including the *Academy of Basics*, *Outlaw Trail (Arrays & Strings)*, *Recursion Realm*, and *Graph Graveyard*.
- **Fog of Knowledge**: Unexplored regions remain shrouded in fog until you conquer prerequisite coding challenges and level up your character.
- **District Navigation**: Seamlessly jump between the Village Hub, Battle Arena, Skill Tree, and Mentors Guild.

### ⚔️ Gamified DSA Curriculum & Boss Battles
- **Class Specializations**: Choose your identity as an *Array Knight*, *Recursion Mage*, *Graph Assassin*, or *Pointer Paladin*.
- **Algorithmic Boss Fights**: Engage in turn-based coding battles where answering algorithmic problems correctly deals damage to enemies.
- **Real-time Mechanics**: Earn Gold (🪙), Experience Points (XP), and maintain daily learning streaks while managing Focus Energy.

### 🧠 AI Mentor & Dynamic Skill Tree
- **Powered by Google Gemini (`gemini-2.5-flash`)**: Receive intelligent, contextual explanations, algorithmic hints, and interactive lesson breakdowns.
- **Adaptive Curriculum**: The Skill Tree dynamically tracks your mastery across core computer science concepts, unlocking advanced nodes as you demonstrate proficiency.

### 📊 Comprehensive Analytics & Activity History
- **Accuracy & Metric Grid**: Track problems attempted, questions solved, current streak, focus energy, and overall accuracy percentage.
- **Chronological Activity Log**: Dedicated `/history` dashboard recording every challenge attempt, lesson completion, and boss encounter with timestamped precision.

### 📱 Responsive Pixel-Art & Glassmorphic UI
- **Built for All Devices**: Tailored desktop navigation sidebar that transforms into an intuitive, pixel-art bottom navigation strip on mobile screens (320px, 375px, tablets).
- **Smooth Micro-Animations**: Powered by Framer Motion for delightful UI transitions, floating panels, and interactive feedback.

---

## 🏗️ System Architecture & Tech Stack

The workspace is structured into two primary production applications focusing on high reliability, clean separation of concerns, and defensive programming:

```text
flameroar.dev/
├── apps/
│   ├── api/          # Express.js REST API + Socket.IO + Mongoose Models
│   │   ├── src/
│   │   │   ├── controllers/  # Async handlers with strict input validation
│   │   │   ├── services/     # Core game mechanics, AI tutoring & lesson engines
│   │   │   ├── models/       # MongoDB schemas (User, Challenge, Lesson, Leaderboard)
│   │   │   └── routes/       # API endpoints & authentication middleware
│   │   └── tests/        # Automated system verification & live audit suites
│   └── web/          # React 19 + Vite + Tailwind CSS + Framer Motion
│       ├── src/
│       │   ├── components/   # Modular UI layout, map navigation & landing components
│       │   ├── context/      # AuthState, WorldUI, and synchronization providers
│       │   ├── pages/        # Dashboard, Battle Arena, Skill Tree, History & Auth
│       │   └── services/     # Axios API client with standardized error handling
├── docs/             # Product specifications and architectural documentation
└── package.json      # Root workspace scripts & concurrency management
```

### Core Technologies:
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, React Router DOM v7.
- **Backend**: Node.js, Express 5, MongoDB (Mongoose 8), Socket.IO, Google GenAI SDK (`@google/genai`).
- **Authentication**: Clerk Auth (`@clerk/clerk-react` & `@clerk/express`) with seamless fallback support for offline/demo evaluation.
- **Security & Hardening**: Strict server-side input sanitization, bounded XP/Coin mutation checks, and verified Clerk token extraction to prevent client-side manipulation and exploits.

---

## 🚀 Installation & Setup Guide

### Prerequisites
- Node.js v18.0 or higher
- npm v9.0 or higher
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/flameroar.dev.git
cd flameroar.dev
```

### Step 2: Install Workspace Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Copy the example environment file to create your local `.env`:
```bash
cp .env.example .env
```
*Note: By default, `MOCK_MODE=true` is enabled in `.env.example`, allowing the backend to run locally without requiring an active MongoDB instance or Clerk secret keys!*

### Step 4: Launch the Development Servers
Run both the backend API and frontend client simultaneously from the root directory:
```bash
npm run dev:all
```
- 🌐 **Frontend Web App**: `http://localhost:5173`
- 🔌 **Backend REST API**: `http://localhost:5055`

---

## 🧪 Verification & Audit Testing

FlameRoar includes an automated backend live verification suite that tests endpoint health, database synchronization, game mechanics, and activity logging.

To run the live system audit against your running backend:
```bash
npm run audit
```
*Expected Output:*
```text
🔍 FLAMEROAR LIVE SYSTEM AUDIT
==================================================
✅ Health Check Passed (Server running on port 5055)
✅ User Profile & Stats Synchronized
✅ Activity History Recording Verified
✅ Game Mechanics & XP Bounds Verified
==================================================
🎉 AUDIT COMPLETE: System is ready for production showcase!
```

To verify frontend build integrity:
```bash
npm run build:web
```

---

## 📸 Portfolio Showcase & Screenshot Guide (For Students & Developers)

If you are using FlameRoar as a centerpiece on your resume, developer portfolio, or GitHub profile, adding visual proof of your work drastically increases recruiter engagement. Follow this guide to capture and embed professional showcases:

### Recommended Screenshot Checklist
Create a folder named `docs/screenshots/` in the repository root and capture the following views:

1. **`dashboard.png` (The Village Hub)**:
   - Capture the main dashboard showing the hero stats grid, accuracy percentage, and the recent activity history log.
2. **`world_map.png` (Interactive RPG Map)**:
   - Capture the full-screen interactive world map highlighting unlocked regions and district markers.
3. **`boss_battle.png` (Algorithmic Battle Arena)**:
   - Navigate to `/game` and screenshot a live coding challenge or boss encounter.
4. **`skill_tree.png` (AI Tutoring Tree)**:
   - Screenshot the algorithmic concept tree with unlocked mastery nodes.
5. **`mobile_view.png` (Responsive Bottom Navigation)**:
   - Resize your browser to 375px width (iPhone 13/14 Pro view) and screenshot the sleek bottom navigation bar and responsive dashboard layout.

### How to Embed Screenshots in this README
Once you have saved your screenshots in `docs/screenshots/`, uncomment and replace the placeholder section below in your repository:

```markdown
### 🖼️ Platform Preview
| Village Hub & Stats | Interactive World Map |
|:---:|:---:|
| ![Village Hub](docs/screenshots/dashboard.png) | ![World Map](docs/screenshots/world_map.png) |

| Algorithmic Battle Arena | Responsive Mobile View |
|:---:|:---:|
| ![Battle Arena](docs/screenshots/boss_battle.png) | ![Mobile View](docs/screenshots/mobile_view.png) |
```

### 💡 Pro-Tip: Recording an Interactive GIF
Recruiters love seeing software in action! Use free tools like **CleanShot X** (macOS), **LICEcap** (Win/Mac), or **OBS Studio** to record a 10-second GIF showing:
1. Selecting a coding quest.
2. Submitting the correct algorithmic answer.
3. The XP gain animation and activity history update!
Save it as `docs/screenshots/gameplay_demo.gif` and pin it right under the hero title!

---

## 🛡️ Why This Project Stands Out (For Technical Reviewers)

When reviewing this codebase for software engineering roles, notice the following engineering principles:
1. **Clean Architectural Separation**: Strict MVC-inspired boundaries separating HTTP request handling (`controllers/`), business logic and game mechanics (`services/`), and data persistence (`models/`).
2. **Defensive Programming & Security**: Zero trust in client-submitted stats. All XP gains, coin rewards, and level progressions are computed and verified server-side with strict boundary checks.
3. **Resilient Offline/Mock Fallbacks**: Designed with developer experience and reviewer accessibility as a first-class priority, ensuring zero white-screen crashes or blocked evaluation flows.
4. **Zero Over-Engineering**: Avoids unnecessary enterprise bloat (no Kafka, Redis, or Kubernetes where simple, reliable Express/MongoDB structures serve the exact product requirements better).

---

## 📜 License & Acknowledgments
Built with passion for developer education and clean software architecture.
Licensed under the MIT License.
