
import React from 'react';

interface TaskbarProps {
  time: Date;
  isGameOpen: boolean;
  isGameMinimized: boolean;
  onTaskbarClick: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ time, isGameOpen, isGameMinimized, onTaskbarClick }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="xp-taskbar h-8 w-full fixed bottom-0 left-0 flex items-center justify-between px-0 z-50 shadow-[0_-2px_4px_rgba(0,0,0,0.2)]">
      {/* Start Button */}
      <div className="xp-start-button h-full flex items-center px-4 gap-2 rounded-r-xl cursor-pointer group hover:brightness-110 transition-all shadow-md shrink-0">
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-0.5">
          <div className="grid grid-cols-2 gap-0.5 w-full h-full">
            <div className="bg-red-500"></div>
            <div className="bg-green-500"></div>
            <div className="bg-blue-500"></div>
            <div className="bg-yellow-500"></div>
          </div>
        </div>
        <span className="text-white font-bold italic text-lg drop-shadow-md select-none">start</span>
      </div>

      {/* Taskbar Items Area */}
      <div className="flex-grow flex items-center px-2 gap-1 overflow-hidden h-full">
        {isGameOpen && (
          <div 
            onClick={onTaskbarClick}
            className={`h-6 px-3 flex items-center gap-2 rounded-[2px] cursor-default max-w-[160px] w-full transition-colors select-none ${
              !isGameMinimized 
                ? 'bg-[#1e52b7] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] border border-white/10' 
                : 'bg-[#3c81f0] hover:bg-[#5293fa] shadow-[1px_1px_0px_rgba(0,0,0,0.3)] border-t border-white/40'
            }`}
          >
            <span className="text-sm">🐍</span>
            <span className="text-white text-xs truncate drop-shadow-sm font-bold">Snake Game - Luna...</span>
          </div>
        )}
      </div>

      {/* Tray */}
      <div className="h-full px-4 flex items-center bg-[#0996f1] shadow-[inset_2px_0_2px_rgba(0,0,0,0.2)] shrink-0 border-l border-[#1941a5]">
        <div className="flex items-center gap-3 cursor-default">
          <span className="text-xs">🔈</span>
          <span className="text-xs">🛡️</span>
          <span className="text-white text-xs font-normal font-sans">
            {formatTime(time)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
