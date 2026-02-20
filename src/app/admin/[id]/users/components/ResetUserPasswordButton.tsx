"use client";
import React, { useState } from "react";
import { useResetUserPassword } from "@/lib/queries/user/useResetUserPassword";
import { Paragraph1 } from "@/common/ui/Text";

interface ResetUserPasswordButtonProps {
  userId: string;
  userName?: string;
}

const ResetUserPasswordButton = ({
  userId,
  userName = "User",
}: ResetUserPasswordButtonProps) => {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
  } = useResetUserPassword();

  const handleReset = () => {
    if (newPassword.trim()) {
      resetPassword(
        { userId, newPassword },
        {
          onSuccess: () => setOpen(false),
        },
      );
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-3 border border-blue-400 text-blue-500 rounded-lg font-semibold hover:bg-blue-50 transition mt-2"
      >
        <Paragraph1>Reset Password</Paragraph1>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-xl p-6 text-center">
            <Paragraph1 className="font-semibold mb-2">
              Reset User Password
            </Paragraph1>
            <p className="text-gray-500 mb-6">
              Enter a new password for <b>{userName}</b>.
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <Paragraph1>Cancel</Paragraph1>
              </button>
              <button
                onClick={handleReset}
                disabled={!newPassword.trim() || isPending}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                <Paragraph1>
                  {isPending ? "Resetting..." : "Confirm Reset"}
                </Paragraph1>
              </button>
            </div>
            {isSuccess && (
              <Paragraph1 className="text-green-600 mt-4">
                Password reset successfully.
              </Paragraph1>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResetUserPasswordButton;
