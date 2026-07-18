import { useMemo, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AslSign } from '@/components/dictionary/asl-sign';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function DictionaryPage() {
  const [query, setQuery] = useState('');

  const letters = useMemo(
    () => ALPHABET.filter((l) => l.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  return (
    <div className="animate-fade-in-up">
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">ASL Dictionary</h1>
              <p className="text-sm text-muted-foreground">
                All 26 letters of the American Sign Language alphabet
              </p>
            </div>
          </div>

          <div className="relative mt-6 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search a letter…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {letters.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No letters match “{query}”.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {letters.map((letter) => (
              <Card
                key={letter}
                className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-0">
                  <div className="aspect-square p-4">
                    <AslSign letter={letter} />
                  </div>
                  <div className="border-t border-border bg-secondary/40 px-4 py-3 text-center">
                    <span className="text-sm font-semibold">
                      Letter{' '}
                      <span className="text-primary">{letter}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
