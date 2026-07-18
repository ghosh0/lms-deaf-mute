import { Prisma } from "@prisma/client";
import { execSync } from "node:child_process";
import { prisma } from "./prisma";

export type CatalogStudyMaterial = {
  id: string;
  title: string;
  filename: string;
};

export type CatalogLesson = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  materials: CatalogStudyMaterial[];
};

export type CatalogQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export type CatalogQuiz = {
  id: string;
  courseId: string;
  title: string;
  questions: CatalogQuizQuestion[];
};

export type CatalogCourse = {
  id: string;
  title: string;
  subject: string;
  category: string;
  description: string;
  longDescription: string;
  color: string;
  icon: string;
  lessons: CatalogLesson[];
};

const seedCourses: CatalogCourse[] = [
  {
    id: "the-heart",
    title: "The Heart",
    subject: "Biology",
    category: "Biology",
    description:
      "Understand the structure and function of the human heart, from chambers to circulation.",
    longDescription:
      "A free, beginner-friendly course on the human heart. Learn how the heart pumps blood, the role of each chamber, and how oxygen travels through your body — all through short video lessons and downloadable study materials.",
    color: "hsl(12 65% 53%)",
    icon: "heart",
    lessons: [
      {
        id: "the-heart-l1",
        courseId: "the-heart",
        title: "Introduction to the Heart",
        description: "An overview of the heart and its role in the body.",
        duration: "8 min",
        videoUrl: "https://www.youtube.com/embed/CWFyxn0qDEU",
        materials: [
          { id: "m1", title: "Heart Diagram Handout", filename: "heart-diagram.pdf" },
          { id: "m2", title: "Key Terms Glossary", filename: "heart-glossary.pdf" },
        ],
      },
      {
        id: "the-heart-l2",
        courseId: "the-heart",
        title: "Chambers and Valves",
        description: "Explore the four chambers and the valves between them.",
        duration: "11 min",
        videoUrl: "https://www.youtube.com/embed/x3Yf3G9VqA8",
        materials: [
          { id: "m3", title: "Chambers & Valves Notes", filename: "chambers-valves.pdf" },
        ],
      },
      {
        id: "the-heart-l3",
        courseId: "the-heart",
        title: "Blood Circulation",
        description: "Trace the path of blood through the body and lungs.",
        duration: "14 min",
        videoUrl: "https://www.youtube.com/embed/CWFyxn0qDEU",
        materials: [
          { id: "m4", title: "Circulation Pathway Map", filename: "circulation-map.pdf" },
        ],
      },
    ],
  },
  {
    id: "french-revolution",
    title: "The French Revolution",
    subject: "History",
    category: "History",
    description:
      "From storming the Bastille to the rise of Napoleon — the events that reshaped France.",
    longDescription:
      "A free course covering the causes, key events, and consequences of the French Revolution. Through video lessons and study notes, understand how a nation was transformed.",
    color: "hsl(27 76% 51%)",
    icon: "landmark",
    lessons: [
      {
        id: "french-revolution-l1",
        courseId: "french-revolution",
        title: "Causes of the Revolution",
        description: "Social, economic, and political tensions in 18th-century France.",
        duration: "12 min",
        videoUrl: "https://www.youtube.com/embed/DtY-BL0jGqg",
        materials: [
          { id: "m5", title: "Causes Summary Sheet", filename: "revolution-causes.pdf" },
        ],
      },
      {
        id: "french-revolution-l2",
        courseId: "french-revolution",
        title: "Storming the Bastille",
        description: "The dramatic events of July 1789.",
        duration: "10 min",
        videoUrl: "https://www.youtube.com/embed/DtY-BL0jGqg",
        materials: [
          { id: "m6", title: "Timeline of 1789", filename: "timeline-1789.pdf" },
        ],
      },
      {
        id: "french-revolution-l3",
        courseId: "french-revolution",
        title: "The Reign of Terror",
        description: "Robespierre, the guillotine, and the radical phase.",
        duration: "15 min",
        videoUrl: "https://www.youtube.com/embed/DtY-BL0jGqg",
        materials: [
          { id: "m7", title: "Key Figures Bios", filename: "revolution-figures.pdf" },
        ],
      },
    ],
  },
  {
    id: "solar-system",
    title: "The Solar System",
    subject: "Physics",
    category: "Physics",
    description:
      "Journey through the planets, moons, and other bodies that orbit our Sun.",
    longDescription:
      "A free, visual tour of our solar system. Learn about each planet, the Sun, asteroids, and comets through engaging video lessons and printable study guides.",
    color: "hsl(220 50% 55%)",
    icon: "orbit",
    lessons: [
      {
        id: "solar-system-l1",
        courseId: "solar-system",
        title: "The Sun and Inner Planets",
        description: "Mercury, Venus, Earth, and Mars — the rocky worlds.",
        duration: "13 min",
        videoUrl: "https://www.youtube.com/embed/libKVRa01L8",
        materials: [
          { id: "m8", title: "Inner Planets Fact Sheet", filename: "inner-planets.pdf" },
        ],
      },
      {
        id: "solar-system-l2",
        courseId: "solar-system",
        title: "The Gas Giants",
        description: "Jupiter, Saturn, Uranus, and Neptune.",
        duration: "16 min",
        videoUrl: "https://www.youtube.com/embed/libKVRa01L8",
        materials: [
          { id: "m9", title: "Gas Giants Comparison", filename: "gas-giants.pdf" },
        ],
      },
      {
        id: "solar-system-l3",
        courseId: "solar-system",
        title: "Asteroids, Comets & Dwarf Planets",
        description: "The smaller bodies of our solar system.",
        duration: "9 min",
        videoUrl: "https://www.youtube.com/embed/libKVRa01L8",
        materials: [
          { id: "m10", title: "Small Bodies Guide", filename: "small-bodies.pdf" },
        ],
      },
    ],
  },
];

const seedQuizzes: CatalogQuiz[] = [
  {
    id: "quiz-the-heart",
    courseId: "the-heart",
    title: "The Heart — Quiz",
    questions: [
      {
        id: "q1",
        question: "How many chambers does the human heart have?",
        options: ["2", "3", "4", "5"],
        correctIndex: 2,
      },
      {
        id: "q2",
        question: "Which chamber pumps oxygenated blood to the body?",
        options: ["Right atrium", "Right ventricle", "Left atrium", "Left ventricle"],
        correctIndex: 3,
      },
      {
        id: "q3",
        question: "Which valve is between the left atrium and left ventricle?",
        options: ["Tricuspid", "Mitral", "Pulmonary", "Aortic"],
        correctIndex: 1,
      },
      {
        id: "q4",
        question: "What is the largest artery in the body?",
        options: ["Pulmonary artery", "Aorta", "Carotid artery", "Femoral artery"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "quiz-french-revolution",
    courseId: "french-revolution",
    title: "The French Revolution — Quiz",
    questions: [
      {
        id: "q1",
        question: "In which year did the French Revolution begin?",
        options: ["1776", "1789", "1799", "1804"],
        correctIndex: 1,
      },
      {
        id: "q2",
        question: "Which event is considered the start of the Revolution?",
        options: [
          "Execution of the king",
          "Storming of the Bastille",
          "Tennis Court Oath",
          "Coronation of Napoleon",
        ],
        correctIndex: 1,
      },
      {
        id: "q3",
        question: "Who led the Reign of Terror?",
        options: ["Napoleon", "Louis XVI", "Robespierre", "Lafayette"],
        correctIndex: 2,
      },
      {
        id: "q4",
        question: "What was the famous slogan of the Revolution?",
        options: [
          "Liberty, Equality, Fraternity",
          "Peace, Land, Bread",
          "Unity, Strength, Freedom",
          "Faith, King, Country",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "quiz-solar-system",
    courseId: "solar-system",
    title: "The Solar System — Quiz",
    questions: [
      {
        id: "q1",
        question: "Which is the largest planet in our solar system?",
        options: ["Saturn", "Jupiter", "Neptune", "Earth"],
        correctIndex: 1,
      },
      {
        id: "q2",
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Earth", "Mercury", "Mars"],
        correctIndex: 2,
      },
      {
        id: "q3",
        question: "How many planets are in our solar system?",
        options: ["7", "8", "9", "10"],
        correctIndex: 1,
      },
      {
        id: "q4",
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Mercury"],
        correctIndex: 2,
      },
    ],
  },
];

function courseToPrisma(course: CatalogCourse): Prisma.CourseCreateInput {
  return {
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
            fileUrl: null,
          })),
        },
      })),
    },
    quizzes: {
      create: seedQuizzes
        .filter((quiz) => quiz.courseId === course.id)
        .map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          description: undefined,
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
        })),
    },
  };
}

function serializeQuestion(question: {
  id: string;
  text: string;
  options: Array<{ id: string; text: string; isCorrect: boolean; order: number }>;
}) {
  const orderedOptions = [...question.options].sort((left, right) => left.order - right.order);
  return {
    id: question.id,
    question: question.text,
    options: orderedOptions.map((option) => option.text),
    correctIndex: Math.max(
      0,
      orderedOptions.findIndex((option) => option.isCorrect)
    ),
  };
}

export function serializeCourse(course: {
  id: string;
  title: string;
  subject: string;
  category: string;
  description: string | null;
  longDescription: string | null;
  color: string | null;
  icon: string | null;
  lessons: Array<{
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    duration: string | null;
    videoUrl: string | null;
    materials: Array<{ id: string; title: string; filename: string }>;
  }>;
}) {
  return {
    id: course.id,
    title: course.title,
    subject: course.subject,
    category: course.category,
    description: course.description ?? "",
    longDescription: course.longDescription ?? "",
    color: course.color ?? "hsl(0 0% 50%)",
    icon: course.icon ?? "book-open",
    lessons: course.lessons.map((lesson) => ({
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description ?? "",
      duration: lesson.duration ?? "",
      videoUrl: lesson.videoUrl ?? "",
      materials: lesson.materials.map((material) => ({
        id: material.id,
        title: material.title,
        filename: material.filename,
      })),
    })),
  };
}

export function serializeQuiz(quiz: {
  id: string;
  courseId: string;
  title: string;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{ id: string; text: string; isCorrect: boolean; order: number }>;
  }>;
}) {
  return {
    id: quiz.id,
    courseId: quiz.courseId,
    title: quiz.title,
    questions: quiz.questions.map(serializeQuestion),
  };
}

export async function getCatalogSnapshot() {
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { materials: true },
      },
    },
  });

  const quizzes = await prisma.quiz.findMany({
    orderBy: { title: "asc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  return {
    courses: courses.map(serializeCourse),
    quizzes: quizzes.map(serializeQuiz),
  };
}

export async function seedApplicationData() {
  let courseCount: number;

  try {
    courseCount = await prisma.course.count();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021" ||
      message.includes("does not exist")
    ) {
      execSync("npx prisma db push", { stdio: "inherit" });
      courseCount = await prisma.course.count();
    } else {
      throw error;
    }
  }

  if (courseCount > 0) return;

  for (const course of seedCourses) {
    await prisma.course.create({ data: courseToPrisma(course) });
  }
}

export async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const adminName = process.env.ADMIN_SEED_NAME?.trim() || "Admin";

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    if (existing.role !== "ADMIN" || !existing.emailVerified) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "ADMIN",
          emailVerified: true,
          authProvider: "LOCAL",
          passwordHash: existing.passwordHash ?? undefined,
          name: existing.name ?? adminName,
        },
      });
    }
    return;
  }

  const { hashPassword } = await import("./auth");
  await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      passwordHash: await hashPassword(adminPassword),
      authProvider: "LOCAL",
      role: "ADMIN",
      emailVerified: true,
    },
  });
}
