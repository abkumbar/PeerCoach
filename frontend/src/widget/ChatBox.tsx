import React, { useState } from 'react';
import { chatWithCoach } from './api';

export default function ChatBox({ memberId, onUseSuggestion }: { memberId: number; onUseSuggestion: (text: string) => void }) {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState<string>('');
  const [suggested, setSuggested] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await chatWithCoach({ memberId, message: (input || '').trim() });
      setReply(res.reply);
      setSuggested(res.suggestedActions || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ borderTop: '1px solid #243145', paddingTop: 8, marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontWeight: 700 }}>Chat with Coach</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for guidance (e.g., meds refill, FUH, safety)"
          style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #243145', background: '#0b1220', color: '#e2e8f0' }}
        />
        <button onClick={send} disabled={loading} style={{ padding: '6px 10px', borderRadius: 6, background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Sending…' : 'Ask'}
        </button>
      </div>
      {error && <div style={{ color: '#f87171', marginTop: 6 }}>{error}</div>}
      {reply && (
        <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
          {reply}
        </div>
      )}
      {suggested?.length ? (
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {suggested.map((a) => (
            <button
              key={a.id}
              className="nba-button"
              onClick={() => onUseSuggestion(a.label)}
              title="Add as note snippet"
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
