const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users[username] !== undefined;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users[username] === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
  //res.cookie('jwt', token, { httpOnly: true });
  req.session.authorization = { accessToken: token };
  return res.status(200).json({ message: "You have logged in successfully" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const token = req.session.authorization.accessToken;

  if (!token) {
    return res.status(401).json({ message: "User not logged in" });
  }

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const username = decoded.username;
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified successfully" });
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  const book = Object.values(books).find(book => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
