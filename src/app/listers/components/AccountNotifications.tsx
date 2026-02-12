// ENDPOINTS: GET /api/listers/notifications/preferences, PUT /api/listers/notifications/preferences

"use client";

import React, { useEffect, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { useNotificationPreferences } from "@/lib/queries/listers/useNotificationPreferences";
import { useUpdateNotificationPreferences } from "@/lib/mutations/listers/useUpdateNotificationPreferences";

interface NotificationSettingProps {
  /** The main title of the setting (e.g., "Email Alerts") */
  title: string;
  /** The descriptive text for the setting */
  description: string;
  /** The initial state of the toggle switch */
  enabled: boolean;
  /** Unique key for the setting */
  settingKey: string;
  onToggle: (key: string, next: boolean) => void;
}

// Sub-component for a single toggleable notification setting
const NotificationSetting: React.FC<NotificationSettingProps> = ({
  title,
  description,
  enabled,
  settingKey,
  onToggle,
}) => {
  // Simple toggle switch component structure
  const ToggleSwitch: React.FC = () => (
    <button
      onClick={() => onToggle(settingKey, !enabled)}
      aria-checked={enabled}
      role="switch"
      className={`relative inline-flex shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
        enabled ? "bg-black" : "bg-gray-200"
      }`}
    >
      <span className="sr-only">Toggle {title}</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
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

const AccountNotifications: React.FC = () => {
  const { data } = useNotificationPreferences();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  const [toggles, setToggles] = useState({
    emailAlerts: true,
    smsUpdates: false,
    productRecommendations: true,
  });

  useEffect(() => {
    const prefs = data?.data.preferences;
    if (!prefs) return;
    setToggles({
      emailAlerts: prefs.emailAlerts?.enabled ?? true,
      smsUpdates: prefs.smsUpdates?.enabled ?? false,
      productRecommendations: prefs.productRecommendations?.enabled ?? true,
    });
  }, [data]);

  const handleToggle = (key: string, next: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: next }));
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate({
      emailAlerts: toggles.emailAlerts,
      smsUpdates: toggles.smsUpdates,
      productRecommendations: toggles.productRecommendations,
    });
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
        {/* Email Alerts */}
        <NotificationSetting
          title="Email Alerts"
          description="Receive email notifications about your orders, returns, and account activity"
          enabled={toggles.emailAlerts}
          settingKey="email_alerts"
          onToggle={handleToggle}
        />

        {/* SMS Updates */}
        <NotificationSetting
          title="SMS Updates"
          description="Get text message updates for shipping, delivery, and important account changes"
          enabled={toggles.smsUpdates}
          settingKey="smsUpdates"
          onToggle={handleToggle}
        />

        {/* Product Recommendations */}
        <NotificationSetting
          title="Product Recommendations"
          description="Receive personalized product suggestions and exclusive offers based on your preferences"
          enabled={toggles.productRecommendations}
          settingKey="productRecommendations"
          onToggle={handleToggle}
        />
      </div>

      {/* Save Button (Implicit in the form, often used if there are other form elements) */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleSave}
          disabled={updatePreferencesMutation.isPending}
          className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updatePreferencesMutation.isPending
            ? "Saving..."
            : "Save Preferences"}
        </button>
      </div>
    </div>
  );
};

export default AccountNotifications;
