const path = require("path");

module.exports = {
  apps: [
    {
      name: "singgah",
      script: path.join(__dirname, "server.js"),

      exec_mode: "cluster",

      // Default 1 worker. Tiap worker bisa memakai hingga max_memory_restart;
      // 3 worker x 600M mudah kena OOM di paket hosting kecil, lalu PM2 restart
      // berulang dan hcdn mengembalikan 503. Naikkan hanya kalau RAM memadai.
      instances: parseInt(process.env.PM2_INSTANCES, 10) || 1,

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
