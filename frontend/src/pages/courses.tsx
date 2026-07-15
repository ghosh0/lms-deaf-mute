import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, BookOpen, Clock, Heart, Landmark, Orbit, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { courses } from '@/data/courses';

const iconMap: Record<string, typeof Heart> = {
  heart: Heart,
  landmark: Landmark,
  orbit: Orbit,
};

export default function CoursesPage() {
  return (
    <div className="animate-fade-in-up">
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Courses</h1>
              <p className="text-sm text-muted-foreground">
                Free, open learning — no enrollment, no fees. Watch any course, anytime.
              </p>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            100% free — every course, every lesson
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const Icon = iconMap[course.icon] ?? BookOpen;
            return (
              <Card
                key={course.id}
                className="group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="relative h-32 overflow-hidden"
                  style={{ background: course.color }}
                >
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white blur-2xl" />
                  </div>
                  <Icon className="absolute right-4 top-4 h-10 w-10 text-white/90" strokeWidth={1.5} />
                  <Badge className="absolute left-4 top-4 bg-white/90 text-foreground hover:bg-white">
                    {course.category}
                  </Badge>
                </div>
                <CardContent className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-bold tracking-tight">{course.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {course.lessons.length} lessons
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Free
                    </span>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:gap-2.5"
                  >
                    View course <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
