import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedAdmin";

let server: Server;

const startServer = async () => {
  try {
    console.log("Attempting to connect to MongoDB with URL:", envVars.DB_URL);
    await mongoose.connect(envVars.DB_URL, {
      connectTimeoutMS: 100000,
      socketTimeoutMS: 100000,
    });
    console.log("Connected to MongoDB ✅");
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port: ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();

const isServerless = !!process.env.VERCEL;

process.on("unhandledRejection", (error) => {
  console.log("UnhandledRejection error detected", error);
  if (!isServerless) {
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }
});

process.on("uncaughtException", (error) => {
  console.log("UncaughtException error detected", error);
  if (!isServerless) {
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }
});
