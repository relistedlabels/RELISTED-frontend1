"use client";

import React, { useState, useCallback } from "react";
import { Trash2, Edit2, Plus, Check, Image as ImageIcon } from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import {
  useAllCategories,
  useDeleteCategory,
  useEditCategory,
  useAllTags,
  useDeleteTag,
  useEditTag,
  useAllBrands,
  useDeleteBrand,
  useEditBrand,
} from "@/lib/queries/admin/useListings";

type ManagementTab = "Categories" | "Tags" | "Brands";

export default function ManagementPanel() {
  const [activeTab, setActiveTab] = useState<ManagementTab>("Categories");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories
  const { data: categories, isLoading: categoriesLoading } = useAllCategories();
  const deleteCategory = useDeleteCategory();
  const editCategory = useEditCategory();

  // Tags
  const { data: tags, isLoading: tagsLoading } = useAllTags();
  const deleteTag = useDeleteTag();
  const editTag = useEditTag();

  // Brands
  const { data: brands, isLoading: brandsLoading } = useAllBrands();
  const deleteBrand = useDeleteBrand();
  const editBrand = useEditBrand();

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
    setEditImageFile(null);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;

    if (activeTab === "Categories") {
      editCategory.mutate(
        {
          categoryId: editingId,
          name: editName,
          imageFile: editImageFile || undefined,
        },
        {
          onSuccess: () => {
            setEditingId(null);
            setEditName("");
            setEditImageFile(null);
          },
        },
      );
    } else if (activeTab === "Tags") {
      editTag.mutate(
        { tagId: editingId, name: editName },
        {
          onSuccess: () => {
            setEditingId(null);
            setEditName("");
          },
        },
      );
    } else if (activeTab === "Brands") {
      editBrand.mutate(
        { brandId: editingId, name: editName },
        {
          onSuccess: () => {
            setEditingId(null);
            setEditName("");
          },
        },
      );
    }
  };

  const handleDelete = (id: string) => {
    if (activeTab === "Categories") {
      deleteCategory.mutate(id, {
        onSuccess: () => {
          setDeletingId(null);
        },
      });
    } else if (activeTab === "Tags") {
      deleteTag.mutate(id, {
        onSuccess: () => {
          setDeletingId(null);
        },
      });
    } else if (activeTab === "Brands") {
      deleteBrand.mutate(id, {
        onSuccess: () => {
          setDeletingId(null);
        },
      });
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item: any) => item.id)));
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    setIsDeleting(true);
    for (const id of idsToDelete) {
      await new Promise<void>((resolve) => {
        if (activeTab === "Categories") {
          deleteCategory.mutate(id, {
            onSuccess: () => resolve(),
            onError: () => resolve(),
          });
        } else if (activeTab === "Tags") {
          deleteTag.mutate(id, {
            onSuccess: () => resolve(),
            onError: () => resolve(),
          });
        } else if (activeTab === "Brands") {
          deleteBrand.mutate(id, {
            onSuccess: () => resolve(),
            onError: () => resolve(),
          });
        }
      });
    }
    setSelectedIds(new Set());
    setIsDeleting(false);
  };

  const isLoading =
    (activeTab === "Categories" && categoriesLoading) ||
    (activeTab === "Tags" && tagsLoading) ||
    (activeTab === "Brands" && brandsLoading);

  const items =
    activeTab === "Categories"
      ? categories || []
      : activeTab === "Tags"
        ? tags || []
        : brands || [];

  return (
    <div className="my-8 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <Paragraph1 className="text-lg font-bold text-gray-900">
          Manage {activeTab}
        </Paragraph1>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(["Categories", "Tags", "Brands"] as ManagementTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setEditingId(null);
              setEditName("");
              setEditImageFile(null);
            }}
            className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab
                ? "text-gray-900 border-black"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {activeTab.toLowerCase()} found
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All Header */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={selectedIds.size === items.length && items.length > 0}
              onChange={toggleSelectAll}
              className="w-5 h-5 cursor-pointer"
            />
            <Paragraph1 className="text-sm text-gray-600 font-medium">
              {selectedIds.size === items.length && items.length > 0
                ? "Deselect All"
                : "Select All"}
            </Paragraph1>
          </div>

          {items.map((item: any) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 border rounded-lg transition ${
                selectedIds.has(item.id)
                  ? "bg-blue-50 border-blue-300"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleSelectItem(item.id)}
                className="w-5 h-5 cursor-pointer flex-shrink-0"
              />

              {/* Name and Edit */}
              {editingId === item.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  {activeTab === "Categories" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setEditImageFile(e.target.files?.[0] || null)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        {editImageFile && (
                          <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                            {editImageFile.name}
                          </span>
                        )}
                      </div>
                      {/* Image Preview */}
                      {(editImageFile || item.imageUrl) && (
                        <div className="p-2 border border-gray-250 rounded-lg bg-gray-50">
                          <img
                            src={
                              editImageFile
                                ? URL.createObjectURL(editImageFile)
                                : item.imageUrl
                            }
                            alt="Preview"
                            className="w-full h-40 rounded-lg object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-4">
                  {/* Image for Categories - displayed beside name */}
                  {activeTab === "Categories" && (
                    <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-gray-100 border border-gray-300 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="text-gray-400" />
                      )}
                    </div>
                  )}
                  <Paragraph1 className="font-medium text-gray-900">
                    {item.name}
                  </Paragraph1>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {editingId === item.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={
                        editCategory.isPending ||
                        editTag.isPending ||
                        editBrand.isPending
                      }
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditName("");
                        setEditImageFile(null);
                      }}
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(item.id, item.name)}
                      className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this{" "}
              {activeTab.toLowerCase().slice(0, -1)}? Related products will be
              reassigned automatically.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={
                  deleteCategory.isPending ||
                  deleteTag.isPending ||
                  deleteBrand.isPending
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {deleteCategory.isPending ||
                deleteTag.isPending ||
                deleteBrand.isPending
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Progress Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin">
                <Check size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">
              Deleting Items
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Please wait while we delete {selectedIds.size} item
              {selectedIds.size !== 1 ? "s" : ""}...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
