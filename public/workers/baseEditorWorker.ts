export class BaseEditorWorker {
    private running: boolean = true;
    private renderLoopId: number | null = null;
  
    constructor() {
      self.onmessage = (event) => this.handleMessage(event.data);
    }
  
    protected handleMessage(message: any) {
      switch (message.type) {
        case 'SLEEP':
          this.sleep();
          break;
        case 'WAKE':
          this.wake();
          break;
        case 'INIT':
          this.init(message.data);
          break;
        default:
          this.handleCustomMessage(message);
      }
    }
  
    protected init(data: any) {
      // Override in specific editor workers
    }
  
    protected handleCustomMessage(message: any) {
      // Override in specific editor workers
    }
  
    protected startRenderLoop() {
      if (!this.renderLoopId && this.running) {
        const loop = () => {
          if (this.running) {
            this.render();
            this.renderLoopId = requestAnimationFrame(loop);
          }
        };
        loop();
      }
    }
  
    protected render() {
      // Override in specific editor workers
    }
  
    protected sleep() {
      this.running = false;
      if (this.renderLoopId) {
        cancelAnimationFrame(this.renderLoopId);
        this.renderLoopId = null;
      }
      this.onSleep();
    }
  
    protected wake() {
      this.running = true;
      this.startRenderLoop();
      this.onWake();
    }
  
    protected onSleep() {
      // Override in specific editor workers
    }
  
    protected onWake() {
      // Override in specific editor workers
    }
  }
  
  // Example specific editor worker (levelEditorWorker.ts)
  
  class LevelEditorWorker extends BaseEditorWorker {
    private scene: any;
  
    protected init(data: any) {
      // Initialize level editor specific stuff
      this.scene = data.scene;
      this.startRenderLoop();
    }
  
    protected render() {
      // Perform level editor specific render operations
      if (this.scene) {
        // Update and render scene
        self.postMessage({ type: 'RENDER_COMPLETE' });
      }
    }
  
    protected handleCustomMessage(message: any) {
      switch (message.type) {
        case 'UPDATE_SCENE':
          // Handle scene updates
          break;
      }
    }
  
    protected onSleep() {
      // Cleanup and save state
      if (this.scene) {
        // Serialize and store scene state
      }
    }
  
    protected onWake() {
      // Restore state
      if (this.scene) {
        // Restore scene state
      }
    }
  }
  
  new LevelEditorWorker();