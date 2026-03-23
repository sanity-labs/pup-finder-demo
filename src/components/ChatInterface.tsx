"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useCallback } from "react";
import type { Dog, FollowUpQuestion, DogProfile } from "@/lib/types";
import { DogGrid } from "./DogGrid";
import { SearchInput } from "./SearchInput";
import { FollowUpPills } from "./FollowUpPills";
import { DogProfileCard } from "./DogProfileCard";
import { DogProfileSkeleton } from "./DogProfileSkeleton";
import { DogModal } from "./DogModal";
import { Confetti } from "./Confetti";

function parseMarkers(text: string) {
  const dogMatch = text.match(/<<<MATCHED_DOGS:(\[.*?\])>>>/);
  const followUpRegex = new RegExp("<<<FOLLOW_UP:(\\[.*?\\])>>>", "s");
  const followUpMatch = text.match(followUpRegex);
  const profilesRegex = new RegExp("<<<DOG_PROFILES:(\\[.*?\\])>>>", "s");
  const profilesMatch = text.match(profilesRegex);

  let matchedIds: string[] | null = null;
  let followUps: FollowUpQuestion[] | null = null;
  let profiles: DogProfile[] | null = null;

  if (dogMatch) {
    try {
      matchedIds = JSON.parse(dogMatch[1]);
    } catch {}
  }

  if (followUpMatch) {
    try {
      followUps = JSON.parse(followUpMatch[1]);
    } catch {}
  }

  if (profilesMatch) {
    try {
      profiles = JSON.parse(profilesMatch[1]);
    } catch {}
  }

  // Split text around the DOG_PROFILES marker for intro/closing
  let introText = "";
  let closingText = "";

  // First strip MATCHED_DOGS and FOLLOW_UP markers
  let workingText = text
    .replace(/<<<MATCHED_DOGS:(\[.*?\])>>>/g, "")
    .replace(new RegExp("<<<FOLLOW_UP:(\\[.*?\\])>>>", "gs"), "");

  if (profilesMatch) {
    const idx = workingText.indexOf(profilesMatch[0]);
    if (idx !== -1) {
      introText = workingText.substring(0, idx).trim();
      closingText = workingText.substring(idx + profilesMatch[0].length).trim();
    } else {
      introText = workingText.replace(profilesRegex, "").trim();
    }
  } else {
    // Strip any partial/incomplete markers (e.g. during streaming)
    introText = workingText.replace(/<<<[\s\S]*$/g, "").trim();
  }

  // Also clean partial markers from intro/closing
  introText = introText.replace(/<<<[\s\S]*$/g, "").trim();
  closingText = closingText.replace(/<<<[\s\S]*$/g, "").trim();

  return { matchedIds, followUps, profiles, introText, closingText };
}

export function ChatInterface({ initialDogs }: { initialDogs: Dog[] }) {
  const [filteredDogIds, setFilteredDogIds] = useState<string[] | null>(null);
  const [introText, setIntroText] = useState<string | null>(null);
  const [closingText, setClosingText] = useState<string | null>(null);
  const [dogProfiles, setDogProfiles] = useState<DogProfile[] | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<
    FollowUpQuestion[] | null
  >(null);
  const [answeredMessageId, setAnsweredMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<
    { question: string; answer: string }[] | null
  >(null);
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

  // Parse AI responses for structured markers
  // Intro text updates live during streaming; everything else waits until done
  useEffect(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    if (assistantMessages.length === 0) return;

    const lastAssistant = assistantMessages[assistantMessages.length - 1];

    // Skip re-parsing a message whose follow-ups were already answered
    if (lastAssistant.id === answeredMessageId) return;

    const textParts = lastAssistant.parts?.filter((p) => p.type === "text");
    if (!textParts || textParts.length === 0) return;

    const fullText = textParts
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("");
    const { matchedIds, followUps, profiles, introText: intro, closingText: closing } =
      parseMarkers(fullText);

    // Show intro text immediately while streaming
    if (intro) {
      setIntroText(intro);
    }

    // Buffer everything else until streaming completes
    if (!isLoading) {
      if (matchedIds) {
        setFilteredDogIds(matchedIds);
      }

      if (closing) {
        setClosingText(closing);
      }

      if (profiles) {
        setDogProfiles(profiles);
      }

      if (followUps) {
        setFollowUpQuestions(followUps);
      }
    }
  }, [messages, answeredMessageId, isLoading]);

  const handleSearch = useCallback(
    (query: string) => {
      setIntroText(null);
      setClosingText(null);
      setDogProfiles(null);
      setFollowUpQuestions(null);
      setFilteredDogIds([]);
      setAnsweredMessageId(null);
      setSearchQuery(query);
      setFollowUpAnswers(null);
      setMessages([]);
      sendMessage({ text: query });
    },
    [sendMessage, setMessages]
  );

  const handleFollowUpSubmit = useCallback(
    (answers: { question: string; answer: string }[]) => {
      // Track which message's follow-ups were answered so we don't re-show them,
      // but still allow NEW follow-ups from the next AI response
      const assistantMessages = messages.filter((m) => m.role === "assistant");
      const lastAssistant = assistantMessages[assistantMessages.length - 1];
      if (lastAssistant) {
        setAnsweredMessageId(lastAssistant.id);
      }
      setFollowUpQuestions(null);
      setDogProfiles(null);
      setFilteredDogIds([]);
      setIntroText(null);
      setClosingText(null);
      setFollowUpAnswers(answers);
      const parts = answers
        .map((a) => `"${a.question}": ${a.answer}`)
        .join("; ");
      sendMessage({
        text: `Here are my answers: ${parts}. Please apply these to the current results and narrow down the matches.`,
      });
    },
    [sendMessage, messages]
  );

  const handleReset = useCallback(() => {
    setFilteredDogIds(null);
    setIntroText(null);
    setClosingText(null);
    setDogProfiles(null);
    setFollowUpQuestions(null);
    setAnsweredMessageId(null);
    setSearchQuery(null);
    setFollowUpAnswers(null);
    setChosenDog(null);
    setShowConfetti(false);
    setMessages([]);
  }, [setMessages]);

  const handleChoose = useCallback((dog: Dog) => {
    setSelectedDog(null);
    setChosenDog(dog);
    setShowConfetti(true);
  }, []);

  // Resolve profiles to actual dog objects
  const profileDogs = dogProfiles
    ? dogProfiles
        .map((profile) => {
          const dog = initialDogs.find((d) => d._id === profile.id);
          return dog ? { dog, profile } : null;
        })
        .filter(Boolean) as { dog: Dog; profile: DogProfile }[]
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
          hasResults={filteredDogIds !== null}
        />
      </div>

      {/* Search History */}
      {searchQuery && filteredDogIds !== null && (
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
                  {a.answer}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Intro + Closing Text */}
      {(introText || closingText) && (
        <div className="max-w-3xl mx-auto px-4 mb-6 fade-in">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-brutal-lg border-3 border-black">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
              {introText}
              {introText && closingText ? "\n\n" : ""}
              {closingText}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && !introText && (
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
      {followUpQuestions && (
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <FollowUpPills
            questions={followUpQuestions}
            onSubmit={handleFollowUpSubmit}
          />
        </div>
      )}

      {/* Dog Profile Cards or Skeletons */}
      {profileDogs && profileDogs.length > 0 ? (
        <div className="max-w-3xl mx-auto px-4 mb-6 space-y-4">
          {profileDogs.map(({ dog, profile }, index) => (
            <DogProfileCard
              key={dog._id}
              dog={dog}
              profile={profile}
              colorIndex={index}
              onClick={(d) => {
                setSelectedDogColorIndex(index);
                setSelectedDog(d);
              }}
              onChoose={handleChoose}
            />
          ))}
        </div>
      ) : isLoading && filteredDogIds !== null ? (
        <DogProfileSkeleton />
      ) : null}

      {/* Initial dog grid (before any search) */}
      {filteredDogIds === null && (
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
      {filteredDogIds !== null &&
        filteredDogIds.length === 0 &&
        !profileDogs?.length &&
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
