 
import { create } from "zustand";

import {
  createChat,
  getAllChats,
  getMessageHistory,
  type Message,
  type Conversation,
} from "../API/ChatAPI";


// --------------------------------------------------
// CONVERSATION STATE
// --------------------------------------------------

interface ConversationState {
  // All conversations belonging to the authenticated user.
  conversations: Conversation[];

  // ID of the currently selected conversation.
  // null means the user is starting a new conversation.
  activeConversationId: string | null;

  // Messages belonging to the currently active conversation.
  messages: Message[];

  // Identifies the current chat view.
  // Used to prevent outdated API responses from modifying
  // a different conversation.
  viewVersion: number;

  // Loading states.
  isSending: boolean;
  isLoadingConversations: boolean;
  isLoadingHistory: boolean;

  // Stores API or application errors.
  error: string | null;


  // --------------------------------------------------
  // ACTIONS
  // --------------------------------------------------

  // Select an existing conversation or clear the active chat.
  setActiveConversation: (id: string | null) => void;

  // Start a completely new conversation.
  startNewConversation: () => void;

  // Manage messages locally.
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // API operations.
  fetchConversations: () => Promise<void>;
  fetchMessageHistory: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}


// --------------------------------------------------
// ZUSTAND STORE
// --------------------------------------------------

export const useConversationStore = create<ConversationState>(
  (set, get) => ({

    // -----------------------------------------------
    // INITIAL STATE
    // -----------------------------------------------

    conversations: [],
    activeConversationId: null,
    messages: [],

    viewVersion: 0,

    isSending: false,
    isLoadingConversations: false,
    isLoadingHistory: false,

    error: null,


    // -----------------------------------------------
    // SET ACTIVE CONVERSATION
    // -----------------------------------------------

    setActiveConversation: (id) =>
      set((state) => ({

        // Update the selected conversation.
        activeConversationId: id,

        // Clear messages from the previously selected chat.
        messages: [],

        // Clear previous errors.
        error: null,

        // Reset history loading state.
        isLoadingHistory: false,

        // Increment viewVersion so previous API requests
        // cannot overwrite the newly selected conversation.
        viewVersion: state.viewVersion + 1,
      })),


    // -----------------------------------------------
    // START NEW CONVERSATION
    // -----------------------------------------------

    startNewConversation: () => {

      // A new conversation does not have a database ID yet.
      // Setting the active ID to null tells sendMessage()
      // to create a new conversation on the backend.
      get().setActiveConversation(null);

    },


    // -----------------------------------------------
    // SET MESSAGES
    // -----------------------------------------------

    setMessages: (messages) => set({
      messages,
    }),


    // -----------------------------------------------
    // ADD MESSAGE
    // -----------------------------------------------

    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message],
      })),


    // -----------------------------------------------
    // FETCH ALL CONVERSATIONS
    // -----------------------------------------------

    fetchConversations: async () => {

      set({
        isLoadingConversations: true,
        error: null,
      });

      try {

        // Retrieve all conversations belonging to the user.
        const conversations = await getAllChats();

        // Update the sidebar state.
        set({
          conversations,
        });

      } catch (error) {

        console.error("Failed to fetch conversations:", error);

        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load conversations.",
        });

      } finally {

        set({
          isLoadingConversations: false,
        });

      }
    },


    // -----------------------------------------------
    // FETCH MESSAGE HISTORY
    // -----------------------------------------------

    fetchMessageHistory: async (conversationId) => {

      // Generate a new request version.
      // This identifies the currently requested conversation view.
      const requestVersion = get().viewVersion + 1;

      set({

        // Set the selected conversation.
        activeConversationId: conversationId,

        // Clear messages from the previous conversation.
        messages: [],

        isLoadingHistory: true,
        error: null,

        viewVersion: requestVersion,
      });


      try {

        // Fetch the complete message history from the backend.
        const result = await getMessageHistory(conversationId);


        // Check whether the user has switched conversations
        // while the API request was still running.
        if (get().viewVersion !== requestVersion) {
          return;
        }


        // Update the messages only if this is still
        // the currently active conversation.
        set({
          messages: result.messages,
        });

      } catch (error) {

        console.error("Failed to fetch message history:", error);

        // Only update the error if the request still belongs
        // to the currently active conversation.
        if (get().viewVersion === requestVersion) {

          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load message history.",
          });

        }

      } finally {

        // Do not change loading state if another conversation
        // has already been selected.
        if (get().viewVersion === requestVersion) {

          set({
            isLoadingHistory: false,
          });

        }

      }
    },


    // -----------------------------------------------
    // SEND MESSAGE
    // -----------------------------------------------

    sendMessage: async (content) => {

      // Remove unnecessary whitespace.
      const message = content.trim();

      // Prevent empty messages and duplicate requests.
      if (!message || get().isSending) {
        return;
      }


      // ---------------------------------------------
      // CAPTURE CURRENT CONVERSATION
      // ---------------------------------------------

      // Store the current conversation ID.
      // null means this message will create a new conversation.
      const conversationId = get().activeConversationId;

      // Capture the current view version.
      // This helps identify whether the user switches chats
      // while the request is being processed.
      const requestVersion = get().viewVersion;


      // ---------------------------------------------
      // OPTIMISTIC USER MESSAGE
      // ---------------------------------------------

      // Generate a temporary ID for the user message.
      // This allows the message to appear immediately
      // without waiting for the backend response.
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content: message,
        role: "USER",
        createdAt: new Date().toISOString(),
      };


      // Display the user message immediately.
      set((state) => ({
        messages: [...state.messages, userMessage],
        isSending: true,
        error: null,
      }));


      try {

        // -------------------------------------------
        // SEND REQUEST TO BACKEND
        // -------------------------------------------

        // If conversationId exists, continue that conversation.
        // Otherwise, the backend creates a new conversation.
        const result = await createChat(
          message,
          conversationId ?? undefined
        );


        // -------------------------------------------
        // CHECK ACTIVE VIEW
        // -------------------------------------------

        // The user might have switched to another conversation
        // while the AI was generating its response.
        if (get().viewVersion !== requestVersion) {

          // Do not append the old response to the current chat.
          set({
            isSending: false,
          });


          // Refresh the sidebar because the previous conversation
          // may have been created or updated.
          await get().fetchConversations();

          return;
        }


        // -------------------------------------------
        // CREATE ASSISTANT MESSAGE
        // -------------------------------------------

        // Generate a temporary frontend ID for the AI response.
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          content: result.response,
          role: "ASSISTANT",
          createdAt: new Date().toISOString(),
        };


        // -------------------------------------------
        // UPDATE CONVERSATION STATE
        // -------------------------------------------

        set((state) => ({

          // Append the assistant response.
          messages: [...state.messages, assistantMessage],

          // Store the actual conversation ID returned
          // by the backend.
          activeConversationId: result.conversationId,

          isSending: false,
        }));


        // -------------------------------------------
        // REFRESH SIDEBAR
        // -------------------------------------------

        // Refresh the conversation list so the sidebar
        // displays the latest title and updatedAt.
        await get().fetchConversations();


      } catch (error) {

        console.error("Chat error:", error);


        // -------------------------------------------
        // HANDLE REQUEST FAILURE
        // -------------------------------------------

        // Only modify the current chat if the user
        // has not switched to another conversation.
        if (get().viewVersion === requestVersion) {

          set((state) => ({

            // Remove the optimistic user message because
            // the backend request failed.
            messages: state.messages.filter(
              (msg) => msg.id !== userMessage.id
            ),

            error:
              error instanceof Error
                ? error.message
                : "Failed to get an AI response.",

            isSending: false,
          }));

        } else {

          // The user has already switched conversations.
          // Do not modify the messages of the new conversation.
          set({
            isSending: false,
          });

        }

      }

    },

  })
);
