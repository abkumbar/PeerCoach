import React, { useState } from 'react';

export default function BarrierSolver({ member, onComposeNote, mode = 'barriers' }: { member: any; onComposeNote: (t: string) => void; mode?: 'barriers' | 'recovery' }) {
  const [free, setFree] = useState('');
  const [checks, setChecks] = useState({ transport: false, pharmacy: false, benefits: false, childcare: false });

  const note = () => {
    if (mode === 'recovery') {
      return `Recovery goal set with ${member?.name || 'member'}: ${free || '—'}`;
    }
    return `Barrier check with ${member?.name || 'member'}: ${Object.entries(checks)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(', ') || 'none reported'}. Notes: ${free || '—'}`;
  };

  return (
    <div>
      {mode === 'recovery' ? (
        <div className="muted" style={{ marginBottom: 8 }}>
          Set one small, meaningful step that fits the member’s recovery plan (WRAP-style).
        </div>
      ) : (
        <div className="muted" style={{ marginBottom: 8 }}>
          Use motivational interviewing prompts to uncover barriers (transport, pharmacy, benefits, childcare, etc.).
        </div>
      )}

      {mode !== 'recovery' && (
        <div style={{ marginBottom: 8 }}>
          {(['transport', 'pharmacy', 'benefits', 'childcare'] as const).map((k) => (
            <label key={k} style={{ display: 'inline-flex', gap: 6, marginRight: 12 }}>
              <input type="checkbox" checked={checks[k]} onChange={(e) => setChecks((s) => ({ ...s, [k]: e.target.checked }))} />
              {k}
            </label>
          ))}
        </div>
      )}

      <div>
        <div className="muted">{mode === 'recovery' ? 'Small recovery step' : 'Notes / prompts'}</div>
        <textarea className="note-editor" value={free} onChange={(e) => setFree(e.target.value)} placeholder={mode === 'recovery' ? 'e.g., text a friend, 10min walk, join art group' : 'e.g., What might get in the way? What would help?'} />
      </div>

      <div>
        <button onClick={() => onComposeNote(note())}>Autofill Note</button>
      </div>
    </div>
  );
}

