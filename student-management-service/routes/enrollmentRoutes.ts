import express from "express";
import {
  checkEnrollmentStatus,
  createEnrollment,
  getEnrollmentDetails,
  listEnrollments,
  updateEnrollmentStatus,
  getEnrollmentsByUserEmail,
  getEnrollmentsByUserId,
  activateEnrollment,
  getEnrollmentsByBatchCourseIds,
  getEnrollmentsByCourseId
} from "../controllers/enrollmentController";

const router = express.Router();

// Create and update endpoints
router.post("/enrollments", createEnrollment);
router.patch("/enrollments", updateEnrollmentStatus);

// Specific endpoints first
router.post("/enrollments/batch", getEnrollmentsByBatchCourseIds);
router.get("/enrollments/course/:courseId", getEnrollmentsByCourseId);
router.get("/enrollments/user/:userId", getEnrollmentsByUserId);
router.get("/enrollments/by-email", getEnrollmentsByUserEmail);
router.get("/enrollments/status", checkEnrollmentStatus);
router.post("/enrollments/:enrollmentId/activate", activateEnrollment);

// Generic endpoints with params last
router.get("/enrollments/:id", getEnrollmentDetails);
router.get("/enrollments", listEnrollments);

export default router;
