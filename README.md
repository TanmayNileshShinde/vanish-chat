# VanishChat 

**VanishChat** is a minimalist, ephemeral communication protocol designed for high-speed, secure messaging. Built with React and Firebase, it features a rolling-buffer system that ensures no more than 50 messages ever exist in a room at one time, alongside a 45-second auto-decay protocol for burner rooms.

- [Live Demo](https://vanishthechat.vercel.app)

---

## ⚡ Features

* **Ephemeral by Design:** Automatic database pruning keeps only the most recent 50 messages in standard rooms.
* **45-Second Time Bomb:** "Timed Vanish Chat" mode triggers a self-destruct sequence, physically deleting messages from the database 45 seconds after they are sent.
* **Zero Latency:** Real-time synchronization via Firebase Realtime Database.
* **Secure Tunnels:** Generate unique alphanumeric keys for private, encrypted sessions.
* **Adaptive UI:** Premium minimalist design (Glassmorphism & Bento Grid) that scales perfectly from mobile to ultra-wide displays.
* **No Logs:** Messages are physically removed from the Google Firebase servers once they exit the buffer or time out.

## 🛠️ Tech Stack

* **Frontend:** React 19 + Vite
* **Styling:** Tailwind CSS v4 + Custom CSS Variables
* **Database:** Firebase Realtime Database
* **Deployment:** Vercel

## 🚀 Local Setup

### 1. **Clone the repository**
   ```bash
   git clone [https://github.com/TanmayNileshShinde/vanish-chat.git](https://github.com/TanmayNileshShinde/vanish-chat.git)
   cd vanish-chat
   ```
### 2. Install dependencies


``` 
npm install
```
### 3. Configure Firebase

Update the firebaseConfig object in src/App.jsx with your own credentials from the Firebase Console if you are hosting your own instance.

### 4. Launch Dev Server

```
npm run dev
```

## 🔒 Security & Privacy
This application is designed for "moment-to-moment" conversation.

- Database Rules: Ensure your Firebase Realtime Database rules are configured to allow read/write access only to authorized endpoints or within test-mode parameters.

- Client-Side: Messages are cleared from local state immediately upon exiting a room or hitting the decay threshold.

## 👤 Contact
Tanmay Nilesh Shinde

- GitHub: https://github.com/TanmayNileshShinde

- LinkedIn: https://www.linkedin.com/in/tanmay-shinde-9b07753bb
