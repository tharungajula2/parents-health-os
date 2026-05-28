"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service worker in production to avoid hot-reloading cache issues in dev
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[Service Worker] Registered successfully with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("[Service Worker] Registration failed:", error);
          });
      };

      // Register when the page is fully loaded
      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        return () => window.removeEventListener("load", handleLoad);
      }
    } else if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "development"
    ) {
      // In development, unregister any active service worker to prevent stale caching
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((unregistered) => {
            if (unregistered) {
              console.log("[Service Worker] Unregistered dev service worker to avoid stale cache:", registration.scope);
            }
          });
        }
      });
    }
  }, []);

  return null; // This component has no visual UI
}
