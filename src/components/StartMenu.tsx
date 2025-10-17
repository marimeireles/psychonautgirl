import { useState, useEffect, useRef } from "react";
import { ChevronRight, FileText, Folder, Heart, ExternalLink } from "lucide-react";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBlog: (blogName: string) => void;
  onOpenWindow: (window: string) => void;
}

export const StartMenu = ({ isOpen, onClose, onOpenBlog, onOpenWindow }: StartMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [blogsOpen, setBlogsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const interests = [
    { name: "Software", icon: "💻" },
    { name: "Research", icon: "🔬" },
    { name: "Community", icon: "🦄" },
    { name: "Activism", icon: "🌈" },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bottom-10 left-0 w-64 md:w-64 win95-border bg-card shadow-2xl z-[100] animate-fade-in max-h-[calc(100vh-3rem)] overflow-y-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/30 to-accent/40 px-3 py-6 flex items-center gap-3 border-b-2 border-border">
        <div className="text-sm font-bold">
          <div className="text-primary">Mari's website</div>
          <div className="text-xs text-muted-foreground">v1.0</div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-1">
        {/* Programs Section with Submenu */}
        <div className="mb-1 relative group/programs">
          <button
            onClick={() => setProgramsOpen(!programsOpen)}
            onMouseEnter={() => setProgramsOpen(true)}
            onMouseLeave={() => setProgramsOpen(false)}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-primary/20 active:bg-primary/30 text-left text-sm"
          >
            <Folder className="w-4 h-4" />
            <span className="flex-1">Programs</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>

          {/* Submenu */}
          <div
            className={`${programsOpen ? 'block' : 'hidden'} absolute left-full md:left-full left-0 md:top-0 bottom-full md:bottom-auto md:ml-1 mb-1 md:mb-0 w-48 win95-border bg-card shadow-2xl z-[110]`}
            onMouseEnter={() => setProgramsOpen(true)}
            onMouseLeave={() => setProgramsOpen(false)}
          >
            <div className="p-1">
              <MenuItem
                icon="🎨"
                text="Paint"
                onClick={() => {
                  onOpenWindow("paint");
                  onClose();
                }}
              />
              <MenuItem
                icon="💬"
                text="Chat"
                onClick={() => {
                  onOpenWindow("chat");
                  onClose();
                }}
              />
              <MenuItem
                icon="🖼️"
                text="Gallery"
                onClick={() => {
                  onOpenWindow("gallery");
                  onClose();
                }}
              />
              <MenuItem
                icon="📖"
                text="Guestbook"
                onClick={() => {
                  onOpenWindow("guestbook");
                  onClose();
                }}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-border my-1" />

        {/* Blogs Section with Submenu */}
        <div className="mb-1 relative group/blogs">
          <button
            onClick={() => setBlogsOpen(!blogsOpen)}
            onMouseEnter={() => setBlogsOpen(true)}
            onMouseLeave={() => setBlogsOpen(false)}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-primary/20 active:bg-primary/30 text-left text-sm"
          >
            <Folder className="w-4 h-4" />
            <span className="flex-1">Blogs</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>

          {/* Submenu */}
          <div
            className={`${blogsOpen ? 'block' : 'hidden'} absolute left-full md:left-full left-0 md:top-0 bottom-full md:bottom-auto md:ml-1 mb-1 md:mb-0 w-56 win95-border bg-card shadow-2xl z-[110]`}
            onMouseEnter={() => setBlogsOpen(true)}
            onMouseLeave={() => setBlogsOpen(false)}
          >
            <div className="p-1">
              <MenuItem
                icon="🤖"
                text="Do Cyborgs Dream of Bionic Sheep?"
                onClick={() => {
                  window.open('https://cyborgdream.github.io/', '_blank');
                  onClose();
                }}
                showArrow={true}
              />
              <MenuItem
                icon="📝"
                text="Medium"
                onClick={() => {
                  window.open('https://medium.com/@mari-meir', '_blank');
                  onClose();
                }}
                showArrow={true}
              />
              <MenuItem
                icon="🔬"
                text="Tech for Good Research"
                onClick={() => {
                  window.open('https://techforgoodresearch.substack.com/', '_blank');
                  onClose();
                }}
                showArrow={true}
              />
              <MenuItem
                icon="📡"
                text="Wireless Hippie"
                onClick={() => {
                  window.open('https://wireless-hippie.neocities.org/', '_blank');
                  onClose();
                }}
                showArrow={true}
              />
              <MenuItem
                icon="✍️"
                text="Letters for the Evanescents"
                onClick={() => {
                  window.open('https://lettersfortheevanescents.mataroa.blog/', '_blank');
                  onClose();
                }}
                showArrow={true}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-border my-1" />

        {/* Interests Section */}
        <div>
          <div className="px-3 py-1 text-xs font-bold text-muted-foreground flex items-center gap-1">
            <Folder className="w-3 h-3" />
            My interests
          </div>
          {interests.map((interest) => (
            <MenuItem
              key={interest.name}
              icon={interest.icon}
              text={interest.name}
              onClick={() => {
                onOpenBlog(interest.name);
                onClose();
              }}
            />
          ))}
          <MenuItem
            icon="📚"
            text="Reading List"
            onClick={() => {
              window.open('/reading-list.html', '_blank');
              onClose();
            }}
            showArrow={true}
          />
        </div>

        <div className="h-px bg-border my-1" />

        {/* System */}
        <MenuItem
          icon="🌸"
          text="About"
          onClick={() => {
            onOpenWindow("about");
            onClose();
          }}
        />
        <MenuItem
          icon="⚙️"
          text="Settings"
          onClick={() => {
            window.open('https://github.com/marimeireles/psychonautgirl', '_blank');
            onClose();
          }}
          showArrow={true}
        />
      </div>
    </div>
  );
};

interface MenuItemProps {
  icon: string;
  text: string;
  onClick?: () => void;
  showArrow?: boolean;
}

const MenuItem = ({ icon, text, onClick, showArrow = false }: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-primary/20 active:bg-primary/30 text-left group text-sm"
    >
      <span className="text-base">{icon}</span>
      <span className={`flex-1 ${showArrow ? 'underline' : ''}`}>{text}</span>
      {showArrow && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
    </button>
  );
};
