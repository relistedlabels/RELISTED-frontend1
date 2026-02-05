import {
  HiOutlineUsers,
  HiOutlineScale,
  HiOutlineClock,
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
} from "react-icons/hi2";
import StatCard from "./StatCard";

const mockLine = [
  { value: 10 },
  { value: 18 },
  { value: 14 },
  { value: 22 },
  { value: 20 },
  { value: 28 },
];

const AnalyticsStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 mt-6 lg:grid-cols-3 gap-4">
      <StatCard
        icon={<HiOutlineChartBar className="w-5 h-5" />}
        value="2,847"
        label="Total Rentals"
        change="+12.5%"
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineCurrencyDollar className="w-5 h-5" />}
        value="₦12.4M"
        label="Total Revenue"
        change="+18.2%"
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineBuildingStorefront className="w-5 h-5" />}
        value="1,234"
        label="Active Listings"
        change="+5.3%"
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineScale className="w-5 h-5" />}
        value="23"
        label="Active Disputes"
        change="-8.1%"
        positive={false}
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineUsers className="w-5 h-5" />}
        value="5,692"
        label="Active Users"
        change="+22.4%"
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineClock className="w-5 h-5" />}
        value="3.2 days"
        label="Avg Delivery Time"
        change="-0.5 days"
        positive={false}
        data={mockLine}
      />
    </div>
  );
};

export default AnalyticsStats;
