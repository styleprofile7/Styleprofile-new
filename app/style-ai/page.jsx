'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { askStyleAI, STYLE_AI_SYSTEM, QUICK_PROMPTS } from '../../utils/styleAI';
import { getPersonalityName } from '../../utils/quizData';

export default function StyleAIPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  if (!currentUser) { router.push('/'); return null; }

  const personality = currentUser.personality
    ? `The user's fashion personality is: ${getPersonalityName(currentUser.personality)}.`
    : '';

  const systemPrompt = `${STYLE_AI_SYSTEM}\n\n${personality} Their name is ${currentUser.name || 'the user'}.`;

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    setError('');

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await askStyleAI(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        systemPrompt
      );
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      // Award XP for first message each session
      if (messages.length === 0) {
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), { points: increment(30) });
        } catch (_) {}
      }
    } catch (e) {
      setError('StyleAI is unavailable right now. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const S = {
    page: { maxWidth: '820px', margin: '0 auto', padding: '24px 20px 100px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' },
    header: { background: 'linear-gradient(135deg, #16302B, #1e4a3d)', borderRadius: '20px', padding: '24px', marginBottom: '20px', color: 'white', flexShrink: 0 },
    chatArea: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' },
    userBubble: { alignSelf: 'flex-end', background: '#16302B', color: 'white', padding: '12px 18px', borderRadius: '18px 18px 4px 18px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.6' },
    aiBubble: { alignSelf: 'flex-start', background: 'white', color: '#1A1A1A', padding: '16px 18px', borderRadius: '18px 18px 18px 4px', maxWidth: '80%', fontSize: '14px', lineHeight: '1.7', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #EBEBEB' },
    inputRow: { display: 'flex', gap: '10px', padding: '16px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', flexShrink: 0, marginTop: 'auto' },
    input: { flex: 1, border: '2px solid #EBEBEB', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'none', maxHeight: '120px' },
    sendBtn: { background: '#16302B', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 20px', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(163,133,96,0.25)', border: '2px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>✨</div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'white', marginBottom: '2px' }}>StyleAI</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
              Your personal fashion advisor · {getPersonalityName(currentUser.personality) || 'Style Expert'} mode
            </div>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(163,133,96,0.2)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
            +30 XP first chat
          </div>
        </div>

        {/* Quick prompts */}
        {messages.length === 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Quick questions</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p.text)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat */}
      <div style={S.chatArea}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✨</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#444', marginBottom: '8px' }}>Ask StyleAI anything</div>
            <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
              Get outfit advice, capsule wardrobe tips, style icon recs,<br />or anything fashion-related.
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={m.role === 'user' ? S.userBubble : S.aiBubble}>
            {m.role === 'assistant' && (
              <div style={{ fontSize: '11px', color: '#A38560', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>✨ StyleAI</div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ ...S.aiBubble, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ fontSize: '11px', color: '#A38560', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>✨ StyleAI</div>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A38560', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ background: '#fdf0ef', color: '#d9534f', padding: '12px 16px', borderRadius: '10px', fontSize: '13px' }}>{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={S.inputRow}>
        <textarea
          style={S.input}
          rows={1}
          placeholder="Ask about your style, outfits, brands..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button style={S.sendBtn} onClick={() => send()} disabled={loading || !input.trim()}>
          {loading ? '...' : 'Ask →'}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
