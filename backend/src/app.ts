import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/project.routes";



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("STWMS Backend is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/auth", authRoutes);

export default app;