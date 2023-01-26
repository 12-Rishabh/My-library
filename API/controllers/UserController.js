const User = require("./../models/User");
const Book = require("./../models/Book");
const userAuth = require("./../middleware/Authorization");

/**
 * @description - Dislay users' books
 *
 * @param  {object} req - request
 *
 * @param  {Object} res - response
 *
 * @return {Object} - Status code and book data
 *
 * Route: GET: /users/myBooks
 */

exports.getAllBooks = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.user.id);
    const books = await Promise.all(
      user.issuedBooks.map((bookId) => {
        return Book.findById(bookId);
      })
    );

    res.status(200).json(books);
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description - User issues book
 *
 * @param  {object} req - request
 *
 * @param  {object} res - response
 *
 * @return {Object} - Success message
 *
 * ROUTE: PATCH: /users/issue/:bookId
 */

exports.issueBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    const user = await User.findById(req.body.user.id);

    if (book.isIssued) {
      if (book.issuedBy === req.body.user.id) {
        res.status(200).json({
          message: "You have already issued this book!",
        });
      } else {
        res.status(200).json({
          message: "This book has been issued by someone else!",
        });
      }
    } else {
      await user.updateOne({ $push: { issuedBooks: req.params.bookId } });
      await book.updateOne({ issuedBy: req.body.user.id, isIssued: true });
      res.status(200).json({
        message: "Book issued successfully!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description - User returns book
 *
 * @param  {object} req - request
 *
 * @param  {object} res - response
 *
 * @return {Object} - Success message
 *
 * ROUTE: PATCH: /users/return/:bookId
 */

exports.returnBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    const user = await User.findById(req.body.user.id);

    // console.log(user);
    // console.log(book);

    if (book.isIssued) {
      if (book.issuedBy === req.body.user.id) {
        await user.updateOne({ $pull: { issuedBooks: req.params.bookId } });
        await book.updateOne({ issuedBy: "", isIssued: false });
        res.status(200).json({
          message: "Book returned successfully!",
        });
      } else {
        res.status(200).json({
          message: "This book has been issued by someone else!",
        });
      }
    } else {
      res.status(200).json({
        message: "You have not issued this book!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};

/**
 * @description - Admin/User delete a user
 *
 * @param  {Object} req - request
 *
 * @param  {Object} res - reponse
 *
 * @returns {Object} - returns success message
 *
 * Route: DELETE: /users/deleteMe/:id
 *
 */

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.body.user.isAdmin || req.body.user.id === req.params.id) {
      const user = await User.findById(req.body.user.id);
      for (const bookId of user.issuedBooks) {
        await Book.findByIdAndUpdate(bookId, { issuedBy: "", isIssued: false });
      }
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({
        message: "Account Successfully deleted.",
      });
    } else {
      res.status(401).json({
        message: "You are not allowed to delete this account!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
  next();
};
