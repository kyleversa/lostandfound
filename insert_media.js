require('dotenv').config();
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const mongoURI = process.env.MONGODB_URI;
const tmdbApiKey = 'cd0fa2acc4843b8d419fb897f5903f86';

const mediaSchema = new mongoose.Schema({
  title: String,
  creator: String,
  type: String,
  date: String,
  website: String,
  tags: [String],
  location: String,
  posterUrl: String
});
const Media = mongoose.model('Media', mediaSchema);

async function getPosterUrl(title) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results?.length > 0 && data.results[0].poster_path) {
      return `https://image.tmdb.org/t/p/w300${data.results[0].poster_path}`;
    }
  } catch (err) {
    console.error(`Error fetching poster for "${title}":`, err);
  }
  return '';
}

async function insertMedia() {
  await mongoose.connect(mongoURI);
  console.log("✅ Connected to MongoDB");

  const mediaItems = [
    {
      title: "Call Me by Your Name",
      creator: "Luca Guadagnino",
      type: "Film",
      date: "2017",
      website: "https://www.imdb.com/title/tt5726616/",
      tags: ["Visually Stunning", "Travel Nostalgia"],
      location: "Northern Italy"
    },
    {
      title: "Midnight in Paris",
      creator: "Woody Allen",
      type: "Film",
      date: "2011",
      website: "https://www.imdb.com/title/tt1605783/",
      tags: ["Culture & History", "Travel Nostalgia"],
      location: "Paris"
    },
    {
    title: "Vicky Cristina Barcelona",
    creator: "Woody Allen",
    type: "Film",
    date: "2008",
    website: "https://www.imdb.com/title/tt0497465/",
    tags: ["Culture & History", "Romantic", "Visually Stunning"],
    location: "Barcelona"
    },
    {
      title: "Lost in Translation",
      creator: "Sofia Coppola",
      type: "Film",
      date: "2003",
      website: "https://www.imdb.com/title/tt0335266/",
      tags: ["Visually Stunning", "Culture & History"],
      location: "Tokyo"
    },
    {
      title: "The Talented Mr. Ripley",
      creator: "Anthony Minghella",
      type: "Film",
      date: "1999",
      website: "https://www.imdb.com/title/tt0134119/",
      tags: ["Culture & History", "Travel Nostalgia"],
      location: "Italy"
    }
  ];

  for (let item of mediaItems) {
    item.posterUrl = await getPosterUrl(item.title);
    await Media.create(item);
    console.log(`✅ Inserted: ${item.title}`);
  }

  await mongoose.disconnect();
  console.log("✅ Done. All media items inserted.");
}

insertMedia();
