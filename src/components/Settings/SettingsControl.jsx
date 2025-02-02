"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/Select';
import { Switch } from '@/components/shared/Switch';
import { Slider } from '@/components/shared/Slider';

export function SettingControl({ setting, onChange }) {
  switch (setting.type) {
    case 'select':
      return (
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm text-gray-300">{setting.label}</label>
          <Select defaultValue={setting.defaultValue} onValueChange={onChange}>
            <SelectTrigger className="w-32 bg-gray-950 border-gray-800 text-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border border-gray-800">
              {setting.options.map(option => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-gray-200 hover:bg-gray-900 focus:bg-gray-900"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm text-gray-300">{setting.label}</label>
          <Switch 
            defaultChecked={setting.defaultValue} 
            onCheckedChange={onChange}
            className="bg-gray-800 data-[state=checked]:bg-blue-600"
          />
        </div>
      );

    case 'slider':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm text-gray-300">{setting.label}</label>
            <span className="text-sm text-gray-400">
              {typeof setting.formatValue === 'function' ? setting.formatValue(setting.defaultValue) : `${setting.defaultValue}%`}
            </span>
          </div>
          <Slider
            defaultValue={[setting.defaultValue]}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            onValueChange={onChange}
            className="[&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
          />
        </div>
      );

    default:
      return null;
  }
}
