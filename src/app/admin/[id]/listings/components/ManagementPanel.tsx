"use client";

import React, { useState, useCallback } from "react";
import {
  Trash2,
  Edit2,
  Plus,
  Check,
  Image as ImageIcon,
  ChevronDown,
  X as XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import {
  useAllCategories,
  useDeleteCategory,
  useEditCategory,
  useCreateCategory,
  useAllTags,
  useDeleteTag,
  useEditTag,
  useCreateTag,
  useAllBrands,
  useDeleteBrand,
  useEditBrand,
  useCreateBrand,
} from "@/lib/queries/admin/useListings";

type ManagementTab = "Categories" | "Tags" | "Brands";

const TAB_LABELS: Record<ManagementTab, string> = {
  Categories: "Primary Category",
  Tags: "Subcategory",
  Brands: "Brands",
};

export default function ManagementPanel() {
  const [activeTab, setActiveTab] = useState<ManagementTab>("Categories");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<ManagementTab | null>(null);
  const [createName, setCreateName] = useState("");
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(
    null,
  );
  const [isDragOver, setIsDragOver] = useState(false);

  // Categories
  const { data: categories, isLoading: categoriesLoading } = useAllCategories();
  const deleteCategory = useDeleteCategory();
  const editCategory = useEditCategory();
  const createCategory = useCreateCategory();

  // Tags
  const { data: tags, isLoading: tagsLoading } = useAllTags();
  const deleteTag = useDeleteTag();
  const editTag = useEditTag();
  const createTag = useCreateTag();

  // Brands
  const { data: brands, isLoading: brandsLoading } = useAllBrands();
  const deleteBrand = useDeleteBrand();
  const editBrand = useEditBrand();
  const createBrand = useCreateBrand();

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

  const handleCreateClick = (type: ManagementTab) => {
    setCreateType(type);
    setShowAddDropdown(false);
    setShowCreateModal(true);
    setCreateName("");
    setCreateImageFile(null);
    setCreateImagePreview(null);
    setIsDragOver(false);
  };

  const handleClearImage = () => {
    setCreateImageFile(null);
    setCreateImagePreview(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCreateImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCreateImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCreateImagePreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an image
      if (file.type.startsWith("image/")) {
        setCreateImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setCreateImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCreateSubmit = () => {
    if (!createName.trim()) return;

    if (createType === "Categories") {
      if (!createImageFile) return;
      createCategory.mutate(
        {
          name: createName.trim(),
          imageFile: createImageFile,
        },
        {
          onSuccess: () => {
            setShowCreateModal(false);
            setCreateType(null);
            setCreateName("");
            setCreateImageFile(null);
            setCreateImagePreview(null);
          },
        },
      );
    } else if (createType === "Tags") {
      createTag.mutate(createName.trim(), {
        onSuccess: () => {
          setShowCreateModal(false);
          setCreateType(null);
          setCreateName("");
        },
      });
    } else if (createType === "Brands") {
      createBrand.mutate(createName.trim(), {
        onSuccess: () => {
          setShowCreateModal(false);
          setCreateType(null);
          setCreateName("");
        },
      });
    }
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
          Manage {TAB_LABELS[activeTab]}
        </Paragraph1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Add
              <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {showAddDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                >
                  <div className="py-2">
                    <button
                      onClick={() => handleCreateClick("Categories")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition text-black"
                    >
                      Create Category
                    </button>
                    <button
                      onClick={() => handleCreateClick("Tags")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition text-black"
                    >
                      Create Tags
                    </button>
                    <button
                      onClick={() => handleCreateClick("Brands")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition text-black"
                    >
                      Create Brands
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
              setShowAddDropdown(false);
              setShowCreateModal(false);
              setCreateType(null);
              setCreateName("");
              setCreateImageFile(null);
              setCreateImagePreview(null);
              setIsDragOver(false);
            }}
            className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab
                ? "text-gray-900 border-black"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {TAB_LABELS[tab]}
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

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && createType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Paragraph1 className="text-xl font-bold mb-4 text-center text-black">
                Create {createType.slice(0, -1)}
              </Paragraph1>
              <div className="space-y-4">
                <div>
                  <Paragraph3 className="block text-sm font-medium text-black mb-2">
                    Name
                  </Paragraph3>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black"
                    placeholder={`Enter ${createType.slice(0, -1).toLowerCase()} name`}
                  />
                </div>
                {createType === "Categories" && (
                  <div>
                    <Paragraph1 className="block text-sm font-medium text-black mb-2">
                      Image
                    </Paragraph1>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer min-h-[200px] flex items-center justify-center overflow-hidden ${
                        isDragOver
                          ? "border-black bg-gray-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {createImagePreview ? (
                        <div className="w-full h-[300px] relative group">
                          <img
                            src={createImagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearImage();
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          >
                            <XIcon size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center pointer-events-none">
                          <div className="flex flex-col items-center space-y-2">
                            <ImageIcon size={24} className="text-gray-400" />
                            <Paragraph3 className="text-sm text-gray-600">
                              {isDragOver
                                ? "Drop image here"
                                : "Drag & drop an image here, or click to select"}
                            </Paragraph3>
                            {createImageFile && (
                              <Paragraph3 className="text-sm text-black font-medium">
                                Selected: {createImageFile.name}
                              </Paragraph3>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateSubmit}
                  disabled={
                    !createName.trim() ||
                    (createType === "Categories" && !createImageFile) ||
                    createCategory.isPending ||
                    createTag.isPending ||
                    createBrand.isPending
                  }
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium"
                >
                  {createCategory.isPending ||
                  createTag.isPending ||
                  createBrand.isPending
                    ? "Creating..."
                    : "Create"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateType(null);
                    setCreateName("");
                    setCreateImageFile(null);
                    setCreateImagePreview(null);
                    setIsDragOver(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
