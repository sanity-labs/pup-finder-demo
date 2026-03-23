"use client";

import Image from "next/image";
import type { Dog, DogProfile } from "@/lib/types";
import { getDogColor } from "@/lib/colors";
import { urlFor } from "@/sanity/image";

interface DogProfileCardProps {
  dog: Dog;
  profile: DogProfile;
  colorIndex: number;
  onClick: (dog: Dog) => void;
  onChoose: (dog: Dog) => void;
}

export function DogProfileCard({
  dog,
  profile,
  colorIndex,
  onClick,
  onChoose,
}: DogProfileCardProps) {
  const color = getDogColor(colorIndex);

  return (
    <div
      className="fade-in bg-white/95 backdrop-blur rounded-2xl border-3 border-black overflow-hidden cursor-pointer card-hover"
      style={{
        "--dog-color": color,
        boxShadow: `4px 4px 0 ${color}, 8px 8px 0 rgba(0,0,0,0.12)`,
      } as React.CSSProperties}
      onClick={() => onClick(dog)}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div
          className="relative w-full sm:w-56 md:w-64 h-56 sm:h-auto shrink-0 overflow-hidden"
          style={{ backgroundColor: color + "30" }}
        >
          {dog.image ? (
            <Image
              src={urlFor(dog.image).width(500).height(500).url()}
              alt={dog.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🐕
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span>🐾</span> {profile.name}
            </h3>
            {dog.adoptionFee !== undefined && (
              <span
                className="px-3 py-1 rounded-full text-sm font-bold border-2 border-black shadow-brutal"
                style={{ backgroundColor: color + "60" }}
              >
                ${dog.adoptionFee}
              </span>
            )}
          </div>
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: color }}
          >
            {profile.subtitle}
          </p>

          {/* Traits */}
          <ul className="space-y-1.5 mb-3 flex-1">
            {profile.traits.map((trait, i) => (
              <li key={i} className="text-gray-700 text-sm leading-snug">
                <span className="font-bold text-gray-900">
                  {trait.includes(":") ? trait.split(":")[0] + ":" : ""}
                </span>{" "}
                {trait.includes(":") ? trait.split(":").slice(1).join(":").trim() : trait}
              </li>
            ))}
          </ul>

          {/* Tagline */}
          <p className="text-gray-500 italic text-sm mb-4">
            {profile.tagline}
          </p>

          {/* Choose button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChoose(dog);
            }}
            className="w-full py-2.5 rounded-xl font-bold text-white border-2 border-black shadow-brutal transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_#000] text-sm"
            style={{ backgroundColor: color }}
          >
            Choose {dog.name}
          </button>
        </div>
      </div>
    </div>
  );
}
