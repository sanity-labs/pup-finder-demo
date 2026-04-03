"use client";

import { useState } from "react";

const PROMPT_IDEAS = [
  "I need a dog that can hike with me and won't make me sneeze",
  "I work from home and want a quiet companion who'll just chill on the couch with me",
  "My kids are 4 and 7 and we've never had a dog before",
  "I live in a 500 sq ft apartment in the city",
  "I'm training for a marathon and want a running buddy",
  "Something fluffy that won't terrorize my cat",
  "I want a big goofy dog that loves everyone but won't wake up the neighbors",
  "I just went through a breakup and need unconditional love",
  "I want a dog with personality — not a boring one",
  "Something low-maintenance, I'm honestly kind of lazy",
  "We already have two dogs and a cat — whoever comes home needs to play nice",
  "First time dog owner, I don't want to be overwhelmed",
  "I want a dog that'll actually protect my house but be sweet with my family",
  "I'm retired and looking for a mellow buddy to keep me company on walks",
  "My daughter does best with calm, predictable animals",
  "Budget's tight but I want a dog that's ready to go — shots, fixed, the works",
];

interface SearchInputProps {
  onSearch: (query: string) => void;
  onReset: () => void;
  isLoading: boolean;
  hasResults: boolean;
}

export function SearchInput({
  onSearch,
  onReset,
  isLoading,
  hasResults,
}: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  if (hasResults) {
    return (
      <button
        type="button"
        onClick={() => {
          setQuery("");
          onReset();
        }}
        className="w-full text-lg md:text-xl px-6 py-5 rounded-2xl border-3 border-black bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-brutal-lg transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#FF6B6B,10px_10px_0_rgba(0,0,0,0.15)]"
      >
        Start Over
      </button>
    );
  }

  const fillRandomIdea = () => {
    const idea = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
    setQuery(idea);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your perfect dog..."
            disabled={isLoading}
            className="w-full text-lg md:text-xl pl-6 pr-6 md:pr-38 py-5 rounded-2xl border-3 border-black bg-white/95 backdrop-blur shadow-brutal-lg focus:outline-none focus:shadow-[6px_6px_0_#FF6B6B,10px_10px_0_rgba(0,0,0,0.15)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all placeholder:text-gray-400 font-medium disabled:opacity-60"
          />
          <div className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 gap-2">
            {!query && !isLoading && (
              <button
                type="button"
                onClick={fillRandomIdea}
                className="text-sm font-semibold text-purple-600 hover:text-pink-500 transition-colors cursor-pointer whitespace-nowrap"
              >
                ✨ Give me ideas
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm border-2 border-black shadow-brutal transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Searching..." : "Find My Pup!"}
            </button>
          </div>
        </div>
        {/* Mobile buttons below input */}
        <div className="flex md:hidden gap-2 mt-3">
          {!query && !isLoading && (
            <button
              type="button"
              onClick={fillRandomIdea}
              className="flex-1 py-3 rounded-xl border-2 border-black bg-white font-semibold text-purple-600 shadow-brutal transition-all text-sm"
            >
              ✨ Give me ideas
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`${!query && !isLoading ? "flex-1" : "w-full"} py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm border-2 border-black shadow-brutal transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Searching..." : "Find My Pup!"}
          </button>
        </div>
      </form>
    </div>
  );
}
