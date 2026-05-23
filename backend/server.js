const express = require("express");
const mongoose = require("mongoose");
const feedbackRoutes = require("./routes/feedback");
const cors = require("cors");
require("dotenv").config();

const app = express(); // ✅ FIRST create app

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api/feedback", feedbackRoutes);

// routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("Server is working");
});

// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});