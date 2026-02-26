// ENDPOINTS: GET /api/renters/notifications/preferences, PUT /api/renters/notifications/preferences

"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";

interface NotificationSettingProps {
  title: string;
  description: string;
  initialEnabled: boolean;
  settingKey: string;
  onToggle?: (key: string, enabled: boolean) => void;
}

// Sub-component for a single toggleable notification setting
const NotificationSetting: React.FC<NotificationSettingProps> = ({
  title,
  description,
  initialEnabled,
  settingKey,
  onToggle,
}) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onToggle?.(settingKey, newValue);
  };

  // Simple toggle switch component structure
  const ToggleSwitch: React.FC = () => (
    <button
      type="button"
      onClick={handleToggle}
      aria-checked={isEnabled}
      role="switch"
      className={`relative inline-flex shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
        isEnabled ? "bg-black" : "bg-gray-200"
      }`}
    >
      <span className="sr-only">Toggle {title}</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
          isEnabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
      <div className="mr-4 max-w-[80%]">
        <Paragraph1 className="text-base font-semibold text-gray-900 mb-1">
          {title}
        </Paragraph1>
        <Paragraph1 className="text-sm text-gray-600">{description}</Paragraph1>
      </div>
      <ToggleSwitch />
    </div>
  );
};

const NOTIFICATION_PREFERENCES = [
  {
    key: "email_alerts",
    title: "Email Alerts",
    description:
      "Receive email notifications about your orders, returns, and account activity",
    default: true,
  },
  {
    key: "sms_updates",
    title: "SMS Updates",
    description:
      "Get SMS notifications for important order updates and reminders",
    default: false,
  },
  {
    key: "order_updates",
    title: "Order Updates",
    description: "Notifications when order status changes",
    default: true,
  },
  {
    key: "rental_reminders",
    title: "Rental Reminders",
    description: "Reminders for upcoming return dates",
    default: true,
  },
  {
    key: "promotional_offers",
    title: "Promotional Offers",
    description: "Receive news on special promotions and discounts",
    default: false,
  },
];

const AccountNotifications: React.FC = () => {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [isLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize preferences from defaults
  useEffect(() => {
    const initialPrefs: Record<string, boolean> = {};
    NOTIFICATION_PREFERENCES.forEach((pref) => {
      initialPrefs[pref.key] = pref.default;
    });
    setPreferences(initialPrefs);
    // TODO: Fetch actual preferences from API when endpoint is ready
    // const { data } = useNotificationPreferences();
  }, []);

  const handleTogglePref = (key: string, enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: enabled }));
    setHasChanges(true);

    // TODO: Call mutation to update preferences
    // updateNotificationMutation.mutate({ [key]: enabled })
  };

  const handleSavePreferences = async () => {
    setHasChanges(false);
    // TODO: Call mutation to save all preferences
    alert("Notification preferences updated!");
  };
  return (
    <div className="font-sans ">
      <Paragraph1 className="text-xl uppercase font-bold text-gray-900 mb-2">
        NOTIFICATIONS
      </Paragraph1>
      <Paragraph1 className="text-sm text-gray-500 mb-6">
        Manage your communication preferences.
      </Paragraph1>

      <div className="space-y-2">
        {NOTIFICATION_PREFERENCES.map((pref) => (
          <NotificationSetting
            key={pref.key}
            title={pref.title}
            description={pref.description}
            initialEnabled={preferences[pref.key] ?? pref.default}
            settingKey={pref.key}
            onToggle={handleTogglePref}
          />
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={handleSavePreferences}
          disabled={!hasChanges || isLoading}
          className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-150"
        >
          {isLoading ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
};

export default AccountNotifications;
