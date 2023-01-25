process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const chaiHttp = require("chai-http");
const server = require("../index");
const mongoose = require("mongoose");
const Book = require("../API/models/Book");
const User = require("../API/models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const key = process.env.SECRET_KEY;

chai.use(chaiHttp);

describe("Books Test Cases", function () {
  before((done) => {
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error!!"));
    db.once("open", () => {
      console.log("Successfull Connection!!!");
      done();
    });
  });

  let tokenAdmin;
  let tokenUser;
  let bookId;

  it("Should signup a new user on POST /auth/signup", (done) => {
    const newUser = {
      email: "testavg1@gmail.com",
      username: "avg1User",
      password: "pass1234",
      isAdmin: false,
    };

    chai
      .request(server)
      .post("/api/auth/signup")
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(201);
      });
    done();
  });

  it("Should signup an admin on POST /auth/signup", (done) => {
    const newUser = {
      email: "admintest@gmail.com",
      username: "admintest",
      password: "pass1234",
      isAdmin: true,
    };

    chai
      .request(server)
      .post("/api/auth/signup")
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(201);
      });
    done();
  });

  it("Should login the admin and fill the token on POST /auth/login", (done) => {
    const loginDetails = {
      email: "admintest@gmail.com",
      password: "pass1234",
    };
    chai
      .request(server)
      .post("/api/auth/login")
      .send(loginDetails)
      .end((err, res) => {
        res.body.should.have.property("accessToken");
        tokenAdmin = res.body.accessToken;
        done();
      });
  });

  it("Should allow the admin to add a new book on /books POST", (done) => {
    const newBook = {
      authorName: "TestName 1",
      coverName: "Test covername 1",
      genre: "testGenre",
    };
    chai
      .request(server)
      .post("/api/books/")
      .set({ Authorization: `Bearer ${tokenAdmin}` })
      .send(newBook)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an("object");
        res.body.data.should.include({
          authorName: "TestName 1",
          coverName: "Test covername 1",
          genre: "testGenre",
        });
      });
    done();
  });

  it("Should get the desired book and fill the book id", async () => {
    const tempBook = await Book.findOne({
      coverName: "Test covername 1",
      authorName: "TestName 1",
    });

    bookId = tempBook._id.toString();
    expect(tempBook).to.be.an("object");
    expect(tempBook).to.have.property("_id");
  });

  it("Should get a book by id on GET /books/:id endpoint", (done) => {
    chai
      .request(server)
      .get(`/api/books/${bookId}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
      });
    done();
  });

  it("Should allow admin to modify a book details on /update/:id ", (done) => {
    const updatedBook = {
      authorName: "TestName updated",
      coverName: "Test covername updated",
      genre: "testGenre",
    };
    chai
      .request(server)
      .patch(`/api/books/update/${bookId}`)
      .set({ Authorization: `Bearer ${tokenAdmin}` })
      .send(updatedBook)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.include({ message: "The book has been updated!" });
        done();
      });
  });

  it("Should login the normal user and fill the token on POST /auth/login", (done) => {
    const loginDetails = {
      email: "testavg1@gmail.com",
      password: "pass1234",
    };
    chai
      .request(server)
      .post("/api/auth/login")
      .send(loginDetails)
      .end((err, res) => {
        res.body.should.have.property("accessToken");
        tokenUser = res.body.accessToken;
        done();
      });
  });

  it("Should deny a normal user to add a new book on POST /books", (done) => {
    const newBook = {
      authorName: "TestName 2",
      coverName: "Test covername 2",
      genre: "Test genre 2",
    };
    chai
      .request(server)
      .post("/api/books/")
      .set({ Authorization: `Bearer ${tokenUser}` })
      .send(newBook)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.an("string");
        res.body.should.be.eql("Only admin can add a book!");
        done();
      });
  });

  it("Should deny a normal user to update a book", (done) => {
    const updatedBook = {
      authorName: "TestName updated",
      coverName: "Test covername updated",
      genre: "testGenre",
    };
    chai
      .request(server)
      .patch(`/api/books/update/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser}` })
      .send(updatedBook)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.an("string");
        res.body.should.be.eql("Only admin can update a book!");
        done();
      });
  });

  it("Should get the list of all books in library on GET /books", (done) => {
    chai
      .request(server)
      .get("/api/books/")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        done();
      });
  });

  it("Should get the list of all books of a genre in library on GET /books/Genre/:genre ", (done) => {
    chai
      .request(server)
      .get("/api/books/Genre/testGenre")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        done();
      });
  });

  it("Should deny the normal user to delete the book on DELETE /books/:id", (done) => {
    chai
      .request(server)
      .delete(`/api/books/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser}` })
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.an("string");
        res.body.should.be.eql("Only admin can remove a book!");
        done();
      });
  });

  it("Should allow the admin to delete the book on DELETE /books/:id", (done) => {
    chai
      .request(server)
      .delete(`/api/books/${bookId}`)
      .set({ Authorization: `Bearer ${tokenAdmin}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql("Book deleted successfully!");
        done();
      });
  });

  after((done) => {
    // Remove all books after all test cases
    Book.deleteMany({}, (err) => {
      if (err) {
        throw err;
      }
      done();
    });
  });

  after((done) => {
    // Remove all users after all test cases
    User.deleteMany({}, (err) => {
      if (err) {
        throw err;
      }
      done();
    });
  });
});
