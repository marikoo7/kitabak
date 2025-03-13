const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://kitabak-book-store:PNxQTxfIC2gWFXtk@cluster0.hbrci.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let bookCollections;

// Ensure the database connection is ready before processing requests
async function connectDB() {
  if (!bookCollections) {
    try {
      await client.connect();
      bookCollections = client.db("BookInventory").collection("books");
      console.log("Connected to MongoDB!");
    } catch (err) {
      console.error("Database connection error:", err);
      throw err;
    }
  }
}

// Middleware to ensure DB connection before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// POST - Upload a new book
app.post("/upload-book", async (req, res) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data provided!" });
    }

    const result = await bookCollections.insertOne(data);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error inserting book:", err);
    res.status(500).json({ error: "Failed to insert book" });
  }
});

// GET - Retrieve all books from the database and by genres
app.get("/all-books", async (req, res) => {
  try {
    const { genre } = req.query;

    let filter = {};
    if (genre) {
      const genresArray = genre.split(",");
      filter = { genres: { $in: genresArray } };
    }

    const books = await bookCollections.find(filter).toArray();
    res.status(200).json(books);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// PATCH - Update a book by ID
app.patch("/book/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid book ID format" });
    }

    const result = await bookCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({ message: "Book updated successfully", result });
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// DELETE - Remove a book by ID
app.delete("/book/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid book ID format" });
    }

    const result = await bookCollections.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// GET - Search books by title, author, genres
app.get("/search-books", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedQuery}`, "i");

    const books = await bookCollections.find({
      $or: [
        { title: { $regex: regex } },
        { author: { $regex: regex } },
        { genres: { $regex: regex } },
      ],
    }).toArray();

    res.status(200).json(books);
  } catch (err) {
    console.error("Error searching books:", err);
    res.status(500).json({ error: "Failed to search books" });
  }
});

// LOCAL HOST SUPPORT: Start server only when running locally
if (process.env.NODE_ENV !== "vercel") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// EXPORT for Vercel
module.exports = app;
