const path = require("path");

module.exports = {
  apps: [
    {
      name: "singgah",
      script: path.join(__dirname, "server.js"),

      exec_mode: "cluster",

      // 2 worker x DB_POOL_MAX 12 = 24 koneksi, jauh di bawah batas TiDB
      // Serverless (~100). Worker berlebih justru memicu DB_POOL habis.
      instances: parseInt(process.env.PM2_INSTANCES, 10) || 2,

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
