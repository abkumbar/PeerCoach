export type Member = any;

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch(`${API_BASE}/api/members`);
  if (!res.ok) throw new Error('Failed to fetch members');
  const data = await res.json();
  return data.members;
}

export async function fetchMember(id: number): Promise<Member> {
  const res = await fetch(`${API_BASE}/api/members/${id}`);
  if (!res.ok) throw new Error('Failed to fetch member');
  return await res.json();
}

export async function requestNBA(body: { member_id: number; note_text?: string; context_override?: any }) {
  const res = await fetch(`${API_BASE}/api/nba`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to compute NBA');
  return await res.json();
}

export async function logAction(body: { member_id: number; action_id: string; action_label: string; note_text?: string }) {
  try {
    await fetch(`${API_BASE}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {}
}

export async function chatWithCoach(body: { memberId: number | string; message: string }): Promise<{ reply: string; suggestedActions: { id: string; label: string }[] }>
{
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to chat with coach');
  return await res.json();
}
