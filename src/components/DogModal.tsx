"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Dog } from "@/lib/types";
import { getDogColor } from "@/lib/colors";
import { urlFor } from "@/sanity/image";

interface DogModalProps {
  dog: Dog;
  onClose: () => void;
  onChoose: (dog: Dog) => void;
  colorIndex: number;
}

function calculateAge(dateOfBirth?: string): string {
  if (!dateOfBirth) return "Unknown";
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 12) return `${totalMonths} months`;
  if (totalMonths < 24) return "1 year";
  return `${Math.floor(totalMonths / 12)} years`;
}

function Badge({
  label,
  value,
  positive,
}: {
  label: string;
  value: boolean | undefined;
  positive?: boolean;
}) {
  const isTrue = value === true;
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
        isTrue
          ? "bg-green-100 border-green-400 text-green-800"
          : "bg-red-50 border-red-300 text-red-700"
      }`}
    >
      {isTrue ? "✓" : "✗"} {label}
    </span>
  );
}

export function DogModal({ dog, onClose, onChoose, colorIndex }: DogModalProps) {
  const color = getDogColor(colorIndex);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="modal-enter bg-white rounded-3xl border-3 border-black shadow-brutal-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={
          {
            "--dog-color": color,
            boxShadow: `8px 8px 0 ${color}, 14px 14px 0 rgba(0,0,0,0.12)`,
          } as React.CSSProperties
        }
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white border-2 border-black shadow-brutal flex items-center justify-center font-bold text-lg hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>

        {/* Image */}
        <div
          className="relative h-72 md:h-80 overflow-hidden rounded-t-3xl"
          style={{ backgroundColor: color + "30" }}
        >
          {dog.image ? (
            <Image
              src={urlFor(dog.image).width(800).height(600).url()}
              alt={dog.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              🐕
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">{dog.name}</h2>
              <p className="text-xl text-gray-600 font-medium">{dog.breed}</p>
            </div>
            {dog.adoptionFee !== undefined && (
              <div
                className="px-4 py-2 rounded-xl border-2 border-black shadow-brutal font-bold text-lg"
                style={{ backgroundColor: color + "60" }}
              >
                ${dog.adoptionFee}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-bold">Age</p>
              <p className="font-bold">{calculateAge(dog.dateOfBirth)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-bold">Size</p>
              <p className="font-bold capitalize">{dog.size}</p>
            </div>
            {dog.weight && (
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-bold">Weight</p>
                <p className="font-bold">{dog.weight} lbs</p>
              </div>
            )}
            {dog.sex && (
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-bold">Sex</p>
                <p className="font-bold capitalize">{dog.sex}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {dog.description && (
            <p className="text-gray-700 leading-relaxed mb-6">
              {dog.description}
            </p>
          )}

          {/* Personality */}
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">
              Personality
            </h3>
            <div className="flex flex-wrap gap-2">
              {dog.temperament && (
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold border-2 border-black"
                  style={{ backgroundColor: color + "50" }}
                >
                  {dog.temperament}
                </span>
              )}
              {dog.energyLevel && (
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 border-2 border-gray-300">
                  {dog.energyLevel} energy
                </span>
              )}
              {dog.barking && (
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 border-2 border-gray-300">
                  {dog.barking} barking
                </span>
              )}
            </div>
          </div>

          {/* Compatibility */}
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">
              Compatibility
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge label="Kids" value={dog.goodWithKids} />
              <Badge label="Dogs" value={dog.goodWithDogs} />
              <Badge label="Cats" value={dog.goodWithCats} />
            </div>
          </div>

          {/* Health */}
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">
              Health & Training
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge label="Spayed/Neutered" value={dog.spayedNeutered} />
              <Badge label="Vaccinated" value={dog.vaccinated} />
              <Badge label="House Trained" value={dog.houseTrained} />
              <Badge label="Crate Trained" value={dog.crateTrained} />
              <Badge label="Microchipped" value={dog.microchipped} />
            </div>
          </div>

          {/* Appearance */}
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">
              Appearance
            </h3>
            <div className="flex flex-wrap gap-2">
              {dog.coatLength && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 border border-gray-300">
                  {dog.coatLength} coat
                </span>
              )}
              {dog.color && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 border border-gray-300">
                  {dog.color}
                </span>
              )}
              {dog.hypoallergenic && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 border border-blue-300 text-blue-800">
                  Hypoallergenic
                </span>
              )}
            </div>
          </div>

          {/* Special Needs */}
          {dog.specialNeeds && (
            <div className="mb-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-300">
              <h3 className="font-bold text-sm uppercase text-amber-700 mb-1">
                Special Needs
              </h3>
              <p className="text-amber-900">{dog.specialNeeds}</p>
            </div>
          )}

          {/* Choose button */}
          <button
            onClick={() => onChoose(dog)}
            className="w-full py-4 rounded-2xl font-bold text-xl text-white border-3 border-black shadow-brutal-lg transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_#000]"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            }}
          >
            Choose {dog.name}! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
