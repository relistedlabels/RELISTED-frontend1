// ENDPOINTS: GET /api/listers/notifications/preferences, PUT /api/listers/notifications/preferences

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";

interface NotificationSettingProps {
  /** The main title of the setting (e.g., "Email Alerts") */
  title: string;
  /** The descriptive text for the setting */
  description: string;
  /** The initial state of the toggle switch */
  initialEnabled: boolean;
  /** Unique key for the setting */
  settingKey: string;
}

// Sub-component for a single toggleable notification setting
const NotificationSetting: React.FC<NotificationSettingProps> = ({
  title,
  description,
  initialEnabled,
  settingKey,
}) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  // Simple toggle switch component structure
  const ToggleSwitch: React.FC = () => (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
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

const AccountNotifications: React.FC = () => {
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
          initialEnabled={true}
          settingKey="email_alerts"
        />

        {/* SMS Updates */}
        <NotificationSetting
          title="SMS Updates"
          description="Get text message updates for shipping, delivery, and important account changes"
          initialEnabled={false}
          settingKey="sms_updates"
        />

        {/* Product Recommendations */}
        <NotificationSetting
          title="Product Recommendations"
          description="Receive personalized product suggestions and exclusive offers based on your preferences"
          initialEnabled={true}
          settingKey="product_recs"
        />
      </div>

      {/* Save Button (Implicit in the form, often used if there are other form elements) */}
      <div className="flex justify-end pt-6">
        <button className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150">
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default AccountNotifications;
