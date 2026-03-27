"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useCallback } from "react";
import type { Dog, FollowUpQuestion, FilterCriterion, AISearchResponse } from "@/lib/types";
import { filterDogs } from "@/lib/filterDogs";
import { DogGrid } from "./DogGrid";
import { SearchInput } from "./SearchInput";
import { FollowUpPills } from "./FollowUpPills";
import { DogProfileCard } from "./DogProfileCard";
import { DogModal } from "./DogModal";
import { Confetti } from "./Confetti";

function parseAIResponse(text: string): AISearchResponse | null {
  // Try to extract JSON from ```json ... ``` block
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1]) as AISearchResponse;
    } catch {}
  }

  // Fallback: try to find a raw JSON object
  const rawJsonMatch = text.match(/\{[\s\S]*"matchedDogIds"[\s\S]*\}/);
  if (rawJsonMatch) {
    try {
      return JSON.parse(rawJsonMatch[0]) as AISearchResponse;
    } catch {}
  }

  return null;
}

export function ChatInterface({ initialDogs }: { initialDogs: Dog[] }) {
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  // matchedDogIds is ranked — first ID is the best match
  const [matchedDogIds, setMatchedDogIds] = useState<string[] | null>(null);
  const [displayedDogs, setDisplayedDogs] = useState<Dog[] | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<
    FollowUpQuestion[] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<
    FilterCriterion[] | null
  >(null);
  const [showTopMatch, setShowTopMatch] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [selectedDogColorIndex, setSelectedDogColorIndex] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [chosenDog, setChosenDog] = useState<Dog | null>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "pup-finder",
    sendAutomaticallyWhen: ({ messages: msgs }) => {
      if (msgs.length === 0) return false;
      const last = msgs[msgs.length - 1];
      if (last.role !== "assistant") return false;
      const hasToolCalls = last.parts?.some(
        (p) =>
          p.type?.startsWith("tool-") && "state" in p && p.state === "done"
      );
      const hasText = last.parts?.some((p) => p.type === "text");
      return hasToolCalls === true && !hasText;
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Parse AI response when streaming completes
  useEffect(() => {
    if (isLoading) return;

    const assistantMessages = messages.filter((m) => m.role === "assistant");
    if (assistantMessages.length === 0) return;

    const lastAssistant = assistantMessages[assistantMessages.length - 1];
    const textParts = lastAssistant.parts?.filter((p) => p.type === "text");
    if (!textParts || textParts.length === 0) return;

    const fullText = textParts
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("");

    const parsed = parseAIResponse(fullText);
    if (!parsed) return;

    setAiMessage(parsed.message);
    setMatchedDogIds(parsed.matchedDogIds);

    // Look up matched dogs from initialDogs, preserving AI rank order
    const idOrder = new Map(parsed.matchedDogIds.map((id, i) => [id, i]));
    const matched = initialDogs
      .filter((d) => idOrder.has(d._id))
      .sort((a, b) => (idOrder.get(a._id) ?? 0) - (idOrder.get(b._id) ?? 0));
    setDisplayedDogs(matched);

    if (parsed.followUps && parsed.followUps.length > 0) {
      setFollowUpQuestions(parsed.followUps);
    }
  }, [messages, isLoading, initialDogs]);

  const handleSearch = useCallback(
    (query: string) => {
      setAiMessage(null);
      setMatchedDogIds(null);
      setDisplayedDogs(null);
      setFollowUpQuestions(null);
      setSearchQuery(query);
      setFollowUpAnswers(null);
      setShowTopMatch(false);
      setMessages([]);
      sendMessage({ text: query });
    },
    [sendMessage, setMessages]
  );

  const handleFollowUpSubmit = useCallback(
    (filters: FilterCriterion[]) => {
      if (!matchedDogIds) return;

      // Client-side filtering, preserving original AI rank order
      const filtered = filterDogs(initialDogs, matchedDogIds, filters);
      const idOrder = new Map(matchedDogIds.map((id, i) => [id, i]));
      filtered.sort((a, b) => (idOrder.get(a._id) ?? 0) - (idOrder.get(b._id) ?? 0));

      setDisplayedDogs(filtered);
      setFollowUpQuestions(null);
      setFollowUpAnswers(filters);
      // Show top match highlight after follow-up filtering narrows results
      setShowTopMatch(filtered.length > 1);
    },
    [initialDogs, matchedDogIds]
  );

  const handleReset = useCallback(() => {
    setAiMessage(null);
    setMatchedDogIds(null);
    setDisplayedDogs(null);
    setFollowUpQuestions(null);
    setSearchQuery(null);
    setFollowUpAnswers(null);
    setShowTopMatch(false);
    setChosenDog(null);
    setShowConfetti(false);
    setMessages([]);
  }, [setMessages]);

  const handleChoose = useCallback((dog: Dog) => {
    setSelectedDog(null);
    setChosenDog(dog);
    setShowConfetti(true);
  }, []);

  const hasSearched = matchedDogIds !== null;
  // Top match is always the first dog in displayedDogs (AI ranked order preserved through filtering)
  const topMatchId = showTopMatch && displayedDogs && displayedDogs.length > 1
    ? displayedDogs[0]._id
    : null;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-black drop-shadow-[3px_3px_0_rgba(0,0,0,0.3)] tracking-tight">
          Pup Finder
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mt-2 font-medium">
          Find your perfect furry companion
        </p>
      </header>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <SearchInput
          onSearch={handleSearch}
          onReset={handleReset}
          isLoading={isLoading}
          hasResults={hasSearched}
        />
      </div>

      {/* Search History */}
      {searchQuery && hasSearched && (
        <div className="max-w-3xl mx-auto px-4 mb-4 fade-in">
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-black/70 font-bold uppercase tracking-wide text-xs">
              Your preferences:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border-2 border-black font-semibold shadow-brutal">
                {searchQuery}
              </span>
              {followUpAnswers?.map((a, i) => (
                <span
                  key={i}
                  className="bg-yellow-100/90 backdrop-blur px-3 py-1.5 rounded-full border-2 border-black font-medium shadow-brutal"
                >
                  {String(a.value)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Message */}
      {aiMessage && (
        <div className="max-w-3xl mx-auto px-4 mb-6 fade-in">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-brutal-lg border-3 border-black">
            <p className="text-gray-800 text-lg leading-relaxed">
              {aiMessage}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="max-w-3xl mx-auto px-4 mb-6">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-brutal-lg border-3 border-black">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="text-gray-600 text-lg">
                Sniffing out the perfect matches...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions && !isLoading && (
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <FollowUpPills
            questions={followUpQuestions}
            onSubmit={handleFollowUpSubmit}
          />
        </div>
      )}

      {/* Search Results */}
      {displayedDogs && displayedDogs.length > 0 && !isLoading && (
        <div className="max-w-3xl mx-auto px-4 mb-6 space-y-4">
          {displayedDogs.map((dog, index) => (
            <DogProfileCard
              key={dog._id}
              dog={dog}
              isTopMatch={dog._id === topMatchId}
              colorIndex={index}
              onClick={(d) => {
                setSelectedDogColorIndex(index);
                setSelectedDog(d);
              }}
              onChoose={handleChoose}
            />
          ))}
        </div>
      )}

      {/* Initial dog grid (before any search) */}
      {!hasSearched && !isLoading && (
        <div className="max-w-7xl mx-auto px-4">
          <DogGrid
            dogs={initialDogs}
            onSelectDog={(dog) => {
              setSelectedDogColorIndex(initialDogs.findIndex((d) => d._id === dog._id));
              setSelectedDog(dog);
            }}
            onChooseDog={handleChoose}
          />
        </div>
      )}

      {/* No matches message */}
      {hasSearched &&
        displayedDogs !== null &&
        displayedDogs.length === 0 &&
        !isLoading && (
          <div className="text-center py-16">
            <p className="text-3xl text-white font-bold">
              No pups match that description
            </p>
            <p className="text-white/80 mt-2 text-lg">
              Try a different description or reset to see all dogs
            </p>
          </div>
        )}

      {/* Modal */}
      {selectedDog && (
        <DogModal
          dog={selectedDog}
          onClose={() => setSelectedDog(null)}
          onChoose={handleChoose}
          colorIndex={selectedDogColorIndex}
        />
      )}

      {/* Confetti */}
      {showConfetti && chosenDog && (
        <Confetti
          dogName={chosenDog.name}
          onClose={() => {
            setShowConfetti(false);
          }}
        />
      )}
    </div>
  );
}
