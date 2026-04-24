// ENDPOINTS: GET /api/renters/disputes/:disputeId/messages, POST /api/renters/disputes/:disputeId/messages

"use client";

import React, { useMemo, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineCamera, HiOutlinePaperAirplane } from "react-icons/hi2";
import { useDisputeMessages } from "@/lib/queries/renters/useDisputes";
import { useSendDisputeMessage } from "@/lib/mutations/renters/useDisputeMutations";

interface Message {
  id: string;
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
          <div className="bg-gray-100 px-3 py-1 rounded-full text-gray-500 text-xs whitespace-nowrap">
            {message.content}
          </div>
        </div>
      );

    case "user":
      // User's Message (Right-aligned, lighter background)
      return (
        <div className="flex justify-end my-3">
          <div className="max-w-[80%]">
            <div className="inline-block bg-gray-100 shadow-sm p-3 rounded-t-xl rounded-l-xl text-gray-900">
              <Paragraph1 className="text-sm">{message.content}</Paragraph1>
            </div>
            <Paragraph1 className="mt-1 text-gray-500 text-xs text-right">
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
            <div className="inline-block bg-black shadow-md p-3 rounded-t-xl rounded-r-xl text-white">
              <Paragraph1 className="text-sm">{message.content}</Paragraph1>
            </div>
            <Paragraph1 className="mt-1 text-gray-500 text-xs text-left">
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
  const { data, isLoading } = useDisputeMessages(disputeId);
  const sendMessageMutation = useSendDisputeMessage(disputeId);

  const messages: Message[] = useMemo(() => {
    if (!data) return [];
    return data.map((m) => ({
      id: m.id,
      type: m.type,
      content: m.content,
      timestamp: m.timestamp,
    }));
  }, [data]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendMessageMutation.mutate({ message: trimmed });
    setInputValue("");
  };

  return (
    <div className="flex flex-col bg-white mt-6 border border-gray-200 rounded-xl h-[500px] font-sans">
      {/* Header (Implicit in image, often includes "Conversation") */}
      <div className="p-4 border-gray-100 border-b">
        <Paragraph1 className="font-bold text-gray-900 text-lg">
          Conversation
        </Paragraph1>
      </div>

      {/* Message Area */}
      <div className="flex-1 space-y-2 p-4 overflow-y-auto">
        {isLoading ? (
          <Paragraph1 className="text-gray-500 text-xs">
            Loading conversation...
          </Paragraph1>
        ) : messages.length === 0 ? (
          <Paragraph1 className="text-gray-500 text-xs">
            No messages yet. Start the conversation.
          </Paragraph1>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-2 p-3 border-gray-100 border-t">
        {/* Camera/Media Button */}
        <button
          type="button"
          disabled
          className="p-2 rounded-full text-gray-400 cursor-not-allowed"
        >
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
          className="flex-1 p-3 border border-gray-300 focus:border-black rounded-full focus:ring-black transition duration-150"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={sendMessageMutation.isPending}
          className="bg-black hover:bg-gray-800 disabled:opacity-50 p-2 rounded-full text-white transition duration-150 disabled:cursor-not-allowed"
        >
          <HiOutlinePaperAirplane className="w-5 h-5 -rotate-45" />
        </button>
      </div>
    </div>
  );
};

export default DisputeConversationLog;
