import { useState } from 'react';
import Practice from './pages/Practice.jsx';
import Progress from './pages/Progress.jsx';

export default function App() {
  const [tab, setTab] = useState('practice');
  const tabClass = (t) =>
    `px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold text-indigo-700">ClipLingo</h1>
        <nav className="flex gap-2">
          <button className={tabClass('practice')} onClick={() => setTab('practice')}>Practice</button>
          <button className={tabClass('progress')} onClick={() => setTab('progress')}>My Progress</button>
        </nav>
      </header>
      {tab === 'practice' ? <Practice /> : <Progress />}
    </div>
  );
}
