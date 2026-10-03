"use client";

import CategoryBreakdown from "./CategoryBreakdown";
import OperationsSignals from "./OperationsSignals";
import RentalsRevenueTrend from "./RentalsRevenueTrend";
import RevenueByCategory from "./RevenueByCategory";
import TopCurators from "./TopCurators";
import TopItems from "./TopItems";

interface AnalyticsDashboardProps {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

const SectionHeading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="mb-4">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);

const AnalyticsDashboard = ({
  timeframe,
  year,
  month,
}: AnalyticsDashboardProps) => {
  const params = { timeframe, year, month };

  return (
    <div className="mt-8 space-y-9">
      <section>
        <SectionHeading
          title="Marketplace performance"
          description="Order volume and gross order value use separate charts and scales."
        />
        <RentalsRevenueTrend {...params} />
      </section>

      <section>
        <SectionHeading
          title="Supply & demand"
          description="Compare today's verified live inventory with customer availability requests in the selected period."
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CategoryBreakdown {...params} />
          <TopItems {...params} />
        </div>
      </section>

      <section>
        <SectionHeading
          title="Revenue drivers"
          description="See which categories and listers generated rental value during the selected period."
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <RevenueByCategory {...params} />
          <TopCurators {...params} />
        </div>
      </section>

      <section>
        <SectionHeading
          title="Fulfilment & operations"
          description="Review current admin queues alongside period-based dispute and delivery metrics above."
        />
        <OperationsSignals />
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
