// ENDPOINTS: GET /api/admin/analytics/dashboard-overview
"use client";
import NeedsAttentionSection from "./components/NeedsAttentionSection";
import OverviewHeader from "./components/OverviewHeader";
import RecentActivitySection from "./components/RecentActivitySection";
import TodaySection from "./components/TodaySection";

function DashboardPage() {
  return (
    <div>
      <OverviewHeader />
      <NeedsAttentionSection />
      <TodaySection />
      <RecentActivitySection />
    </div>
  );
}

export default DashboardPage;
