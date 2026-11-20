# 💡 DSA Assistant — Features Guide

Welcome to **DSA Assistant** (DSA LLM)! This document explains all the features of the application in a clean, straightforward, and easy-to-read way.

---

## 📌 What is DSA Assistant?

**DSA Assistant** is a dedicated full-stack AI web application designed specifically to teach **Data Structures and Algorithms (DSA)**. Powered by Google's Gemini AI, it helps developers and students master complex computer science topics—from Big-O notation and linked lists to dynamic programming and graph algorithms—inside a distraction-free, modern interface.

---

## 🌟 Key Features at a Glance

| Feature | What It Does | Why It Helps |
| :--- | :--- | :--- |
| 🤖 **Specialized DSA Instructor** | AI strictly focused on Data Structures & Algorithms | Keeps you focused on coding without off-topic chatter |
| 🧠 **Smart Memory & Auto-Summaries** | Automatically summarizes long chats in the background | Remembers long conversations without slowing down or wasting tokens |
| 💬 **Multiple Chat Sessions** | Start new chats or switch between previous discussions | Organize learning by topic (e.g., Arrays, Trees, Sorting) |
| 🏷️ **Smart Auto-Titling** | Automatically titles conversations based on your question | Easy to find past chats in your sidebar |
| 🔒 **Secure User Authentication** | User sign-up and login with password hashing & JWT tokens | Keeps your chat history private and saved to your account |
| ⚡ **Modern Dark-Mode UI** | Fast, responsive interface built with Tailwind CSS | Comfortable for late-night coding sessions |

---

## 🔍 Detailed Feature Walkthrough

### 1. 🤖 Dedicated DSA AI Instructor
- **Laser-focused on DSA:** The AI is instructed specifically as a DSA tutor. It explains concepts, breaks down logic step-by-step, and provides clear code implementations.
- **No off-topic distractions:** If asked about unrelated topics (like weather, general chat, or pop culture), the assistant firmly redirects the conversation back to algorithms and data structures.
- **Code & Complexity Breakdown:** The AI gives clean code snippets, explains edge cases, and provides Time & Space Complexity analysis (Big-O notation).

---

### 2. 🧠 Smart Rolling Context & Background Summarization
One common problem with AI chats is that long conversations get expensive, slow, or exceed token limits. DSA Assistant solves this automatically:

- **10-Message Sliding Window:** When you send a prompt, the system passes the last 10 messages to the AI so the immediate context stays fresh and fast.
- **Automated Rolling Summary:** Every 10 messages, the system asks Gemini to generate a concise summary of the discussion (preserving key algorithms discussed, progress made, and unresolved questions).
- **Long-term Memory:** Future prompts include this rolling summary + the recent messages. The AI remembers what you learned earlier without needing to resend hundreds of past messages.
- **Non-blocking & Resilient:** Summarization happens smoothly in the background. If summary generation ever runs into a network hiccup, your chat response is never delayed or lost.

```
[Older Messages] ──> Summarized into a compact brief ──┐
                                                        ├──> Fed into AI as Context
[Last 10 Messages] ──> Sent as recent chat history ─────┘
```

---

### 3. 💬 Conversation Management & Sidebar History
- **New Chat in One Click:** Tap the `+ New Chat` button whenever you want to explore a new algorithm or topic with a clean slate.
- **Automatic Conversation Titling:** You don't need to name your chats. The app automatically creates a clean, readable title based on your opening question (truncated neatly if long).
- **Persistent Chat History:** All your chats and messages are saved in a PostgreSQL database via Prisma ORM. You can return days later and pick up right where you left off.
- **Seamless Switching:** Easily switch between topics in the left sidebar. The app handles data loading smoothly and prevents accidental state mixing.

---

### 4. 🔒 User Accounts & Data Security
- **Signup & Login:** Create your account with your name, email, and password.
- **Password Security:** All passwords are encrypted using industry-standard `bcrypt` before being stored.
- **Stateless JWT Sessions:** Logins generate a secure JSON Web Token (JWT) stored in your browser session for seamless access.
- **Protected Routes:** The chat interface is strictly protected; unauthenticated visitors are automatically redirected to the login page.
- **User Privacy & Isolation:** Every conversation is bound directly to your user ID. Other users cannot see or access your chat history.

---

### 5. 🎨 Intuitive, Developer-Friendly UI
- **Starter Inspiration Prompts:** Starting fresh? Click one of the starter cards (e.g., *"Explain binary search"*, *"What is a linked list?"*, *"Explain Big O notation"*) to begin instantly.
- **Keyboard Shortcuts:**
  - `Enter`: Quickly send your message.
  - `Shift + Enter`: Insert a new line (great for pasting multiline code or examples).
- **Visual "Thinking" State:** A smooth animated indicator appears while the AI processes your question so you know your response is on its way.
- **Auto-Scroll:** The view automatically scrolls smoothly to the latest response as messages arrive.
- **Responsive Layout:** Works smoothly across both desktop screens and smaller laptop displays.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router |
| **Backend** | Node.js, Express 5, TypeScript (`tsx`), Zod (validation) |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcrypt` |
| **AI Model** | Google Gemini (`gemini-3.5-flash`) via `@google/genai` |

---

## 🚀 How to Run the Project Locally

### 1. Backend Setup
```bash
cd server
npm install
# Make sure your .env has DATABASE_URL, GEMINI_API_KEY, and JWT_SECRET
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

Once running, visit `http://localhost:5173` in your browser to sign up and start learning DSA!
