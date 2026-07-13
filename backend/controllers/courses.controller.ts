import z from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";

const createCourseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  subject: z.string().min(1),
  description: z.string().optional(),
});

const updateCourseSchema = createCourseSchema.partial();

export const getAllCourses = () => {
  return asyncHandler(async (req, res) => {
      const subject = typeof req.query.subject === "string" ? req.query.subject : undefined;
      const courses = await prisma.course.findMany({
        where: subject ? { subject } : undefined,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { lessons: true, quizzes: true } } },
      });
      res.json(courses);
    })
}

export const getCourseById = () => {
  return asyncHandler(async (req, res) => {
      const course = await prisma.course.findUnique({
        where: { id: req.params.id },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { materials: true },
          },
          quizzes: {
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true, description: true, _count: { select: { questions: true } } },
          },
        },
      });
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.json(course);
    })
}

export const adminCreateCourse = () => {
  return asyncHandler(async (req, res) => {
    const data = createCourseSchema.parse(req.body);
    const course = await prisma.course.create({ data });
    res.status(201).json(course);
  })
}

export const adminUpdateCourse=()=>
{
  return asyncHandler(async (req, res) => {
    const data = updateCourseSchema.parse(req.body);
    const course = await prisma.course.update({ where: { id: req.params.id }, data });
    res.json(course);
  })
}

export const adminDeleteCourse=()=>
{
  return asyncHandler(async (req, res) => {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
}