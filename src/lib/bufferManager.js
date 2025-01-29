// bufferManager.js
export class BufferManager {
    constructor(size) {
      this.size = size;
      this.isSharedBufferAvailable = typeof SharedArrayBuffer !== 'undefined';
      
      if (this.isSharedBufferAvailable) {
        this.buffer = new SharedArrayBuffer(size);
        this.view = new Uint8Array(this.buffer);
      } else {
        // Fallback to regular ArrayBuffer
        this.buffer = new ArrayBuffer(size);
        this.view = new Uint8Array(this.buffer);
      }
    }
  
    getBuffer() {
      return this.buffer;
    }
  
    getView() {
      return this.view;
    }
  
    async update(newData) {
      if (!this.isSharedBufferAvailable) {
        // For regular ArrayBuffer, we need to copy the data
        this.view.set(newData);
      }
      // For SharedArrayBuffer, the backend can write directly
    }
  
    isShared() {
      return this.isSharedBufferAvailable;
    }
  }