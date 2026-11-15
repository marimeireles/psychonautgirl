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
  /**
   * How defaultPosition/defaultSize are read:
   * - "scaled" (default): as a spot on the reference desktop, mapped onto this viewport
   * - "fill": defaultPosition is the margin; the window fills the rest of the desktop
   * - "bottom-right": parked in the bottom-right corner
   */
  placement?: Placement;
}

type Placement = 'scaled' | 'fill' | 'bottom-right';

const TASKBAR_HEIGHT = 40;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

const clampToViewport = (
  pos: { x: number; y: number },
  size: { width: number; height: number }
) => {
  if (typeof window === 'undefined') {
    return { x: pos.x, y: pos.y, width: size.width, height: size.height };
  }
  const maxW = window.innerWidth;
  const maxH = Math.max(MIN_HEIGHT, window.innerHeight - TASKBAR_HEIGHT);
  const width = Math.max(MIN_WIDTH, Math.min(size.width, maxW));
  const height = Math.max(MIN_HEIGHT, Math.min(size.height, maxH));
  const x = Math.max(0, Math.min(pos.x, maxW - width));
  const y = Math.max(0, Math.min(pos.y, maxH - height));
  return { x, y, width, height };
};

// Window positions and sizes across the site are written for this viewport (the
// site owner's MacBook Pro browser window), where the desktop looks the way it
// is meant to. On any other viewport each window keeps the same relative spot and is
// drawn larger or smaller as a whole (frame and content together, via CSS
// zoom), within limits so the text stays readable.
const REFERENCE = { width: 1470, height: 835 };
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.4;
const ICON_COLUMN_WIDTH = 104; // the first column of desktop icons, with its margin

const fitToViewport = (
  pos: { x: number; y: number },
  size: { width: number; height: number },
  placement: Placement
) => {
  if (typeof window === 'undefined') {
    return { x: pos.x, y: pos.y, width: size.width, height: size.height, scale: 1 };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (placement === 'fill') {
    return { ...clampToViewport(pos, { width: vw - 2 * pos.x, height: vh - pos.y - 80 }), scale: 1 };
  }
  const usable = vh - TASKBAR_HEIGHT;
  const refUsable = REFERENCE.height - TASKBAR_HEIGHT;
  const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, vw / REFERENCE.width, usable / refUsable));
  const width = Math.round(size.width * scale);
  const height = Math.round(size.height * scale);
  if (placement === 'bottom-right') {
    return { ...clampToViewport({ x: vw - width - 40, y: vh - height - 80 }, { width, height }), scale };
  }
  // keep the window's centre at the same fraction of the desktop
  const cx = ((pos.x + size.width / 2) / REFERENCE.width) * vw;
  const cy = ((pos.y + size.height / 2) / refUsable) * usable;
  // on narrower screens, stay clear of the first column of desktop icons as long as the window still fits beside it
  const minX = Math.max(0, Math.min(pos.x, ICON_COLUMN_WIDTH, vw - width));
  const x = Math.max(minX, Math.round(cx - width / 2));
  return { ...clampToViewport({ x, y: Math.round(cy - height / 2) }, { width, height }), scale };
};

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
  placement = 'scaled',
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

  const fit = () =>
    fitToViewport(
      defaultPosition,
      { width: defaultSize?.width || 384, height: defaultSize?.height || 500 },
      placement
    );
  const fitRef = useRef(fit);
  fitRef.current = fit;
  const [initialBounds] = useState(fit);
  const [scale, setScale] = useState(initialBounds.scale);
  // once the visitor drags or resizes a window it stays where they put it
  const userMoved = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScale(fitRef.current().scale);
      if (!rndRef.current) return;
      if (isMaximized) {
        rndRef.current.updatePosition({ x: 0, y: 0 });
        rndRef.current.updateSize({ width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT });
        return;
      }
      const el = rndRef.current.getSelfElement() as HTMLElement | null;
      if (!el) return;
      // The window's transform state equals its on-screen rect (its static
      // offset is 0,0), so work from the rect itself. getDraggablePosition()
      // reports a different coordinate space and doubled offsets per resize.
      const rect = el.getBoundingClientRect();
      const pos = { x: rect.x, y: rect.y };
      const currentSize = { width: el.offsetWidth, height: el.offsetHeight };
      // untouched windows follow the viewport; moved ones are only kept on screen
      const target = userMoved.current ? clampToViewport(pos, currentSize) : fitRef.current();
      if (target.x !== pos.x || target.y !== pos.y) {
        rndRef.current.updatePosition({ x: target.x, y: target.y });
      }
      if (target.width !== currentSize.width || target.height !== currentSize.height) {
        rndRef.current.updateSize({ width: target.width, height: target.height });
      }
    };
    window.addEventListener('resize', handleResize);
    // react-rnd re-applies the default position asynchronously after mount,
    // which can double the offset and strand bottom/right-placed windows
    // off-screen. Watch the first ~0.5s of frames and put it back in place.
    let frames = 0;
    let raf = requestAnimationFrame(function tick() {
      handleResize();
      if (++frames < 30) raf = requestAnimationFrame(tick);
    });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [isMaximized, initialBounds.width, initialBounds.height]);

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
      // Save where the window is now, to come back to
      const el = rndRef.current.getSelfElement() as HTMLElement | null;
      const rect = el?.getBoundingClientRect();
      const currentState = rect
        ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        : fit();
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
    <div
      data-window
      className="win95-border bg-card flex flex-col shadow-lg h-full"
      style={!isMobile && scale !== 1 ? { zoom: scale } : undefined}
    >
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
      default={{ x: initialBounds.x, y: initialBounds.y, width: initialBounds.width, height: initialBounds.height }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      onDragStop={() => {
        userMoved.current = true;
      }}
      onResizeStop={() => {
        userMoved.current = true;
      }}
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
