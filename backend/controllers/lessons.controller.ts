import z from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";

const createLessonSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
});

const updateLessonSchema = createLessonSchema.partial().omit({ courseId: true });

export const getCourseLessons = () => {
    return asyncHandler(async (req, res) => {
        const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
        const lessons = await prisma.lesson.findMany({
          where: courseId ? { courseId } : undefined,
          orderBy: [{ courseId: "asc" }, { order: "asc" }],
          include: { materials: true },
        });
        res.json(lessons);
      })
}

export const getLessonById = () => {
    return asyncHandler(async (req, res) => {
        const lesson = await prisma.lesson.findUnique({
          where: { id: req.params.id },
          include: { materials: true, course: { select: { id: true, title: true } } },
        });
        if (!lesson) return res.status(404).json({ error: "Lesson not found" });
        res.json(lesson);
      })
}

export const adminCreateLesson=()=>
{
    return asyncHandler(async (req, res) => {
    const data = createLessonSchema.parse(req.body);
    const lesson = await prisma.lesson.create({ data });
    res.status(201).json(lesson);
  })
}

export const adminUpdateLesson=()=>
{
    return asyncHandler(async (req, res) => {
    const data = updateLessonSchema.parse(req.body);
    const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data });
    res.json(lesson);
  })
}

export const adminDeleteLesson=()=>
{
    return asyncHandler(async (req, res) => {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
}