"use client";

import { useEffect, useRef, useState } from "react";

export interface ChatOption {
  label: string;
  value: string;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  options?: ChatOption[];
  selectMode?: "single" | "multi";
  maxSelections?: number;
}

interface ChatUIProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onSelect: (values: string[]) => void;
  selectMode?: "single" | "multi";
  maxSelections?: number;
  options?: ChatOption[];
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
    </div>
  );
}

function AiMessage({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(content.slice(0, i));
      if (i >= content.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-gray-800 shadow-sm">
      {displayed}
      {!done && <span className="animate-pulse">|</span>}
    </div>
  );
}

function PillOptions({
  options,
  selectMode,
  maxSelections,
  onSelect,
}: {
  options: ChatOption[];
  selectMode: "single" | "multi";
  maxSelections?: number;
  onSelect: (values: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function handleTap(value: string) {
    if (selectMode === "single") {
      onSelect([value]);
      return;
    }

    setSelected((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      const max = maxSelections ?? options.length;
      if (prev.length >= max) return prev;
      return [...prev, value];
    });
  }

  const requiredCount = maxSelections ?? 1;
  const canContinue = selectMode === "multi" && selected.length >= requiredCount;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => handleTap(opt.value)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition ${
              isSelected
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-primary-200 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
      {selectMode === "multi" && (
        <button
          onClick={() => onSelect(selected)}
          disabled={!canContinue}
          className="mt-2 w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      )}
    </div>
  );
}

export default function ChatUI({
  messages,
  isTyping,
  onSelect,
  selectMode = "single",
  maxSelections,
  options,
}: ChatUIProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-warm-50 to-accent-50">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-32 pt-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" ? (
              <AiMessage content={msg.content} />
            ) : (
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary-600 px-4 py-3 text-white shadow-sm">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}

        {options && options.length > 0 && !isTyping && (
          <div className="mx-auto max-w-sm">
            <PillOptions
              options={options}
              selectMode={selectMode}
              maxSelections={maxSelections}
              onSelect={onSelect}
            />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
