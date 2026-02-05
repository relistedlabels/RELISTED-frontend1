import React from "react";
import AnalyticsHeader from "./components/AnalyticsHeader";
import AnalyticsStats from "./components/AnalyticsStats";
import AnalyticsDashboard from "./components/AnalyticsDashboard";


function page() {
  return (
    <div>
      <AnalyticsHeader />
      <AnalyticsStats />
      <AnalyticsDashboard />
    </div>
  );
}

export default page;
