import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Square,
  Trash2,
  Delete,
  Languages,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Hand,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type Lang = 'english' | 'hindi' | 'bengali';

const LANG_LABEL: Record<Lang, string> = {
  english: 'English',
  hindi: 'Hindi',
  bengali: 'Bengali',
};

// A small, illustrative "translation" map. Since there is no backend, we
// produce a friendly transliteration / placeholder for non-English targets.
function translateText(text: string, lang: Lang): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (lang === 'english') return trimmed;

  // Devanagari / Bengali numeral-free transliteration demo.
  // This is a stand-in for a real translation service.
  const map: Record<Exclude<Lang, 'english'>, (s: string) => string> = {
    hindi: (s) =>
      s
        .split(' ')
        .map((w) => transliterate(w, 'hi'))
        .join(' '),
    bengali: (s) =>
      s
        .split(' ')
        .map((w) => transliterate(w, 'bn'))
        .join(' '),
  };
  return map[lang](trimmed);
}

// Very small Latin -> Devanagari/Bengali demo mapping for common letters.
// Not a real translator — just enough to show non-Latin script output.
const devanagariMap: Record<string, string> = {
  a: 'अ', b: 'ब', c: 'क', d: 'द', e: 'ए', f: 'फ', g: 'ग', h: 'ह',
  i: 'इ', j: 'ज', k: 'क', l: 'ल', m: 'म', n: 'न', o: 'ओ', p: 'प',
  q: 'क', r: 'र', s: 'स', t: 'त', u: 'उ', v: 'व', w: 'व', x: 'क्स',
  y: 'य', z: 'ज़',
};
const bengaliMap: Record<string, string> = {
  a: 'অ', b: 'ব', c: 'ক', d: 'দ', e: 'এ', f: 'ফ', g: 'গ', h: 'হ',
  i: 'ই', j: 'জ', k: 'ক', l: 'ল', m: 'ম', n: 'ন', o: 'ও', p: 'প',
  q: 'ক', r: 'র', s: 'স', t: 'ত', u: 'উ', v: 'ভ', w: 'ভ', x: 'ক্স',
  y: 'য', z: 'জ',
};

function transliterate(word: string, lang: 'hi' | 'bn'): string {
  const map = lang === 'hi' ? devanagariMap : bengaliMap;
  const lower = word.toLowerCase();
  let out = '';
  for (const ch of lower) {
    out += map[ch] ?? ch;
  }
  return out || word;
}

export default function TranslatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [detected, setDetected] = useState<string[]>([]);
  const [currentSign, setCurrentSign] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('english');
  const [translated, setTranslated] = useState('');
  const [translating, setTranslating] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setCurrentSign(null);
  }, []);

  const startCamera = useCallback(async () => {
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      toast.error('Could not access the webcam. Please grant camera permission.');
      console.error(err);
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Simulated live detection: cycles a random ASL letter every ~1.6s while the
  // camera is on, mimicking a real recognition model's streaming output.
  useEffect(() => {
    if (!cameraOn) return;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      setCurrentSign(alphabet[Math.floor(Math.random() * alphabet.length)]);
      timeout = setTimeout(tick, 1600);
    };
    tick();
    return () => clearTimeout(timeout);
  }, [cameraOn]);

  const captureLetter = () => {
    if (!currentSign) return;
    setDetected((d) => [...d, currentSign]);
  };

  const addSpace = () => setDetected((d) => [...d, ' ']);

  const backspace = () => setDetected((d) => d.slice(0, -1));

  const clearAll = () => {
    setDetected([]);
    setTranslated('');
  };

  const sentence = detected.join('').replace(/\s+/g, ' ').trim();

  const handleTranslate = () => {
    if (!sentence) {
      toast.error('Nothing to translate yet — capture some letters first.');
      return;
    }
    setTranslating(true);
    setTimeout(() => {
      setTranslated(translateText(sentence, lang));
      setTranslating(false);
    }, 500);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Camera className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Sign to Text</h1>
              <p className="text-sm text-muted-foreground">
                Sign ASL letters to your webcam and translate them into English, Hindi, or Bengali.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Webcam panel */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video w-full bg-foreground/5">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  playsInline
                  muted
                />
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-secondary/60 text-center backdrop-blur-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-md">
                      <CameraOff className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Camera is off</p>
                      <p className="text-sm text-muted-foreground">
                        Turn on your webcam to start signing
                      </p>
                    </div>
                    <Button onClick={startCamera} disabled={starting}>
                      {starting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting…
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" /> Start camera
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {cameraOn && (
                  <>
                    {/* Live badge */}
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                      LIVE
                    </div>

                    {/* Detected letter overlay */}
                    {currentSign && (
                      <div className="absolute right-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                        <span className="text-2xl font-extrabold leading-none">
                          {currentSign}
                        </span>
                        <span className="mt-0.5 text-[10px] uppercase tracking-wide opacity-80">
                          detected
                        </span>
                      </div>
                    )}

                    {/* Hand guide */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-40 w-40 rounded-full border-2 border-dashed border-primary/40" />
                    </div>

                    {/* Stop button */}
                    <button
                      onClick={stopCamera}
                      className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur hover:bg-background"
                    >
                      <Square className="h-3.5 w-3.5 fill-destructive text-destructive" /> Stop
                    </button>
                  </>
                )}
              </div>

              {cameraOn && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
                  <Button onClick={captureLetter} disabled={!currentSign}>
                    <Hand className="mr-2 h-4 w-4" /> Capture letter
                  </Button>
                  <Button variant="outline" onClick={addSpace}>
                    Space
                  </Button>
                  <Button variant="outline" size="icon" onClick={backspace} title="Backspace">
                    <Delete className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={clearAll} title="Clear all">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output panel */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Detected characters
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {detected.length} character{detected.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="min-h-[120px] rounded-xl border border-dashed border-border bg-secondary/30 p-4">
                  {detected.length === 0 ? (
                    <p className="flex h-full min-h-[88px] items-center justify-center text-center text-sm text-muted-foreground">
                      Captured letters will appear here. Sign to the camera and tap
                      “Capture letter”.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {detected.map((ch, i) =>
                        ch === ' ' ? (
                          <span
                            key={i}
                            className="inline-block h-8 w-4"
                            aria-label="space"
                          />
                        ) : (
                          <span
                            key={i}
                            className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-primary/10 px-2 text-lg font-bold text-primary"
                          >
                            {ch}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-xl bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sentence
                  </p>
                  <p className="mt-1 text-lg font-medium leading-relaxed">
                    {sentence || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Translate to
                    </label>
                    <Select
                      value={lang}
                      onValueChange={(v) => setLang(v as Lang)}
                    >
                      <SelectTrigger>
                        <Languages className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English (default)</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="bengali">Bengali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleTranslate} disabled={translating} className="sm:mb-0.5">
                    {translating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating…
                      </>
                    ) : (
                      <>
                        Translate <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {LANG_LABEL[lang]} translation
                    </span>
                  </div>
                  <p
                    className="min-h-[2.5rem] text-lg font-medium leading-relaxed"
                    dir={lang === 'english' ? 'ltr' : 'ltr'}
                  >
                    {translated || (
                      <span className="text-muted-foreground">
                        Your translation will appear here.
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
