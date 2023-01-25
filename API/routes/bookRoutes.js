const router = require("express").Router();
const Book = require("./../models/Book");
const BookController = require("./../controllers/BookController");
const userAuth = require("./../middleware/Authorization");

/**
 * @swagger
 *    definitions:
 *    BookRequest:
 *                    type: object
 *                    properties:
 *                            coverName:
 *                                 type: string
 *                            authorName:
 *                                 type: string
 *                            genre:
 *                                 type: string
 *    BookResponse:
 *                    type: object
 *                    properties:
 *                            coverName:
 *                                 type: string
 *                            authorName:
 *                                 type: string
 *                            genre:
 *                                 type: string
 *                            isIssued:
 *                                 type: boolean
 *                            issuedBy:
 *                                 type: string
 *                            _id:
 *                                 type: string
 */

//  parameters:
//  *       - name: book
//  *         description: Book object
//  *         in: body
//  *         required: true
//  *         schema:
//  *           $ref: '#/definitions/BookRequest'
//  *       - name: x-access-token
//  *         in: header
//  *         description: an authentication header
//  *         required: true
//  *         type: string

/**
 * @swagger
 * /books:
 *   post:
 *     tags:
 *       - Book Operations
 *     summary: Post a book into DB
 *     description: It adds a new book to the database
 *     parameters:
 *       - name: x-access-token
 *         in: header
 *         description: an authentication header
 *         required: true
 *         type: string
 *     requestBody:
 *         required: true
 *         content:
 *             application/json:
 *                 schema:
 *                     $ref: '#/definitions/BookRequest'
 *     responses:
 *       200:
 *         description: Book uploaded successfully
 *         content:
 *             application/json:
 *                 schema:
 *                    $ref : '#/definitions/BookResponse'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /books:
 *   get:
 *     tags:
 *       - Book Operations
 *     summary: Get all books from DB
 *     description: It gets all books from the database
 *     responses:
 *       200:
 *         description: Book uploaded successfully
 *         content:
 *             application/json:
 *                 schema:
 *                    $ref : '#/definitions/BookResponse'
 *       500:
 *         description: Internal server error
 */

router
  .route("")
  .post(userAuth.isLoggedIn, BookController.addNewBook)
  .get(BookController.getAllBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     tags:
 *       - Book Operations
 *     summary: Get a book from DB
 *     description: It gets a book from the database with given id
 *     parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           description: Valid Id required
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Book uploaded successfully
 *         content:
 *             application/json:
 *                 schema:
 *                    $ref : '#/definitions/BookResponse'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     tags:
 *       - Book Operations
 *     summary: Delete book from DB
 *     description: It is used to delete a book from the database with given id
 *     parameters:
 *       - name: x-access-token
 *         in: header
 *         description: an authentication header
 *         required: true
 *         type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Valid Id required
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       400:
 *         description: Bad input supplied
 *       401:
 *         description: Invalid token supplied
 *       500:
 *         description: Internal server error
 */
router
  .route("/:id")
  .get(BookController.getBook)
  .delete(userAuth.isLoggedIn, BookController.deleteBook);

/**
 * @swagger
 * /books/update/{id}:
 *   patch:
 *     tags:
 *       - Book Operations
 *     summary: update book from DB
 *     description: It is used to update a book from the database with given id
 *     parameters:
 *       - name: x-access-token
 *         in: header
 *         description: an authentication header
 *         required: true
 *         type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Valid Id required
 *         schema:
 *           type: string
 *     requestBody:
 *         required: true
 *         content:
 *             application/json:
 *                 schema:
 *                     $ref: '#/definitions/BookRequest'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *             application/json:
 *                 schema:
 *                    $ref : '#/definitions/BookResponse'
 *       500:
 *         description: Internal server error
 */

router
  .route("/update/:id")
  .patch(userAuth.isLoggedIn, BookController.updateBook);

/**
 * @swagger
 * /books/Genre/{genre}:
 *   get:
 *     tags:
 *       - Book Operations
 *     summary: Get all genre books from DB
 *     description: It gets all books of a given genre from the database
 *     parameters:
 *         - in: path
 *           name: genre
 *           required: true
 *           description: Book genre required
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Book uploaded successfully
 *         content:
 *             application/json:
 *                 schema:
 *                    $ref : '#/definitions/BookResponse'
 *       500:
 *         description: Internal server error
 */
router.route("/Genre/:genre").get(BookController.getGenreBooks);

module.exports = router;
