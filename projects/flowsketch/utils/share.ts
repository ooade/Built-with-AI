import pako from 'pako';
import { Base64 } from 'js-base64';

interface DiagramState {
  code: string;
  config?: {
    theme?: string;
    handDrawn?: boolean;
  };
}

export const encodeState = (state: DiagramState): string => {
  const json = JSON.stringify(state);
  const data = new TextEncoder().encode(json);
  const compressed = pako.deflate(data, { level: 9 });
  return Base64.fromUint8Array(compressed, true); // URL-safe base64
};

export const decodeState = (encoded: string): DiagramState | null => {
  try {
    const compressed = Base64.toUint8Array(encoded);
    const data = pako.inflate(compressed);
    const json = new TextDecoder().decode(data);
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode state:', e);
    return null;
  }
};
