"use client";

import type { Dog } from "@/lib/types";
import { DogCard } from "./DogCard";

interface DogGridProps {
  dogs: Dog[];
  onSelectDog: (dog: Dog) => void;
  onChooseDog: (dog: Dog) => void;
}

export function DogGrid({ dogs, onSelectDog, onChooseDog }: DogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {dogs.map((dog, index) => (
        <DogCard
          key={dog._id}
          dog={dog}
          colorIndex={index}
          onClick={() => onSelectDog(dog)}
          onChoose={() => onChooseDog(dog)}
        />
      ))}
    </div>
  );
}
