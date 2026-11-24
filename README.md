# ClipLingo

AI-powered English learning app. Watch a short video clip, describe it by **voice or text**, and get instant **spelling and grammar feedback**. ClipLingo tracks your mistakes over time and shows which ones keep coming back.

**Stack:** MongoDB, Express, React (Vite), Node.js, Tailwind CSS, OpenAI Whisper (speech-to-text), LLM API (feedback generation)

## Features
- Describe short clips (15s or less) via typed text or microphone recording
- Whisper transcribes speech; an LLM returns corrected text, a score, categorised errors (spelling / grammar / vocabulary / punctuation), and a tip
- Progress dashboard: score trend and recurring mistake patterns (aggregated in MongoDB)
- Responsive UI built with React + Tailwind

## Architecture
```
client (React + Tailwind) --/api--> server (Express)
                                      |- Whisper  (audio -> transcript)
                                      |- LLM      (transcript -> structured JSON feedback)
                                      '- MongoDB  (clips, submissions, aggregated progress)
```

## Getting started
**Prereqs:** Node 20+, MongoDB running locally (or an Atlas URI), an OpenAI API key.

```bash
git clone https://github.com/<your-username>/cliplingo.git
cd cliplingo
npm run install:all
cp server/.env.example server/.env   # then add your OPENAI_API_KEY
npm run seed                          # loads sample clips
npm run dev                           # client :5173, server :5000
```

## API
| Method | Route | Description |
|---|---|---|
| GET | `/api/clips` | List clips |
| POST | `/api/feedback` | multipart/form-data: `userId`, `clipId`, and `text` or `audio` |
| GET | `/api/progress/:userId` | Stats + recurring mistakes |

## Roadmap
- [ ] JWT auth (currently an anonymous per-browser ID)
- [ ] Spaced-repetition drills built from recurring mistakes
- [ ] Clip upload / admin panel
- [ ] Deployment (Vercel + Render + MongoDB Atlas)
- [ ] Tests (Jest + Supertest)

## License
MIT
