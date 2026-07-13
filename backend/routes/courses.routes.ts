import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { adminCreateCourse, adminDeleteCourse, adminUpdateCourse, getAllCourses, getCourseById } from "../controllers/courses.controller.js";

const router = Router();

// List courses (public). Optional ?subject= filter.
router.get(
  "/",
  getAllCourses()
);

// Get one course with lessons + quiz summary (public).
router.get(
  "/:id",
  getCourseById()
);

// Admin: create course
router.post(
  "/",
  adminCreateCourse()
);

// Admin: update course
router.patch(
  "/:id",
  adminUpdateCourse()
);

// Admin: delete course (cascades lessons/materials/quizzes)
router.delete(
  "/:id",
  adminDeleteCourse()
);

export default router;
