import React, { useState } from 'react';

export default function CSSRSQuick({ member, onComposeNote }: { member: any; onComposeNote: (t: string) => void }) {
  const [answers, setAnswers] = useState<{ [k: string]: 'yes' | 'no' | undefined }>({});

  const q = [
    { id: 'wish_dead', text: 'Have you wished you were dead or wished you could go to sleep and not wake up?' },
    { id: 'thoughts', text: 'Have you actually had any thoughts of killing yourself?' },
    { id: 'intent', text: 'Have you been thinking about how you might do this or had any intention to act?' },
  ];

  const positive = Object.values(answers).some((v) => v === 'yes');

  const copyNote = () => {
    const lines = [
      `C-SSRS quick screen with ${member?.name || 'member'}:`,
      ...q.map((qi) => `- ${qi.text} ${answers[qi.id] ? '[' + answers[qi.id] + ']' : '[—]'} `),
      positive
        ? 'Positive screen. Escalated to clinician and provided 988 resources. Stayed with member and ensured safety steps.'
        : 'Negative screen. Offered support and resources as needed.',
    ];
    onComposeNote(lines.join('\n'));
  };

  return (
    <div>
      <div className="muted" style={{ marginBottom: 8 }}>
        This brief demo does not replace clinical screening. Escalate to a clinician on any positive.
      </div>
      {q.map((qi) => (
        <div key={qi.id} className="row">
          <div style={{ flex: 1 }}>{qi.text}</div>
          <select
            value={answers[qi.id] || ''}
            onChange={(e) => setAnswers((s) => ({ ...s, [qi.id]: e.target.value as any }))}
            style={{ background: '#0b1220', color: 'white', border: '1px solid #243145', borderRadius: 6, padding: '6px' }}
          >
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      ))}

      {positive ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: 6 }}>Positive screen: escalate now</div>
          <ul>
            <li>Warm handoff to clinician or supervisor immediately.</li>
            <li>
              Offer the 988 Suicide & Crisis Lifeline: <a href="https://988lifeline.org/" target="_blank" rel="noreferrer">988</a>
            </li>
            <li>Stay with member if in person; remove lethal means if safe; involve supports with consent.</li>
          </ul>
        </div>
      ) : (
        <div style={{ marginTop: 10 }} className="muted">
          No positives reported. Continue supportive conversation and review resources as needed.
        </div>
      )}

      <div>
        <button onClick={copyNote}>Autofill Note</button>
      </div>
    </div>
  );
}

