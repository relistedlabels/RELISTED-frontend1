"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle2, AlertCircle, Star } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useUpload } from "@/lib/queries/renters/useUpload";
import { useAddresses, Address } from "@/lib/queries/renters/useAddresses";
import { rentersApi } from "@/lib/api/renters";
import { toast } from "sonner";

interface ReadyToReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    images: string[],
    itemCondition: "GOOD" | "FAIR" | "POOR",
    damageNotes: string,
  ) => Promise<void>;
  isLoading?: boolean;
  orderId?: string;
  rentalId?: string;
}

type ModalStep = "confirmation" | "upload" | "success" | "review" | "review-success";

const ReadyToReturnModal: React.FC<ReadyToReturnModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading: externalIsLoading = false,
  orderId,
  rentalId,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("confirmation");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [itemCondition, setItemCondition] = useState<"GOOD" | "FAIR" | "POOR">(
    "GOOD",
  );
  const [damageNotes, setDamageNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const isMountedRef = useRef(true);

  const uploadMutation = useUpload();

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );

  // Fetch renter's addresses
  const { data: addresses } = useAddresses();

  // Format address for display
  const location = useMemo(() => {
    if (!addresses || addresses.length === 0) {
      return "No address on file";
    }

    // Find default address or use first one
    const defaultAddress =
      addresses.find((addr) => addr.isDefault) || addresses[0];

    return `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state}`;
  }, [addresses]);

  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (currentStep === "upload" && contentRef.current) {
      setTimeout(() => {
        const shippingSection = contentRef.current?.querySelector(
          '[data-section="shipping"]',
        );
        shippingSection?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [currentStep]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrls((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceed = async () => {
    if (uploadedImages.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setIsLoading(true);
    try {
      // Upload images first to get UUIDs
      const imageUuids: string[] = [];
      for (const file of uploadedImages) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult = await uploadMutation.mutateAsync(formData);
        imageUuids.push(uploadResult.uploadId || uploadResult.id || "");
      }

      // Call onConfirm with new format
      await onConfirm(imageUuids, itemCondition, damageNotes);

      if (isMountedRef.current) {
        setCurrentStep("success");
      }
    } catch (error) {
      console.error("Error confirming return:", error);
      if (isMountedRef.current) {
        toast.error("Failed to confirm return. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (currentStep === "success" || currentStep === "review-success") {
      setCurrentStep("confirmation");
      setUploadedImages([]);
      setPreviewUrls([]);
      setItemCondition("GOOD");
      setDamageNotes("");
      setRating(0);
      setReviewComment("");
      onClose();
    } else {
      onClose();
      setCurrentStep("confirmation");
      setUploadedImages([]);
      setPreviewUrls([]);
      setItemCondition("GOOD");
      setDamageNotes("");
      setRating(0);
      setReviewComment("");
    }
  };

  const handleSuccessClose = () => {
    setCurrentStep("confirmation");
    setUploadedImages([]);
    setPreviewUrls([]);
    setItemCondition("GOOD");
    setDamageNotes("");
    setRating(0);
    setReviewComment("");
    onClose();
  };

  const handleSubmitReview = async () => {
    const resolvedRentalId =
      rentalId ?? (orderId && isUuid(orderId) ? orderId : undefined);

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await rentersApi.submitReview({
        ...(resolvedRentalId ? { rentalId: resolvedRentalId } : { orderId: orderId }),
        rating,
        comment: reviewComment,
      });
      toast.success("Review submitted successfully!");
      setCurrentStep("review-success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit review";
      toast.error(message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="z-[9999] fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white shadow-2xl rounded-lg w-full max-w-md max-h-[90vh] md:max-h-[85vh] lg:max-h-[80vh] overflow-y-auto scroll-smooth"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="top-0 sticky flex justify-between items-center bg-white p-4 border-gray-100 border-b">
              <Paragraph3 className="font-bold text-gray-900 text-lg">
                Return Item
              </Paragraph3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 p-6">
              {currentStep === "confirmation" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-50 p-4 rounded-full">
                      <AlertCircle className="text-blue-600" size={40} />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Paragraph1 className="font-semibold text-gray-900">
                      Ready to Return?
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600 leading-relaxed">
                      Before proceeding, please make sure:
                    </Paragraph1>

                    {/* Checklist */}
                    <ul className="space-y-2 ml-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 font-bold text-blue-600">
                          ✓
                        </span>
                        <Paragraph1 className="text-gray-700">
                          Item is in good condition
                        </Paragraph1>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 font-bold text-blue-600">
                          ✓
                        </span>
                        <Paragraph1 className="text-gray-700">
                          Item is properly packaged
                        </Paragraph1>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 font-bold text-blue-600">
                          ✓
                        </span>
                        <Paragraph1 className="text-gray-700">
                          Item is ready to ship
                        </Paragraph1>
                      </li>
                    </ul>

                    {/* Rider Info */}
                    <div className="space-y-3 bg-blue-50 mt-4 p-3 border border-blue-200 rounded-lg">
                      <div className="space-y-2">
                        <Paragraph1 className="text-blue-700 text-sm">
                          <span className="font-semibold">Pickup: </span>A rider
                          will be assigned to come collect the item at your
                          location:{" "}
                          <span className="font-semibold"> {location}</span>
                        </Paragraph1>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setCurrentStep("upload")}
                      className="flex-1 bg-black hover:bg-gray-900 px-4 py-3 rounded-lg font-semibold text-white text-sm transition"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === "upload" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Header */}
                  <div>
                    <Paragraph1 className="font-semibold text-gray-900">
                      Upload Item Photos
                    </Paragraph1>
                    <Paragraph1 className="mt-1 text-gray-600">
                      Take photos of the item in its current state to confirm
                      condition
                    </Paragraph1>
                  </div>

                  {/* Image Upload Area */}
                  <div className="space-y-3">
                    <label className="block">
                      <div className="p-6 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg text-center transition cursor-pointer">
                        <Upload
                          className="mx-auto mb-2 text-gray-400"
                          size={32}
                        />
                        <Paragraph1 className="font-medium text-gray-600">
                          Click to upload photos
                        </Paragraph1>
                        <Paragraph1 className="mt-1 text-gray-500 text-xs">
                          PNG, JPG up to 5MB each
                        </Paragraph1>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="space-y-2">
                        <Paragraph1 className="font-medium text-gray-700">
                          Uploaded Images ({previewUrls.length})
                        </Paragraph1>
                        <div className="gap-3 grid grid-cols-3">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="group relative">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="rounded-lg w-full h-24 object-cover"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="top-1 right-1 absolute bg-red-500 opacity-0 group-hover:opacity-100 p-1 rounded-full text-white transition"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 p-3 border border-blue-200 rounded-lg">
                    <Paragraph1 className="text-blue-700 text-xs">
                      <span className="font-semibold">Tip:</span> Upload clear
                      photos showing the overall condition, any wear, and
                      packaging
                    </Paragraph1>
                  </div>

                  {/* Item Condition */}
                  <div className="space-y-2">
                    <label className="block">
                      <Paragraph1 className="mb-2 font-semibold text-gray-900">
                        Item Condition <span className="text-red-500">*</span>
                      </Paragraph1>
                      <select
                        value={itemCondition}
                        onChange={(e) =>
                          setItemCondition(
                            e.target.value as "GOOD" | "FAIR" | "POOR",
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full text-gray-900"
                      >
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor</option>
                      </select>
                    </label>
                  </div>

                  {/* Damage Notes */}
                  <div className="space-y-2">
                    <label className="block">
                      <Paragraph1 className="mb-2 font-semibold text-gray-900">
                        Damage Notes{" "}
                        <span className="text-gray-500">(Optional)</span>
                      </Paragraph1>
                      <textarea
                        value={damageNotes}
                        onChange={(e) => setDamageNotes(e.target.value)}
                        placeholder="Describe any damage, stains, or issues with the item..."
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full text-gray-900 resize-none placeholder-gray-400"
                        rows={3}
                      />
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setCurrentStep("confirmation")}
                      className="flex-1 hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 text-sm transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleProceed}
                      disabled={
                        isLoading ||
                        externalIsLoading ||
                        uploadedImages.length === 0
                      }
                      className="flex-1 bg-black hover:bg-gray-900 disabled:bg-gray-400 px-4 py-3 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                    >
                      {isLoading || externalIsLoading
                        ? "Processing..."
                        : "Proceed"}
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 py-4 text-center"
                >
                  {/* Success Icon */}
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="bg-green-50 p-4 rounded-full"
                    >
                      <CheckCircle2 className="text-green-600" size={48} />
                    </motion.div>
                  </div>

                  {/* Success Message */}
                  <div className="space-y-2">
                    <Paragraph1 className="font-bold text-gray-900">
                      Return Confirmed!
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600">
                      Your return request has been submitted successfully.
                    </Paragraph1>
                  </div>

                  {/* Info Box */}
                  <div className="space-y-2 bg-blue-50 p-4 border border-blue-200 rounded-lg">
                    <Paragraph1 className="font-semibold text-blue-900">
                      What happens next?
                    </Paragraph1>
                    <Paragraph1 className="text-blue-700 text-sm leading-relaxed">
                      The lister will be notified and will contact you to
                      arrange pickup. Make sure to keep the item in the location
                      you specified.
                    </Paragraph1>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setCurrentStep("review")}
                    className="bg-black hover:bg-gray-900 px-4 py-3 rounded-lg w-full font-semibold text-white text-sm transition"
                  >
                    Continue to Review
                  </button>
                </motion.div>
              )}

              {currentStep === "review" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Header */}

                  {/* Star Rating */}
                  <div className="space-y-3">
                    <Paragraph1 className="font-semibold text-gray-900">
                      Rating <span className="text-red-500">*</span>
                    </Paragraph1>
                    <div className="flex justify-center gap-2 py-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition"
                        >
                          <Star
                            size={40}
                            className={`${
                              star <= (hoverRating || rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            } transition`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <Paragraph1 className="text-gray-600 text-sm text-center">
                        {rating === 5 && "Excellent!"}
                        {rating === 4 && "Very Good"}
                        {rating === 3 && "Good"}
                        {rating === 2 && "Fair"}
                        {rating === 1 && "Poor"}
                      </Paragraph1>
                    )}
                  </div>

                  {/* Review Comment */}
                  <div className="space-y-2">
                    <label className="block">
                      <Paragraph1 className="mt-1 text-gray-600">
                        Leave a note for the Lister
                      </Paragraph1>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with the lister. Was the item accurately described? How was the condition?"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full text-gray-900 resize-none placeholder-gray-400"
                        rows={4}
                      />
                    </label>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 p-3 border border-blue-200 rounded-lg">
                    <Paragraph1 className="text-blue-700 text-xs">
                      <span className="font-semibold">Note:</span> Your review
                      helps encourage the lister to continue providing great
                      service to future renters.
                    </Paragraph1>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    {/* <button
                    onClick={() => setCurrentStep("success")}
                    className="flex-1 hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 text-sm transition"
                  >
                    Skip
                  </button> */}
                    <button
                      onClick={handleSubmitReview}
                      disabled={rating === 0 || isSubmittingReview}
                      className="flex justify-center bg-black hover:bg-gray-900 disabled:bg-gray-400 px-4 py-3 rounded-lg w-full font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === "review-success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 py-4 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="bg-green-50 p-4 rounded-full"
                    >
                      <CheckCircle2 className="text-green-600" size={48} />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <Paragraph1 className="font-bold text-gray-900">
                      Thank You!
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600">
                      Your review has been submitted. We appreciate your
                      feedback!
                    </Paragraph1>
                  </div>

                  <button
                    onClick={handleSuccessClose}
                    className="bg-black hover:bg-gray-900 px-4 py-3 rounded-lg w-full font-semibold text-white text-sm transition"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ReadyToReturnModal;
