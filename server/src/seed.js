import mongoose from 'mongoose';
import Clip from './models/Clip.js';

// Replace these with your own <=15s clips (host them in /client/public/clips or on a CDN).
const clips = [
  { title: 'A flower opening', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', level: 'beginner', durationSec: 5 },
  { title: 'Big Buck Bunny (intro)', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', level: 'beginner', durationSec: 10 },
];

await mongoose.connect(process.env.MONGO_URI);
await Clip.deleteMany({});
await Clip.insertMany(clips);
console.log(`Seeded ${clips.length} clips`);
await mongoose.disconnect();
