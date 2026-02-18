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
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm border border-gray-100">
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:300ms]" />
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
    <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-gray-800 shadow-sm border border-gray-100">
      {displayed}
      {!done && <span className="animate-pulse text-gray-400">|</span>}
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
    <div className="flex flex-col gap-3">
      {selectMode === "multi" && maxSelections && (
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          Pick up to {maxSelections} · {selected.length} selected
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => handleTap(opt.value)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-150 ${
                isSelected
                  ? "border-primary-600 bg-primary-600 text-white shadow-md"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary-400 hover:bg-orange-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {selectMode === "multi" && (
        <button
          onClick={() => onSelect(selected)}
          disabled={!canContinue}
          className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-30"
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
  const hasOptions = options && options.length > 0 && !isTyping;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex h-screen flex-col bg-[#faf7f2]">
      {/* Scrollable chat messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" ? (
                <AiMessage content={msg.content} />
              ) : (
                <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary-600 px-4 py-3 text-white shadow-sm">
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

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Sticky options panel — only shown when there are options */}
      {hasOptions && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="mx-auto max-w-2xl">
            <PillOptions
              options={options}
              selectMode={selectMode}
              maxSelections={maxSelections}
              onSelect={onSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
