
import { useConversationStore } from "../store/ConversationStore";

export default function ConversationSidebar() {
  const conversations = useConversationStore(
    (state) => state.conversations
  );

  const activeConversationId = useConversationStore(
    (state) => state.activeConversationId
  );

  const fetchMessageHistory = useConversationStore(
    (state) => state.fetchMessageHistory
  );

  const setActiveConversation = useConversationStore(
    (state) => state.setActiveConversation
  );

  const isLoadingConversations = useConversationStore(
    (state) => state.isLoadingConversations
  );

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950">

      {/* Sidebar Header */}
      <div className="border-b border-slate-800 p-4">
        <button
          onClick={() => setActiveConversation(null)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <span className="text-lg">+</span>
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-3">

        <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Recent Conversations
        </h2>

        {isLoadingConversations ? (
          <p className="px-2 py-4 text-sm text-slate-500">
            Loading conversations...
          </p>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-4 text-sm text-slate-500">
            No previous conversations.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((conversation) => {
              const isActive =
                activeConversationId === conversation.id;

              return (
                <button
                  key={conversation.id}
                  onClick={() =>
                    fetchMessageHistory(conversation.id)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    isActive
                      ? "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className="shrink-0 text-base">
                    💬
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {conversation.title || "Untitled conversation"}
                  </span>

                  {isActive && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-slate-800 p-4">
        <p className="text-center text-xs text-slate-600">
          DSA Assistant
        </p>
      </div>
    </aside>
  );
}
