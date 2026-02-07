
import Peer, { DataConnection } from 'peerjs';
import { SyncMessage } from '../types';

type EventCallback = (data: any) => void;

export class PeerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private eventListeners: Map<string, EventCallback[]> = new Map();
  public peerId: string | null = null;

  constructor() {
    this.eventListeners.set('data', []);
    this.eventListeners.set('connected', []);
    this.eventListeners.set('error', []);
  }

  initialize(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Clean up existing peer if any
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
      this.connections.clear();

      // Create new peer
      this.peer = new Peer();

      // Set a timeout to reject if ID generation takes too long (e.g., network issues)
      const timeoutId = setTimeout(() => {
        if (this.peer && !this.peer.id) {
           this.peer.destroy();
           this.peer = null;
           reject(new Error('Connection to matchmaking server timed out.'));
        }
      }, 15000); // 15 seconds timeout

      this.peer.on('open', (id) => {
        clearTimeout(timeoutId);
        this.peerId = id;
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.handleConnection(conn);
      });

      this.peer.on('error', (err) => {
        // If we haven't initialized yet (no peerId), treat this as an init failure
        if (!this.peerId) {
            clearTimeout(timeoutId);
            reject(err);
        }
        // Emit error for general handling
        this.emit('error', err);
      });
    });
  }

  connect(peerId: string) {
    if (!this.peer) throw new Error('Peer not initialized');
    const conn = this.peer.connect(peerId);
    this.handleConnection(conn);
  }

  private handleConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.emit('connected', conn.peer);
    });

    conn.on('data', (data) => {
      this.emit('data', data);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.emit('error', err);
    });
  }

  broadcast(message: SyncMessage) {
    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  on(event: string, callback: EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      this.eventListeners.set(event, listeners.filter(cb => cb !== callback));
    }
  }

  private emit(event: string, data: any) {
    this.eventListeners.get(event)?.forEach(cb => cb(data));
  }

  destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connections.clear();
    this.peerId = null;
  }
}

export const peerService = new PeerService();
