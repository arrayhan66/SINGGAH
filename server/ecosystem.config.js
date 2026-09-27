const path = require("path");

module.exports = {
  apps: [
    {
      name: "singgah",
      script: path.join(__dirname, "server.js"),

      exec_mode: "cluster",

      instances: parseInt(process.env.PM2_INSTANCES, 10) || 3,

      min_uptime: "20s",
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: "600M",

      env: {
        NODE_ENV: "production",
        PORT: 5000,
        SERVER_BACKLOG: "8192",
      },
    },
  ],
};
