import { ReactNode, useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

interface WindowProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
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
  defaultSize,
  width = 'w-96',
  height = 'h-auto',
  icon,
  zIndex = 10,
  onFocus,
  isMinimized: externalIsMinimized,
  onMinimize,
}: WindowProps) => {
  const [internalIsMinimized, setInternalIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousState, setPreviousState] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const rndRef = useRef<Rnd>(null);
  const isMinimized = externalIsMinimized !== undefined ? externalIsMinimized : internalIsMinimized;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMinimize = () => {
    const newMinimized = !isMinimized;
    if (onMinimize) {
      onMinimize(newMinimized);
    } else {
      setInternalIsMinimized(newMinimized);
    }
  };

  const handleMaximize = () => {
    if (!rndRef.current) return;

    if (isMaximized) {
      // Restore previous state
      if (previousState) {
        rndRef.current.updatePosition({ x: previousState.x, y: previousState.y });
        rndRef.current.updateSize({ width: previousState.width, height: previousState.height });
      }
      setIsMaximized(false);
    } else {
      // Save current state
      const currentState = {
        x: rndRef.current.props.position?.x || defaultPosition.x,
        y: rndRef.current.props.position?.y || defaultPosition.y,
        width: rndRef.current.props.size?.width || 384,
        height: rndRef.current.props.size?.height || 400,
      };
      setPreviousState(currentState);

      // Maximize - account for taskbar at bottom
      const taskbarHeight = 40; // Height of taskbar
      rndRef.current.updatePosition({ x: 0, y: 0 });
      rndRef.current.updateSize({
        width: window.innerWidth,
        height: window.innerHeight - taskbarHeight,
      });
      setIsMaximized(true);
    }
  };

  // Hide entire window when minimized
  if (isMinimized) {
    return null;
  }

  const windowContent = (
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
              title="Minimize"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={handleMaximize}
              className="win95-border bg-card hover:bg-muted w-5 h-5 flex items-center justify-center active:win95-border-inset"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onClose}
              className="win95-border bg-card hover:bg-muted w-5 h-5 flex items-center justify-center active:win95-border-inset"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="bg-card flex-1 min-h-0 p-2">
          {children}
        </div>
      </div>
  );

  // Mobile: fixed position, full width
  if (isMobile) {
    return (
      <div
        className="fixed top-0 left-0 right-0 bottom-10 m-2 animate-fade-in"
        style={{ zIndex }}
        onClick={onFocus}
      >
        {windowContent}
      </div>
    );
  }

  // Desktop: draggable and resizable
  return (
    <Rnd
      ref={rndRef}
      default={{
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: defaultSize?.width || 384,
        height: defaultSize?.height || 500,
      }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      dragHandleClassName="window-title"
      className="animate-fade-in"
      style={{ zIndex }}
      onMouseDown={onFocus}
      disableDragging={isMaximized}
      enableResizing={isMaximized ? false : {
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
      {windowContent}
    </Rnd>
  );
};
