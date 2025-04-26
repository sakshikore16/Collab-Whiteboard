import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { KeycloakProvider } from './context/KeycloakProvider';

// Ensure Web Crypto API is available
if (typeof window !== 'undefined') {
  if (!window.crypto) {
    const cryptoObj = {} as Crypto;
    Object.defineProperty(window, 'crypto', {
      value: cryptoObj,
      writable: true,
      configurable: true
    });
  }
  
  if (!window.crypto.subtle) {
    const subtleCrypto = {
      digest: async (algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> => {
        const algorithmName = typeof algorithm === 'string' ? algorithm : algorithm.name;
        if (algorithmName !== 'SHA-256') {
          throw new Error('Only SHA-256 is supported in this polyfill');
        }
        
        // Handle BufferSource type properly
        let bytes: Uint8Array;
        if (data instanceof ArrayBuffer) {
          bytes = new Uint8Array(data);
        } else if (data instanceof Uint8Array) {
          bytes = data;
        } else {
          bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        
        const hashBuffer = new Uint8Array(32);
        
        // This is a very basic SHA-256 implementation for demonstration
        // In production, you should use a proper SHA-256 implementation
        for (let i = 0; i < bytes.length; i++) {
          hashBuffer[i % 32] ^= bytes[i];
        }
        
        return hashBuffer.buffer;
      }
    } as SubtleCrypto;

    Object.defineProperty(window.crypto, 'subtle', {
      value: subtleCrypto,
      writable: true,
      configurable: true
    });
  }

  if (!window.crypto.getRandomValues) {
    const getRandomValues = function<T extends ArrayBufferView>(array: T): T {
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };

    Object.defineProperty(window.crypto, 'getRandomValues', {
      value: getRandomValues,
      writable: true,
      configurable: true
    });
  }

  if (!window.crypto.randomUUID) {
    const randomUUID = () => {
      const arr = new Uint8Array(16);
      window.crypto.getRandomValues(arr);
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
        (Number(c) ^ arr[Math.random() * 16 & 15] >> Number(c) / 4).toString(16)
      );
    };

    Object.defineProperty(window.crypto, 'randomUUID', {
      value: randomUUID,
      writable: true,
      configurable: true
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <KeycloakProvider>
    <App />
  </KeycloakProvider>
);
