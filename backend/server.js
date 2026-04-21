const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Correct CORS
app.use(cors());

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// review route
app.post("/review", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Code is required" });
  }

  console.log("Received code:", code);

  res.json({
    message: "Code received successfully",
    code: code,
  });
});

// ✅ use port 8000
app.listen(8000, () => {
  console.log("Server running on port 8000");
});
