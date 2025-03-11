require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define Book Schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    publisher: String,
    date: String,
    website: String,
    tags: [String],
    location: String
});

const Book = mongoose.model('Book', bookSchema);

// Array of Books to Insert
const bookInventory = [
    {
        title: "Tokyo Vice",
        author: "Jake Adelstein",
        publisher: "Pantheon Books",
        date: "2009",
        website: "https://www.penguinrandomhouse.ca/books/198646/tokyo-vice-by-jake-adelstein/9780307475299",
        tags: ["Deep Dive Into Culture", "Local Read"],
        location: "Tokyo, Japan"
    },
    {
        title: "In a Sunburned Country",
        author: "Bill Bryson",
        publisher: "Broadway Books",
        date: "2000",
        website: "https://www.penguinrandomhouse.ca/books/20559/in-a-sunburned-country-by-bill-bryson/9780385259415",
        tags: ["Travel Memoir", "Pre-Trip Inspiration"],
        location: "Sydney, Australia"
    },
    {
        title: "Bangkok Wakes to Rain",
        author: "Pitchaya Sudbanthad",
        publisher: "Riverhead Books",
        date: "2019",
        website: "https://www.penguinrandomhouse.ca/books/566672/bangkok-wakes-to-rain-by-pitchaya-sudbanthad/9780525534778",
        tags: ["Local Read", "Deep Dive Into Culture"],
        location: "Bangkok, Thailand"
    },
    {
        title: "The Island", 
        author: "Victoria Hislop",
        publisher: "HarperCollins",
        date: "2005",
        website: "https://www.harpercollins.com/products/the-island-victoria-hislop?variant=32206060978210",
        tags: ["Travel Memoir", "Read While Traveling"],
        location: "Santorini, Greece"
    },
    {
        title: "A Strangeness in My Mind",
        author: "Orhan Pamuk",
        publisher: "Knopf",
        date: "2015",
        website: "https://www.penguinrandomhouse.com/books/212404/a-strangeness-in-my-mind-by-orhan-pamuk/",
        tags: ["Local Read", "Deep Dive Into Culture"],
        location: "Istanbul, Turkey"
    }
];

// Insert Books into MongoDB
Book.insertMany(bookInventory)
    .then(() => {
        console.log("Books inserted successfully!");
        mongoose.connection.close(); // Close connection after insertion
    })
    .catch(err => console.error("Error inserting books:", err));
