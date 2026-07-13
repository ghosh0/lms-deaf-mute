import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { adminCreateLesson, adminDeleteLesson, adminUpdateLesson, getCourseLessons, getLessonById } from "../controllers/lessons.controller.js";

const router = Router();

// List lessons for a course (public)
router.get(
  "/",
  getCourseLessons()
);

// Get one lesson (public)
router.get(
  "/:id",
  getLessonById()
);

// Admin: create
router.post(
  "/",
  adminCreateLesson()
);

// Admin: update
router.patch(
  "/:id",
  adminUpdateLesson()
);

// Admin: delete
router.delete(
  "/:id",
  adminDeleteLesson()
);

export default router;