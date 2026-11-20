 
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { useConversationStore } from "../store/ConversationStore";
import ConversationSidebar from "./ConversationSidebar";

export default function ChatInterface() {
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useConversationStore((state) => state.messages);
  const sendMessage = useConversationStore((state) => state.sendMessage);
  const isSending = useConversationStore((state) => state.isSending);
  const error = useConversationStore((state) => state.error);

  const fetchConversations = useConversationStore(
    (state) => state.fetchConversations
  );

  const isLoadingHistory = useConversationStore(
    (state) => state.isLoadingHistory
  );

  // Fetch previous conversations on page load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = prompt.trim();

    if (!message || isSending) return;

    setPrompt("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-5 sm:px-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold">
          D
        </div>

        <div>
          <h1 className="font-semibold tracking-wide">
            DSA Assistant
          </h1>

          <p className="text-xs text-slate-400">
            Your data structures & algorithms companion
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          AI Assistant
        </div>
      </header>

      {/* Sidebar + Chat Layout */}
      <div className="flex min-h-0 flex-1">

        {/* Previous Conversations Sidebar */}
        <ConversationSidebar />

        {/* Main Chat Area */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Chat Messages */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-8 sm:px-6">

              {isLoadingHistory ? (
                <div className="my-auto flex items-center justify-center gap-3 py-16 text-sm text-slate-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
                  Loading conversation...
                </div>
              ) : messages.length === 0 ? (
                <div className="my-auto flex flex-col items-center justify-center py-16 text-center">

                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
                    ✦
                  </div>

                  <h2 className="text-2xl font-semibold sm:text-3xl">
                    What are we learning today?
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                    Ask me about algorithms, data structures, time complexity,
                    or debugging your code.
                  </p>

                  <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
                    {[
                      "Explain binary search",
                      "What is a linked list?",
                      "Explain Big O notation",
                      "How does merge sort work?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setPrompt(suggestion)}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left text-sm text-slate-300 transition hover:border-indigo-500/60 hover:bg-slate-900"
                      >
                        <span className="mb-2 block text-indigo-400">
                          ↗
                        </span>

                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-7">

                  {messages.map((message) => {
                    const isUser = message.role === "USER";

                    return (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          isUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                            isUser
                              ? "bg-slate-700 text-white"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {isUser ? "Y" : "D"}
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                            isUser
                              ? "rounded-tr-sm bg-indigo-600 text-white"
                              : "rounded-tl-sm border border-slate-800 bg-slate-900 text-slate-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-7">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {isSending && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-semibold">
                        D
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900 px-4 py-4">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />

                        <span className="ml-2 text-xs text-slate-400">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  <p>{error}</p>

                  <p className="mt-1 text-xs text-red-300/70">
                    Check your backend connection and try again.
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Prompt Input */}
          <footer className="shrink-0 border-t border-slate-800 bg-slate-950 px-4 pb-5 pt-4 sm:px-6">
            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-3xl"
            >
              <div className="flex items-end gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-3 transition focus-within:border-indigo-500">

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about DSA..."
                  rows={1}
                  disabled={isSending || isLoadingHistory}
                  aria-label="Your message"
                  className="max-h-40 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!prompt.trim() || isSending || isLoadingHistory}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
                >
                  ↑
                </button>
              </div>

              <p className="mt-3 text-center text-xs text-slate-500">
                Enter to send · Shift + Enter for a new line
              </p>
            </form>
          </footer>

        </div>
      </div>
    </div>
  );
}
