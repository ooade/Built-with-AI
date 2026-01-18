
import React, { useState, useEffect } from 'react';
import SnakeGame from './components/SnakeGame';
import Taskbar from './components/Taskbar';

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
}

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windowState, setWindowState] = useState<WindowState>({
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenGame = () => {
    setWindowState(prev => ({ ...prev, isOpen: true, isMinimized: false }));
  };

  const handleCloseGame = () => {
    setWindowState(prev => ({ ...prev, isOpen: false }));
  };

  const handleMinimizeGame = () => {
    setWindowState(prev => ({ ...prev, isMinimized: true }));
  };

  const handleMaximizeGame = () => {
    setWindowState(prev => ({ ...prev, isMaximized: !prev.isMaximized }));
  };

  const handleTaskbarClick = () => {
    if (windowState.isMinimized) {
      setWindowState(prev => ({ ...prev, isMinimized: false }));
    } else {
      setWindowState(prev => ({ ...prev, isMinimized: true }));
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col select-none">
      {/* XP Desktop Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000')`,
          filter: 'brightness(0.9) contrast(1.1)' 
        }}
      />
      
      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 z-10 p-4 grid grid-flow-row gap-6 w-24">
        <DesktopIcon label="My Computer" icon="💻" />
        <DesktopIcon label="Recycle Bin" icon="🗑️" />
        <DesktopIcon label="My Documents" icon="📂" />
        <DesktopIcon 
          label="Snake Game" 
          icon="🐍" 
          onClick={handleOpenGame}
        />
      </div>

      {/* Main Game Window Container */}
      {/* We keep it mounted but hidden if minimized to preserve state during minimize. 
          If closed (isOpen=false), we don't render it at all. */}
      {windowState.isOpen && (
        <div className={`flex-grow flex items-center justify-center relative z-20 pb-12 ${windowState.isMinimized ? 'hidden' : ''} ${windowState.isMaximized ? 'p-0 w-full h-full pb-8' : ''}`}>
          <SnakeGame 
            onClose={handleCloseGame}
            onMinimize={handleMinimizeGame}
            onMaximize={handleMaximizeGame}
            isMaximized={windowState.isMaximized}
          />
        </div>
      )}

      <Taskbar 
        time={currentTime} 
        isGameOpen={windowState.isOpen}
        isGameMinimized={windowState.isMinimized}
        onTaskbarClick={handleTaskbarClick}
      />
    </div>
  );
};

interface DesktopIconProps {
  label: string;
  icon: string;
  onClick?: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ label, icon, onClick }) => (
  <div 
    className="flex flex-col items-center gap-1 group cursor-pointer active:opacity-50"
    onClick={onClick}
    onDoubleClick={onClick}
  >
    <div className="text-3xl filter drop-shadow-md group-hover:brightness-110 transition-all">{icon}</div>
    <span className="text-white text-xs px-1 rounded bg-black/20 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,1)] group-hover:bg-[#0058e4]">
      {label}
    </span>
  </div>
);

export default App;
