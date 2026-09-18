"use client";
import React, { useState } from "react";
import { useDeleteAdminProduct } from "@/lib/queries/admin/useDeleteAdminProduct";
import { Paragraph1 } from "@/common/ui/Text";
import { buttonDestructive, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";

interface DeleteProductButtonProps {
  productId: string;
  productName?: string;
  onDeleteSuccess?: () => void;
}

const DeleteProductButton = ({
  productId,
  productName = "Product",
  onDeleteSuccess,
}: DeleteProductButtonProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteProduct, isPending } = useDeleteAdminProduct(productId);

  const handleDelete = () => {
    deleteProduct(undefined, {
      onSuccess: () => {
        setOpen(false);
        onDeleteSuccess?.();
      },
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-2 border border-red-400 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition "
      >
        <Paragraph1>Delete Listing</Paragraph1>
      </button>
      {open && (
        <div className={dialogBackdrop}>
          <div className={`${dialogCard} max-w-sm text-center`}>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <span className="text-red-500 text-lg">⚠</span>
            </div>
            <Paragraph1 className="font-semibold mb-2">
              Delete Listing
            </Paragraph1>
            <p className="text-gray-500 mb-6">
              Are you sure you want to <b>permanently delete</b> {productName}?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className={`${buttonSecondary} flex-1`}
              >
                <Paragraph1>Cancel</Paragraph1>
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className={`${buttonDestructive} flex-1`}
              >
                <Paragraph1>
                  {isPending ? "Deleting..." : "Confirm Delete"}
                </Paragraph1>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteProductButton;
