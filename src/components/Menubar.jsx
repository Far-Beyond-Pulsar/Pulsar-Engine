import React from 'react';

const Menubar = ({ menus, activeMenu, onMenuClick, onMenuAction }) => (
  <div className="h-6 bg-black border-b border-blue-900/20 flex items-center px-2">
    {menus.map((menu) => (
      <div key={menu.name} className="relative">
        <button
          className={`px-3 h-full flex items-center hover:bg-blue-900/10 text-sm menu-item
            ${activeMenu === menu.name ? 'bg-blue-900/10 text-blue-500' : 'text-gray-300'}`}
          onClick={() => onMenuClick(menu.name)}
        >
          {menu.name}
        </button>
        
        {activeMenu === menu.name && menu.items.length > 0 && (
          <div className="absolute top-full left-0 mt-0.5 bg-black/10 rounded-lg shadow-xl min-w-[200px] py-1 z-50 backdrop-blur-md border border-gray-700/30">
            {menu.items.map((item, i) => (
              item.type === 'separator' ? (
                <div key={i} className="h-px bg-transparent my-1" />
              ) : (
                <button
                  key={i}
                  className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-900/10 hover:text-blue-500 text-gray-300 text-sm"
                  onClick={() => onMenuAction(item.action)}
                >
                  <span className="flex items-center gap-2">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-gray-500 text-xs">{item.shortcut}</span>
                  )}
                </button>
              )
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);

export default Menubar;