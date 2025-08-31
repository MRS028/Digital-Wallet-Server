import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { start } from "repl";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to MongoDB ✅");
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port: ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();

process.on("unhandledRejection", (error) => {
  console.log(
    "UnhandledRejection error detected ....Server shutting down",
    error
  );
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.log(
    "UncaughtException error detected ....Server shutting down",
    error
  );
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
