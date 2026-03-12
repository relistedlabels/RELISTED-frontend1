"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Paragraph1, Header2 } from "@/common/ui/Text";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import Link from "next/link";

const WalletFundTestPage = () => {
  const [userId, setUserId] = useState("7d172d18-daad-46cd-ab6d-8d8af28c0b16");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState("");

  // Bearer token provided
  const BEARER_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiUmVsaXN0ZWQtbGFiZWxzIiwibmJmIjoxNzY4OTk4MTIxLCJleHAiOjE4MDA1MzQxMjEsImlzcyI6ImFwcHMud2VtYWJhbmsuY29tIiwiYXVkIjoiYXBwcy53ZW1hYmFuay5jb20ifQ.MpYaqOEyVLkQlKJFUf6CoU6iKNpXJNC4LxBtq2MY_NQ";

  // ENDPOINT: POST wallet/wema/fund (demo fund wallet)
  const handleFundWallet = async () => {
    setError("");
    setResponse(null);

    // Validation
    if (!userId.trim()) {
      setError("Please enter a User ID");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const endpoint = `${baseUrl}/wallet/wema/fund`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
        body: JSON.stringify({
          userId: userId.trim(),
          amount: parseFloat(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          `Error (${res.status}): ${data?.message || "Failed to fund wallet"}`,
        );
        setResponse(data);
        return;
      }

      setResponse(data);
      setUserId("");
      setAmount("");
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
      console.error("Fund wallet error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans bg-white min-h-screen">
      {/* Back Button */}
      <div className="p-4 border-b border-gray-200">
        <Link
          href="/dev"
          className="flex items-center space-x-2 text-black hover:text-gray-600 transition"
        >
          <HiOutlineArrowLeft size={20} />
          <span>Back to Dev</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        <Header2 className="mb-6 text-gray-900">
          Wallet Fund Test (WEMA)
        </Header2>

        {/* Test Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6"
        >
          <Paragraph1 className="text-sm font-semibold text-gray-700 mb-4">
            Endpoint Configuration
          </Paragraph1>
          <div className="bg-white p-4 rounded border border-gray-200 space-y-2 mb-6 font-mono text-xs">
            <div>
              <span className="text-gray-600">Base URL:</span>
              <span className="text-gray-900 block break-all">
                {process.env.NEXT_PUBLIC_API_BASE_URL}/wallet/wema/fund
              </span>
            </div>
            <div>
              <span className="text-gray-600">Method:</span>
              <span className="text-blue-600"> POST</span>
            </div>
            <div>
              <span className="text-gray-600">Authorization:</span>
              <span className="text-gray-900"> Bearer Token (Wema)</span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <Paragraph1 className="text-xs text-red-700">{error}</Paragraph1>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            onClick={handleFundWallet}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 px-4 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition"
          >
            {loading ? "Processing..." : "Fund Wallet"}
          </motion.button>
        </motion.div>

        {/* Response Display */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg border ${
              error
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <Paragraph1
              className={`font-semibold mb-4 ${
                error ? "text-red-900" : "text-green-900"
              }`}
            >
              {error ? "Error Response" : "Success Response"}
            </Paragraph1>
            <pre className="bg-white p-4 rounded border overflow-x-auto text-xs font-mono text-gray-800">
              {JSON.stringify(response, null, 2)}
            </pre>
          </motion.div>
        )}

        {/* Token Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Paragraph1 className="text-xs text-blue-900">
            <strong>ℹ️ Token Info:</strong> This test uses a provided Wema bank
            bearer token for wallet funding. Token will expire on{" "}
            <strong>2025-05-28</strong>.
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

export default WalletFundTestPage;
