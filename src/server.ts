// server.ts
import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedAdmin";
import { connectDB } from "./app/config/db";

let server: Server;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");
    // Seed super admin user
    await seedSuperAdmin();

    server = app.listen(envVars.PORT, () => {
      console.log(`🚀 Server running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};

startServer();
