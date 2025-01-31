import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const buffer = new Uint8Array(width * height * 4);
        const bufferPtr = buffer.byteOffset;

        invoke('set_canvas_memory', {
            memory_address: bufferPtr,
            width,
            height,
        }).catch(console.error);

        const updateFrame = () => {
            const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
            ctx.putImageData(imageData, 0, 0);
            requestAnimationFrame(updateFrame);
        };

        updateFrame();
    }, []);

    return <canvas ref={canvasRef} width={800} height={600} />;
}
