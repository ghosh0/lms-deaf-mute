import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Download,
  Clock,
  HelpCircle,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCourseById, getLessonById, getQuizByCourse } from '@/data/courses';
import { toast } from 'sonner';

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const course = courseId ? getCourseById(courseId) : undefined;
  const lesson =
    courseId && lessonId ? getLessonById(courseId, lessonId) : undefined;

  if (!course || !lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <Button asChild className="mt-6">
          <Link to="/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  const lessonIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < course.lessons.length - 1
      ? course.lessons[lessonIndex + 1]
      : null;
  const quiz = getQuizByCourse(course.id);

  const handleDownload = (title: string, filename: string) => {
    // In a real app this would fetch a real PDF. Here we generate a small
    // placeholder PDF blob so the download actually works.
    const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT /F1 18 Tf 72 720 Td (${title.replace(/[()\\]/g, '')}) Tj ET
BT /F1 12 Tf 72 690 Td (Study material for: ${lesson.title.replace(/[()\\]/g, '')}) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000236 00000 n 
0000000400 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
460
%%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloading ${filename}`);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {course.title}
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {lesson.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {lesson.duration}
            </span>
            <span>
              Lesson {lessonIndex + 1} of {course.lessons.length}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Video */}
        <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
          <div className="aspect-video w-full">
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Study materials */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Study materials</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Download PDF study materials for this lesson.
          </p>

          {lesson.materials.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No study materials for this lesson.
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {lesson.materials.map((mat) => (
                <Card key={mat.id} className="transition-all hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{mat.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {mat.filename}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => handleDownload(mat.title, mat.filename)}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Quiz link */}
        {quiz && (
          <section className="mt-8">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Ready to test yourself?</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Take the {course.title} quiz — {quiz.questions.length} multiple-choice questions.
                  </p>
                </div>
                <Button
                  className="shrink-0"
                  onClick={() => navigate(`/courses/${course.id}/quiz`)}
                >
                  Take quiz <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Prev / Next navigation */}
        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          {prevLesson ? (
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/courses/${course.id}/lessons/${prevLesson.id}`)
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="flex flex-col items-start text-left">
                <span className="text-xs text-muted-foreground">Previous</span>
                <span className="text-sm font-medium">{prevLesson.title}</span>
              </span>
            </Button>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/courses/${course.id}/lessons/${nextLesson.id}`)
              }
            >
              <span className="flex flex-col items-end text-right">
                <span className="text-xs text-muted-foreground">Next</span>
                <span className="text-sm font-medium">{nextLesson.title}</span>
              </span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <PlayCircle className="mr-2 h-4 w-4" /> Back to course
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
