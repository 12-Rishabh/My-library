const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    coverName: {
      type: String,
      require: true,
      min: 3,
    },
    authorName: {
      type: String,
      require: true,
      min: 3,
    },
    genre: {
      type: String,
      require: true,
      min: 3,
    },
    isIssued: {
      type: Boolean,
      require: true,
      default: false,
    },
    issuedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
