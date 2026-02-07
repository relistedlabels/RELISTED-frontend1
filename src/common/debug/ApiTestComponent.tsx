"use client";

import { useEffect } from "react";
import { useProductStatistics } from "@/lib/queries/product/useProductStatistics";
import { useGetAllUsers } from "@/lib/queries/user/useGetAllUsers";

const ApiTestComponent = () => {
  const statisticsQuery = useProductStatistics();
  const usersQuery = useGetAllUsers(1, 10);

  useEffect(() => {
    if (statisticsQuery.data) {
      console.log("✅ Product Statistics Response:", statisticsQuery.data);
    }
    if (statisticsQuery.error) {
      console.error("❌ Product Statistics Error:", statisticsQuery.error);
    }
  }, [statisticsQuery.data, statisticsQuery.error]);

  useEffect(() => {
    if (usersQuery.data) {
      console.log("✅ Users List Response:", usersQuery.data);
    }
    if (usersQuery.error) {
      console.error("❌ Users List Error:", usersQuery.error);
    }
  }, [usersQuery.data, usersQuery.error]);

  const ApiSection = ({
    title,
    icon,
    isLoading,
    error,
    data,
  }: {
    title: string;
    icon: string;
    isLoading: boolean;
    error: any;
    data: any;
  }) => (
    <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-950">
      <div className="font-semibold text-yellow-400 mb-3 text-sm">
        {icon} {title}
      </div>
      {isLoading && <div className="text-blue-400 text-xs">⏳ Loading...</div>}
      {error && (
        <div className="text-red-400 text-xs">
          ❌ Error: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}
      {data && (
        <pre className="text-green-300 bg-black p-3 rounded overflow-auto max-h-64 text-xs whitespace-pre-wrap break-words border border-gray-800">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      {!data && !isLoading && !error && (
        <div className="text-gray-500 text-xs">No data yet</div>
      )}
    </div>
  );

  return (
    <div className="w-full bg-gray-900 text-white p-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">
          🔧 API Test Console
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Raw JSON responses for all APIs being integrated. Verify data
          structure before moving to production UI.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Product Statistics */}
          <ApiSection
            title="Product Statistics"
            icon="📊"
            isLoading={statisticsQuery.isLoading}
            error={statisticsQuery.error}
            data={statisticsQuery.data}
          />

          {/* Users List */}
          <ApiSection
            title="Users List"
            icon="👥"
            isLoading={usersQuery.isLoading}
            error={usersQuery.error}
            data={usersQuery.data}
          />

          {/* Placeholder */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-950 border-dashed">
            <div className="text-gray-400 text-xs">
              Ready to add: Orders, Products, Categories, Disputes, Wallet APIs,
              etc.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestComponent;
