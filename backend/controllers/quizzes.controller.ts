import z from "zod";
import { asyncHandler, HttpError } from "../middleware/error";
import { prisma } from "../lib/prisma";

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean().default(false),
  order: z.number().int().nonnegative().optional(),
});

const questionSchema = z.object({
  text: z.string().min(1),
  order: z.number().int().nonnegative().optional(),
  options: z.array(optionSchema).min(2),
});

const createQuizSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(questionSchema).optional().default([]),
});

const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
});

export const getAllQuizzes=()=>
{
    return asyncHandler(async (req, res) => {
        const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
        const quizzes = await prisma.quiz.findMany({
          where: courseId ? { courseId } : undefined,
          orderBy: { createdAt: "asc" },
          include: { _count: { select: { questions: true } } },
        });
        res.json(quizzes);
      })
}

export const getQuizById=()=>
{
    return asyncHandler(async (req, res) => {
        const includeAnswers = req.query.includeAnswers === "true";
        const quiz = await prisma.quiz.findUnique({
          where: { id: req.params.id },
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: { options: { orderBy: { order: "asc" } } },
            },
          },
        });
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    
        if (!includeAnswers) {
          quiz.questions = quiz.questions.map((q:any) => ({
            ...q,
            options: q.options.map(({ isCorrect: _ignore, ...rest }) => rest as typeof q.options[number]),
          }));
        }
        res.json(quiz);
      })
}

export const adminCreateQuiz=()=>
{
    return asyncHandler(async (req, res) => {
    const data = createQuizSchema.parse(req.body);
    const quiz = await prisma.quiz.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        questions: {
          create: data.questions.map((q, qi) => ({
            text: q.text,
            order: q.order ?? qi,
            options: {
              create: q.options.map((o, oi) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                order: o.order ?? oi,
              })),
            },
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });
    res.status(201).json(quiz);
  })
}

export const adminUpdateQuiz=()=>
{
    return asyncHandler(async (req, res) => {
    const data = updateQuizSchema.parse(req.body);
    const quiz = await prisma.quiz.update({ where: { id: req.params.id }, data });
    res.json(quiz);
  })
}

export const adminDeleteQuiz=()=>
{
    return asyncHandler(async (req, res) => {
    await prisma.quiz.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
}

export const adminCreateQuestion=()=>
{
    return asyncHandler(async (req, res) => {
        const data = questionSchema.parse(req.body);
        const question = await prisma.quizQuestion.create({
          data: {
            quizId: req.params.quizId,
            text: data.text,
            order: data.order ?? 0,
            options: {
              create: data.options.map((o, oi) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                order: o.order ?? oi,
              })),
            },
          },
          include: { options: true },
        });
        res.status(201).json(question);
      })
}

export const adminUpdateQuestion=()=>
{
    return asyncHandler(async (req, res) => {
        const schema = z.object({
          text: z.string().min(1).optional(),
          order: z.number().int().nonnegative().optional(),
        });
        const data = schema.parse(req.body);
        const question = await prisma.quizQuestion.update({
          where: { id: req.params.questionId },
          data,
        });
        res.json(question);
      })
}

export const adminDeleteQuestion=()=>
{
    return asyncHandler(async (req, res) => {
    await prisma.quizQuestion.delete({ where: { id: req.params.questionId } });
    res.status(204).send();
  })
}

export const adminCreateOption=()=>
{
    return asyncHandler(async (req, res) => {
        const data = optionSchema.parse(req.body);
        const option = await prisma.quizOption.create({
          data: {
            questionId: req.params.questionId,
            text: data.text,
            isCorrect: data.isCorrect,
            order: data.order ?? 0,
          },
        });
        res.status(201).json(option);
      })
}

export const adminUpdateOption=()=>
{
    return asyncHandler(async (req, res) => {
        const schema = optionSchema.partial();
        const data = schema.parse(req.body);
        const option = await prisma.quizOption.update({ where: { id: req.params.optionId }, data });
        res.json(option);
      })
}

export const adminDeleteOption=()=>
{
    return asyncHandler(async (req, res) => {
    await prisma.quizOption.delete({ where: { id: req.params.optionId } });
    res.status(204).send();
  })
}

export const handleSubmitQuiz=()=>
{
    return asyncHandler(async (req, res) => {
    const { answers } = submitSchema.parse(req.body);
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: { include: { options: true } } },
    });
    if (!quiz) throw new HttpError(404, "Quiz not found");

    const questionMap = new Map(quiz.questions.map((q:any) => [q.id, q]));

    const results = answers.map((a) => {
      const q = questionMap.get(a.questionId);
      if (!q) return { questionId: a.questionId, correct: false, error: "Unknown question" };
      const correctIds = q.options.filter((o:any) => o.isCorrect).map((o:any) => o.id).sort();
      const selected = [...new Set(a.selectedOptionIds)].sort();
      const correct =
        correctIds.length === selected.length &&
        correctIds.every((id:any, i:any) => id === selected[i]);
      return { questionId: a.questionId, correct, correctOptionIds: correctIds };
    });

    const score = results.filter((r) => r.correct).length;
    res.json({
      quizId: quiz.id,
      total: quiz.questions.length,
      answered: answers.length,
      score,
      results,
    });
  })
}