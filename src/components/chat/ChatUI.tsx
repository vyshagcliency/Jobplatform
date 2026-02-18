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
    <div
      className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3"
      style={{
        backgroundColor: "#13161D",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span
        className="h-2 w-2 animate-bounce rounded-full [animation-delay:0ms]"
        style={{ backgroundColor: "#6B7280" }}
      />
      <span
        className="h-2 w-2 animate-bounce rounded-full [animation-delay:150ms]"
        style={{ backgroundColor: "#6B7280" }}
      />
      <span
        className="h-2 w-2 animate-bounce rounded-full [animation-delay:300ms]"
        style={{ backgroundColor: "#6B7280" }}
      />
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
    <div
      className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-3"
      style={{
        backgroundColor: "#13161D",
        border: "1px solid rgba(255,255,255,0.07)",
        color: "#EDEAE4",
        fontSize: "0.9375rem",
        lineHeight: "1.6",
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      {displayed}
      {!done && (
        <span style={{ color: "#6B7280" }} className="animate-pulse">
          |
        </span>
      )}
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
        <p
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "0.75rem",
            color: "#6B7280",
            fontWeight: 500,
            letterSpacing: "0.03em",
          }}
        >
          Pick up to {maxSelections} &middot; {selected.length} selected
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => handleTap(opt.value)}
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: "9999px",
                padding: "0.5rem 1rem",
                transition: "all 0.15s ease",
                border: isSelected
                  ? "1.5px solid #FF5C2C"
                  : "1.5px solid rgba(255,255,255,0.12)",
                backgroundColor: isSelected
                  ? "#FF5C2C"
                  : "rgba(255,255,255,0.04)",
                color: isSelected ? "#fff" : "#EDEAE4",
                cursor: "pointer",
              }}
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
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "0.875rem",
            fontWeight: 600,
            width: "100%",
            padding: "0.75rem",
            borderRadius: "10px",
            border: "none",
            cursor: canContinue ? "pointer" : "not-allowed",
            backgroundColor: canContinue ? "#FF5C2C" : "rgba(255,255,255,0.08)",
            color: canContinue ? "#fff" : "#6B7280",
            transition: "all 0.15s ease",
          }}
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
    <div
      className="flex h-screen flex-col"
      style={{ backgroundColor: "#0C0E13" }}
    >
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
                <div
                  className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3"
                  style={{
                    backgroundColor: "#FF5C2C",
                    color: "#fff",
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}
                >
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

      {/* Sticky bottom options panel */}
      {hasOptions && (
        <div
          className="px-4 py-4"
          style={{
            backgroundColor: "#13161D",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
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
