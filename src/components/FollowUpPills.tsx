"use client";

import { useState } from "react";
import type { FollowUpQuestion, FollowUpOption, FilterCriterion } from "@/lib/types";
import { DOG_COLORS } from "@/lib/colors";

interface FollowUpPillsProps {
  questions: FollowUpQuestion[];
  onSubmit: (filters: FilterCriterion[]) => void;
}

export function FollowUpPills({ questions, onSubmit }: FollowUpPillsProps) {
  const [selected, setSelected] = useState<Record<number, FollowUpOption>>({});

  const allAnswered = questions.every((_, i) => selected[i] !== undefined);

  const handleSelect = (questionIndex: number, option: FollowUpOption) => {
    setSelected((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = () => {
    const filters: FilterCriterion[] = questions.map((q, i) => ({
      field: q.field,
      filterType: q.filterType,
      value: selected[i].value,
    }));
    onSubmit(filters);
  };

  return (
    <div className="space-y-4 fade-in">
      <p className="text-white font-bold text-lg text-center">
        Help me narrow it down!
      </p>
      {questions.map((q, qi) => (
        <div
          key={qi}
          className="pill-stagger bg-white/95 backdrop-blur rounded-2xl p-5 border-3 border-black shadow-brutal-lg"
          style={{ animationDelay: `${qi * 100}ms` }}
        >
          <p className="font-bold text-gray-800 mb-3">{q.question}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((option, oi) => {
              const color = DOG_COLORS[(qi * 3 + oi) % DOG_COLORS.length];
              const isSelected = selected[qi]?.label === option.label;
              return (
                <button
                  key={oi}
                  onClick={() => handleSelect(qi, option)}
                  className={`px-5 py-2 rounded-full font-semibold border-2 border-black transition-all text-sm ${
                    isSelected
                      ? "translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0_#000] ring-2 ring-offset-1 ring-black"
                      : "shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_#000]"
                  }`}
                  style={{
                    backgroundColor: isSelected ? color : `${color}99`,
                  }}
                >
                  {isSelected && <span className="mr-1">&#10003;</span>}
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`px-8 py-3 rounded-full font-bold text-lg border-3 border-black transition-all ${
            allAnswered
              ? "bg-yellow-400 shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_#000] cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
          }`}
        >
          Find my pup!
        </button>
      </div>
    </div>
  );
}
