"use client";

import { useEffect } from "react";
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function StudioPage() {
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("non-boolean attribute") &&
        args[0].includes("focused")
      ) {
        return;
      }
      originalError(...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return <NextStudio config={config} />;
}
