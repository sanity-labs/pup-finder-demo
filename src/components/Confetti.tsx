"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  dogName: string;
  onClose: () => void;
}

export function Confetti({ dogName, onClose }: ConfettiProps) {
  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: [
          "#FF6B6B",
          "#4ECDC4",
          "#FFE66D",
          "#DDA0FF",
          "#FF8B94",
          "#FFB347",
        ],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: [
          "#FF6B6B",
          "#4ECDC4",
          "#FFE66D",
          "#DDA0FF",
          "#FF8B94",
          "#FFB347",
        ],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Big initial burst
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors: [
        "#FF6B6B",
        "#4ECDC4",
        "#FFE66D",
        "#DDA0FF",
        "#FF8B94",
        "#FFB347",
        "#A8E6CF",
        "#B8F3FF",
      ],
    });

    // Continuous side bursts
    frame();
  }, []);

  useEffect(() => {
    fireConfetti();
  }, [fireConfetti]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="modal-enter text-center p-8 md:p-12 bg-white rounded-3xl border-3 border-black shadow-brutal-lg max-w-lg mx-4">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-3">
          It&apos;s a Match!
        </h2>
        <p className="text-xl text-gray-700 mb-2">
          You&apos;ve found your perfect companion:
        </p>
        <p className="text-3xl font-bold mb-6">{dogName}</p>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg border-2 border-black shadow-brutal transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
        >
          Celebrate! 🐾
        </button>
      </div>
    </div>
  );
}
