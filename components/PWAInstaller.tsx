"use client";

import { useEffect } from "react";

/**
 * Registers the service worker and keeps an installed (home-screen) app fresh:
 *  - checks for a new worker every time the app comes to the foreground
 *  - when a new worker takes control, reloads — immediately if no timed session
 *    is running, otherwise deferred until the session ends (see Trainer).
 */
export function PWAInstaller() {
  // Deploy skew: HTML from a new build can briefly reference a chunk the edge hasn't
  // served yet (or the SW cached a stale one). Clear caches and reload once.
  useEffect(() => {
    const KEY = "drill:chunk-retry";
    const heal = async (msg: string) => {
      if (!/ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/.test(msg)) return;
      try { if (sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
      try { if ("caches" in window) for (const k of await caches.keys()) await caches.delete(k); } catch { /* ignore */ }
      window.location.reload();
    };
    const onError = (e: ErrorEvent) => void heal(String(e.message || e.error?.message || ""));
    const onRejection = (e: PromiseRejectionEvent) => void heal(String(e.reason?.message || e.reason || ""));
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    // A successful load clears the guard so a *later* skew can heal again.
    const clear = () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } };
    const t = setTimeout(clear, 15000);
    return () => { window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); clearTimeout(t); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const inSession = () => document.body.dataset.inSession === "1";
    let reloaded = false;
    const reload = () => { if (!reloaded) { reloaded = true; window.location.reload(); } };

    const onControllerChange = () => {
      if (inSession()) document.body.dataset.updateReady = "1";
      else reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let reg: ServiceWorkerRegistration | undefined;
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((r) => { reg = r; return r.update(); })
      .catch((err) => console.error("Service Worker registration failed:", err));

    // Foreground → look for a newer build. Also reload if one was deferred and the session is over.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (document.body.dataset.updateReady === "1" && !inSession()) reload();
      reg?.update().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
    };
  }, []);

  return null;
}
