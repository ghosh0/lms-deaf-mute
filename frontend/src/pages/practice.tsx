import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Square,
  ArrowRight,
  Loader2,
  Sparkles,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { AslSign } from '@/components/dictionary/asl-sign';
import { cn } from '@/lib/utils';

// Alphabet practice list with corresponding emojis and words
const ALPHABET_ITEMS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
  const emojiMap: Record<string, string> = {
    A: '🍎', B: '🍌', C: '🐱', D: '🐶', E: '🥚', F: '🐟', G: '🍇', H: '🎩',
    I: '🍨', J: '🏺', K: '🔑', L: '🦁', M: '🐒', N: '🥜', O: '🦉', P: '🐧',
    Q: '👑', R: '🤖', S: '☀️', T: '🌲', U: '☂️', V: '🎻', W: '🍉', X: '🪵',
    Y: '⛵', Z: '🦓',
  };
  const wordMap: Record<string, string> = {
    A: 'Apple', B: 'Banana', C: 'Cat', D: 'Dog', E: 'Egg', F: 'Fish', G: 'Grape', H: 'Hat',
    I: 'Ice cream', J: 'Jar', K: 'Key', L: 'Lion', M: 'Monkey', N: 'Nut', O: 'Owl', P: 'Penguin',
    Q: 'Queen', R: 'Robot', S: 'Sun', T: 'Tree', U: 'Umbrella', V: 'Violin', W: 'Watermelon', X: 'Wood',
    Y: 'Yacht', Z: 'Zebra',
  };
  return {
    letter,
    emoji: emojiMap[letter] || '✨',
    word: wordMap[letter] || letter,
  };
});

interface WordItem {
  word: string;
  emoji: string;
}

const WORD_CATEGORIES: Record<string, WordItem[]> = {
  Animals: [
    { word: 'LION', emoji: '🦁' },
    { word: 'TIGER', emoji: '🐯' },
    { word: 'CAT', emoji: '🐱' },
    { word: 'DOG', emoji: '🐶' },
    { word: 'OWL', emoji: '🦉' },
    { word: 'BEAR', emoji: '🐻' },
    { word: 'FROG', emoji: '🐸' },
    { word: 'FISH', emoji: '🐟' },
  ],
  Transport: [
    { word: 'CAR', emoji: '🚗' },
    { word: 'SHIP', emoji: '🚢' },
    { word: 'BOAT', emoji: '⛵' },
    { word: 'BUS', emoji: '🚌' },
    { word: 'TRAM', emoji: '🚊' },
    { word: 'BIKE', emoji: '🚲' },
  ],
  Fruits: [
    { word: 'PEAR', emoji: '🍐' },
    { word: 'KIWI', emoji: '🥝' },
    { word: 'PLUM', emoji: '🍇' },
    { word: 'FIG', emoji: '🧆' },
    { word: 'DATE', emoji: '🌴' },
    { word: 'LIME', emoji: '🍋' },
  ],
  Festival: [
    { word: 'HOLI', emoji: '🎨' },
    { word: 'DIWALI', emoji: '🪔' },
    { word: 'EID', emoji: '🌙' },
    { word: 'XMAS', emoji: '🎄' },
    { word: 'POOJA', emoji: '🌸' },
  ],
  Vegetables: [
    { word: 'PEA', emoji: '🥦' },
    { word: 'CORN', emoji: '🌽' },
    { word: 'YAM', emoji: '🍠' },
    { word: 'TOMATO', emoji: '🍅' },
    { word: 'POTATO', emoji: '🥔' },
    { word: 'CARROT', emoji: '🥕' },
  ],
  Occupation: [
    { word: 'CHEF', emoji: '👨‍🍳' },
    { word: 'PILOT', emoji: '👨‍✈️' },
    { word: 'NURSE', emoji: '🧑‍⚕️' },
    { word: 'DOCTOR', emoji: '🥼' },
    { word: 'ARTIST', emoji: '🎨' },
    { word: 'ACTOR', emoji: '🎭' },
  ],
};

type PracticeTab = 'alphabet' | 'words';

export default function PracticePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [activeTab, setActiveTab] = useState<PracticeTab>('alphabet');

  // Webcam States
  const [cameraOn, setCameraOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [currentSign, setCurrentSign] = useState<string | null>(null);

  // Alphabet Practice States
  const [selectedAlphaIdx, setSelectedAlphaIdx] = useState(0);
  const [alphaCompleted, setAlphaCompleted] = useState<Record<string, boolean>>({});

  // Word Practice States
  const [selectedCategory, setSelectedCategory] = useState<string>('Animals');
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [wordCompleted, setWordCompleted] = useState(false);

  // Success Highlight Effect State
  const [matchSuccess, setMatchSuccess] = useState(false);
  const [isWrongSign, setIsWrongSign] = useState(false);

  const activeAlphaItem = ALPHABET_ITEMS[selectedAlphaIdx];
  const activeWordItem = WORD_CATEGORIES[selectedCategory][selectedWordIdx];

  // Derive target letter
  const getTargetLetter = useCallback(() => {
    if (activeTab === 'alphabet') {
      return activeAlphaItem.letter;
    } else {
      if (wordCompleted) return null;
      return activeWordItem.word[activeLetterIndex];
    }
  }, [activeTab, activeAlphaItem, activeWordItem, activeLetterIndex, wordCompleted]);

  const targetLetter = getTargetLetter();

  // Handle letter match success logic
  const triggerMatchSuccess = useCallback((matchedLetter: string) => {
    if (matchSuccess) return; // Prevent double trigger
    setMatchSuccess(true);
    toast.success(`Correct sign: ${matchedLetter}!`, { duration: 1500 });

    setTimeout(() => {
      setMatchSuccess(false);
      setCurrentSign(null);

      if (activeTab === 'alphabet') {
        // Complete current alphabet letter
        setAlphaCompleted((prev) => ({ ...prev, [matchedLetter]: true }));
        // Auto-advance alphabet after a short delay
        setSelectedAlphaIdx((prev) => (prev + 1) % ALPHABET_ITEMS.length);
      } else {
        // Word practice
        const word = activeWordItem.word;
        if (activeLetterIndex + 1 >= word.length) {
          setWordCompleted(true);
          toast.success(`🎉 Completed spelling: ${word}!`, { duration: 2500 });
        } else {
          setActiveLetterIndex((prev) => prev + 1);
        }
      }
    }, 1000);
  }, [matchSuccess, activeTab, activeLetterIndex, activeWordItem]);

  // Check if camera sign matches target
  useEffect(() => {
    if (cameraOn && currentSign && targetLetter) {
      if (currentSign.toLowerCase() === targetLetter.toLowerCase()) {
        triggerMatchSuccess(targetLetter);
        setIsWrongSign(false);
      } else {
        setIsWrongSign(true);
      }
    } else {
      setIsWrongSign(false);
    }
  }, [cameraOn, currentSign, targetLetter, triggerMatchSuccess]);

  // Webcam Management
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

  // Frame predict loop
  const predictFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0) return;

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const form = new FormData();
        form.append('file', blob, 'frame.jpg');

        try {
          const { data } = await axios.post('http://localhost:8000/predict', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (data.success) {
            setCurrentSign(data.letter || null);
          }
        } catch (err) {
          // Silent catch to prevent console flooding on offline/local prediction errors
          console.debug('Prediction error:', err);
        }
      },
      'image/jpeg',
      0.9
    );
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraOn) return;
    const id = setInterval(predictFrame, 300);
    return () => clearInterval(id);
  }, [cameraOn, predictFrame]);

  // Word Practice Reset when active word changes
  const resetWordPractice = (wordIdx: number, catName?: string) => {
    if (catName) setSelectedCategory(catName);
    setSelectedWordIdx(wordIdx);
    setActiveLetterIndex(0);
    setWordCompleted(false);
    setMatchSuccess(false);
  };

  const handleNextWord = () => {
    const list = WORD_CATEGORIES[selectedCategory];
    const nextIdx = (selectedWordIdx + 1) % list.length;
    resetWordPractice(nextIdx);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Practice Zone</h1>
              <p className="text-sm text-muted-foreground">
                Spelling and alphabet practice using ASL hand gesture recognition.
              </p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="mt-6 flex border-b border-border">
            <button
              onClick={() => {
                setActiveTab('alphabet');
                setMatchSuccess(false);
              }}
              className={cn(
                'pb-3 px-6 text-sm font-semibold border-b-2 transition-all -mb-px',
                activeTab === 'alphabet'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Alphabet Practice
            </button>
            <button
              onClick={() => {
                setActiveTab('words');
                setMatchSuccess(false);
              }}
              className={cn(
                'pb-3 px-6 text-sm font-semibold border-b-2 transition-all -mb-px',
                activeTab === 'words'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Word Practice
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Practice Content Panel (Left & Center) */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'alphabet' ? (
              /* ================== ALPHABET PRACTICE VIEW ================== */
              <div className="space-y-6">
                {/* Horizontal scroll / grid selection of letters */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Select a letter to practice
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ALPHABET_ITEMS.map((item, idx) => {
                        const isSelected = selectedAlphaIdx === idx;
                        const isDone = alphaCompleted[item.letter];
                        return (
                          <button
                            key={item.letter}
                            onClick={() => {
                              setSelectedAlphaIdx(idx);
                              setMatchSuccess(false);
                            }}
                            className={cn(
                              'relative flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-all',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-sm'
                                : 'border-border bg-background text-foreground hover:bg-secondary/60',
                              isDone && !isSelected && 'border-primary/40 bg-primary/5 text-primary'
                            )}
                          >
                            {item.letter}
                            {isDone && (
                              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-white">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Primary Alphabet Practice Box */}
                <Card className="overflow-hidden">
                  <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
                    {/* Left: Active item emoji & ASL sign illustration */}
                    <div className="w-44 h-44 shrink-0 flex flex-col items-center justify-center border border-border bg-secondary/20 rounded-2xl p-4">
                      <span className="text-5xl mb-2">{activeAlphaItem.emoji}</span>
                      <div className="w-24 h-24">
                        <AslSign letter={activeAlphaItem.letter} />
                      </div>
                    </div>

                    {/* Right: Practice Information and Match Div */}
                    <div className="flex-1 space-y-4 text-center md:text-left w-full">
                      <div>
                        <span className="text-xs font-bold tracking-widest text-primary uppercase">
                          Practice Letter {activeAlphaItem.letter}
                        </span>
                        <h2 className="text-2xl font-extrabold mt-1">
                          {activeAlphaItem.letter} is for {activeAlphaItem.word}
                        </h2>
                      </div>

                      {/* Expected Spelling Blocks */}
                      <div className="flex justify-center md:justify-start items-center gap-1.5 mt-2">
                        {activeAlphaItem.word.toUpperCase().split('').map((ch, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              'inline-flex h-9 min-w-9 items-center justify-center rounded-md border text-sm font-extrabold',
                              idx === 0
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border text-muted-foreground bg-secondary/10'
                            )}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>

                      {/* Present Letter Div */}
                      <div className="border border-dashed border-border rounded-xl bg-card/60 p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Present Letter to Sign
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'flex h-14 w-14 items-center justify-center rounded-xl text-3xl font-extrabold border shadow-sm transition-all',
                                matchSuccess
                                  ? 'bg-green-500 border-green-500 text-white animate-pulse'
                                  : isWrongSign
                                    ? 'bg-red-500 border-red-500 text-white animate-pulse'
                                    : 'bg-primary/10 border-primary/20 text-primary'
                              )}
                            >
                              {activeAlphaItem.letter}
                            </span>
                            <div className="text-left">
                              <p className="text-sm font-bold">Show &quot;{activeAlphaItem.letter}&quot; gesture</p>
                              <p className="text-xs text-muted-foreground">
                                Make the gesture in front of your camera.
                              </p>
                            </div>
                          </div>
                          {alphaCompleted[activeAlphaItem.letter] && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                              Completed ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* ================== WORD PRACTICE VIEW ================== */
              <div className="space-y-6">
                {/* Category & Word selection panel */}
                <Card>
                  <CardContent className="p-4">
                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2 pb-3 border-b border-border">
                      {Object.keys(WORD_CATEGORIES).map((catName) => {
                        const isCatSelected = selectedCategory === catName;
                        const catEmojis: Record<string, string> = { Animals: '🦁', Transport: '🚗', Fruits: '🍎', Festival: '🎉', Vegetables: '🥦', Occupation: '💼' };
                        return (
                          <button
                            key={catName}
                            onClick={() => resetWordPractice(0, catName)}
                            className={cn(
                              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border',
                              isCatSelected
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                            )}
                          >
                            {catEmojis[catName] || '📂'} {catName}
                          </button>
                        );
                      })}
                    </div>

                    {/* Word items grid */}
                    <div className="mt-3">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Select a word to spell
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {WORD_CATEGORIES[selectedCategory].map((item, idx) => {
                          const isWordSelected = selectedWordIdx === idx;
                          return (
                            <button
                              key={item.word}
                              onClick={() => resetWordPractice(idx)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5',
                                isWordSelected
                                  ? 'bg-secondary border-primary/50 text-foreground font-bold shadow-xs'
                                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
                              )}
                            >
                              <span>{item.emoji}</span>
                              <span>{item.word}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Primary Word Practice Content Box */}
                <Card>
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    {wordCompleted ? (
                      /* Celebration Screen */
                      <div className="text-center py-6 space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Trophy className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black">Word Spelled Successfully!</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Excellent! You spelled <span className="font-bold text-primary">{activeWordItem.word}</span> correctly.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-6xl animate-bounce">{activeWordItem.emoji}</span>
                        </div>
                        <div className="flex justify-center gap-3 pt-2">
                          <Button onClick={() => resetWordPractice(selectedWordIdx)}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Practice again
                          </Button>
                          <Button onClick={handleNextWord} variant="outline">
                            Next word <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Active Practice Step */
                      <div className="space-y-6">
                        {/* Word illustration */}
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-6xl mb-2">{activeWordItem.emoji}</span>
                          <span className="text-xs font-bold tracking-widest text-primary uppercase">
                            Spell the word
                          </span>
                        </div>

                        {/* Spelling Blocks */}
                        <div className="flex justify-center items-center gap-2.5">
                          {activeWordItem.word.split('').map((letter, index) => {
                            const isCompleted = index < activeLetterIndex;
                            const isActive = index === activeLetterIndex;
                            return (
                              <div
                                key={index}
                                className={cn(
                                  'flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl font-black shadow-sm transition-all',
                                  isCompleted && 'bg-primary/20 border-primary text-primary font-extrabold',
                                  isActive && 'bg-primary border-primary text-primary-foreground scale-110 ring-4 ring-primary/20 animate-pulse',
                                  !isCompleted && !isActive && 'border-border text-muted-foreground bg-secondary/15'
                                )}
                              >
                                {letter}
                              </div>
                            );
                          })}
                        </div>

                        {/* Present Letter Div with Helper Sign */}
                        <div className="border border-dashed border-border rounded-2xl bg-card/60 p-6 flex flex-col md:flex-row items-center gap-6">
                          <div className="w-24 h-24 bg-secondary/30 rounded-xl p-2 shrink-0 border border-border flex items-center justify-center">
                            <AslSign letter={activeWordItem.word[activeLetterIndex]} />
                          </div>
                          <div className="flex-1 space-y-2 text-center md:text-left w-full">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Present Letter to Sign
                            </p>
                            <h3 className="text-xl font-bold">
                              Show letter &quot;
                              <span
                                className={cn(
                                  'transition-all duration-300',
                                  matchSuccess
                                    ? 'text-green-500 font-black text-2xl animate-pulse'
                                    : isWrongSign
                                      ? 'text-red-500 font-black text-2xl animate-pulse'
                                      : 'text-primary font-black text-2xl'
                                )}
                              >
                                {activeWordItem.word[activeLetterIndex]}
                              </span>
                              &quot;
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Form the sign displayed in the guide above. The detector will automatically advance when matched!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Webcam recognition panel & Simulator (Right) */}
          <div className="space-y-6">
            {/* Camera feed card */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video w-full bg-foreground/5">
                  <video ref={videoRef} className="h-full w-full object-cover -scale-x-100" style={{ transform: 'scaleX(-1)' }} playsInline muted autoPlay />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {!cameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-secondary/60 text-center backdrop-blur-xs">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-md">
                        <CameraOff className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">Webcam is off</p>
                        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                          Turn on camera to practice with live sign language detection
                        </p>
                      </div>
                      <Button onClick={startCamera} disabled={starting} size="sm">
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
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-[10px] font-bold shadow-xs backdrop-blur-xs">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                        LIVE DETECTION
                      </div>

                      {/* Display live detected letter */}
                      {currentSign && (
                        <div className="absolute right-3 top-3 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                          <span className="text-xl font-extrabold leading-none">{currentSign}</span>
                          <span className="text-[8px] uppercase tracking-wide opacity-80 mt-0.5">seen</span>
                        </div>
                      )}

                      <button
                        onClick={stopCamera}
                        className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-bold shadow-xs backdrop-blur-xs hover:bg-background"
                      >
                        <Square className="h-3 w-3 fill-destructive text-destructive" /> Stop
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
