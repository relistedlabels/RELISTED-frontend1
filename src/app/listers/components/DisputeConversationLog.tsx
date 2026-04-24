// ENDPOINTS: GET /api/listers/disputes/:disputeId/messages (chat history), POST /api/listers/disputes/:disputeId/messages (send message)
"use client";

import Image from "next/image";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineArrowDownTray,
  HiOutlineCamera,
  HiOutlinePaperAirplane,
  HiOutlineXMark,
} from "react-icons/hi2";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import { useSendDisputeMessage } from "@/lib/mutations/listers/useSendDisputeMessage";
import { useMe } from "@/lib/queries/auth/useMe";
import { useDisputeMessages } from "@/lib/queries/listers/useDisputeMessages";
import { useDisputeUpload } from "@/lib/queries/renters/useUpload";

type DisputeMessageType = "user" | "admin" | "status";

type MessageAttachment = {
  id?: string;
  url?: string;
  thumbnailUrl?: string;
  name?: string;
};

interface MessageSender {
  id?: string;
  name?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

interface Message {
  id: number;
  type: DisputeMessageType;
  content: string;
  timestamp?: string; // Only for user/admin messages
  createdBy?: string;
  senderId?: string;
  sender?: MessageSender;
  attachments?: MessageAttachment[];
}

const isProbablyUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:") ||
  value.startsWith("blob:");

const normalizeMessageType = (value: unknown): DisputeMessageType => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "status") return "status";
  if (normalized === "admin") return "admin";
  return "user";
};

const formatTimestamp = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getMessageDateKey = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toISOString().slice(0, 10);
};

const formatMessageDate = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getSenderName = (message: Message): string => {
  if (message.sender?.name) return message.sender.name;
  if (message.sender?.role) return message.sender.role.toLowerCase();
  if (message.createdBy) return message.createdBy;
  return "User";
};

const getSenderAvatar = (message: Message): string | null => {
  return String(message.sender?.avatarUrl ?? "").trim() || null;
};

const getInitials = (name: string) => {
  const safe = String(name ?? "").trim();
  if (!safe) return "U";
  return safe.split(/\s+/).map((part) => part[0]).join("").toUpperCase().substring(0, 2);
};

const extractAttachments = (raw: unknown): MessageAttachment[] => {
  const possible =
    (raw as Record<string, unknown>)?.attachmentUrls ??
    (raw as Record<string, unknown>)?.attachments ??
    (raw as Record<string, unknown>)?.mediaUrls ??
    (raw as Record<string, unknown>)?.media ??
    (raw as Record<string, unknown>)?.mediaIds;
  if (!Array.isArray(possible)) return [];
  return possible
    .map((value: unknown) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        return isProbablyUrl(trimmed) ? { url: trimmed } : { id: trimmed };
      }

      if (value && typeof value === "object") {
        const v = value as Record<string, unknown>;
        const id = String(
          v.id ?? v.uploadId ?? v.mediaId ?? v.media_id ?? "",
        ).trim();
        const url = String(v.url ?? "").trim();
        const thumbnailUrl = String(
          v.thumbnailUrl ?? v.thumbnail_url ?? v.thumbUrl ?? v.thumb_url ?? "",
        ).trim();
        const name = String(v.name ?? v.fileName ?? v.filename ?? "").trim();
        if (!id && !url) return null;
        return {
          ...(id ? { id } : {}),
          ...(url ? { url } : {}),
          ...(thumbnailUrl ? { thumbnailUrl } : {}),
          ...(name ? { name } : {}),
        };
      }

      return null;
    })
    .filter((value): value is MessageAttachment => Boolean(value));
};

// Sub-component for rendering a single chat bubble/status update
const ChatMessage: React.FC<{
  message: Message;
  isMine: boolean;
  resolveAttachment: (
    attachment: MessageAttachment,
  ) => { fullUrl: string; thumbUrl: string } | undefined;
  onOpenImage: (url: string) => void;
}> = ({ message, isMine, resolveAttachment, onOpenImage }) => {
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
    case "admin": {
      const attachments = (message.attachments ?? [])
        .map((attachment) => resolveAttachment(attachment))
        .filter((value): value is { fullUrl: string; thumbUrl: string } =>
          Boolean(value),
        );
      const hasContent = Boolean(message.content.trim());

      return isMine ? (
        <div className="flex justify-end my-3">
          <div className="max-w-[80%]">
            <div className="inline-block bg-gray-100 shadow-sm p-3 rounded-t-xl rounded-l-xl text-gray-900">
              {hasContent ? (
                <Paragraph1 className="text-sm">{message.content}</Paragraph1>
              ) : null}
              {attachments.length > 0 ? (
                <div className="gap-2 grid grid-cols-3 mt-2">
                  {attachments.map(({ fullUrl, thumbUrl }) => (
                    <button
                      key={fullUrl}
                      type="button"
                      onClick={() => onOpenImage(fullUrl)}
                      className="relative border border-gray-200 rounded-lg w-24 h-24 overflow-hidden"
                    >
                      <Image
                        src={thumbUrl}
                        alt="Attachment"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Paragraph1 className="mt-1 text-gray-500 text-xs text-right">
              {formatTimestamp(message.timestamp)}
            </Paragraph1>
          </div>
        </div>
      ) : (
        <div className="flex justify-start my-3">
          <div className="max-w-[80%]">
            <div className="inline-block bg-black shadow-md p-3 rounded-t-xl rounded-r-xl text-white">
              {hasContent ? (
                <Paragraph1 className="text-sm">{message.content}</Paragraph1>
              ) : null}
              {attachments.length > 0 ? (
                <div className="gap-2 grid grid-cols-3 mt-2">
                  {attachments.map(({ fullUrl, thumbUrl }) => (
                    <button
                      key={fullUrl}
                      type="button"
                      onClick={() => onOpenImage(fullUrl)}
                      className="relative border border-gray-800 rounded-lg w-24 h-24 overflow-hidden"
                    >
                      <Image
                        src={thumbUrl}
                        alt="Attachment"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Paragraph1 className="mt-1 text-gray-500 text-xs text-left">
              {formatTimestamp(message.timestamp)}
            </Paragraph1>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

const DisputeConversationLog: React.FC<{
  disputeId: string;
  canUpload?: boolean;
}> = ({ disputeId, canUpload = true }) => {
  const [inputValue, setInputValue] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data, isLoading } = useDisputeMessages(disputeId, 1, 50);
  const sendMessageMutation = useSendDisputeMessage(disputeId);
  const uploadMutation = useDisputeUpload({ role: "listers", disputeId });
  const { data: me } = useMe();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!lightboxUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxUrl(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxUrl]);

  const messages: Message[] = useMemo(() => {
    if (!data?.data.messages) return [];
    return data.data.messages.map((m) => ({
      id: Number.isNaN(Number(m.messageId)) ? Date.now() : Number(m.messageId),
      type: normalizeMessageType(m.type),
      content: m.content,
      timestamp: m.displayTimestamp,
      createdBy: String(m.createdBy ?? "").trim(),
      senderId: String(m.senderId ?? "").trim(),
      attachments: extractAttachments(m),
    }));
  }, [data]);

  const groupedMessageEntries = useMemo(() => {
    const grouped = new Map<string, Message[]>();

    for (const message of messages) {
      const key = getMessageDateKey(message.timestamp);
      const bucketKey = key || "";
      const existing = grouped.get(bucketKey);
      if (existing) existing.push(message);
      else grouped.set(bucketKey, [message]);
    }

    const entries = Array.from(grouped.entries());
    entries.sort((a, b) => (a[0] || "").localeCompare(b[0] || ""));
    return entries;
  }, [messages]);

  const isMine = (message: Message) => {
    const createdBy = String(message.createdBy ?? "")
      .trim()
      .toLowerCase();
    const senderId = String(message.senderId ?? "").trim();
    const meId = String(me?.id ?? "").trim();

    if (senderId && meId && senderId === meId) return true;
    if (createdBy === "lister") return true;
    return false;
  };

  const resolveAttachment = (attachment: MessageAttachment) => {
    const directUrl = String(attachment.url ?? "").trim();
    const directThumb = String(attachment.thumbnailUrl ?? "").trim();

    const id = String(attachment.id ?? "").trim();
    const resolvedUrl = directUrl || (id && isProbablyUrl(id) ? id : "");
    if (!resolvedUrl) return undefined;

    return {
      fullUrl: resolvedUrl,
      thumbUrl: directThumb || resolvedUrl,
    };
  };

  useEffect(() => {
    return () => {
      for (const url of previewUrls) URL.revokeObjectURL(url);
    };
  }, [previewUrls]);

  const handleFilePick = (files: File[]) => {
    if (!canUpload) return;
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ]);

    const incoming = files.filter((file) => {
      if (!ALLOWED_TYPES.has(file.type)) {
        toast.error("Invalid image type. Allowed: JPEG, PNG, WebP, GIF");
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image too large. Maximum size is 10MB");
        return false;
      }
      return true;
    });
    const mergedFiles = [...attachedFiles, ...incoming].slice(0, 3);
    const nextPreviews = mergedFiles.map((f) => URL.createObjectURL(f));
    for (const url of previewUrls) URL.revokeObjectURL(url);
    setAttachedFiles(mergedFiles);
    setPreviewUrls(nextPreviews);
  };

  const removeAttachment = (index: number) => {
    const nextFiles = attachedFiles.filter((_, i) => i !== index);
    const nextPreviews = nextFiles.map((f) => URL.createObjectURL(f));
    for (const url of previewUrls) URL.revokeObjectURL(url);
    setAttachedFiles(nextFiles);
    setPreviewUrls(nextPreviews);
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    try {
      let uploadIds: string[] | undefined;

      if (attachedFiles.length > 0) {
        const uploadResults = await Promise.all(
          attachedFiles.map((file) => uploadMutation.mutateAsync(file)),
        );
        uploadIds = uploadResults.map((u) => u.id).filter(Boolean);
      }

      await sendMessageMutation.mutateAsync({
        content: trimmed,
        ...(uploadIds?.length ? { uploadIds } : {}),
      });
      setInputValue("");
      setAttachedFiles([]);
      for (const url of previewUrls) URL.revokeObjectURL(url);
      setPreviewUrls([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send message.");
    }
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
          groupedMessageEntries.map(([dateKey, groupMessages]) => (
            <div key={dateKey || "unknown"}>
              {dateKey ? (
                <div className="flex justify-center my-2">
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-500 text-xs">
                    {formatMessageDate(groupMessages[0]?.timestamp)}
                  </span>
                </div>
              ) : null}
              {groupMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isMine={isMine(msg)}
                  resolveAttachment={resolveAttachment}
                  onOpenImage={setLightboxUrl}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-2 p-3 border-gray-100 border-t">
        {/* Camera/Media Button */}
        <button
          type="button"
          onClick={() =>
            canUpload ? fileInputRef.current?.click() : undefined
          }
          disabled={!canUpload}
          className="p-2 rounded-full text-gray-500 hover:text-black disabled:hover:text-gray-300 disabled:text-gray-300 transition duration-150 disabled:cursor-not-allowed"
        >
          <HiOutlineCamera className="w-6 h-6" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFilePick(files);
            e.target.value = "";
          }}
        />

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
          disabled={sendMessageMutation.isPending || uploadMutation.isPending}
          className="bg-black hover:bg-gray-800 disabled:opacity-50 p-2 rounded-full text-white transition duration-150 disabled:cursor-not-allowed"
        >
          <HiOutlinePaperAirplane className="w-5 h-5 -rotate-45" />
        </button>
      </div>

      {previewUrls.length > 0 ? (
        <div className="flex items-center gap-2 px-4 pb-4">
          {previewUrls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => removeAttachment(index)}
              className="relative border border-gray-200 rounded-lg w-14 h-14 overflow-hidden"
            >
              <Image
                src={url}
                alt="Attachment preview"
                fill
                sizes="56px"
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxUrl ? (
        <div
          className="z-[10000] fixed inset-0 flex justify-center items-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxUrl(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightboxUrl(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl h-[80vh]">
            <div className="-top-12 right-0 absolute flex gap-2">
              <a
                href={lightboxUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Save image"
                className="inline-flex justify-center items-center bg-black/80 hover:bg-black px-3 py-2 rounded-lg text-white transition"
              >
                <HiOutlineArrowDownTray className="w-5 h-5" />
              </a>
              <button
                type="button"
                aria-label="Close image preview"
                className="inline-flex justify-center items-center bg-black/80 hover:bg-black px-3 py-2 rounded-lg text-white transition"
                onClick={() => setLightboxUrl(null)}
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>
            <Image
              src={lightboxUrl}
              alt="Attachment"
              fill
              sizes="100vw"
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

// --- Example Usage matching the provided image content ---

export default DisputeConversationLog;
