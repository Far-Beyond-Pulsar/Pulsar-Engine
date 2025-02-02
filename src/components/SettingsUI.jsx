"use client";

import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shared/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shared/Select';
import { Switch } from '@/components/shared/Switch';
import { Slider } from '@/components/shared/Slider';
import { 
  Settings, Monitor, Palette, Keyboard, Volume2, 
  Cpu, Network, Globe, Database, Shield,
  Gamepad, MessageSquare, Cloud, Terminal
} from 'lucide-react';

// Settings configuration object
const settingsConfig = {
  categories: [
    { id: 'performance', icon: Cpu,           label: 'Performance' },
    { id: 'language',    icon: Globe,         label: 'Language' },
    { id: 'graphics',    icon: Palette,       label: 'Graphics' },
    { id: 'security',    icon: Shield,        label: 'Security' },
    { id: 'network',     icon: Network,       label: 'Network' },
    { id: 'storage',     icon: Database,      label: 'Storage' },
    { id: 'display',     icon: Monitor,       label: 'Display' },
    { id: 'social',      icon: MessageSquare, label: 'Social' },
    { id: 'cloud',       icon: Cloud,         label: 'Cloud Sync' },
    { id: 'debug',       icon: Terminal,      label: 'Debug' },
    { id: 'audio',       icon: Volume2,       label: 'Audio' },
    { id: 'input',       icon: Keyboard,      label: 'Input' },
    { id: 'game',        icon: Gamepad,       label: 'Game' },
  ],
  settings: {
    display: {
      sections: [
        {
          title: 'Display Settings',
          settings: [
            {
              type: 'select',
              id: 'resolution',
              label: 'Resolution',
              defaultValue: '1920x1080',
              options: [
                { value: '1280x720',  label: '1280x720' },
                { value: '1920x1080', label: '1920x1080' },
                { value: '2560x1440', label: '2560x1440' },
                { value: '3840x2160', label: '3840x2160' }
              ]
            },
            {
              type: 'select',
              id: 'displayMode',
              label: 'Display Mode',
              defaultValue: 'fullscreen',
              options: [
                { value: 'windowed',   label: 'Windowed' },
                { value: 'borderless', label: 'Borderless' },
                { value: 'fullscreen', label: 'Fullscreen' }
              ]
            },
            {
              type: 'switch',
              id: 'vsync',
              label: 'VSync',
              defaultValue: false
            },
            {
              type: 'slider',
              id: 'brightness',
              label: 'Brightness',
              defaultValue: 75,
              min: 0,
              max: 100,
              step: 1
            }
          ]
        },
        {
          title: 'UI Settings',
          settings: [
            {
              type: 'select',
              id: 'uiScale',
              label: 'UI Scale',
              defaultValue: '100',
              options: [
                { value: '80',  label: '80%' },
                { value: '90',  label: '90%' },
                { value: '100', label: '100%' },
                { value: '110', label: '110%' },
                { value: '120', label: '120%' }
              ]
            },
            {
              type: 'switch',
              id: 'showFps',
              label: 'Show FPS Counter',
              defaultValue: false
            }
          ]
        }
      ]
    },
    graphics: {
      sections: [
        {
          title: 'Quality Presets',
          settings: [
            {
              type: 'select',
              id: 'qualityPreset',
              label: 'Quality Preset',
              defaultValue: 'custom',
              options: [
                { value: 'low',    label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high',   label: 'High' },
                { value: 'ultra',  label: 'Ultra' },
                { value: 'custom', label: 'Custom' }
              ]
            }
          ]
        }
      ]
    }
  }
};

const SettingControl = ({ setting, onChange }) => {
  switch (setting.type) {
    case 'select':
      return (
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">{setting.label}</label>
          <Select defaultValue={setting.defaultValue} onValueChange={onChange}>
            <SelectTrigger className="w-40 bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">{setting.label}</label>
          <Switch defaultChecked={setting.defaultValue} onCheckedChange={onChange} />
        </div>
      );

    case 'slider':
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-gray-300">{setting.label}</label>
            <span className="text-sm text-gray-400">
              {setting.formatValue ? setting.formatValue(setting.defaultValue) : `${setting.defaultValue}%`}
            </span>
          </div>
          <Slider
            defaultValue={[setting.defaultValue]}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            onValueChange={onChange}
          />
        </div>
      );

    default:
      return null;
  }
};

const SettingsSection = ({ section }) => {
  return (
    <div className="space-y-4 width-[200px]">
      <h3 className="text-lg font-medium text-gray-200">{section.title}</h3>
      <div className="space-y-4">
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
};

const SettingsModal = () => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('display');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[80vh] w-[80vw] p-0 bg-gray-900 border border-gray-800">
        <DialogHeader className="p-4 border-b border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-200">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(80vh-4rem)]">
          <div className="w-64 border-r border-gray-800 overflow-y-auto">
            <nav className="space-y-1 p-2">
              {settingsConfig.categories.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm ${
                    activeCategory === id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveCategory(id)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 p-6 overflow-y-auto w-[70%]">
            {settingsConfig.settings[activeCategory]?.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <SettingsSection section={section} />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;