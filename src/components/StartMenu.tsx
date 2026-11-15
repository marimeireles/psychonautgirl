import { useState, useEffect, useRef } from "react";
import { ChevronRight, FileText, Folder, Heart, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBlog: (blogName: string) => void;
  onOpenWindow: (window: string) => void;
}

// Below this viewport size the fly-out submenus (and their tooltips) no longer
// fit beside the menu, so everything is shown as one list with section titles.
const FLYOUT_MIN_WIDTH = 700;
const FLYOUT_MIN_HEIGHT = 540;
const isCompactViewport = () => window.innerWidth < FLYOUT_MIN_WIDTH || window.innerHeight < FLYOUT_MIN_HEIGHT;

interface Entry {
  icon: string;
  text: string;
  onClick: () => void;
  showArrow?: boolean;
  asLink?: boolean;
  underline?: boolean;
  tooltip?: string;
}

export const StartMenu = ({ isOpen, onClose, onOpenBlog, onOpenWindow }: StartMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Tap-to-open state for the folder submenus; hover still opens them on devices with a mouse.
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const toggleFolder = (name: string) =>
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  const [compact, setCompact] = useState(isCompactViewport);
  useEffect(() => {
    const onResize = () => setCompact(isCompactViewport());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // Hover classes are spelled out in full so Tailwind can find them.
  const hoverOpen: Record<string, string> = {
    programs: "[@media(hover:hover)]:group-hover/programs:block",
    blogs: "[@media(hover:hover)]:group-hover/blogs:block",
    interviews: "[@media(hover:hover)]:group-hover/interviews:block",
  };
  const submenuClass = (name: string, width: string) =>
    `${openFolders.has(name) ? "block" : "hidden"} ${hoverOpen[name]} absolute left-full top-0 ml-1 ${width} win95-border bg-card shadow-2xl z-50`;

  useEffect(() => {
    if (!isOpen) setOpenFolders(new Set());
  }, [isOpen]);

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

  // every entry closes the menu after doing its thing
  const then = (fn: () => void) => () => {
    fn();
    onClose();
  };
  const external = (url: string) => then(() => window.open(url, "_blank"));

  const programs: Entry[] = [
    { icon: "🎨", text: "Paint", onClick: then(() => onOpenWindow("paint")) },
    { icon: "💬", text: "Chat", onClick: then(() => onOpenWindow("chat")) },
    { icon: "🖼️", text: "Gallery", onClick: then(() => onOpenWindow("gallery")) },
    { icon: "📖", text: "Guestbook", onClick: then(() => onOpenWindow("guestbook")) },
    { icon: "📝", text: "Collaborative Dashboard", onClick: then(() => navigate("/dashboard")) },
    { icon: "🔨", text: "Project ideas", onClick: then(() => onOpenWindow("projects")) },
    { icon: "🧠", text: "Anki Flashcards", onClick: then(() => navigate("/anki")) },
    { icon: "🌿", text: "Food Diary", onClick: then(() => navigate("/food")) },
  ];
  const interviews: Entry[] = [
    { icon: "🏆", text: "Interview Dashboard", asLink: true, onClick: then(() => navigate("/ukiepc")) },
    { icon: "🧪", text: "Interview Gym", asLink: true, onClick: then(() => navigate("/interview")) },
  ];
  const blogs: Entry[] = [
    { icon: "🏛️", text: "Arete Telos", tooltip: "Thoughts on human flourishing", showArrow: true, onClick: external("https://aretetelos.substack.com/") },
    {
      icon: "🤖",
      text: "Do Cyborgs Dream of Bionic Sheep?",
      tooltip: "A software engineering diary",
      showArrow: true,
      onClick: external("https://cyborgdream.github.io/"),
    },
    {
      icon: "📝",
      text: "Medium",
      tooltip: "Essays on my open source work on the Jupyter ecossystem",
      showArrow: true,
      onClick: external("https://medium.com/@mari-meir"),
    },
    {
      icon: "✍️",
      text: "Letters for the Evanescents",
      tooltip: "Short texts and poems for the tender-hearted",
      showArrow: true,
      onClick: external("https://lettersfortheevanescents.mataroa.blog/"),
    },
    { icon: "🌀", text: "3l3ktr4's Cove", tooltip: "Schizo thoughts", showArrow: true, onClick: external("https://3l3ktr4.mmm.page/") },
  ];
  const interests: Entry[] = [
    { icon: "💻", text: "Software", onClick: then(() => onOpenBlog("Software")) },
    { icon: "🎓", text: "Academic work", onClick: then(() => onOpenWindow("academicWork")) },
    { icon: "🦄", text: "Community", onClick: then(() => onOpenBlog("Community")) },
    { icon: "🌈", text: "Activism", onClick: then(() => onOpenBlog("Activism")) },
    { icon: "📚", text: "Reading List", showArrow: true, underline: false, onClick: external("/reading-list.html") },
  ];
  const system: Entry[] = [
    { icon: "🌸", text: "About", onClick: then(() => onOpenWindow("about")) },
    { icon: "📰", text: "News", onClick: then(() => onOpenWindow("news")) },
    { icon: "⚙️", text: "Settings", showArrow: true, onClick: external("https://github.com/marimeireles/psychonautgirl") },
  ];

  const items = (list: Entry[], inline = false) => list.map((e) => <MenuItem key={e.text} {...e} inlineTooltip={inline} />);
  const header = (
    <div className="bg-gradient-to-r from-primary/30 to-accent/40 px-3 py-6 flex items-center gap-3 border-b-2 border-border">
      <div className="text-sm font-bold">
        <div className="text-primary">Mari's Disk Operating System</div>
        <div className="text-xs text-muted-foreground">MS-DOS</div>
      </div>
    </div>
  );
  const sectionTitle = (title: string) => (
    <div className="px-3 py-1 text-xs font-bold text-muted-foreground flex items-center gap-1">
      <Folder className="w-3 h-3" />
      {title}
    </div>
  );
  const divider = <div className="h-px bg-border my-1" />;

  // Small screens: no fly-outs, just every entry in one scrollable list under its section title.
  if (compact) {
    return (
      <div
        ref={menuRef}
        className="fixed bottom-10 left-0 w-72 max-w-[100vw] max-h-[calc(100dvh-2.5rem)] overflow-y-auto win95-border bg-card shadow-2xl z-50 animate-fade-in"
      >
        {header}
        <div className="p-1">
          {sectionTitle("Programs")}
          {items(programs)}
          {divider}
          {sectionTitle("Interviews")}
          {items(interviews)}
          {divider}
          {sectionTitle("Blogs")}
          {items(blogs, true)}
          {divider}
          {sectionTitle("My interests")}
          {items(interests)}
          {divider}
          {items(system)}
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="fixed bottom-10 left-0 w-64 win95-border bg-card shadow-2xl z-50 animate-fade-in">
      {header}

      {/* Menu Items */}
      <div className="p-1">
        {/* Programs Section with Submenu */}
        <div className="mb-1 relative group/programs">
          <button onClick={() => toggleFolder("programs")} className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-primary/20 active:bg-primary/30 text-left text-sm">
            <Folder className="w-4 h-4" />
            <span className="flex-1">Programs</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>

          <div className={submenuClass("programs", "w-48")}>
            <div className="p-1">
              {items(programs)}
              {/* Interviews folder (third-level flyout) */}
              <div className="relative group/interviews">
                <button onClick={() => toggleFolder("interviews")} className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-primary/20 active:bg-primary/30 text-left text-sm">
                  <span className="text-base">📁</span>
                  <span className="flex-1">Interviews</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </button>
                <div className={submenuClass("interviews", "w-52")}>
                  <div className="p-1">{items(interviews)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {divider}

        {/* Blogs Section with Submenu */}
        <div className="mb-1 relative group/blogs">
          <button onClick={() => toggleFolder("blogs")} className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-primary/20 active:bg-primary/30 text-left text-sm">
            <Folder className="w-4 h-4" />
            <span className="flex-1">Blogs</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>

          <div className={submenuClass("blogs", "w-56")}>
            <div className="p-1">{items(blogs)}</div>
          </div>
        </div>

        {divider}

        {/* Interests Section */}
        <div>
          {sectionTitle("My interests")}
          {items(interests)}
        </div>

        {divider}

        {/* System */}
        {items(system)}
      </div>
    </div>
  );
};

interface MenuItemProps {
  icon: string;
  text: string;
  onClick?: () => void;
  showArrow?: boolean;
  /** style as an in-site link: underlined + primary color, no external-link icon */
  asLink?: boolean;
  /** override the underline (defaults to underlining showArrow/asLink items) */
  underline?: boolean;
  tooltip?: string;
  /** show the tooltip text as a second line instead of a hover bubble (the flat small-screen list) */
  inlineTooltip?: boolean;
}

const MenuItem = ({ icon, text, onClick, showArrow = false, asLink = false, underline, tooltip, inlineTooltip = false }: MenuItemProps) => {
  const underlined = underline ?? (showArrow || asLink);
  return (
    <div className="relative group/item">
      <button
        onClick={onClick}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-primary/20 active:bg-primary/30 text-left text-sm"
      >
        <span className="text-base">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className={`${underlined ? 'underline' : ''} ${asLink ? 'text-primary' : ''}`}>{text}</span>
          {tooltip && inlineTooltip && <span className="block text-xs text-muted-foreground">{tooltip}</span>}
        </span>
        {showArrow && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
      </button>
      {tooltip && !inlineTooltip && (
        <div
          className="hidden [@media(hover:hover)]:group-hover/item:block absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 win95-border bg-card px-2 py-1.5 text-xs shadow-2xl z-[60] pointer-events-none"
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};
