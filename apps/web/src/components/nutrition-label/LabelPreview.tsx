import React, { useEffect, useRef } from 'react';

interface LabelPreviewProps {
  canvas: HTMLCanvasElement | null;
  labelData: any;
  onDownload: () => void;
}

export default function LabelPreview({ canvas, labelData, onDownload }: LabelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = canvas.width;
        canvasRef.current.height = canvas.height;
        ctx.drawImage(canvas, 0, 0);
      }
    }
  }, [canvas]);

  return (
    <div className="label-preview">
      <h3>Generated Nutrition Label</h3>
      
      {canvas ? (
        <div className="preview-container">
          <canvas 
            ref={canvasRef}
            className="nutrition-label-canvas"
          />
          
          <div className="preview-actions">
            <button 
              onClick={onDownload}
              className="download-button"
            >
              Download PNG
            </button>
          </div>
        </div>
      ) : (
        <div className="preview-placeholder">
          <p>Generate a label to see preview</p>
        </div>
      )}
    </div>
  );
}
