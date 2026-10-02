import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import academicYearRoutes from "./routes/academicYearRoutes.js";
import { facultyRoutes, hodRoutes } from "./routes/userRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import syllabusRoutes from "./routes/syllabusRoutes.js";
import lecturePlanRoutes from "./routes/lecturePlanRoutes.js";

const app = express();

// Allow the React app to call this API
app.use(cors({ origin: process.env.CLIENT_URL }));

// Parse JSON request bodies into req.body
app.use(express.json());

// Health check route: used to test that the API is running
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AcademicTrack API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/hods", hodRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/lecture-plans", lecturePlanRoutes);

// Must stay LAST: 404 handler, then the error handler
app.use(notFound);
app.use(errorHandler);

export default app;