import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { Paintbrush, Eraser, Square, Circle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const PaintWindow = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeTool, setActiveTool] = useState<"draw" | "erase">("draw");

  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF"];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 500,
      height: 350,
      backgroundColor: "#ffffff",
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 3;
    canvas.isDrawingMode = true;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = true;
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeTool === "erase" ? "#ffffff" : activeColor;
      fabricCanvas.freeDrawingBrush.width = activeTool === "erase" ? 20 : 3;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast.success("Canvas cleared!");
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto h-full">
      {/* Toolbar */}
      <div className="win95-border-inset bg-muted p-2 flex gap-2 items-center flex-wrap">
        <button
          onClick={() => setActiveTool("draw")}
          className={`win95-border p-1.5 ${activeTool === "draw" ? "win95-border-inset bg-muted" : "bg-card hover:bg-muted"}`}
          title="Pencil"
        >
          <Paintbrush className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool("erase")}
          className={`win95-border p-1.5 ${activeTool === "erase" ? "win95-border-inset bg-muted" : "bg-card hover:bg-muted"}`}
          title="Eraser"
        >
          <Eraser className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          onClick={handleClear}
          className="win95-border bg-card hover:bg-muted p-1.5"
          title="Clear"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setActiveColor(color)}
            className={`win95-border w-6 h-6 ${activeColor === color ? "win95-border-inset" : ""}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Canvas */}
      <div className="win95-border-inset">
        <canvas ref={canvasRef} className="pixelated" />
      </div>
    </div>
  );
};
