import { useEffect, useRef, useState } from 'react';
import { fetchClips, submitDescription } from '../api.js';

const CATEGORY_COLORS = {
  spelling: 'bg-red-100 text-red-700',
  grammar: 'bg-amber-100 text-amber-700',
  vocabulary: 'bg-blue-100 text-blue-700',
  punctuation: 'bg-purple-100 text-purple-700',
};

export default function Practice() {
  const [clips, setClips] = useState([]);
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    fetchClips().then(setClips).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!audioBlob) return setAudioUrl(null);
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  const clip = clips[idx];

  const reset = () => {
    setText('');
    setAudioBlob(null);
    setResult(null);
    setError('');
  };

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' }));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      setError('Microphone access denied.');
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const data = await submitDescription({
        clipId: clip._id,
        text,
        audioBlob: mode === 'voice' ? audioBlob : null,
      });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!clip) return <p className="text-slate-500">{error || 'No clips yet. Run `npm run seed`.'}</p>;

  const canSubmit = mode === 'text' ? text.trim().length > 0 : !!audioBlob;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="font-semibold">{clip.title}</h2>
        <video key={clip._id} src={clip.videoUrl} controls loop className="w-full rounded-lg bg-black" />
        <p className="text-sm text-slate-500">Watch the clip, then describe what's happening in English.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <div className="flex gap-2">
          {['text', 'voice'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); }}
              className={`px-3 py-1 rounded-full text-sm ${mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
            >
              {m === 'text' ? 'Type' : 'Speak'}
            </button>
          ))}
        </div>

        {mode === 'text' ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Describe the clip..."
            className="w-full border rounded-lg p-3 focus:outline-indigo-500"
          />
        ) : (
          <div className="flex items-center gap-3">
            {!recording ? (
              <button onClick={startRecording} className="px-4 py-2 bg-red-500 text-white rounded-lg">Start recording</button>
            ) : (
              <button onClick={stopRecording} className="px-4 py-2 bg-slate-800 text-white rounded-lg animate-pulse">Stop</button>
            )}
            {audioUrl && !recording && <audio controls src={audioUrl} />}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-40"
        >
          {loading ? 'Checking...' : 'Get feedback'}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Feedback</h3>
            <span className="text-2xl font-bold text-indigo-600">{result.score}/100</span>
          </div>
          {result.inputType === 'voice' && (
            <p className="text-sm"><span className="font-medium">You said:</span> {result.text}</p>
          )}
          <p className="text-sm"><span className="font-medium">Corrected:</span> {result.correctedText}</p>
          {result.errors.length === 0 ? (
            <p className="text-green-600">No mistakes. Nice work!</p>
          ) : (
            <ul className="space-y-2">
              {result.errors.map((e, i) => (
                <li key={i} className="border rounded-lg p-3 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs mr-2 ${CATEGORY_COLORS[e.category] || 'bg-slate-100'}`}>
                    {e.category}{e.rule ? ` · ${e.rule}` : ''}
                  </span>
                  <span className="line-through text-red-500">{e.original}</span> → <span className="text-green-600 font-medium">{e.correction}</span>
                  <p className="text-slate-600 mt-1">{e.explanation}</p>
                </li>
              ))}
            </ul>
          )}
          {result.tip && <p className="text-sm bg-indigo-50 p-3 rounded-lg">Tip: {result.tip}</p>}
          <button
            onClick={() => { setIdx((idx + 1) % clips.length); reset(); }}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg"
          >
            Next clip
          </button>
        </div>
      )}
    </div>
  );
}
