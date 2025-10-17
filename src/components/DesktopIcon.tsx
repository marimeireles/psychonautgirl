import { ReactNode } from 'react';

interface DesktopIconProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export const DesktopIcon = ({ icon, label, onClick }: DesktopIconProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 hover:bg-primary/20 active:bg-primary/30 rounded group w-20"
    >
      <div className="text-4xl pixelated drop-shadow-lg">{icon}</div>
      <span className="text-xs text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center leading-tight">
        {label}
      </span>
    </button>
  );
};
