// webgpu.worker.ts
/// <reference types="@webgpu/types" />
let device: GPUDevice | null = null;
let context: GPUCanvasContext | null = null;
let pipeline: GPURenderPipeline | null = null;

async function initWebGPU(canvas: OffscreenCanvas) {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('No GPU adapter found');
  
  device = await adapter.requestDevice();
  context = canvas.getContext('webgpu');
  if (!context) throw new Error('No WebGPU context');

  const format = navigator.gpu.getPreferredCanvasFormat();
  if (!device) throw new Error('No GPU device');
  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });

  const shader = device.createShaderModule({
    code: `
      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) color: vec4f,
      }

      @vertex fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
        let positions = array<vec2f, 3>(
          vec2f( 0.0,  0.5),
          vec2f(-0.5, -0.5),
          vec2f( 0.5, -0.5)
        );
        let colors = array<vec3f, 3>(
          vec3f(1.0, 0.0, 0.0),
          vec3f(0.0, 1.0, 0.0),
          vec3f(0.0, 0.0, 1.0)
        );

        var output: VertexOutput;
        output.position = vec4f(positions[vertexIndex], 0.0, 1.0);
        output.color = vec4f(colors[vertexIndex], 1.0);
        return output;
      }

      @fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
        return input.color;
      }
    `
  });

  pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shader,
      entryPoint: 'vertexMain'
    },
    fragment: {
      module: shader,
      entryPoint: 'fragmentMain',
      targets: [{ format }]
    }
  });
}

function render() {
  if (!device || !context || !pipeline) return;
  
  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: 'clear',  
      storeOp: 'store',
    }]
  });

  renderPass.setPipeline(pipeline);
  renderPass.draw(3);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
}

self.onmessage = async (e: MessageEvent) => {
  switch (e.data.type) {
    case 'init':
      await initWebGPU(e.data.canvas);
      self.postMessage({ type: 'initialized' });
      break;
    case 'render':
      render();
      break;
    case 'cleanup':
      if (device) device.destroy();
      device = null;
      context = null;
      pipeline = null;
      break;
  }
};