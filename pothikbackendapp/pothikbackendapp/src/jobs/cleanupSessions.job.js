// src/jobs/cleanupSessions.job.js

const { Sessions } = require("../models"); // your Sessions model
const { Op } = require("sequelize");

// Interval for running cleanup (e.g., every 1 hour)
const INTERVAL = 60 * 60 * 1000; // 1 hour

// Function to delete expired sessions
const cleanupSessions = async () => {
  try {
    const now = new Date();

    const deletedCount = await Sessions.destroy({
      where: {
        expires_at: {
          [Op.lt]: now,
        },
      },
    });

    console.log(`[Session Cleanup] ${deletedCount} expired sessions removed at ${now.toISOString()}`);
  } catch (err) {
    console.error("[Session Cleanup] Error:", err.message);
  }
};

// Start job
const startCleanupJob = () => {
  console.log("[Session Cleanup] Job started");
  cleanupSessions(); // Run immediately
  setInterval(cleanupSessions, INTERVAL); // Run repeatedly
};

module.exports = startCleanupJob;
