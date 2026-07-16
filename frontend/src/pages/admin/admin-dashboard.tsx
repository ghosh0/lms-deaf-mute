import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  SpellCheck,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminAuth } from '@/context/admin-auth-context';
import { courses as seedCourses, quizzes as seedQuizzes } from '@/data/courses';
import { AslSign } from '@/components/dictionary/asl-sign';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Course, Lesson, Quiz, StudyMaterial, QuizQuestion } from '@/data/courses';

type Tab = 'overview' | 'courses' | 'quizzes' | 'dictionary';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function readJsonError(response: Response) {
  try {
    const payload = await response.json();
    return payload?.error ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
}

let idCounter = 1000;
const uid = (prefix: string) => `${prefix}-${++idCounter}`;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { admin, token, signOut } = useAdminAuth();
  const [tab, setTab] = useState<Tab>('overview');

  // Admin state (in-memory; seeded from hardcoded data)
  const [courseList, setCourseList] = useState<Course[]>(() =>
    seedCourses.map((c) => ({ ...c, lessons: [...c.lessons] }))
  );
  const [quizList, setQuizList] = useState<Quiz[]>(() =>
    seedQuizzes.map((q) => ({ ...q, questions: [...q.questions] }))
  );
  const [dictionaryLetters, setDictionaryLetters] =
    useState<string[]>([...ALPHABET]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/catalog`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) {
          throw new Error(await readJsonError(response));
        }

        const data = (await response.json()) as { courses: Course[]; quizzes: Quiz[] };
        if (!cancelled) {
          setCourseList(data.courses);
          setQuizList(data.quizzes);
        }
      } catch {
        // Keep the fallback seed state if the backend is unavailable.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const persistCatalog = async (courses: Course[], quizzes: Quiz[]) => {
    const response = await fetch(`${API_BASE}/api/catalog/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ courses, quizzes }),
    });
    if (!response.ok) {
      throw new Error(await readJsonError(response));
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/admin');
  };

  if (!admin) {
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div>
              <span className="text-lg font-extrabold tracking-tight">Admin</span>
              <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {admin.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'courses', label: 'Courses & Lessons', icon: BookOpen },
              { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
              { id: 'dictionary', label: 'Dictionary', icon: SpellCheck },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                tab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <Overview
            courseCount={courseList.length}
            lessonCount={courseList.reduce((a, c) => a + c.lessons.length, 0)}
            quizCount={quizList.length}
            dictionaryCount={dictionaryLetters.length}
          />
        )}

        {tab === 'courses' && (
          <CoursesManager
            courseList={courseList}
            setCourseList={setCourseList}
            quizList={quizList}
            persistCatalog={persistCatalog}
          />
        )}

        {tab === 'quizzes' && (
          <QuizzesManager
            quizList={quizList}
            setQuizList={setQuizList}
            courseList={courseList}
            persistCatalog={persistCatalog}
          />
        )}

        {tab === 'dictionary' && (
          <DictionaryManager
            letters={dictionaryLetters}
            setLetters={setDictionaryLetters}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Overview ---------- */

function Overview({
  courseCount,
  lessonCount,
  quizCount,
  dictionaryCount,
}: {
  courseCount: number;
  lessonCount: number;
  quizCount: number;
  dictionaryCount: number;
}) {
  const stats = [
    { label: 'Courses', value: courseCount, icon: BookOpen },
    { label: 'Lessons', value: lessonCount, icon: FileText },
    { label: 'Quizzes', value: quizCount, icon: HelpCircle },
    { label: 'Dictionary cards', value: dictionaryCount, icon: SpellCheck },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-extrabold">{s.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Courses & Lessons manager ---------- */

function CoursesManager({
  courseList,
  setCourseList,
  quizList,
  persistCatalog,
}: {
  courseList: Course[];
  setCourseList: React.Dispatch<React.SetStateAction<Course[]>>;
  quizList: Quiz[];
  persistCatalog: (courses: Course[], quizzes: Quiz[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Course | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    courseId: string;
    lesson: Lesson | null;
  } | null>(null);

  const handleSaveCourse = async (course: Course) => {
    const nextCourses = courseList.some((c) => c.id === course.id)
      ? courseList.map((c) => (c.id === course.id ? course : c))
      : [...courseList, course];
    setCourseList(nextCourses);
    setEditing(null);
    try {
      await persistCatalog(nextCourses, quizList);
      toast.success('Course saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const nextCourses = courseList.filter((c) => c.id !== id);
    setCourseList(nextCourses);
    try {
      await persistCatalog(nextCourses, quizList);
      toast.success('Course deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete course');
    }
  };

  const handleSaveLesson = async (courseId: string, lesson: Lesson) => {
    const nextCourses = courseList.map((c) => {
      if (c.id !== courseId) return c;
      const exists = c.lessons.some((l) => l.id === lesson.id);
      const lessons = exists
        ? c.lessons.map((l) => (l.id === lesson.id ? lesson : l))
        : [...c.lessons, lesson];
      return { ...c, lessons };
    });
    setCourseList(nextCourses);
    setEditingLesson(null);
    try {
      await persistCatalog(nextCourses, quizList);
      toast.success('Lesson saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (courseId: string, lessonId: string) => {
    const nextCourses = courseList.map((c) =>
      c.id === courseId
        ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) }
        : c
    );
    setCourseList(nextCourses);
    try {
      await persistCatalog(nextCourses, quizList);
      toast.success('Lesson deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete lesson');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Courses</h2>
        <Button
          size="sm"
          onClick={() =>
            setEditing({
              id: uid('course'),
              title: '',
              subject: '',
              category: 'Biology',
              description: '',
              longDescription: '',
              color: 'hsl(27 76% 51%)',
              icon: 'heart',
              lessons: [],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> New course
        </Button>
      </div>

      <div className="space-y-3">
        {courseList.map((course) => (
          <Card key={course.id}>
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() =>
                    setExpanded((e) => (e === course.id ? null : course.id))
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  {expanded === course.id ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                <div
                  className="h-10 w-10 shrink-0 rounded-lg"
                  style={{ background: course.color }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{course.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {course.category} · {course.lessons.length} lessons
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(course)}
                    title="Edit course"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteCourse(course.id)}
                    title="Delete course"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {expanded === course.id && (
                <div className="border-t border-border bg-secondary/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Lessons</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditingLesson({
                          courseId: course.id,
                          lesson: {
                            id: uid('lesson'),
                            courseId: course.id,
                            title: '',
                            description: '',
                            duration: '',
                            videoUrl: '',
                            materials: [],
                          },
                        })
                      }
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add lesson
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {course.lessons.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No lessons yet.
                      </p>
                    )}
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {lesson.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {lesson.duration} · {lesson.materials.length} materials
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setEditingLesson({
                              courseId: course.id,
                              lesson,
                            })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteLesson(course.id, lesson.id)
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <CourseEditor
          course={editing}
          onSave={handleSaveCourse}
          onCancel={() => setEditing(null)}
        />
      )}

      {editingLesson && (
        <LessonEditor
          lesson={editingLesson.lesson}
          onSave={(lesson) =>
            handleSaveLesson(editingLesson.courseId, lesson)
          }
          onCancel={() => setEditingLesson(null)}
        />
      )}
    </div>
  );
}

/* ---------- Course editor modal ---------- */

function CourseEditor({
  course,
  onSave,
  onCancel,
}: {
  course: Course;
  onSave: (c: Course) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Course>(course);

  return (
    <Modal title={course.title ? 'Edit course' : 'New course'} onClose={onCancel}>
      <div className="space-y-4">
        <Field label="Title">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. The Heart"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Subject">
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Biology"
            />
          </Field>
          <Field label="Category">
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as Course['category'] })
              }
            >
              <option value="Biology">Biology</option>
              <option value="History">History</option>
              <option value="Physics">Physics</option>
            </select>
          </Field>
        </div>
        <Field label="Short description">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="One-line summary"
            rows={2}
          />
        </Field>
        <Field label="Long description">
          <Textarea
            value={form.longDescription}
            onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
            placeholder="Detailed course description"
            rows={3}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Color (HSL)">
            <Input
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              placeholder="hsl(27 76% 51%)"
            />
          </Field>
          <Field label="Icon">
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            >
              <option value="heart">Heart</option>
              <option value="landmark">Landmark</option>
              <option value="orbit">Orbit</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!form.title) {
                toast.error('Title is required');
                return;
              }
              onSave(form);
            }}
          >
            <Save className="mr-2 h-4 w-4" /> Save course
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Lesson editor modal ---------- */

function LessonEditor({
  lesson,
  onSave,
  onCancel,
}: {
  lesson: Lesson | null;
  onSave: (l: Lesson) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Lesson>(
    lesson ?? {
      id: uid('lesson'),
      courseId: '',
      title: '',
      description: '',
      duration: '',
      videoUrl: '',
      materials: [],
    }
  );

  const addMaterial = () =>
    setForm((f) => ({
      ...f,
      materials: [
        ...f.materials,
        { id: uid('mat'), title: '', filename: '' },
      ],
    }));

  const updateMaterial = (id: string, patch: Partial<StudyMaterial>) =>
    setForm((f) => ({
      ...f,
      materials: f.materials.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));

  const removeMaterial = (id: string) =>
    setForm((f) => ({
      ...f,
      materials: f.materials.filter((m) => m.id !== id),
    }));

  return (
    <Modal title={lesson?.title ? 'Edit lesson' : 'New lesson'} onClose={onCancel}>
      <div className="space-y-4">
        <Field label="Lesson title">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Chambers and Valves"
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Duration">
            <Input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g. 10 min"
            />
          </Field>
          <Field label="Video URL (embed)">
            <Input
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/embed/…"
            />
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Study materials (optional)</Label>
            <Button size="sm" variant="outline" onClick={addMaterial}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add material
            </Button>
          </div>
          <div className="space-y-2">
            {form.materials.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <Input
                  value={m.title}
                  onChange={(e) => updateMaterial(m.id, { title: e.target.value })}
                  placeholder="Material title"
                  className="flex-1"
                />
                <Input
                  value={m.filename}
                  onChange={(e) => updateMaterial(m.id, { filename: e.target.value })}
                  placeholder="file.pdf"
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeMaterial(m.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {form.materials.length === 0 && (
              <p className="text-sm text-muted-foreground">No materials added.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!form.title) {
                toast.error('Title is required');
                return;
              }
              onSave(form);
            }}
          >
            <Save className="mr-2 h-4 w-4" /> Save lesson
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Quizzes manager ---------- */

function QuizzesManager({
  quizList,
  setQuizList,
  courseList,
  persistCatalog,
}: {
  quizList: Quiz[];
  setQuizList: React.Dispatch<React.SetStateAction<Quiz[]>>;
  courseList: Course[];
  persistCatalog: (courses: Course[], quizzes: Quiz[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Quiz | null>(null);

  const handleSave = async (quiz: Quiz) => {
    const nextQuizzes = quizList.some((q) => q.id === quiz.id)
      ? quizList.map((q) => (q.id === quiz.id ? quiz : q))
      : [...quizList, quiz];
    setQuizList(nextQuizzes);
    setEditing(null);
    try {
      await persistCatalog(courseList, nextQuizzes);
      toast.success('Quiz saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save quiz');
    }
  };

  const handleDelete = async (id: string) => {
    const nextQuizzes = quizList.filter((q) => q.id !== id);
    setQuizList(nextQuizzes);
    try {
      await persistCatalog(courseList, nextQuizzes);
      toast.success('Quiz deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete quiz');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Quizzes</h2>
          <p className="text-sm text-muted-foreground">
            Quizzes are referenced to courses, not individual lessons.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            setEditing({
              id: uid('quiz'),
              courseId: courseList[0]?.id ?? '',
              title: '',
              questions: [],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> New quiz
        </Button>
      </div>

      <div className="space-y-3">
        {quizList.map((quiz) => {
          const course = courseList.find((c) => c.id === quiz.courseId);
          return (
            <Card key={quiz.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <HelpCircle className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{quiz.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {course?.title ?? 'Unassigned'} · {quiz.questions.length} questions
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditing(quiz)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(quiz.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editing && (
        <QuizEditor
          quiz={editing}
          courseList={courseList}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function QuizEditor({
  quiz,
  courseList,
  onSave,
  onCancel,
}: {
  quiz: Quiz;
  courseList: Course[];
  onSave: (q: Quiz) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Quiz>(quiz);

  const addQuestion = () =>
    setForm((f) => ({
      ...f,
      questions: [
        ...f.questions,
        {
          id: uid('q'),
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
        },
      ],
    }));

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q) =>
        q.id === id ? { ...q, ...patch } : q
      ),
    }));

  const updateOption = (qId: string, idx: number, value: string) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) }
          : q
      ),
    }));

  const removeQuestion = (id: string) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.filter((q) => q.id !== id),
    }));

  return (
    <Modal title={quiz.title ? 'Edit quiz' : 'New quiz'} onClose={onCancel}>
      <div className="space-y-4">
        <Field label="Quiz title">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. The Heart — Quiz"
          />
        </Field>
        <Field label="Linked course">
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
          >
            {courseList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Questions (MCQ only)</Label>
            <Button size="sm" variant="outline" onClick={addQuestion}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add question
            </Button>
          </div>
          <div className="space-y-3">
            {form.questions.map((q, qi) => (
              <div
                key={q.id}
                className="rounded-xl border border-border bg-secondary/20 p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-2 text-sm font-bold text-muted-foreground">
                    {qi + 1}.
                  </span>
                  <Input
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(q.id, { question: e.target.value })
                    }
                    placeholder="Question text"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-2 space-y-2 pl-6">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuestion(q.id, { correctIndex: oi })
                        }
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                          q.correctIndex === oi
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground'
                        )}
                        title="Mark as correct"
                      >
                        {String.fromCharCode(65 + oi)}
                      </button>
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(q.id, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Tap a letter to mark the correct answer.
                  </p>
                </div>
              </div>
            ))}
            {form.questions.length === 0 && (
              <p className="text-sm text-muted-foreground">No questions yet.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!form.title) {
                toast.error('Title is required');
                return;
              }
              onSave(form);
            }}
          >
            <Save className="mr-2 h-4 w-4" /> Save quiz
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Dictionary manager ---------- */

function DictionaryManager({
  letters,
  setLetters,
}: {
  letters: string[];
  setLetters: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [newLetter, setNewLetter] = useState('');

  const addLetter = () => {
    const upper = newLetter.toUpperCase().trim();
    if (!upper) return;
    if (letters.includes(upper)) {
      toast.error('That letter already exists');
      return;
    }
    setLetters((prev) => [...prev, upper].sort());
    setNewLetter('');
    toast.success('Dictionary card added');
  };

  const removeLetter = (letter: string) => {
    setLetters((prev) => prev.filter((l) => l !== letter));
    toast.success('Dictionary card removed');
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Dictionary cards</h2>
        <p className="text-sm text-muted-foreground">
          Add or remove ASL alphabet cards shown on the public dictionary page.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label>Add a letter</Label>
              <Input
                value={newLetter}
                onChange={(e) => setNewLetter(e.target.value)}
                placeholder="e.g. A"
                maxLength={1}
                onKeyDown={(e) => e.key === 'Enter' && addLetter()}
              />
            </div>
            <Button onClick={addLetter}>
              <Plus className="mr-2 h-4 w-4" /> Add card
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {letters.map((letter) => (
          <Card key={letter} className="group relative overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square p-3">
                <AslSign letter={letter} />
              </div>
              <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-3 py-2">
                <span className="text-sm font-semibold text-primary">{letter}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeLetter(letter)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------- Shared helpers ---------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl animate-fade-in-up rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
