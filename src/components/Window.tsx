import { ReactNode, useState } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
  width?: string;
  height?: string;
  icon?: ReactNode;
  zIndex?: number;
  onFocus?: () => void;
  isMinimized?: boolean;
  onMinimize?: (minimized: boolean) => void;
}

export const Window = ({
  title,
  children,
  onClose,
  defaultPosition = { x: 100, y: 100 },
  width = 'w-96',
  height = 'h-auto',
  icon,
  zIndex = 10,
  onFocus,
  isMinimized: externalIsMinimized,
  onMinimize,
}: WindowProps) => {
  const [internalIsMinimized, setInternalIsMinimized] = useState(false);
  const isMinimized = externalIsMinimized !== undefined ? externalIsMinimized : internalIsMinimized;

  const handleMinimize = () => {
    const newMinimized = !isMinimized;
    if (onMinimize) {
      onMinimize(newMinimized);
    } else {
      setInternalIsMinimized(newMinimized);
    }
  };

  return (
    <Rnd
      default={{
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: 384,
        height: 'auto',
      }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      dragHandleClassName="window-title"
      className="animate-fade-in"
      style={{ zIndex }}
      onMouseDown={onFocus}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      resizeHandleStyles={{
        bottomRight: {
          cursor: 'nwse-resize',
          width: '20px',
          height: '20px',
          right: '0px',
          bottom: '0px',
        },
        bottom: {
          cursor: 'ns-resize',
          height: '10px',
        },
        right: {
          cursor: 'ew-resize',
          width: '10px',
        },
        top: {
          cursor: 'ns-resize',
          height: '10px',
        },
        left: {
          cursor: 'ew-resize',
          width: '10px',
        },
        topRight: {
          cursor: 'nesw-resize',
          width: '20px',
          height: '20px',
        },
        topLeft: {
          cursor: 'nwse-resize',
          width: '20px',
          height: '20px',
        },
        bottomLeft: {
          cursor: 'nesw-resize',
          width: '20px',
          height: '20px',
        },
      }}
    >
      <div className="win95-border bg-card flex flex-col shadow-lg h-full">
        {/* Title Bar */}
        <div className="window-title win95-title flex items-center justify-between px-1 py-1 cursor-move select-none">
          <div className="flex items-center gap-2 text-primary-foreground font-bold text-sm">
            {icon && <span className="text-base">{icon}</span>}
            <span>{title}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleMinimize}
              className="win95-border bg-card hover:bg-muted w-5 h-5 flex items-center justify-center active:win95-border-inset"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              className="win95-border bg-card hover:bg-muted w-5 h-5 flex items-center justify-center active:win95-border-inset"
            >
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onClose}
              className="win95-border bg-card hover:bg-muted w-5 h-5 flex items-center justify-center active:win95-border-inset"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        {!isMinimized && (
          <div className="p-2 bg-card overflow-auto flex-1">
            {children}
          </div>
        )}
      </div>
    </Rnd>
  );
};
