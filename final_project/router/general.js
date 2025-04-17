const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = password;
  return res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', function (req, res) {
  getBookList()
    .then(bookList => res.status(200).json(bookList))
    .catch(error => res.status(500).json({ message: "Failed to retrieve books" }));
});

function getBookList() {
  return new Promise((resolve, reject) => {
    try {
      const bookList = Object.values(books).map(book => ({
        isbn: book.isbn,
        author: book.author,
        title: book.title,
        reviews: book.reviews
      }));
      resolve({ message: "Returned data using a Promise", data: bookList });
    } catch (error) {
      reject(error);
    }
  });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  getBookByIsbn(isbn)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(404).json({ message: "Book not found" }));
});

function getBookByIsbn(isbn) {
  return new Promise((resolve, reject) => {
    try {
      const book = Object.values(books).find(book => book.isbn === isbn);
      if (!book) {
        reject("Book not found");
      } else {
        resolve({ message: "Returned book data using a Promise", data: book });
      }
    } catch (error) {
      reject(error);
    }
  });
}
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  getBooksByAuthor(author)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(404).json({ message: "No books found by this author" }));
});

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    try {
      const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
      if (booksByAuthor.length === 0) {
        reject("No books found");
      } else {
        resolve({ message: "Returned books by author using a Promise", data: booksByAuthor });
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  getBooksByTitle(title)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(404).json({ message: "No books found with this title" }));
});

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    try {
      const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
      if (booksByTitle.length === 0) {
        reject("No books found");
      } else {
        resolve({ message: "Returned books by title using a Promise", data: booksByTitle });
      }
    } catch (error) {
      reject(error);
    }
  });
}

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = Object.values(books).find(book => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (Object.keys(book.reviews).length === 0) {
    return res.status(200).json({ message: "There are no reviews for this book yet" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
