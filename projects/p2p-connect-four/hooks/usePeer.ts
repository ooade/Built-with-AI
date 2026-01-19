import { useState, useEffect, useCallback, useRef } from 'react';
import { NetworkMessage, PeerConnectionState } from '../types';

const PEER_CONFIG = {
  debug: 0, 
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

const HEARTBEAT_MS = 2000;
const PING_TIMEOUT_MS = 5000;
const MAX_RETRIES = 5;
const RECONNECT_DELAY_BASE = 1000;

const generateShortId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const usePeer = (
  onMessageReceived: (msg: NetworkMessage) => void,
  onPeerConnected: (isHost: boolean) => void
) => {
  const [status, setStatus] = useState<PeerConnectionState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    peerId: null,
    error: null,
    latency: null,
    retryAttempt: 0,
  });

  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);
  const mountedRef = useRef<boolean>(true);
  const callbacksRef = useRef({ onMessageReceived, onPeerConnected });
  
  // Logic Refs
  const targetPeerIdRef = useRef<string | null>(null);
  const isHostRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  
  // Timers
  const timersRef = useRef<{
    heartbeat: ReturnType<typeof setInterval> | null;
    retry: ReturnType<typeof setTimeout> | null;
    reconnect: ReturnType<typeof setTimeout> | null;
  }>({ heartbeat: null, retry: null, reconnect: null });
  
  const lastPongTimeRef = useRef<number>(0);

  useEffect(() => {
    callbacksRef.current = { onMessageReceived, onPeerConnected };
  }, [onMessageReceived, onPeerConnected]);

  const safeSetStatus = useCallback((updates: Partial<PeerConnectionState>) => {
    if (mountedRef.current) {
      setStatus(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // --- Cleanup & Helpers ---

  const clearAllTimers = () => {
    if (timersRef.current.heartbeat) clearInterval(timersRef.current.heartbeat);
    if (timersRef.current.retry) clearTimeout(timersRef.current.retry);
    if (timersRef.current.reconnect) clearTimeout(timersRef.current.reconnect);
  };

  const closeConnection = () => {
    clearAllTimers();
    if (connRef.current) {
      try {
        connRef.current.removeAllListeners?.();
        connRef.current.close();
      } catch (e) { /* ignore */ }
      connRef.current = null;
    }
    safeSetStatus({ isConnected: false, latency: null });
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      closeConnection();
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, []);

  // --- Heartbeat ---

  const startHeartbeat = useCallback(() => {
    if (timersRef.current.heartbeat) clearInterval(timersRef.current.heartbeat);
    
    lastPongTimeRef.current = Date.now();

    timersRef.current.heartbeat = setInterval(() => {
      if (!connRef.current || !connRef.current.open) {
        closeConnection();
        return;
      }

      const timeSincePong = Date.now() - lastPongTimeRef.current;
      if (timeSincePong > PING_TIMEOUT_MS) {
        console.warn('[Heartbeat] Timeout. Closing connection.');
        connRef.current.close(); 
        return;
      }

      try {
        connRef.current.send({ type: 'PING' });
      } catch (e) { /* ignore send errors */ }
    }, HEARTBEAT_MS);
  }, []);

  // --- Core Peer Logic ---

  const initPeer = useCallback((forcedId?: string) => {
    if (peerRef.current && !peerRef.current.destroyed) return;

    // @ts-ignore
    const Peer = window.Peer;
    if (!Peer) {
      safeSetStatus({ error: 'PeerJS not loaded' });
      return;
    }

    const idToUse = forcedId || generateShortId();
    console.log(`[Peer] Init: ${idToUse}`);
    safeSetStatus({ isConnecting: true, error: null });

    const peer = new Peer(idToUse, PEER_CONFIG);
    peerRef.current = peer;

    peer.on('open', (id: string) => {
      if (!mountedRef.current || peerRef.current !== peer) return;
      console.log(`[Peer] Ready: ${id}`);
      safeSetStatus({ peerId: id, isConnecting: false });
      sessionStorage.setItem('p2p_cf_id', id);

      // Auto-connect if Guest
      if (!isHostRef.current && targetPeerIdRef.current) {
        connectToHost(targetPeerIdRef.current);
      }
    });

    peer.on('connection', (conn: any) => {
      if (peerRef.current !== peer) return;
      if (connRef.current) connRef.current.close();
      
      isHostRef.current = true;
      setupConnection(conn);
    });

    peer.on('disconnected', () => {
      if (peerRef.current !== peer) return;
      // Silent reconnect to signaling
      if (!peer.destroyed) {
        timersRef.current.reconnect = setTimeout(() => {
          if (peerRef.current === peer && !peer.destroyed && !peer.open) {
            peer.reconnect();
          }
        }, 1000);
      }
    });

    peer.on('error', (err: any) => {
      if (peerRef.current !== peer) return;

      const type = err.type;
      const msg = String(err.message || '');

      // Suppress known benign errors
      if (['network', 'disconnected', 'peer-unavailable', 'socket-error', 'socket-closed'].includes(type) ||
          msg.includes('Lost connection') || 
          msg.includes('In a hurry')) {
          
          if (!isHostRef.current && targetPeerIdRef.current && !connRef.current) {
             // Only retry if we are trying to connect and failed
             scheduleRetry(); 
          } else {
             peer.reconnect();
          }
          return;
      }

      if (type === 'unavailable-id') {
        peer.destroy();
        if (isHostRef.current) initPeer(generateShortId());
        else safeSetStatus({ error: 'ID collision. Refreshing...' });
        return;
      }

      console.error(`[Peer] Error: ${type}`, msg);
      safeSetStatus({ error: `Network: ${msg}` });
    });

  }, [safeSetStatus]);

  const setupConnection = (conn: any) => {
    connRef.current = conn;

    conn.on('open', () => {
      if (!mountedRef.current) return;
      retryCountRef.current = 0;
      safeSetStatus({ 
        isConnected: true, 
        isConnecting: false, 
        isReconnecting: false, 
        error: null,
        retryAttempt: 0 
      });
      callbacksRef.current.onPeerConnected(isHostRef.current);
      startHeartbeat();
    });

    conn.on('data', (data: any) => {
      if (!mountedRef.current) return;
      const msg = data as NetworkMessage;

      if (msg.type === 'PING') {
        try { conn.send({ type: 'PONG' }); } catch(e) {}
        return;
      }
      if (msg.type === 'PONG') {
        const rtt = Date.now() - lastPongTimeRef.current;
        lastPongTimeRef.current = Date.now();
        safeSetStatus({ latency: rtt });
        return;
      }
      callbacksRef.current.onMessageReceived(msg);
    });

    conn.on('close', () => {
      if (!mountedRef.current) return;
      closeConnection();
      if (!isHostRef.current && targetPeerIdRef.current) {
        scheduleRetry();
      }
    });
  };

  const scheduleRetry = () => {
    if (retryCountRef.current >= MAX_RETRIES) {
      safeSetStatus({ isReconnecting: false, error: 'Connection lost. Host may have left.' });
      return;
    }

    retryCountRef.current++;
    const delay = Math.min(RECONNECT_DELAY_BASE * Math.pow(1.5, retryCountRef.current), 10000);
    
    safeSetStatus({ isReconnecting: true, retryAttempt: retryCountRef.current, error: null });

    timersRef.current.retry = setTimeout(() => {
      if (targetPeerIdRef.current) connectToHost(targetPeerIdRef.current);
    }, delay);
  };

  const connectToHost = (hostId: string) => {
    const peer = peerRef.current;
    if (!peer || peer.destroyed) {
      initPeer();
      return;
    }
    if (!peer.open || !peer.id) {
        if (peer.disconnected) peer.reconnect();
        return;
    }

    safeSetStatus({ isConnecting: true, error: null });
    try {
      const conn = peer.connect(hostId, { reliable: true, serialization: 'json' });
      setupConnection(conn);
    } catch (e) {
      scheduleRetry();
    }
  };

  const actions = {
    connectToPeer: useCallback((id: string) => {
      targetPeerIdRef.current = id;
      isHostRef.current = false;
      retryCountRef.current = 0;
      closeConnection();
      connectToHost(id);
    }, []),

    startHosting: useCallback(() => {
      targetPeerIdRef.current = null;
      isHostRef.current = true;
      if (peerRef.current) peerRef.current.destroy();
      initPeer(generateShortId());
    }, [initPeer]),

    regenerateHostId: useCallback(() => {
      if (peerRef.current) peerRef.current.destroy();
      initPeer(generateShortId());
    }, [initPeer]),

    sendMessage: useCallback((msg: NetworkMessage) => {
      if (connRef.current?.open) {
        try { connRef.current.send(msg); } catch (e) {}
      }
    }, []),

    retryConnection: useCallback(() => {
      if (targetPeerIdRef.current) {
        retryCountRef.current = 0;
        safeSetStatus({ isReconnecting: true, error: null });
        connectToHost(targetPeerIdRef.current);
      }
    }, [])
  };

  return { ...status, ...actions };
};