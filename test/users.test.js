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

describe("User Test cases", () => {
  let tokenAdmin;
  let tokenUser1;
  let tokenUser2;
  let bookId;
  let userId1;
  let userId2;

  it("Should signup a new user on POST /auth/signup", (done) => {
    const newUser = {
      email: "usertest1@gmail.com",
      username: "usertest1",
      password: "testpass",
      isAdmin: false,
    };

    chai
      .request(server)
      .post("/api/auth/signup")
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });

  it("Should signup another new user on POST /auth/signup", (done) => {
    const newUser = {
      email: "usertest2@gmail.com",
      username: "usertest2",
      password: "testpass",
      isAdmin: false,
    };

    chai
      .request(server)
      .post("/api/auth/signup")
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });

  it("Should signup an admin on POST /auth/signup", (done) => {
    const newUser = {
      email: "admintest@gmail.com",
      username: "admintest",
      password: "testpass",
      isAdmin: true,
    };

    chai
      .request(server)
      .post("/api/auth/signup")
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });

  it("Should login the admin and fill the token on POST /auth/login", (done) => {
    const loginDetails = {
      email: "admintest@gmail.com",
      password: "testpass",
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

  it("Should login user1 and fill the token on POST /auth/login", (done) => {
    const loginDetails = {
      email: "usertest1@gmail.com",
      password: "testpass",
    };
    chai
      .request(server)
      .post("/api/auth/login")
      .send(loginDetails)
      .end((err, res) => {
        res.body.should.have.property("accessToken");
        tokenUser1 = res.body.accessToken;
        done();
      });
  });

  it("Should login user2 and fill the token on POST /auth/login", (done) => {
    const loginDetails = {
      email: "usertest2@gmail.com",
      password: "testpass",
    };
    chai
      .request(server)
      .post("/api/auth/login")
      .send(loginDetails)
      .end((err, res) => {
        res.body.should.have.property("accessToken");
        tokenUser2 = res.body.accessToken;
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

  it("Should allow user1 to issue the book", (done) => {
    chai
      .request(server)
      .patch(`/api/users/issue/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser1}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql("Book issued successfully!");
        done();
      });
  });

  it("Should deny user1 to issue the same book", (done) => {
    chai
      .request(server)
      .patch(`/api/users/issue/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser1}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql("You have already issued this book!");
        done();
      });
  });

  it("Should deny user2 to issue the book", (done) => {
    chai
      .request(server)
      .patch(`/api/users/issue/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser2}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql(
          "This book has been issued by someone else!"
        );
        done();
      });
  });

  it("Should display the books issued by user1", (done) => {
    chai
      .request(server)
      .get("/api/users/myBooks")
      .set({ Authorization: `Bearer ${tokenUser1}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.should.have.length(1);
        done();
      });
  });

  it("Should allow user1 to return the book", (done) => {
    chai
      .request(server)
      .patch(`/api/users/return/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser1}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql("Book returned successfully!");
        done();
      });
  });

  it("Should not allow user1 to return the book", (done) => {
    chai
      .request(server)
      .patch(`/api/users/return/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser1}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql("You have not issued this book!");
        done();
      });
  });

  it("Should allow user2 to issue the book", (done) => {
    chai
      .request(server)
      .patch(`/api/users/issue/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser2}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql("Book issued successfully!");
        done();
      });
  });

  it("Should deny user1 to issue the book", (done) => {
    chai
      .request(server)
      .patch(`/api/users/issue/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser1}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql(
          "This book has been issued by someone else!"
        );
        done();
      });
  });

  it("Should find user1 and fill get it's ID", async () => {
    const tempUser = await User.findOne({
      email: "usertest1@gmail.com",
      username: "usertest1",
    });
    userId1 = tempUser._id.toString();
    typeof userId1.should.be.a("string");
  });

  it("Should find user2 and fill get it's ID", async () => {
    const tempUser = await User.findOne({
      email: "usertest2@gmail.com",
      username: "usertest2",
    });
    userId2 = tempUser._id.toString();
    typeof userId2.should.be.a("string");
  });

  it("Should deny user1 to delete user2", (done) => {
    chai
      .request(server)
      .delete(`/api/users/deleteMe/${userId2}`)
      .set({ Authorization: `Bearer ${tokenUser1}` })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.message.should.be.eql(
          "You are not allowed to delete this account!"
        );
        done();
      });
  });

  it("Should allow user2 to delete its account", (done) => {
    chai
      .request(server)
      .delete(`/api/users/deleteMe/${userId2}`)
      .set({ Authorization: `Bearer ${tokenUser2}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql("Account Successfully deleted.");
        done();
      });
  });

  it("Should allow user1 to issue the book", (done) => {
    chai
      .request(server)
      .patch(`/api/users/issue/${bookId}`)
      .set({ Authorization: `Bearer ${tokenUser1}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql("Book issued successfully!");
        done();
      });
  });

  it("Should allow admin to delete user1's account", (done) => {
    chai
      .request(server)
      .delete(`/api/users/deleteMe/${userId1}`)
      .set({ Authorization: `Bearer ${tokenAdmin}` })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.eql("Account Successfully deleted.");
        done();
      });
  });

  after((done) => {
    Book.deleteMany({}, (err) => {
      if (err) {
        throw err;
      }
      done();
    });
  });

  after((done) => {
    User.deleteMany({}, (err) => {
      if (err) {
        throw err;
      }
      done();
    });
  });
});
