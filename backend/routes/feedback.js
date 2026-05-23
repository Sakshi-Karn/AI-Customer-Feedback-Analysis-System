const express = require("express");
const Feedback = require("../models/Feedback");
const analyzeSentiment = require("../utils/sentiment");

const router = express.Router();

// Submit feedback
router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!message) {
      return res.status(400).json("Message is required");
    }

    // AI sentiment
    const sentiment = await analyzeSentiment(message);

    // save to DB
    const feedback = await Feedback.create({
      userId,
      message,
      sentiment
    });

    // alert for negative
    if (sentiment === "negative") {
      console.log("⚠️ Negative feedback received!");
    }

    res.json(feedback);

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Get all feedback
router.get("/", async (req, res) => {
  try {
    const data = await Feedback.find();

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    data.forEach(item => {
      if (item.sentiment === "positive") positive++;
      else if (item.sentiment === "negative") negative++;
      else neutral++;
    });

    res.json({
      total: data.length,
      positive,
      negative,
      neutral,
      feedbacks: data
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;