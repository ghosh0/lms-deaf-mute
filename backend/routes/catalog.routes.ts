import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { getCatalogSnapshot } from "../lib/catalog";

const router = Router();

const syncSchema = z.object({
  courses: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      subject: z.string().min(1),
      category: z.string().min(1),
      description: z.string().optional().default(""),
      longDescription: z.string().optional().default(""),
      color: z.string().optional().default(""),
      icon: z.string().optional().default(""),
      lessons: z.array(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1),
          description: z.string().optional().default(""),
          duration: z.string().optional().default(""),
          videoUrl: z.string().optional().default(""),
          materials: z.array(
            z.object({
              id: z.string().min(1),
              title: z.string().min(1),
              filename: z.string().min(1),
            }),
          ),
        }),
      ),
    }),
  ),
  quizzes: z.array(
    z.object({
      id: z.string().min(1),
      courseId: z.string().min(1),
      title: z.string().min(1),
      questions: z.array(
        z.object({
          id: z.string().min(1),
          question: z.string().min(1),
          options: z.array(z.string().min(1)).min(2),
          correctIndex: z.number().int().nonnegative(),
        }),
      ),
    }),
  ),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await getCatalogSnapshot());
  })
);

router.post(
  "/sync",
  asyncHandler(async (req, res) => {
    const data = syncSchema.parse(req.body);

    await prisma.course.deleteMany();

    for (const course of data.courses) {
      await prisma.course.create({
        data: {
          id: course.id,
          title: course.title,
          slug: course.id,
          subject: course.subject,
          category: course.category,
          description: course.description,
          longDescription: course.longDescription,
          color: course.color,
          icon: course.icon,
          lessons: {
            create: course.lessons.map((lesson, lessonIndex) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              duration: lesson.duration,
              videoUrl: lesson.videoUrl,
              order: lessonIndex,
              materials: {
                create: lesson.materials.map((material) => ({
                  id: material.id,
                  title: material.title,
                  filename: material.filename,
                })),
              },
            })),
          },
        },
      });
    }

    for (const quiz of data.quizzes) {
      await prisma.quiz.create({
        data: {
          id: quiz.id,
          courseId: quiz.courseId,
          title: quiz.title,
          questions: {
            create: quiz.questions.map((question, questionIndex) => ({
              id: question.id,
              text: question.question,
              order: questionIndex,
              options: {
                create: question.options.map((option, optionIndex) => ({
                  text: option,
                  isCorrect: optionIndex === question.correctIndex,
                  order: optionIndex,
                })),
              },
            })),
          },
        },
      });
    }

    res.json({ ok: true });
  })
);

export default router;
