
import React from 'react';

interface XPWindowProps {
  title: string;
  children: React.ReactNode;
  width?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  icon?: string;
}

const XPWindow: React.FC<XPWindowProps> = ({ 
  title, 
  children, 
  width = 'w-auto', 
  onClose, 
  onMinimize,
  onMaximize,
  isMaximized = false,
  icon = '🕹️' 
}) => {
  return (
    <div className={`xp-window-border bg-[#ece9d8] shadow-2xl flex flex-col ${isMaximized ? 'w-full h-full rounded-none border-0' : width}`}>
      {/* Title Bar */}
      <div 
        className="xp-gradient h-8 flex items-center justify-between px-2 cursor-default shrink-0"
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm shadow-sm">{icon}</span>
          <span className="text-white font-bold text-sm tracking-wide xp-title-text select-none">{title}</span>
        </div>
        <div className="flex gap-1">
          {/* Minimize Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
            className="w-5 h-5 bg-[#3b93ff] rounded-[2px] border border-white/50 text-white flex items-center justify-center hover:brightness-110 focus:outline-none active:brightness-90"
            title="Minimize"
          >
            <div className="w-2 h-[2px] bg-white mt-2"></div>
          </button>

          {/* Maximize Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize?.(); }}
            className="w-5 h-5 bg-[#3b93ff] rounded-[2px] border border-white/50 text-white flex items-center justify-center hover:brightness-110 focus:outline-none active:brightness-90"
            title={isMaximized ? "Restore Down" : "Maximize"}
          >
            {isMaximized ? (
              <div className="relative w-3 h-3">
                 <div className="absolute top-0 right-0 w-2 h-2 border-[1.5px] border-white bg-[#3b93ff]"></div>
                 <div className="absolute bottom-0 left-0 w-2 h-2 border-[1.5px] border-white bg-[#3b93ff] z-10"></div>
              </div>
            ) : (
              <div className="w-2 h-2 border-[2px] border-white box-border"></div>
            )}
          </button>

          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            className="w-5 h-5 bg-[#e33e14] rounded-[2px] border border-white/50 text-white flex items-center justify-center font-bold text-xs hover:bg-[#ff5b33] transition-colors focus:outline-none active:bg-[#b02b0b]"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Toolbar / Menu bar */}
      <div className="h-6 flex items-center px-2 text-xs border-b border-gray-300 gap-4 text-black/80 shrink-0 select-none bg-[#ece9d8]">
        <span className="cursor-pointer hover:bg-blue-100 px-1 rounded">Game</span>
        <span className="cursor-pointer hover:bg-blue-100 px-1 rounded">View</span>
        <span className="cursor-pointer hover:bg-blue-100 px-1 rounded">Help</span>
      </div>

      {/* Content */}
      <div className={`p-3 bg-[#ece9d8] ${isMaximized ? 'flex-grow flex items-center justify-center' : ''}`}>
        {children}
      </div>

      {/* Status Bar */}
      <div className="h-5 bg-[#f0f0e8] border-t border-white flex items-center px-2 text-[10px] text-gray-500 gap-4 shrink-0 select-none">
        <div className="border-r border-gray-300 pr-4">Ready</div>
        <div>v1.0.4 - classic-edition</div>
      </div>
    </div>
  );
};

export default XPWindow;
