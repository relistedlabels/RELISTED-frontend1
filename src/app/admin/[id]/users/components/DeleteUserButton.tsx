"use client";
import React, { useState } from "react";
import { useDeleteUser } from "@/lib/queries/user/useDeleteUser";
import { Paragraph1 } from "@/common/ui/Text";

interface DeleteUserButtonProps {
  userId: string;
  userName?: string;
}

const DeleteUserButton = ({
  userId,
  userName = "User",
}: DeleteUserButtonProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteUser, isPending, isSuccess } = useDeleteUser();

  const handleDelete = () => {
    deleteUser(userId, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-3 border border-red-400 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition mt-2"
      >
        <Paragraph1>Delete User</Paragraph1>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-xl p-6 text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <span className="text-red-500 text-lg">⚠</span>
            </div>
            <Paragraph1 className="font-semibold mb-2">
              Delete User Account
            </Paragraph1>
            <p className="text-gray-500 mb-6">
              Are you sure you want to <b>permanently delete</b> {userName}?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <Paragraph1>Cancel</Paragraph1>
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                <Paragraph1>
                  {isPending ? "Deleting..." : "Confirm Delete"}
                </Paragraph1>
              </button>
            </div>
            {isSuccess && (
              <Paragraph1 className="text-green-600 mt-4">
                User deleted successfully.
              </Paragraph1>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteUserButton;
