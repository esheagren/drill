"use client";

/** Replaces Next's default "Application error" screen with something recoverable. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const reload = async () => {
    try { if ("caches" in window) for (const k of await caches.keys()) await caches.delete(k); } catch { /* ignore */ }
    window.location.reload();
  };
  return (
    <div className="min-h-dvh flex items-center justify-center px-6 bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-xs w-full text-center space-y-4">
        <div className="text-2xl font-light">Something broke</div>
        <p className="text-sm text-gray-500">Usually a new version arriving mid-load. Reloading fixes it; your progress is saved.</p>
        <button onClick={reload} className="w-full h-12 rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black">Reload</button>
        <button onClick={reset} className="w-full h-10 text-sm text-gray-500">Try again without reloading</button>
        <p className="text-[10px] text-gray-300 dark:text-gray-700 break-all">{error.message}</p>
      </div>
    </div>
  );
}
