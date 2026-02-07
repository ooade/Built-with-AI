
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Share2, Link, Copy, Check, Users, Shield, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TEXTS } from '../textResources';

interface CollaborationProps {
  onStartSession: () => Promise<void>;
  onJoinSession: (peerId: string) => Promise<void>;
  onEndSession: () => void;
  peerId: string | null;
  isConnected: boolean;
  connectedPeerId: string | null;
}

export const Collaboration: React.FC<CollaborationProps> = ({ 
  onStartSession, 
  onJoinSession, 
  onEndSession,
  peerId, 
  isConnected,
  connectedPeerId
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleCopy = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      toast.success(TEXTS.COLLABORATION.TOAST.CODE_COPIED);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = async () => {
    setIsInitializing(true);
    try {
      await onStartSession();
    } catch (e) {
      // Error handled in App.tsx via toast
      // We catch it here primarily to ensure the finally block executes
      // and we don't crash the component
    } finally {
      setIsInitializing(false);
    }
  };

  const isSessionActive = peerId || isConnected;

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{TEXTS.COLLABORATION.TITLE}</h1>
        <p className="text-gray-500 font-medium mt-1">{TEXTS.COLLABORATION.SUBTITLE}</p>
      </div>

      {!isSessionActive ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Host Session */}
          <div className="p-8 rounded-3xl border bg-white border-gray-200/60 shadow-sm transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 mb-6">
              <Share2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{TEXTS.COLLABORATION.HOST.TITLE}</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {TEXTS.COLLABORATION.HOST.DESC}
            </p>
            <Button onClick={handleStart} disabled={isInitializing} className="w-full shadow-lg shadow-primary-500/20">
              {isInitializing ? TEXTS.COLLABORATION.HOST.BTN_GENERATING : TEXTS.COLLABORATION.HOST.BTN_GEN}
            </Button>
          </div>

          {/* Join Session */}
          <div className="p-8 rounded-3xl border bg-white border-gray-200/60 shadow-sm transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 mb-6">
              <Link size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{TEXTS.COLLABORATION.JOIN.TITLE}</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {TEXTS.COLLABORATION.JOIN.DESC}
            </p>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder={TEXTS.COLLABORATION.JOIN.PLACEHOLDER}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-center"
              />
              <Button 
                variant="secondary" 
                className="w-full"
                disabled={!inputCode} 
                onClick={() => onJoinSession(inputCode)}
              >
                {TEXTS.COLLABORATION.JOIN.BTN}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           {/* Active Session Management */}
           <div className="bg-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-900/10 border border-gray-800">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
               <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'}`}>
                    <Users size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{TEXTS.COLLABORATION.ACTIVE.TITLE}</h2>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></span>
                       {isConnected ? (connectedPeerId ? TEXTS.COLLABORATION.ACTIVE.CONNECTED_PEER : TEXTS.COLLABORATION.ACTIVE.CONNECTED) : TEXTS.COLLABORATION.ACTIVE.WAITING}
                    </p>
                  </div>
               </div>

               <div className="flex gap-3 w-full sm:w-auto">
                 <Button 
                   variant="secondary" 
                   onClick={onEndSession}
                   className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300 w-full sm:w-auto"
                 >
                   <LogOut size={16} className="mr-2" />
                   {TEXTS.COLLABORATION.ACTIVE.END_BTN}
                 </Button>
               </div>
             </div>

             {/* Connection Details */}
             {peerId && !connectedPeerId && (
               <div className="mt-8 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">{TEXTS.COLLABORATION.ACTIVE.SHARE_CODE_LABEL}</label>
                 <div className="flex items-center gap-3">
                   <code className="flex-1 text-lg font-mono font-bold text-white break-all">{peerId}</code>
                   <button 
                     onClick={handleCopy}
                     className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                   >
                     {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                   </button>
                 </div>
                 <div className="mt-3 flex items-center gap-2 text-primary-400 text-xs font-medium">
                   <RefreshCw size={12} className="animate-spin" />
                   {TEXTS.COLLABORATION.ACTIVE.WAITING_PEER_SPIN}
                 </div>
               </div>
             )}
           </div>

           <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
             <Shield size={20} className="text-blue-500 mt-0.5" />
             <div className="text-sm text-blue-800">
               <p className="font-bold mb-1">{TEXTS.COLLABORATION.ACTIVE.BACKUP_TITLE}</p>
               <p>{TEXTS.COLLABORATION.ACTIVE.BACKUP_DESC}</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
