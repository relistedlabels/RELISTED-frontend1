// ENDPOINTS: GET /api/listers/disputes/:disputeId/messages (chat history), POST /api/listers/disputes/:disputeId/messages (send message)
"use client";

import React, { useMemo, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineCamera, HiOutlinePaperAirplane } from "react-icons/hi2";
import { useDisputeMessages } from "@/lib/queries/listers/useDisputeMessages";
import { useSendDisputeMessage } from "@/lib/mutations/listers/useSendDisputeMessage";

interface Message {
  id: number;
  type: "user" | "admin" | "status";
  content: string;
  timestamp?: string; // Only for user/admin messages
}

// Sub-component for rendering a single chat bubble/status update
const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  switch (message.type) {
    case "status":
      // System Status Update (e.g., "Dispute created")
      return (
        <div className="flex justify-center my-3">
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
            {message.content}
          </div>
        </div>
      );

    case "user":
      // User's Message (Right-aligned, lighter background)
      return (
        <div className="flex justify-end my-3">
          <div className="max-w-[80%]">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-t-xl rounded-l-xl shadow-sm inline-block">
              <Paragraph1 className="text-sm">{message.content}</Paragraph1>
            </div>
            <Paragraph1 className="text-xs text-gray-500 mt-1 text-right">
              {message.timestamp}
            </Paragraph1>
          </div>
        </div>
      );

    case "admin":
      // Admin's Message (Left-aligned, darker background)
      return (
        <div className="flex justify-start my-3">
          <div className="max-w-[80%]">
            <div className="bg-black text-white p-3 rounded-t-xl rounded-r-xl shadow-md inline-block">
              <Paragraph1 className="text-sm">{message.content}</Paragraph1>
            </div>
            <Paragraph1 className="text-xs text-gray-500 mt-1 text-left">
              {message.timestamp}
            </Paragraph1>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const DisputeConversationLog: React.FC<{ disputeId: string }> = ({
  disputeId,
}) => {
  const [inputValue, setInputValue] = useState("");
  const { data, isLoading } = useDisputeMessages(disputeId, 1, 50);
  const sendMessageMutation = useSendDisputeMessage(disputeId);

  const messages: Message[] = useMemo(() => {
    if (!data?.data.messages) return [];
    return data.data.messages.map((m) => ({
      id: Number.isNaN(Number(m.messageId)) ? Date.now() : Number(m.messageId),
      type: m.type as Message["type"],
      content: m.content,
      timestamp: m.displayTimestamp,
    }));
  }, [data]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendMessageMutation.mutate({ content: trimmed });
    setInputValue("");
  };

  return (
    <div className="font-sans mt-6 bg-white border border-gray-200 rounded-xl flex flex-col h-[500px]">
      {/* Header (Implicit in image, often includes "Conversation") */}
      <div className="p-4 border-b border-gray-100">
        <Paragraph1 className="text-lg font-bold text-gray-900">
          Conversation
        </Paragraph1>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <Paragraph1 className="text-xs text-gray-500">
            Loading conversation...
          </Paragraph1>
        ) : messages.length === 0 ? (
          <Paragraph1 className="text-xs text-gray-500">
            No messages yet. Start the conversation.
          </Paragraph1>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-100 flex items-center space-x-2">
        {/* Camera/Media Button */}
        <button className="p-2 text-gray-500 hover:text-black transition duration-150 rounded-full">
          <HiOutlineCamera className="w-6 h-6" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-black focus:border-black transition duration-150"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={sendMessageMutation.isPending}
          className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlinePaperAirplane className="w-5 h-5 -rotate-45" />
        </button>
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---

export default DisputeConversationLog;
