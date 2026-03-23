"use client";

import Image from "next/image";
import type { Dog } from "@/lib/types";
import { getDogColor } from "@/lib/colors";
import { urlFor } from "@/sanity/image";

interface DogCardProps {
  dog: Dog;
  colorIndex: number;
  onClick: () => void;
  onChoose: () => void;
}

function calculateAge(dateOfBirth?: string): string {
  if (!dateOfBirth) return "Age unknown";
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;

  if (totalMonths < 12) return `${totalMonths} mo`;
  if (totalMonths < 24) return `1 year`;
  return `${Math.floor(totalMonths / 12)} years`;
}

export function DogCard({ dog, colorIndex, onClick, onChoose }: DogCardProps) {
  const color = getDogColor(colorIndex);

  return (
    <div
      className="card-hover rounded-2xl border-3 border-black bg-white overflow-hidden cursor-pointer"
      style={
        { "--dog-color": color, boxShadow: `4px 4px 0 ${color}, 8px 8px 0 rgba(0,0,0,0.12)` } as React.CSSProperties
      }
      onClick={onClick}
    >
      {/* Image */}
      <div
        className="relative h-56 overflow-hidden"
        style={{ backgroundColor: color + "30" }}
      >
        {dog.image ? (
          <Image
            src={urlFor(dog.image).width(400).height(400).url()}
            alt={dog.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🐕
          </div>
        )}
        {/* Size badge */}
        <span
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase border-2 border-black bg-white shadow-brutal"
        >
          {dog.size}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-2xl font-bold tracking-tight">{dog.name}</h3>
          <span className="text-sm font-medium text-gray-500">
            {calculateAge(dog.dateOfBirth)}
          </span>
        </div>
        <p className="text-gray-600 font-medium">{dog.breed}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {dog.temperament && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold border border-black/20"
              style={{ backgroundColor: color + "40" }}
            >
              {dog.temperament}
            </span>
          )}
          {dog.energyLevel && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 border border-black/20">
              {dog.energyLevel} energy
            </span>
          )}
        </div>

        {/* Choose button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChoose();
          }}
          className="mt-4 w-full py-2.5 rounded-xl font-bold text-white border-2 border-black shadow-brutal transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_#000]"
          style={{ backgroundColor: color }}
        >
          Choose {dog.name}
        </button>
      </div>
    </div>
  );
}
