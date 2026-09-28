// FILE: backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pacsV3Router = require("./routes/pacsV3");
const keyImagesV3Router = require("./routes/keyImagesV3");
const reportsV3Router = require("./routes/reportsV3");

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Register API v3 Routes
app.use("/api/v3/pacs", pacsV3Router);
app.use("/api/v3/key-images", keyImagesV3Router);
app.use("/api/v3/reports", reportsV3Router);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "iPaCX RIS/PACS v3.0 Core Engine",
    version: "3.0.0",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 iPaCX RIS/PACS v3.0 Core Engine running on port ${PORT}`);
  console.log(`=======================================================`);
});
