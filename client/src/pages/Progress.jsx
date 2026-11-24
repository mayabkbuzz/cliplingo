import { useEffect, useState } from 'react';
import { fetchProgress } from '../api.js';

export default function Progress() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-slate-500">Loading...</p>;
  if (data.totalSubmissions === 0) return <p className="text-slate-500">Nothing yet. Do a practice round first.</p>;

  const max = Math.max(...data.recurringMistakes.map((m) => m.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Submissions" value={data.totalSubmissions} />
        <Stat label="Avg score (last 20)" value={data.averageScore ?? '-'} />
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-3">Score trend</h3>
        <div className="flex items-end gap-1 h-24">
          {data.scoreHistory.map((s, i) => (
            <div key={i} title={`${s.score}`} className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${s.score}%` }} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-3">Your recurring mistakes</h3>
        {data.recurringMistakes.length === 0 ? (
          <p className="text-green-600">No recurring mistakes yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.recurringMistakes.map((m, i) => (
              <li key={i}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{m.rule} <span className="text-slate-400">({m.category})</span></span>
                  <span>{m.count}x</span>
                </div>
                <div className="h-2 bg-slate-100 rounded">
                  <div className="h-2 bg-amber-500 rounded" style={{ width: `${(m.count / max) * 100}%` }} />
                </div>
                {m.example && (
                  <p className="text-xs text-slate-500 mt-1">
                    e.g. "{m.example.original}" → "{m.example.correction}"
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="bg-white rounded-xl shadow p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold text-indigo-600">{value}</p>
  </div>
);
