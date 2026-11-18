import React, { useState } from 'react';

export default function SafetyPlan({ member, onComposeNote }: { member: any; onComposeNote: (t: string) => void }) {
  const [data, setData] = useState({
    signs: '',
    coping: '',
    supports: '',
    professionals: '',
    environment: '',
  });

  const copyNote = () => {
    const lines = [
      `Safety Plan review/creation with ${member?.name || 'member'}:`,
      `- Warning signs: ${data.signs || '—'}`,
      `- Coping strategies: ${data.coping || '—'}`,
      `- Social supports: ${data.supports || '—'}`,
      `- Professionals: ${data.professionals || '—'}`,
      `- Safe environment steps: ${data.environment || '—'}`,
    ];
    onComposeNote(lines.join('\n'));
  };

  const set = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setData((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div>
      <div className="muted" style={{ marginBottom: 8 }}>
        This simplified checklist references the Stanley-Brown Safety Planning Intervention. Use local policy for full forms.
      </div>
      <div>
        <div className="muted">Warning signs</div>
        <textarea className="note-editor" value={data.signs} onChange={set('signs')} />
      </div>
      <div>
        <div className="muted">Coping strategies</div>
        <textarea className="note-editor" value={data.coping} onChange={set('coping')} />
      </div>
      <div>
        <div className="muted">Social supports</div>
        <textarea className="note-editor" value={data.supports} onChange={set('supports')} />
      </div>
      <div>
        <div className="muted">Professionals</div>
        <textarea className="note-editor" value={data.professionals} onChange={set('professionals')} />
      </div>
      <div>
        <div className="muted">Safe environment steps</div>
        <textarea className="note-editor" value={data.environment} onChange={set('environment')} />
      </div>
      <div>
        <button onClick={copyNote}>Autofill Note</button>
      </div>
    </div>
  );
}

