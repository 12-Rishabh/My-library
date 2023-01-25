const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    coverName: {
      type: String,
      required: true,
      min: 3,
    },
    authorName: {
      type: String,
      required: true,
      min: 3,
    },
    genre: {
      type: String,
      required: true,
      min: 3,
    },
    isIssued: {
      type: Boolean,
      required: true,
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
