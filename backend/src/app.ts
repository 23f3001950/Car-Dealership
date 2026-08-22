import express from "express";
import cors from "cors";
import db from "./db";
import authRoutes from "./routes/auth";
import vehicleRoutes from "./routes/vehicles";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Car Dealership API is running"
  });
});

app.get("/api/health", (_req, res) => {
  db.get("SELECT 1 AS status", (err, row: any) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        database: "disconnected"
      });
    }

    return res.json({
      status: "ok",
      database: row.status === 1 ? "connected" : "error"
    });
  });
});

export default app;