import React, { useState, useCallback, useRef } from "react";

export type ToolType = "pen" | "highlighter" | "circle" | "rectangle" | "arrow" | "text" | "eraser";
export type ColorType = "red" | "green" | "blue" | "yellow" | "orange" | "purple" | "black" | "white";

export interface Annotation {
  id: string;
  type: ToolType;
  color: ColorType;
  points?: { x: number; y: number }[];
  center?: { x: number; y: number };
  radius?: number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  text?: string;
  fontSize?: number;
  strokeWidth: number;
}

interface UseWhiteboardReturn {
  isEnabled: boolean;
  currentTool: ToolType;
  currentColor: ColorType;
  annotations: Annotation[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  toggleWhiteboard: () => void;
  setTool: (tool: ToolType) => void;
  setColor: (color: ColorType) => void;
  clearAnnotations: () => void;
  addAnnotation: (annotation: Annotation) => void;
  resizeCanvas: (width: number, height: number) => void;
  handlePointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handlePointerUp: () => void;
}

const COLORS: Record<ColorType, string> = {
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  black: "#000000",
  white: "#ffffff",
};

const STROKE_WIDTHS: Record<ToolType, number> = {
  pen: 2,
  highlighter: 15,
  circle: 2,
  rectangle: 2,
  arrow: 3,
  text: 0,
  eraser: 20,
};

export function useWhiteboard(): UseWhiteboardReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentTool, setToolState] = useState<ToolType>("pen");
  const [currentColor, setColorState] = useState<ColorType>("red");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const currentShape = useRef<Annotation | null>(null);

  const setTool = useCallback((tool: ToolType) => {
    setToolState(tool);
  }, []);

  const setColor = useCallback((color: ColorType) => {
    setColorState(color);
  }, []);

  const toggleWhiteboard = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const addAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
    renderAnnotation(annotation);
  }, []);

  const renderAnnotation = useCallback((annotation: Annotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = COLORS[annotation.color];
    ctx.fillStyle = COLORS[annotation.color];
    ctx.lineWidth = annotation.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (annotation.type) {
      case "pen":
      case "highlighter":
        if (annotation.points && annotation.points.length > 1) {
          ctx.globalAlpha = annotation.type === "highlighter" ? 0.3 : 1;
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
          for (let i = 1; i < annotation.points.length; i++) {
            ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        break;

      case "circle":
        if (annotation.center && annotation.radius) {
          ctx.beginPath();
          ctx.arc(annotation.center.x, annotation.center.y, annotation.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case "rectangle":
        if (annotation.start && annotation.end) {
          ctx.beginPath();
          ctx.rect(annotation.start.x, annotation.start.y, annotation.end.x - annotation.start.x, annotation.end.y - annotation.start.y);
          ctx.stroke();
        }
        break;

      case "arrow":
        if (annotation.start && annotation.end) {
          drawArrow(ctx, annotation.start, annotation.end, COLORS[annotation.color], annotation.strokeWidth);
        }
        break;

      case "text":
        if (annotation.text && annotation.start) {
          ctx.font = `${annotation.fontSize || 16}px Arial`;
          ctx.fillText(annotation.text, annotation.start.x, annotation.start.y);
        }
        break;

      case "eraser":
        if (annotation.points && annotation.points.length > 1) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
          for (let i = 1; i < annotation.points.length; i++) {
            ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
          }
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        }
        break;
    }
  }, []);

  const drawArrow = useCallback((ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, color: string, width: number) => {
    const headLength = 15;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;

    isDrawing.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === "pen" || currentTool === "highlighter" || currentTool === "eraser") {
      currentPoints.current = [{ x, y }];
    } else if (currentTool === "circle") {
      currentShape.current = {
        id: Date.now().toString(),
        type: currentTool,
        color: currentColor,
        center: { x, y },
        radius: 0,
        strokeWidth: STROKE_WIDTHS[currentTool],
      };
    } else if (currentTool === "rectangle" || currentTool === "arrow") {
      currentShape.current = {
        id: Date.now().toString(),
        type: currentTool,
        color: currentColor,
        start: { x, y },
        end: { x, y },
        strokeWidth: STROKE_WIDTHS[currentTool],
      };
    }
  }, [isEnabled, currentTool, currentColor]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !isEnabled) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === "pen" || currentTool === "highlighter" || currentTool === "eraser") {
      currentPoints.current.push({ x, y });
      
      // Render while drawing
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx && currentPoints.current.length > 1) {
          const points = currentPoints.current;
          ctx.strokeStyle = COLORS[currentColor];
          ctx.lineWidth = STROKE_WIDTHS[currentTool];
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          
          if (currentTool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
          } else if (currentTool === "highlighter") {
            ctx.globalAlpha = 0.3;
          }
          
          ctx.beginPath();
          ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
          ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
          ctx.stroke();
          
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
        }
      }
    } else if (currentShape.current) {
      if (currentTool === "circle" && currentShape.current.center) {
        const dx = x - currentShape.current.center.x;
        const dy = y - currentShape.current.center.y;
        currentShape.current.radius = Math.sqrt(dx * dx + dy * dy);
      } else if ((currentTool === "rectangle" || currentTool === "arrow") && currentShape.current.start) {
        currentShape.current.end = { x, y };
      }
    }
  }, [isEnabled, currentTool, currentColor]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current || !isEnabled) return;

    isDrawing.current = false;

    if ((currentTool === "pen" || currentTool === "highlighter" || currentTool === "eraser") && currentPoints.current.length > 0) {
      const annotation: Annotation = {
        id: Date.now().toString(),
        type: currentTool,
        color: currentColor,
        points: [...currentPoints.current],
        strokeWidth: STROKE_WIDTHS[currentTool],
      };
      setAnnotations(prev => [...prev, annotation]);
      currentPoints.current = [];
    } else if (currentShape.current) {
      setAnnotations(prev => [...prev, currentShape.current!]);
      renderAnnotation(currentShape.current);
      currentShape.current = null;
    }
  }, [isEnabled, currentTool, currentColor, renderAnnotation]);

  const resizeCanvas = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    // Re-render all annotations after resize
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      annotations.forEach(ann => renderAnnotation(ann));
    }
  }, [annotations, renderAnnotation]);

  // Attach pointer events to canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.pointerEvents = isEnabled ? "auto" : "none";
    canvas.style.touchAction = "none";
  }, [isEnabled]);

  React.useEffect(() => {
    setupCanvas();
  }, [setupCanvas, isEnabled]);

  return {
    isEnabled,
    currentTool,
    currentColor,
    annotations,
    canvasRef,
    toggleWhiteboard,
    setTool,
    setColor,
    clearAnnotations,
    addAnnotation,
    resizeCanvas,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
