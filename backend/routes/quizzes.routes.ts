import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { adminCreateOption, adminCreateQuestion, adminCreateQuiz, adminDeleteOption, adminDeleteQuestion, adminDeleteQuiz, adminUpdateOption, adminUpdateQuestion, adminUpdateQuiz, getAllQuizzes, getQuizById, handleSubmitQuiz } from "../controllers/quizzes.controller.js";

const router = Router();

// List quizzes for a course (public)
router.get(
  "/",
  getAllQuizzes()
);

// Get quiz for taking (public). Hides isCorrect on options unless ?includeAnswers=true.
router.get(
  "/:id",
  getQuizById()
);

// Admin: create quiz (optionally with questions + options in one shot)
router.post(
  "/",
  adminCreateQuiz()
);

// Admin: update quiz meta
router.patch(
  "/:id",
  adminUpdateQuiz()
);

// Admin: delete quiz
router.delete(
  "/:id",
  adminDeleteQuiz()
);

// --- Questions ---

router.post(
  "/:quizId/questions",
  adminCreateQuestion()
);

router.patch(
  "/questions/:questionId",
  adminUpdateQuestion()
);

router.delete(
  "/questions/:questionId",
  adminDeleteQuestion()
);

// --- Options ---

router.post(
  "/questions/:questionId/options",
  adminCreateOption()
);

router.patch(
  "/options/:optionId",
  adminUpdateOption()
);

router.delete(
  "/options/:optionId",
  adminDeleteOption()
);

// --- Submit / grade quiz (public) ---

router.post(
  "/:id/submit",
  handleSubmitQuiz()
);

export default router;
