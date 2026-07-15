import { Link } from 'react-router-dom';
import {
  Hand,
  Camera,
  BookOpen,
  Languages,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Camera,
    title: 'Real-time Recognition',
    description:
      'Turn your webcam into a sign-language reader. Letters are detected live and assembled into words as you sign.',
  },
  {
    icon: Languages,
    title: 'Multi-language Output',
    description:
      'Translate detected sentences into English, Hindi, or Bengali with a single tap — built for the Indian community.',
  },
  {
    icon: BookOpen,
    title: 'Visual ASL Dictionary',
    description:
      'Browse all 26 ASL alphabet signs in a clean, card-based dictionary. Learn at your own pace, anywhere.',
  },
];

const stats = [
  { value: '26', label: 'ASL signs' },
  { value: '3', label: 'Languages' },
  { value: 'Real-time', label: 'Detection' },
  { value: '100%', label: 'Free to learn' },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-chart-2/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Sign language, made accessible
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Bridge the gap between{' '}
              <span className="text-primary">silence</span> and{' '}
              <span className="font-serif italic text-foreground">understanding</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Mudraa helps the deaf and mute community learn ASL and translate sign
              language into English, Hindi, and Bengali — in real time, right from your camera.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/translate">
                  Start translating <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dictionary">
                  <BookOpen className="mr-2 h-4 w-4" /> Browse dictionary
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card/60 p-5 text-center shadow-sm backdrop-blur"
              >
                <div className="text-2xl font-extrabold text-primary sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything you need to communicate
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three powerful tools, one focused experience — designed for learners and
              everyday conversation alike.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">
              From sign to sentence in three simple steps.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', icon: Hand, title: 'Sign to the camera', text: 'Position your hand in front of the webcam and form ASL letters.' },
              { step: '02', icon: Zap, title: 'Live detection', text: 'Mudraa reads each gesture and assembles characters into a sentence.' },
              { step: '03', icon: Languages, title: 'Translate', text: 'Pick a language — English, Hindi, or Bengali — and read the result instantly.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-extrabold text-primary/20">{s.step}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/80 px-6 py-14 text-center shadow-xl sm:px-12">
            <div className="absolute inset-0 -z-10 opacity-20">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white blur-3xl" />
            </div>
            <ShieldCheck className="mx-auto h-10 w-10 text-primary-foreground" />
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to start your journey?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
              Join a community committed to making communication accessible for everyone.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">
                  Create free account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link to="/translate">Try the translator</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-foreground/80">
              <Users className="h-4 w-4" /> Built for learners, educators, and everyday conversations
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
