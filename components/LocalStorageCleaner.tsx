"use client";

import { useEffect } from "react";

const STORAGE_START_TIME_KEY = "localStorage_startTime";
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 10 minutes in milliseconds
const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds

export function LocalStorageCleaner() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeAndCheck = () => {
      const startTimeStr = localStorage.getItem(STORAGE_START_TIME_KEY);
      const now = Date.now();

      if (!startTimeStr) {
        // First time: save the start time
        localStorage.setItem(STORAGE_START_TIME_KEY, now.toString());
        return;
      }

      const startTime = parseInt(startTimeStr, 10);
      const elapsed = now - startTime;

      if (elapsed >= CLEANUP_INTERVAL_MS) {
        // 5 minutes have passed: clear all localStorage
        localStorage.clear();
        // Reset the start time
        localStorage.setItem(STORAGE_START_TIME_KEY, now.toString());
        console.log("[LocalStorageCleaner] LocalStorage cleared after 5 minutes");
      }
    };

    // Check immediately on mount
    initializeAndCheck();

    // Set up interval to check periodically
    const intervalId = setInterval(initializeAndCheck, CHECK_INTERVAL_MS);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // This component doesn't render anything
  return null;
}


