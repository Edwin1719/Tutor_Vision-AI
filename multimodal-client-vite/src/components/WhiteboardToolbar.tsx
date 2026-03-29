import { Button } from "./ui/button";
import { Pen, Highlighter, Circle, Square, ArrowRight, Type, Eraser, Trash2, Palette } from "lucide-react";
import type { ToolType, ColorType } from "../hooks/useWhiteboard";

interface WhiteboardToolbarProps {
  currentTool: ToolType;
  currentColor: ColorType;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: ColorType) => void;
  onClear: () => void;
  onClose: () => void;
}

const TOOLS: { id: ToolType; icon: React.ReactNode; label: string }[] = [
  { id: "pen", icon: <Pen className="w-4 h-4" />, label: "Lápiz" },
  { id: "highlighter", icon: <Highlighter className="w-4 h-4" />, label: "Resaltar" },
  { id: "circle", icon: <Circle className="w-4 h-4" />, label: "Círculo" },
  { id: "rectangle", icon: <Square className="w-4 h-4" />, label: "Rectángulo" },
  { id: "arrow", icon: <ArrowRight className="w-4 h-4" />, label: "Flecha" },
  { id: "text", icon: <Type className="w-4 h-4" />, label: "Texto" },
  { id: "eraser", icon: <Eraser className="w-4 h-4" />, label: "Borrar" },
];

const COLORS: { id: ColorType; color: string; label: string }[] = [
  { id: "red", color: "#ef4444", label: "Rojo" },
  { id: "green", color: "#22c55e", label: "Verde" },
  { id: "blue", color: "#3b82f6", label: "Azul" },
  { id: "yellow", color: "#eab308", label: "Amarillo" },
  { id: "orange", color: "#f97316", label: "Naranja" },
  { id: "purple", color: "#a855f7", label: "Morado" },
  { id: "black", color: "#000000", label: "Negro" },
  { id: "white", color: "#ffffff", label: "Blanco" },
];

export function WhiteboardToolbar({
  currentTool,
  currentColor,
  onToolChange,
  onColorChange,
  onClear,
  onClose,
}: WhiteboardToolbarProps) {
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 shadow-2xl border border-gray-700 max-w-2xl w-full z-50">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-1">
          {TOOLS.map(tool => (
            <Button
              key={tool.id}
              size="sm"
              variant={currentTool === tool.id ? "secondary" : "ghost"}
              className={`w-9 h-9 p-0 ${currentTool === tool.id ? "bg-white text-black" : "text-white hover:bg-gray-700"}`}
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
            >
              {tool.icon}
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-700" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <Palette className="w-4 h-4 text-gray-400" />
          {COLORS.map(color => (
            <button
              key={color.id}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                currentColor === color.id ? "border-white scale-110" : "border-gray-600 hover:scale-105"
              }`}
              style={{ backgroundColor: color.color }}
              onClick={() => onColorChange(color.id)}
              title={color.label}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-700" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="w-9 h-9 p-0 text-red-400 hover:bg-red-900/50 hover:text-red-300"
            onClick={onClear}
            title="Limpiar todo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-9 h-9 p-0 text-gray-400 hover:bg-gray-700 hover:text-white"
            onClick={onClose}
            title="Cerrar pizarra"
          >
            <span className="text-lg leading-none">×</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
