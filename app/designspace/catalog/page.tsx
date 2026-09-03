import DsNotes from "@/components/DsNotes";

/** Mobbin-style catalog: every view state, live in a phone frame, with its canonical name. */
const VIEWS: { id: string; name: string; src: string; note: string }[] = [
  { id: "V1", name: "Practice", src: "/", note: "The default screen. Timer, prompt, answer line, keypad." },
  { id: "V2", name: "Feedback · miss", src: "/?demo=wrong", note: "Keypad gone. Answer, why, play-with-it widget, technique card, → bar." },
  { id: "V3", name: "Feedback · slow", src: "/?demo=slow", note: "Correct but over budget: green outline on the technique card." },
  { id: "V4", name: "Session summary", src: "/?demo=summary", note: "Count, accuracy, per-skill tally, Again + length picker." },
  { id: "V5", name: "Session length", src: "/?demo=timer", note: "Sheet from tapping the timer." },
  { id: "V6", name: "Make it default?", src: "/?demo=default", note: "Prompt after choosing a new length." },
  { id: "V7", name: "Onboarding · name", src: "/?demo=onboarding", note: "First entry." },
  { id: "V8", name: "Onboarding · sign in", src: "/?demo=signin", note: "Second device." },
  { id: "V9", name: "Overlay · History", src: "/?demo=history", note: "Daily bars stacked by session." },
  { id: "V10", name: "Overlay · Unit", src: "/?demo=unit", note: "Hierarchy + strength/weakness map." },
  { id: "V11", name: "Overlay · Profile", src: "/?demo=profile", note: "Name, email, sign in." },
  { id: "V12", name: "Error", src: "/designspace/catalog/error-demo", note: "Recoverable error screen (static)." },
];

export default function Catalog() {
  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight">Catalog</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8 max-w-prose">Every view state of the app, rendered live (they&apos;re the real thing, in a frame — so this never goes stale). Refer to them by number: “V2 needs…”.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {VIEWS.map((v) => (
          <figure key={v.id}>
            <div className="w-full aspect-[9/17] rounded-[20px] border border-gray-300 dark:border-gray-700 overflow-hidden bg-black">
              {v.src.endsWith("error-demo") ? <ErrorDemo /> : <iframe src={v.src} title={`${v.id} ${v.name}`} className="w-full h-full" loading="lazy" />}
            </div>
            <figcaption className="mt-2">
              <div className="text-sm"><span className="text-gray-400 tabular-nums mr-1.5">{v.id}</span>{v.name}</div>
              <div className="text-[11px] text-gray-500">{v.note}</div>
            </figcaption>
          </figure>
        ))}
      </div>
      <DsNotes page="catalog" />
    </div>
  );
}

function ErrorDemo() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4 text-gray-100 text-center">
      <div className="space-y-2">
        <div className="text-lg font-light">Something broke</div>
        <p className="text-[10px] text-gray-400">Usually a new version arriving mid-load. Reloading fixes it; your progress is saved.</p>
        <div className="h-8 rounded-xl bg-gray-100 text-black text-[11px] flex items-center justify-center">Reload</div>
      </div>
    </div>
  );
}
