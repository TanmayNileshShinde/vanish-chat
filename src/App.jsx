import { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  onChildAdded, 
  push, 
  query, 
  limitToLast, 
  get, 
  remove 
} from "firebase/database";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0G3DJbSiHgFWRVhgxUfTbp2JVw6FeVW0",
  authDomain: "my-chat-app-9798.firebaseapp.com",
  projectId: "my-chat-app-9798",
  storageBucket: "my-chat-app-9798.firebasestorage.app",
  messagingSenderId: "1060491022346",
  appId: "1:1060491022346:web:ac887fec3402524317cff3",
  measurementId: "G-HLCC14V8M8",
  databaseURL: "https://my-chat-app-9798-default-rtdb.asia-southeast1.firebasedatabase.app/" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function App() {
  const [view, setView] = useState('home'); 
  const [roomCode, setRoomCode] = useState('GLOBAL');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [socketId] = useState(Math.random().toString(36).substr(2, 9));
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time listener with "Last 50" limit
  useEffect(() => {
    if (view === 'chat') {
      const messagesRef = ref(db, `rooms/${roomCode}/messages`);
      const recentQuery = query(messagesRef, limitToLast(50));

      const unsubscribe = onChildAdded(recentQuery, (snapshot) => {
        const data = snapshot.val();
        setMessages((prev) => {
          if (prev.find(m => m.id === data.id)) return prev;
          // Keep local state at 50 messages too
          const newMsgs = [...prev, { ...data }];
          return newMsgs.length > 50 ? newMsgs.slice(newMsgs.length - 50) : newMsgs;
        });
      });

      return () => {
        // Firebase handles unbinding automatically when room changes
      };
    }
  }, [view, roomCode]);

  // Send Message + Auto-Delete Logic
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messagesRef = ref(db, `rooms/${roomCode}/messages`);

    // 1. Push new message
    await push(messagesRef, { 
      text, 
      userId: socketId, 
      id: Date.now() 
    });

    setText('');

    // 2. Database Cleanup (Auto-Prune)
    // We check the full list and delete anything beyond the 50th message
    const snapshot = await get(messagesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const keys = Object.keys(data);
      
      if (keys.length > 50) {
        const numToDelete = keys.length - 50;
        for (let i = 0; i < numToDelete; i++) {
          await remove(ref(db, `rooms/${roomCode}/messages/${keys[i]}`));
        }
      }
    }
  };

  // --- HOME VIEW ---
  if (view === 'home') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-20">
        <header className="mb-12">
          <code className="mb-4">v1.1.0 — Auto-Vanish</code>
          <h1>VanishChat</h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text)' }}>
            A professional communication protocol. 
            Only the last 50 messages are retained in the live buffer.
          </p>
        </header>

        {!isJoining ? (
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
              onClick={() => { setRoomCode('GLOBAL'); setView('chat'); }}
              className="py-4 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: 'var(--text-h)', color: 'var(--bg)' }}
            >
              Enter Public Network
            </button>
            <button 
              onClick={() => {
                const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                setRoomCode(code); setView('chat');
              }}
              className="py-4 rounded-lg font-medium border transition-all hover:bg-[var(--code-bg)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-h)' }}
            >
              Create Secure Room
            </button>
            <button 
              onClick={() => setIsJoining(true)}
              className="mt-4 text-sm font-medium uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              Join with code →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-sm animate-in fade-in zoom-in duration-300">
            <input 
              autoFocus
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="000000"
              className="p-4 rounded-lg border text-center font-mono text-xl tracking-[0.4em]"
              style={{ background: 'var(--code-bg)', borderColor: 'var(--border)', color: 'var(--text-h)' }}
              maxLength={6}
            />
            <button 
              onClick={() => inputCode.length === 6 && (setRoomCode(inputCode), setView('chat'))}
              className="py-4 rounded-lg font-bold"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Connect
            </button>
            <button onClick={() => setIsJoining(false)} className="text-xs font-bold uppercase opacity-50 hover:opacity-100 transition-opacity">Cancel</button>
          </div>
        )}
      </div>
    );
  }

  // --- CHAT VIEW ---
  return (
    <div className="flex flex-col h-screen max-w-full overflow-hidden">
      <nav className="flex items-center justify-between p-6 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <button 
          onClick={() => { setView('home'); setMessages([]); }} 
          className="text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
        >
          ← Exit
        </button>
        <div className="flex gap-4 items-center">
          <span className="text-[10px] uppercase opacity-40 font-black tracking-widest">Channel</span>
          <code style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{roomCode}</code>
        </div>
      </nav>

      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
        style={{ background: 'var(--bg)' }}
      >
        {messages.length === 0 && (
          <div className="my-auto opacity-20 font-mono text-sm tracking-widest">... awaiting handshake ...</div>
        )}
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex flex-col ${m.userId === socketId ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`message-bubble ${m.userId === socketId ? 'me' : 'other'}`}>
              {m.text}
            </div>
            <span className="text-[9px] mt-1.5 opacity-30 font-mono tracking-tighter uppercase">
              {new Date(m.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <footer className="p-6 border-t shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <form onSubmit={sendMessage} className="flex gap-4 max-w-4xl mx-auto">
          <input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Secure message..."
            className="flex-1 p-4 rounded-xl border transition-all focus:ring-2 ring-[var(--accent-bg)]"
            style={{ background: 'var(--code-bg)', borderColor: 'var(--border)', color: 'var(--text-h)' }}
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="px-8 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-30"
            style={{ background: 'var(--text-h)', color: 'var(--bg)' }}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;