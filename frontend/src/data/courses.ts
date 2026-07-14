export interface StudyMaterial {
  id: string;
  title: string;
  filename: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  materials: StudyMaterial[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  category: 'Biology' | 'History' | 'Physics';
  description: string;
  longDescription: string;
  color: string;
  icon: string;
  lessons: Lesson[];
}

const fallbackCourses: Course[] = [
  {
    id: 'the-heart',
    title: 'The Heart',
    subject: 'Biology',
    category: 'Biology',
    description:
      'Understand the structure and function of the human heart, from chambers to circulation.',
    longDescription:
      'A free, beginner-friendly course on the human heart. Learn how the heart pumps blood, the role of each chamber, and how oxygen travels through your body — all through short video lessons and downloadable study materials.',
    color: 'hsl(12 65% 53%)',
    icon: 'heart',
    lessons: [
      {
        id: 'the-heart-l1',
        courseId: 'the-heart',
        title: 'Introduction to the Heart',
        description: 'An overview of the heart and its role in the body.',
        duration: '8 min',
        videoUrl: 'https://www.youtube.com/embed/CWFyxn0qDEU',
        materials: [
          { id: 'm1', title: 'Heart Diagram Handout', filename: 'heart-diagram.pdf' },
          { id: 'm2', title: 'Key Terms Glossary', filename: 'heart-glossary.pdf' },
        ],
      },
      {
        id: 'the-heart-l2',
        courseId: 'the-heart',
        title: 'Chambers and Valves',
        description: 'Explore the four chambers and the valves between them.',
        duration: '11 min',
        videoUrl: 'https://www.youtube.com/embed/x3Yf3G9VqA8',
        materials: [
          { id: 'm3', title: 'Chambers & Valves Notes', filename: 'chambers-valves.pdf' },
        ],
      },
      {
        id: 'the-heart-l3',
        courseId: 'the-heart',
        title: 'Blood Circulation',
        description: 'Trace the path of blood through the body and lungs.',
        duration: '14 min',
        videoUrl: 'https://www.youtube.com/embed/CWFyxn0qDEU',
        materials: [
          { id: 'm4', title: 'Circulation Pathway Map', filename: 'circulation-map.pdf' },
        ],
      },
    ],
  },
  {
    id: 'french-revolution',
    title: 'The French Revolution',
    subject: 'History',
    category: 'History',
    description:
      'From storming the Bastille to the rise of Napoleon — the events that reshaped France.',
    longDescription:
      'A free course covering the causes, key events, and consequences of the French Revolution. Through video lessons and study notes, understand how a nation was transformed.',
    color: 'hsl(27 76% 51%)',
    icon: 'landmark',
    lessons: [
      {
        id: 'french-revolution-l1',
        courseId: 'french-revolution',
        title: 'Causes of the Revolution',
        description: 'Social, economic, and political tensions in 18th-century France.',
        duration: '12 min',
        videoUrl: 'https://www.youtube.com/embed/DtY-BL0jGqg',
        materials: [
          { id: 'm5', title: 'Causes Summary Sheet', filename: 'revolution-causes.pdf' },
        ],
      },
      {
        id: 'french-revolution-l2',
        courseId: 'french-revolution',
        title: 'Storming the Bastille',
        description: 'The dramatic events of July 1789.',
        duration: '10 min',
        videoUrl: 'https://www.youtube.com/embed/DtY-BL0jGqg',
        materials: [
          { id: 'm6', title: 'Timeline of 1789', filename: 'timeline-1789.pdf' },
        ],
      },
      {
        id: 'french-revolution-l3',
        courseId: 'french-revolution',
        title: 'The Reign of Terror',
        description: 'Robespierre, the guillotine, and the radical phase.',
        duration: '15 min',
        videoUrl: 'https://www.youtube.com/embed/DtY-BL0jGqg',
        materials: [
          { id: 'm7', title: 'Key Figures Bios', filename: 'revolution-figures.pdf' },
        ],
      },
    ],
  },
  {
    id: 'solar-system',
    title: 'The Solar System',
    subject: 'Physics',
    category: 'Physics',
    description:
      'Journey through the planets, moons, and other bodies that orbit our Sun.',
    longDescription:
      'A free, visual tour of our solar system. Learn about each planet, the Sun, asteroids, and comets through engaging video lessons and printable study guides.',
    color: 'hsl(220 50% 55%)',
    icon: 'orbit',
    lessons: [
      {
        id: 'solar-system-l1',
        courseId: 'solar-system',
        title: 'The Sun and Inner Planets',
        description: 'Mercury, Venus, Earth, and Mars — the rocky worlds.',
        duration: '13 min',
        videoUrl: 'https://www.youtube.com/embed/libKVRa01L8',
        materials: [
          { id: 'm8', title: 'Inner Planets Fact Sheet', filename: 'inner-planets.pdf' },
        ],
      },
      {
        id: 'solar-system-l2',
        courseId: 'solar-system',
        title: 'The Gas Giants',
        description: 'Jupiter, Saturn, Uranus, and Neptune.',
        duration: '16 min',
        videoUrl: 'https://www.youtube.com/embed/libKVRa01L8',
        materials: [
          { id: 'm9', title: 'Gas Giants Comparison', filename: 'gas-giants.pdf' },
        ],
      },
      {
        id: 'solar-system-l3',
        courseId: 'solar-system',
        title: 'Asteroids, Comets & Dwarf Planets',
        description: 'The smaller bodies of our solar system.',
        duration: '9 min',
        videoUrl: 'https://www.youtube.com/embed/libKVRa01L8',
        materials: [
          { id: 'm10', title: 'Small Bodies Guide', filename: 'small-bodies.pdf' },
        ],
      },
    ],
  },
];

const fallbackQuizzes: Quiz[] = [
  {
    id: 'quiz-the-heart',
    courseId: 'the-heart',
    title: 'The Heart — Quiz',
    questions: [
      {
        id: 'q1',
        question: 'How many chambers does the human heart have?',
        options: ['2', '3', '4', '5'],
        correctIndex: 2,
      },
      {
        id: 'q2',
        question: 'Which chamber pumps oxygenated blood to the body?',
        options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
        correctIndex: 3,
      },
      {
        id: 'q3',
        question: 'Which valve is between the left atrium and left ventricle?',
        options: ['Tricuspid', 'Mitral', 'Pulmonary', 'Aortic'],
        correctIndex: 1,
      },
      {
        id: 'q4',
        question: 'What is the largest artery in the body?',
        options: ['Pulmonary artery', 'Aorta', 'Carotid artery', 'Femoral artery'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'quiz-french-revolution',
    courseId: 'french-revolution',
    title: 'The French Revolution — Quiz',
    questions: [
      {
        id: 'q1',
        question: 'In which year did the French Revolution begin?',
        options: ['1776', '1789', '1799', '1804'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'Which event is considered the start of the Revolution?',
        options: [
          'Execution of the king',
          'Storming of the Bastille',
          'Tennis Court Oath',
          'Coronation of Napoleon',
        ],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: 'Who led the Reign of Terror?',
        options: ['Napoleon', 'Louis XVI', 'Robespierre', 'Lafayette'],
        correctIndex: 2,
      },
      {
        id: 'q4',
        question: 'What was the famous slogan of the Revolution?',
        options: [
          'Liberty, Equality, Fraternity',
          'Peace, Land, Bread',
          'Unity, Strength, Freedom',
          'Faith, King, Country',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'quiz-solar-system',
    courseId: 'solar-system',
    title: 'The Solar System — Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which is the largest planet in our solar system?',
        options: ['Saturn', 'Jupiter', 'Neptune', 'Earth'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'Which planet is closest to the Sun?',
        options: ['Venus', 'Earth', 'Mercury', 'Mars'],
        correctIndex: 2,
      },
      {
        id: 'q3',
        question: 'How many planets are in our solar system?',
        options: ['7', '8', '9', '10'],
        correctIndex: 1,
      },
      {
        id: 'q4',
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Jupiter', 'Mars', 'Mercury'],
        correctIndex: 2,
      },
    ],
  },
];

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getLessonById(courseId: string, lessonId: string): Lesson | undefined {
  return getCourseById(courseId)?.lessons.find((l) => l.id === lessonId);
}

export function getQuizByCourse(courseId: string): Quiz | undefined {
  return quizzes.find((q) => q.courseId === courseId);
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function loadCatalog(): Promise<{ courses: Course[]; quizzes: Quiz[] }> {
  try {
    const response = await fetch(`${API_BASE}/api/catalog`);
    if (!response.ok) {
      throw new Error(`Catalog request failed with ${response.status}`);
    }
    return (await response.json()) as { courses: Course[]; quizzes: Quiz[] };
  } catch {
    return {
      courses: fallbackCourses,
      quizzes: fallbackQuizzes,
    };
  }
}

const catalog = await loadCatalog();

export const courses = catalog.courses;
export const quizzes = catalog.quizzes;
