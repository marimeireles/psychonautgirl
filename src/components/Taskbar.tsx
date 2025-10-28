import { useState, useEffect } from "react";
import { Sparkles, Volume2 } from "lucide-react";

interface WindowInfo {
  id: string;
  title: string;
  icon: string;
}

interface TaskbarProps {
  onStartClick: () => void;
  windows?: WindowInfo[];
  onWindowClick?: (id: string) => void;
}

export const Taskbar = ({ onStartClick, windows = [], onWindowClick }: TaskbarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    console.log('time')
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 win95-border taskbar-gradient flex items-center justify-between px-2 z-50 shadow-lg">
      <button
        onClick={onStartClick}
        className="win95-border bg-gradient-to-br from-primary/20 to-accent/30 hover:from-primary/30 hover:to-accent/40 px-3 py-1 font-bold text-sm active:win95-border-inset flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        Start
      </button>

      <div className="flex-1 flex items-center gap-2 px-2 overflow-x-auto">
        {windows.map((window) => (
          <button
            key={window.id}
            onClick={() => onWindowClick?.(window.id)}
            className="win95-border bg-card hover:bg-muted px-2 py-1 text-sm active:win95-border-inset flex items-center gap-2 min-w-[120px] max-w-[150px]"
          >
            <span>{window.icon}</span>
            <span className="truncate">{window.title}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <a
          href="https://open.spotify.com/user/12162592549?si=1248bae490c74683"
          target="_blank"
          rel="noopener noreferrer"
          className="win95-border bg-card hover:bg-muted p-1 active:win95-border-inset"
          title="Listen on Spotify"
        >
          <Volume2 className="w-4 h-4 text-primary" />
        </a>
        <div className="win95-border-inset bg-muted/60 backdrop-blur-sm px-3 py-1 text-sm font-mono min-w-[100px] text-center">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
