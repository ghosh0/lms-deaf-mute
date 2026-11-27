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
import axios from "axios";
import { recognizeVideoFrame } from '@/lib/asl-recognizer';

type Lang = 'english' | 'hindi' | 'bengali';

const LANG_LABEL: Record<Lang, string> = {
  english: 'English',
  hindi: 'Hindi',
  bengali: 'Bengali',
};



export default function TranslatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

const lastLetterRef = useRef("");

const lastCaptureTime = useRef(0);
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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or is blocked. If you are accessing this site via HTTP, please try localhost or HTTPS instead.');
      }
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (constraintErr) {
        console.warn('Failed to start camera with primary constraints, trying fallback:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('video.play() failed or was interrupted, but stream is active:', playErr);
        }
      }
      setCameraOn(true);
    } catch (err: any) {
      console.error('Error starting camera:', err);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Camera permission denied. Please click the camera icon in your URL bar and allow access.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        toast.error('Camera is already in use by another app or tab. Please close other applications.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error('No camera found on this device.');
      } else {
        toast.error(`Could not start camera: ${err.message || err}`);
      }
    } finally {
      setStarting(false);
    }
  }, []);

  const predictFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    try {
      const data = await recognizeVideoFrame(videoRef.current, canvasRef.current);
      if (data.success) {
        setCurrentSign(data.letter || null);
      }
    } catch (err) {
      console.log(err);
    }
  };


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

    if(!cameraOn) return;

    const id = setInterval(

        predictFrame,

        200

    );

    return () => clearInterval(id);

}, [cameraOn]);

  const captureLetter = () => {

    if(!currentSign) return;

    if(

        lastLetterRef.current===currentSign &&

        Date.now()-lastCaptureTime.current<800

    ){

        return;

    }

    lastLetterRef.current=currentSign;

    lastCaptureTime.current=Date.now();

    setDetected(

        d=>[

            ...d,

            currentSign

        ]

    );

};

  const addSpace = () => {
  setDetected((prev) => [...prev, " "]);
};

const backspace = () => {
  setDetected((prev) => prev.slice(0, -1));
};

const clearAll = () => {
  setDetected([]);
  setTranslated("");
  setCurrentSign(null);
};

  const sentence = detected.join('').replace(/\s+/g, ' ').trim();

  const handleTranslate = async () => {
    if (!sentence) {
      toast.error('Nothing to translate yet — capture some letters first.');
      return;
    }
    setTranslating(true);
    try {
      if (lang === 'english') {
        setTranslated(sentence);
      } else {
        const langCode = lang === 'hindi' ? 'hi' : 'bn';
        const response = await axios.get('https://api.mymemory.translated.net/get', {
          params: {
            q: sentence,
            langpair: `en|${langCode}`
          }
        });
        if (response.data?.responseData?.translatedText) {
          setTranslated(response.data.responseData.translatedText);
        } else {
          throw new Error('No translation response');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to translate sentence. Please try again.');
    } finally {
      setTranslating(false);
    }
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
          <Card className="overflow-hidden h-fit!">
            <CardContent className="p-0">
              <div className="relative aspect-video w-full bg-foreground/5">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover -scale-x-100"
                  style={{ transform: 'scaleX(-1)' }}
                  playsInline
                  muted
                  autoPlay
                />
                <canvas

    ref={canvasRef}

    style={{

        display:"none"

    }}

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
