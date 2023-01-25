const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const userRoutes = require("./API/routes/userRoutes");
const bookRoutes = require("./API/routes/bookRoutes");
const authRoutes = require("./API/routes/authRoutes");
const rateLimit = require("express-rate-limit");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nodejs Book-Library API using MongoDB",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:7000/api",
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./api/routes/bookRoutes.js",
    "./api/routes/userRoutes.js",
    "./api/routes/authRoutes.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGO_URL, {}, (err) => {
  if (err) console.log(err);
  else console.log("Connected to MongoDB!");
});

const limiter = rateLimit({
  max: 20,
  windowMs: 5000,
});

// middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users/", limiter, userRoutes);
app.use("/api/auth/", limiter, authRoutes);
app.use("/api/books/", limiter, bookRoutes);

const port = process.env.PORT || 7000;

app.listen(port, () => {
  console.log("Server : 7000 is running");
});

module.exports = app;
