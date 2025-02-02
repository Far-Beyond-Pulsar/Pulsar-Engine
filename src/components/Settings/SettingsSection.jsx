"use client";

import React from 'react';
import { SettingControl } from './SettingsControl';

export function SettingsSection({ section }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-200 border-b border-gray-800 pb-2">
        {section.title}
      </h3>
      <div className="space-y-6">
        {section.settings.map(setting => (
          <SettingControl
            key={setting.id}
            setting={setting}
            onChange={(value) => console.log(`${setting.id} changed to:`, value)}
          />
        ))}
      </div>
    </div>
  );
}