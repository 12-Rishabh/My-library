const Book = require("./../models/Book");

/**
 * @description - Admin add new book
 *
 * @param  {object} req - request
 *
 * @param  {object} res - response
 *
 * @return {Object} - Object containing status code and success message
 *
 * Route: POST: /books
 *
 */

exports.addNewBook = async (req, res, next) => {
  try {
    const newBook = new Book({
      coverName: req.body.coverName,
      authorName: req.body.authorName,
      genre: req.body.genre,
    });

    if (req.body.user.isAdmin) {
      const book = await newBook.save();
      res.status(201).json({
        message: "Added successfully",
        data: book,
      });
    } else {
      res.status(403).json("Only admin can add a book!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description - displays a book
 *
 * @param  {object} req - request
 *
 * @param  {object} res - response
 *
 * @return {Object} - Book details
 *
 *  Route: GET: /api/books/:id
 */

exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description - displays all books
 *
 * @param  {object} req - request
 *
 * @param  {object} res - response
 *
 * @return {Object} - Book details
 *
 *  Route: GET: /api/books
 */

exports.getAllBooks = async (req, res, next) => {
  try {
    const allBooks = await Book.find();
    res.status(200).json(allBooks);
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description - displays books of a genre
 *
 * @param  {object} req - request
 *
 * @param  {object} res - response
 *
 * @return {Object} - Book details
 *
 *  Route: GET: /api/books/Genre/:genre
 */

exports.getGenreBooks = async (req, res, next) => {
  try {
    const allBooks = await Book.find({ genre: req.params.genre });
    res.status(200).json(allBooks);
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description -updates a book
 *
 * @param  {object} req - request
 *
 * @param  {object} res - response
 *
 * @return {Object} - Success message
 *
 *  Route: PATCH: /api/books/update/:id
 */

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (req.body.user.isAdmin) {
      const { user, ...changes } = req.body;
      console.log(changes);
      await book.updateOne({ $set: changes });
      res.status(200).json({
        message: "The book has been updated!",
      });
    } else {
      res.status(403).json("Only admin can update a book!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description - Admin delete a book
 *
 * @param  {Object} req - request
 *
 * @param  {Object} res - reponse
 *
 * @returns {Object} - returns success message
 *
 * Route: DELETE: /books/:bookId
 *
 */

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (req.body.user.isAdmin) {
      await book.deleteOne();
      res.status(200).json("Book deleted successfully!");
    } else {
      res.status(403).json("Only admin can remove a book!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};
