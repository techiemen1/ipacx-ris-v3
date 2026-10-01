// FILE: backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pacsV3Router = require("./routes/pacsV3");
const keyImagesV3Router = require("./routes/keyImagesV3");
const reportsV3Router = require("./routes/reportsV3");
const billingV3Router = require("./routes/billingV3");
const mwlV3Router = require("./routes/mwlV3");
const authV3Router = require("./routes/authV3");
const signaturesV3Router = require("./routes/signaturesV3");
const configV3Router = require("./routes/configV3");
const templatesV3Router = require("./routes/templatesV3");

const path = require("path");

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static uploaded key images and attachments
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register API v3 Routes
app.use("/api/v3/pacs", pacsV3Router);
app.use("/api/v3/key-images", keyImagesV3Router);
app.use("/api/v3/reports", reportsV3Router);
app.use("/api/v3/billing", billingV3Router);
app.use("/api/v3/mwl", mwlV3Router);
app.use("/api/v3/auth", authV3Router);
app.use("/api/v3/signatures", signaturesV3Router);
app.use("/api/v3/config", configV3Router);
app.use("/api/v3/templates", templatesV3Router);

// Legacy/Compatibility Route Aliases
app.use("/api/pacs", pacsV3Router);
app.use("/api/pacs/v2/key-images", keyImagesV3Router);
app.use("/api/key-images", keyImagesV3Router);


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
