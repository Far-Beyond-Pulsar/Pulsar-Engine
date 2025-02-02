import { useState } from 'react';
import { Settings } from 'lucide-react';
import settingsConfig from '@/config/settings.json';
import { Dialog, DialogContent, DialogTrigger } from './SettingsDialog';
import { SettingsSection } from './SettingsSection';
import { Sidebar } from './Sidebar';

const SettingsModal = () => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('display');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 rounded-lg transition-colors">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col h-full">
          <div className="shrink-0 p-4 border-b border-gray-800 flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-200">Settings</h2>
            <button 
              className="lg:hidden text-gray-400 hover:text-gray-200"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Settings size={20} />
            </button>
          </div>
          
          <div className="flex-1 flex min-h-0">
            <Sidebar
              categories={settingsConfig.categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            
            <div className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-6">
              <div className="w-full max-w-2xl mx-auto space-y-4">
                {settingsConfig.settings[activeCategory]?.sections.map((section, index) => (
                  <SettingsSection key={index} section={section} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;