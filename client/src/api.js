// Anonymous per-browser id so progress tracking works without auth (add JWT auth later).
export function getUserId() {
  let id = localStorage.getItem('cliplingo_uid');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('cliplingo_uid', id);
  }
  return id;
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const fetchClips = () => fetch('/api/clips').then(handle);
export const fetchProgress = () => fetch(`/api/progress/${getUserId()}`).then(handle);

export function submitDescription({ clipId, text, audioBlob }) {
  const form = new FormData();
  form.append('userId', getUserId());
  form.append('clipId', clipId);
  if (audioBlob) form.append('audio', audioBlob, 'recording.webm');
  else form.append('text', text);
  return fetch('/api/feedback', { method: 'POST', body: form }).then(handle);
}
