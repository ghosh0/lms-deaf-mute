const aslImages: Record<string, string> = {
  A: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/a-sign-language-4561deac-cfdedd5a-1920w.jpg",
  B: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/b-sign-language-2b0c5933-bf9b0829-1920w.jpg",
  C: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/c-sign-language-bb8d77d2-f2fa30e6-1920w.jpg",
  D: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/d-sign-language-42c327b8-4712cc47-1920w.jpg",
  E: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/e-sign-language-ddf0e9dc-c74af13b-1920w.jpg",
  F: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/f-sign-language-17795960-95b4d8f7-1920w.jpg",
  G: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/g-sign-language-3975453b-3916190c-1920w.jpg",
  H: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/h-sign-language-ee1639a7-69a675a3-1920w.jpg",
  I: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/i-sign-language-008d47e6-989ee559-1920w.jpg",
  J: "https://irp.cdn-website.com/dcc864fc/dms3rep/multi/letter-j-sign-language.gif",
  K: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/k-sign-language-00bc1e7c-1920w.jpg",
  L: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/l-sign-language-fd31b4ca-e8746b6c-1920w.jpg",
  M: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/m-sign-language-a693afda-d328f002-6ea114af-1920w.jpg",
  N: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/n-sign-language-2dd09315-e9b78f27-1920w.jpg",
  O: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/o-sign-language-4475ac86-949c93fc-1920w.jpg",
  P: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/p-sign-language-397a49ab-4ed6ddfd-1920w.jpg",
  Q: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/q-sign-language-8890ba2a-34ddf5ab-1920w.jpg",
  R: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/r-sign-language-3cb6b2b4-fcce9b4e-1920w.jpg",
  S: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/s-sign-language-b70694e7-a09fc8e9-1920w.jpg",
  T: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/t-sign-language-889993fe-0b033173-1920w.jpg",
  U: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/u-sign-language-8a051475-72f20e47-1920w.jpg",
  V: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/v-sign-language-080557e6-29dd9088-1920w.jpg",
  W: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/w-sign-language-45f612fc-a7d5c952-1920w.jpg",
  X: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/x-sign-language-7ec4e334-1db8b4e5-1920w.jpg",
  Y: "https://lirp.cdn-website.com/dcc864fc/dms3rep/multi/opt/y-sign-language-c9f55fb0-86a248f4-1920w.jpg",
  Z: "https://irp.cdn-website.com/dcc864fc/dms3rep/multi/letter-z-sign-language-alphabet.gif", 
};

export function AslSign({ letter }: { letter: string }) {
  const upperLetter = letter.toUpperCase();
  const imageUrl = aslImages[upperLetter];

  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-secondary/40 text-lg font-bold">
        {letter}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`ASL sign for ${letter}`}
      className="h-full w-full object-cover rounded-xl border border-border shadow-xs"
    />
  );
}
