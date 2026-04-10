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

  // Check if current room is in Timed Mode
  const isTimedMode = roomCode.startsWith('T-');

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Message Listener & Time-Bomb Protocol
  useEffect(() => {
    if (view === 'chat') {
      const messagesRef = ref(db, `rooms/${roomCode}/messages`);
      const recentQuery = query(messagesRef, limitToLast(50));

      const unsubscribe = onChildAdded(recentQuery, (snapshot) => {
        const data = snapshot.val();
        const messageKey = snapshot.key;

        setMessages((prev) => {
          // Prevent duplicates
          if (prev.find(m => m.id === data.id)) return prev;
          
          // Add new message and keep local state to 50 items max
          const newMsgs = [...prev, { ...data, key: messageKey }];
          return newMsgs.slice(-50); 
        });

        // --- THE 45-SECOND DECAY (Only runs for 'T-' rooms) ---
        if (roomCode.startsWith('T-')) {
          const timeSinceSent = Date.now() - data.id;
          const delay = Math.max(0, 45000 - timeSinceSent);

          setTimeout(() => {
            // 1. Physically remove from database
            remove(ref(db, `rooms/${roomCode}/messages/${messageKey}`));
            // 2. Remove from local UI immediately
            setMessages((prev) => prev.filter(m => m.key !== messageKey));
          }, delay);
        }
      });

      return () => {
        // Firebase automatically handles detaching the listener when the reference changes
      };
    }
  }, [view, roomCode]);

  // Send Message & Prune Database Protocol
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messagesRef = ref(db, `rooms/${roomCode}/messages`);
    
    // 1. Send the message
    await push(messagesRef, { 
      text, 
      userId: socketId, 
      id: Date.now() 
    });

    setText('');

    // 2. Background Pruning: Ensure database never exceeds 50 messages
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

  // --- UI: HOME VIEW ---
  if (view === 'home') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-20">
        <header className="mb-12 text-center">
          <code className="mb-4 inline-block px-2 py-1 rounded bg-[var(--code-bg)] text-[var(--text-h)] border border-[var(--border)]">v1.2.0 — Timed Protocols</code>
          <h1 className="text-[var(--text-h)]">VanishChat</h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text)' }}>
            A minimalist communication protocol for secure, real-time data exchange.
          </p>
        </header>

        {!isJoining ? (
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
              onClick={() => { setRoomCode('GLOBAL'); setView('chat'); }}
              className="py-4 rounded-lg font-medium transition-all hover:opacity-90 cursor-pointer shadow-sm"
              style={{ background: 'var(--text-h)', color: 'var(--bg)' }}
            >
              Public Network
            </button>
            
            <button 
              onClick={() => {
                // Generates a standard 6-char code (e.g., X8F9A2)
                const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                setRoomCode(code); setView('chat');
              }}
              className="py-4 rounded-lg font-medium border transition-all hover:bg-[var(--code-bg)] cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--text-h)' }}
            >
              Secure Tunnel (Persistent)
            </button>

            <button 
              onClick={() => {
                // Generates a 'T-' prefixed 6-char code
                const code = 'T-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                setRoomCode(code); setView('chat');
              }}
              className="py-4 rounded-lg font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
            >
              <span>Timed Vanish Chat</span>
              <span className="text-[10px] uppercase font-mono opacity-70 tracking-widest">Messages decay in 45s</span>
            </button>

            <button 
              onClick={() => setIsJoining(true)}
              className="mt-4 text-sm font-medium uppercase tracking-widest transition-opacity hover:opacity-70 cursor-pointer"
              style={{ color: 'var(--text)' }}
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
              placeholder="6-CHAR CODE"
              className="p-4 rounded-lg border text-center font-mono text-xl tracking-[0.4em] outline-none focus:border-[var(--accent)] transition-all"
              style={{ background: 'var(--code-bg)', borderColor: 'var(--border)', color: 'var(--text-h)' }}
              maxLength={6}
            />
            <button 
              onClick={() => inputCode.length === 6 && (setRoomCode(inputCode), setView('chat'))}
              className="py-4 rounded-lg font-bold cursor-pointer transition-all hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Connect
            </button>
            <button 
              onClick={() => setIsJoining(false)} 
              className="text-xs font-bold uppercase opacity-50 hover:opacity-100 transition-opacity cursor-pointer text-[var(--text-h)]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- UI: CHAT VIEW ---
  return (
    <div className="flex flex-col h-screen max-w-full overflow-hidden">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between p-6 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <button 
          onClick={() => { setView('home'); setMessages([]); }} 
          className="text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity cursor-pointer text-[var(--text-h)]"
        >
          ← Exit
        </button>
        <div className="flex gap-4 items-center">
          {/* Visual Indicator for Timed Mode */}
          {isTimedMode && (
            <span className="text-[10px] uppercase font-black tracking-widest animate-pulse" style={{ color: 'var(--accent)' }}>
              ⏱️ 45s Decay Active
            </span>
          )}
          <span className="text-[10px] uppercase opacity-40 font-black tracking-widest text-[var(--text)]">Channel</span>
          <code className="px-2 py-1 rounded border" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>
            {roomCode}
          </code>
        </div>
      </nav>

      {/* Messages Window */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" style={{ background: 'var(--bg)' }}>
        {messages.length === 0 && (
          <div className="my-auto text-center opacity-30 font-mono text-sm tracking-widest text-[var(--text-h)]">... awaiting handshake ...</div>
        )}
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex flex-col ${m.userId === socketId ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`message-bubble ${m.userId === socketId ? 'me' : 'other'}`}>
              {m.text}
            </div>
            <span className="text-[10px] mt-1.5 opacity-40 font-mono tracking-tighter uppercase text-[var(--text)]">
              {new Date(m.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <footer className="p-6 border-t shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <form onSubmit={sendMessage} className="flex gap-4 max-w-4xl mx-auto">
          <input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Secure message..."
            className="flex-1 p-4 rounded-xl border transition-all outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--code-bg)', borderColor: 'var(--border)', color: 'var(--text-h)' }}
          />
          <button 
            type="submit" 
            disabled={!text.trim()} 
            className="px-8 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-30 cursor-pointer shadow-sm" 
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