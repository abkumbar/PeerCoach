import React, { useState } from 'react';

export default function FollowUpNudge({ member, onComposeNote }: { member: any; onComposeNote: (t: string) => void }) {
  const [when, setWhen] = useState('Within 7 days');
  const [mode, setMode] = useState('Call');
  const [barriers, setBarriers] = useState({ transport: false, pharmacy: false, benefits: false });

  const template = () => `Called ${member?.name || 'member'} to schedule ${when} follow-up. Mode: ${mode}.
Barriers checked: ${Object.entries(barriers)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ') || 'none reported'}.
`;

  return (
    <div>
      <div className="row">
        <label style={{ width: 160 }}>Target timing</label>
        <select
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          style={{ background: '#0b1220', color: 'white', border: '1px solid #243145', borderRadius: 6, padding: '6px' }}
        >
          <option>Within 7 days</option>
          <option>Within 30 days</option>
        </select>
      </div>
      <div className="row">
        <label style={{ width: 160 }}>Contact mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ background: '#0b1220', color: 'white', border: '1px solid #243145', borderRadius: 6, padding: '6px' }}
        >
          <option>Call</option>
          <option>Text</option>
          <option>Portal</option>
        </select>
      </div>
      <div>
        <div className="muted" style={{ marginTop: 8, marginBottom: 4 }}>Check barriers</div>
        {(['transport', 'pharmacy', 'benefits'] as const).map((k) => (
          <label key={k} style={{ display: 'inline-flex', gap: 6, marginRight: 12 }}>
            <input type="checkbox" checked={barriers[k]} onChange={(e) => setBarriers((s) => ({ ...s, [k]: e.target.checked }))} />
            {k}
          </label>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <div className="muted">Talk track</div>
        <div style={{ background: '#0b1220', border: '1px solid #243145', borderRadius: 6, padding: 8 }}>
          Hi {member?.name?.split(' ')[0] || 'there'}, I’m your peer guide. I’d like to help you schedule a follow-up within the next week. What day and time works for you? Any concerns with transportation or getting medications?
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={() => onComposeNote(template())}>Autofill Note</button>
      </div>
    </div>
  );
}

