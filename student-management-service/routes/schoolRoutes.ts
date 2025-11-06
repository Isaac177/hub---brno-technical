import express from "express";
import { schoolController } from "../controllers/schoolController";

const router = express.Router();

router.get("/school/:schoolId/students", schoolController.getSchoolStudents);

export default router;