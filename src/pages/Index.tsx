import { useState, useRef } from "react";
import { Window } from "@/components/Window";
import { DesktopIcon } from "@/components/DesktopIcon";
import { Taskbar } from "@/components/Taskbar";
import { StartMenu } from "@/components/StartMenu";
import { PaintWindow } from "@/components/windows/PaintWindow";
import { ChatWindow } from "@/components/windows/ChatWindow";
import { AboutWindow } from "@/components/windows/AboutWindow";
import { GalleryWindow } from "@/components/windows/GalleryWindow";
import { GuestbookWindow } from "@/components/windows/GuestbookWindow";
import { BlogWindow } from "@/components/windows/BlogWindow";
import { JobPopupWindow } from "@/components/windows/JobPopupWindow";
import { AcademicWorkWindow } from "@/components/windows/AcademicWorkWindow";
import { FocusAreaWindow } from "@/components/windows/FocusAreaWindow";
import { ProjectsWindow } from "@/components/windows/ProjectsWindow";
import { NewsWindow } from "@/components/windows/NewsWindow";
import { focusAreas, type FocusArea } from "@/data/focusAreas";
import { BubbleBackground } from "@/components/BubbleBackground";
import { SparkleTrail } from "@/components/SparkleTrail";
import desktopBg from "@/assets/desktop-bg.jpg";

type WindowType = "paint" | "chat" | "about" | "gallery" | "guestbook" | "jobPopup" | "academicWork" | "projects" | "news";

interface BlogWindow {
  id: string;
  name: string;
}

const Index = () => {
  const [openWindows, setOpenWindows] = useState<Set<WindowType>>(new Set(["about", "jobPopup"]));
  const [blogWindows, setBlogWindows] = useState<BlogWindow[]>([
    { id: "software-1", name: "Software" },
    { id: "research-1", name: "Research" }
  ]);
  const [openFocusAreas, setOpenFocusAreas] = useState<FocusArea[]>([]);
  const [guestbookOnCover, setGuestbookOnCover] = useState(false);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [windowZIndex, setWindowZIndex] = useState<Record<string, number>>({ about: 13, "software-1": 11, "research-1": 12, jobPopup: 20 });
  const [topZIndex, setTopZIndex] = useState(20);
  const [minimizedWindows, setMinimizedWindows] = useState<Record<string, boolean>>({});

  // When something was opened: a double-click's second click lands on the backdrop of the thing
  // the first click just opened, so clicks outside only close it after a short grace period.
  const openedAtRef = useRef<Partial<Record<WindowType, number>>>({});
  const CLOSE_GRACE_MS = 1000;
  const closeIfSettled = (window: WindowType) => {
    const openedAt = openedAtRef.current[window] ?? 0;
    if (Date.now() - openedAt > CLOSE_GRACE_MS) closeWindow(window);
  };

  const openWindow = (window: WindowType) => {
    openedAtRef.current[window] = Date.now();
    setOpenWindows(new Set(openWindows).add(window));
    if (minimizedWindows[window]) {
      setMinimizedWindows({ ...minimizedWindows, [window]: false });
    }
    bringWindowToFront(window);
  };

  const closeWindow = (window: WindowType) => {
    const newWindows = new Set(openWindows);
    newWindows.delete(window);
    setOpenWindows(newWindows);
    const newZIndex = { ...windowZIndex };
    delete newZIndex[window];
    setWindowZIndex(newZIndex);
  };

  const openBlogWindow = (blogName: string) => {
    const existingBlog = blogWindows.find(b => b.name === blogName);
    if (!existingBlog) {
      const newId = Date.now().toString();
      setBlogWindows([...blogWindows, { id: newId, name: blogName }]);
      bringWindowToFront(newId);
    } else {
      if (minimizedWindows[existingBlog.id]) {
        setMinimizedWindows({ ...minimizedWindows, [existingBlog.id]: false });
      }
      bringWindowToFront(existingBlog.id);
    }
  };

  const closeBlogWindow = (id: string) => {
    setBlogWindows(blogWindows.filter(b => b.id !== id));
    const newZIndex = { ...windowZIndex };
    delete newZIndex[id];
    setWindowZIndex(newZIndex);
  };

  const openFocusAreaWindow = (areaId: string) => {
    const area = focusAreas.find((a) => a.id === areaId);
    if (!area) return;
    const windowId = `focus-${areaId}`;
    if (!openFocusAreas.find((a) => a.id === areaId)) {
      setOpenFocusAreas([...openFocusAreas, area]);
    }
    if (minimizedWindows[windowId]) {
      setMinimizedWindows({ ...minimizedWindows, [windowId]: false });
    }
    bringWindowToFront(windowId);
  };

  const closeFocusAreaWindow = (areaId: string) => {
    setOpenFocusAreas(openFocusAreas.filter((a) => a.id !== areaId));
    const windowId = `focus-${areaId}`;
    const newZIndex = { ...windowZIndex };
    delete newZIndex[windowId];
    setWindowZIndex(newZIndex);
  };

  const bringWindowToFront = (id: string) => {
    const newZIndex = topZIndex + 1;
    setTopZIndex(newZIndex);
    setWindowZIndex({ ...windowZIndex, [id]: newZIndex });
  };

  // Window configurations for taskbar
  const windowConfigs = {
    paint: { title: "Paint", icon: "🎨" },
    chat: { title: "Chat Room", icon: "💬" },
    about: { title: "About Mariana Meireles", icon: "🌸" },
    gallery: { title: "My Art Gallery", icon: "🖼️" },
    guestbook: { title: "Guestbook", icon: "📖" },
    jobPopup: { title: "Looking for Opportunities!", icon: "✨" },
    academicWork: { title: "Academic Work", icon: "🎓" },
    projects: { title: "Project ideas", icon: "🔨" },
    news: { title: "News", icon: "📰" },
  };

  // Build taskbar windows list
  const blogIcons: Record<string, string> = {
    "Software": "💻",
    "Research": "🔬",
    "Community": "🦄",
    "Activism": "🌈",
  };

  const taskbarWindows = [
    ...Array.from(openWindows).map((type) => ({
      id: type,
      title: windowConfigs[type].title,
      icon: windowConfigs[type].icon,
    })),
    ...blogWindows.map((blog) => ({
      id: blog.id,
      title: blog.name,
      icon: blogIcons[blog.name] || "📝",
    })),
    ...openFocusAreas.map((area) => ({
      id: `focus-${area.id}`,
      title: area.name,
      icon: area.icon,
    })),
  ];

  const handleWindowClick = (id: string) => {
    // If window is minimized, restore it
    if (minimizedWindows[id]) {
      setMinimizedWindows({ ...minimizedWindows, [id]: false });
    }
    bringWindowToFront(id);
  };

  const handleMinimize = (id: string, minimized: boolean) => {
    setMinimizedWindows({ ...minimizedWindows, [id]: minimized });
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ backgroundColor: '#f0e6ff' }}
    >
      <div className="hidden md:block">
        <BubbleBackground />
      </div>
      <SparkleTrail />

      {/* Desktop Icons */}
      <div className="hidden md:flex absolute top-4 left-4 gap-4 z-10">
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          <DesktopIcon
            icon="💬"
            label="Chat"
            onClick={() => openWindow("chat")}
          />
          <DesktopIcon
            icon="📖"
            label="Guestbook"
            onClick={() => openWindow("guestbook")}
          />
          <DesktopIcon
            icon="💻"
            label="Software"
            onClick={() => openBlogWindow("Software")}
          />
          <DesktopIcon
            icon="🎓"
            label="Academic Work"
            onClick={() => openWindow("academicWork")}
          />
          <DesktopIcon
            icon="📚"
            label="Reading List"
            onClick={() => window.open("/reading-list.html", "_blank")}
          />
        </div>
        {/* Column 2 */}
        <div className="flex flex-col gap-4 justify-end">
          <DesktopIcon
            icon="📰"
            label="News"
            onClick={() => openWindow("news")}
          />
          <DesktopIcon
            icon="🌸"
            label="About"
            onClick={() => openWindow("about")}
          />
        </div>
      </div>

      {/* Windows */}
      {openWindows.has("paint") && (
        <Window
          title="Paint"
          onClose={() => closeWindow("paint")}
          defaultPosition={{ x: 20, y: 50 }}
          width="w-auto"
          icon="🎨"
          zIndex={windowZIndex["paint"] || 10}
          onFocus={() => bringWindowToFront("paint")}
          isMinimized={minimizedWindows["paint"]}
          onMinimize={(minimized) => handleMinimize("paint", minimized)}
        >
          <PaintWindow />
        </Window>
      )}

      {openWindows.has("chat") && (
        <Window
          title="Chat Room"
          onClose={() => closeWindow("chat")}
          defaultPosition={{ x: 200, y: 50 }}
          defaultSize={{ width: 410, height: 500 }}
          icon="💬"
          zIndex={windowZIndex["chat"] || 10}
          onFocus={() => bringWindowToFront("chat")}
          isMinimized={minimizedWindows["chat"]}
          onMinimize={(minimized) => handleMinimize("chat", minimized)}
        >
          <ChatWindow />
        </Window>
      )}

      {openWindows.has("about") && (
        <Window
          title="About me"
          onClose={() => closeWindow("about")}
          defaultPosition={{ x: 150, y: 40 }}
          defaultSize={{ width: 600, height: 600 }}
          width="w-[600px]"
          icon="🌸"
          zIndex={windowZIndex["about"] || 10}
          onFocus={() => bringWindowToFront("about")}
          isMinimized={minimizedWindows["about"]}
          onMinimize={(minimized) => handleMinimize("about", minimized)}
        >
          <AboutWindow />
        </Window>
      )}

      {openWindows.has("jobPopup") && (
        <Window
          title="Looking for Opportunities!"
          onClose={() => closeWindow("jobPopup")}
          defaultPosition={{ x: 350, y: 80 }}
          defaultSize={{ width: 380, height: 366 }}
          width="w-[400px]"
          icon="✨"
          zIndex={windowZIndex["jobPopup"] || 20}
          onFocus={() => bringWindowToFront("jobPopup")}
          isMinimized={minimizedWindows["jobPopup"]}
          onMinimize={(minimized) => handleMinimize("jobPopup", minimized)}
        >
          <JobPopupWindow />
        </Window>
      )}

      {openWindows.has("gallery") && (
        <Window
          title="My Art Gallery"
          onClose={() => closeWindow("gallery")}
          defaultPosition={{ x: 250, y: 100 }}
          width="w-[450px]"
          icon="🖼️"
          zIndex={windowZIndex["gallery"] || 10}
          onFocus={() => bringWindowToFront("gallery")}
          isMinimized={minimizedWindows["gallery"]}
          onMinimize={(minimized) => handleMinimize("gallery", minimized)}
        >
          <GalleryWindow />
        </Window>
      )}

      {/* Guestbook: a tome laid open in the middle of the screen, closed by its ribbon */}
      {openWindows.has("guestbook") && !minimizedWindows["guestbook"] && (
        <div
          className="fixed inset-0 bottom-10 flex items-center justify-center p-4"
          style={{ zIndex: windowZIndex["guestbook"] || 10, background: "rgba(10, 6, 4, 0.45)" }}
          onMouseDown={(e) => {
            bringWindowToFront("guestbook");
            if (e.target === e.currentTarget) closeIfSettled("guestbook");
          }}
        >
          <div
            className="animate-fade-in tome-shadow"
            style={{ transform: "rotate(-0.4deg)" }}
          >
          <div
            className={`relative tome ${guestbookOnCover ? "on-cover" : ""}`}
            style={{
              width: "min(860px, 94vw)",
              height: "min(560px, 80vh)",
            }}
          >
            <span className="tome-spine" />
            {/* gold tooling, following the fold at the spine */}
            <svg className="tome-tooling" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                {/* the tooling catches light on the boards and falls into shadow as it drops into the fold */}
                <linearGradient id="toolingInk" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="rgba(214, 176, 92, 0.75)" />
                  <stop offset="0.36" stopColor="rgba(201, 160, 74, 0.6)" />
                  <stop offset="0.46" stopColor="rgba(120, 90, 35, 0.45)" />
                  <stop offset="0.5" stopColor="rgba(60, 40, 12, 0.35)" />
                  <stop offset="0.54" stopColor="rgba(120, 90, 35, 0.45)" />
                  <stop offset="0.64" stopColor="rgba(201, 160, 74, 0.6)" />
                  <stop offset="1" stopColor="rgba(214, 176, 92, 0.75)" />
                </linearGradient>
              </defs>
              {/* outer line, right on the cover's edge */}
              <path
                d="M 12 0 H 410 L 450 5 L 480 12 L 500 16 L 520 12 L 550 5 L 590 0 H 988 Q 1000 0 1000 18 V 982 Q 1000 1000 988 1000 H 590 L 550 995 L 520 988 L 500 984 L 480 988 L 450 995 L 410 1000 H 12 Q 0 1000 0 982 V 18 Q 0 0 12 0 Z"
                fill="none"
                stroke="url(#toolingInk)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* inner line, a little way in */}
              <path
                d="M 14 9 H 410 L 450 14 L 480 21 L 500 25 L 520 21 L 550 14 L 590 9 H 986 Q 994 9 994 22 V 978 Q 994 991 986 991 H 590 L 550 986 L 520 979 L 500 975 L 480 979 L 450 986 L 410 991 H 14 Q 6 991 6 978 V 22 Q 6 9 14 9 Z"
                fill="none"
                stroke="url(#toolingInk)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className="tome-stack" />
            <div className="tome-pages h-full">
              <GuestbookWindow onClose={() => closeWindow("guestbook")} onCoverChange={setGuestbookOnCover} />
            </div>
            <span className="tome-corner tl" />
            <span className="tome-corner tr" />
            <span className="tome-corner bl" />
            <span className="tome-corner br" />
          </div>
          </div>
        </div>
      )}

      {openWindows.has("academicWork") && (
        <Window
          title="Academic Work"
          onClose={() => closeWindow("academicWork")}
          defaultPosition={{ x: 20, y: 20 }}
          defaultSize={{ width: window.innerWidth - 40, height: window.innerHeight - 100 }}
          width="w-[95vw]"
          icon="🎓"
          zIndex={windowZIndex["academicWork"] || 10}
          onFocus={() => bringWindowToFront("academicWork")}
          isMinimized={minimizedWindows["academicWork"]}
          onMinimize={(minimized) => handleMinimize("academicWork", minimized)}
        >
          <div className="h-full">
            <AcademicWorkWindow onOpenFocusArea={openFocusAreaWindow} />
          </div>
        </Window>
      )}

      {openWindows.has("projects") && (
        <Window
          title="Projects"
          onClose={() => closeWindow("projects")}
          defaultPosition={{ x: 100, y: 80 }}
          defaultSize={{ width: 700, height: 500 }}
          width="w-[800px]"
          icon="🔧"
          zIndex={windowZIndex["projects"] || 10}
          onFocus={() => bringWindowToFront("projects")}
          isMinimized={minimizedWindows["projects"]}
          onMinimize={(minimized) => handleMinimize("projects", minimized)}
        >
          <ProjectsWindow />
        </Window>
      )}

      {/* News: a newspaper laid flat in the middle of the screen, closed by its dog-ear */}
      {openWindows.has("news") && !minimizedWindows["news"] && (
        <div
          className="fixed inset-0 bottom-10 flex items-center justify-center p-4"
          style={{ zIndex: windowZIndex["news"] || 10, background: "rgba(20, 20, 30, 0.25)" }}
          onMouseDown={(e) => {
            bringWindowToFront("news");
            if (e.target === e.currentTarget) closeIfSettled("news");
          }}
        >
          <div
            className="relative animate-fade-in"
            style={{
              width: "min(640px, 90vw)",
              height: "min(78vh, 760px)",
              transform: "rotate(-0.6deg)",
              filter: "drop-shadow(0 24px 34px rgba(0,0,0,0.42)) drop-shadow(0 6px 8px rgba(0,0,0,0.28)) drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
            }}
          >
            {/* the rest of the paper, peeking out behind the front page */}
            <div className="news-sheet" style={{ transform: "rotate(-1.4deg) translate(-7px, 5px)" }} />
            <div className="news-sheet" style={{ transform: "rotate(1.1deg) translate(8px, 7px)", filter: "brightness(0.94)" }} />
            <div className="news-sheet" style={{ transform: "rotate(2.2deg) translate(-3px, 11px)", filter: "brightness(0.88)" }} />
            <div className="news-sheet" style={{ transform: "rotate(-0.6deg) translate(12px, 3px)", filter: "brightness(0.97)" }} />
            {/* the front page, with its top-right corner cut away where the fold lifts */}
            <div
              className="h-full relative"
              style={{ clipPath: "polygon(0 0, calc(100% - 58px) 0, 100% 58px, 100% 100%, 0 100%)" }}
            >
              <NewsWindow />
              <div className="newsprint-relief" />
            </div>
            {/* dog-ear: the folded corner, click to close */}
            <button
              type="button"
              aria-label="Close the newspaper"
              title="Close"
              onClick={() => closeWindow("news")}
              className="dog-ear"
            />
          </div>
        </div>
      )}

      {/* Blog Windows */}
      {blogWindows.map((blog, index) => {
        // Define specific positions for each blog type
        const blogPositions: Record<string, { x: number; y: number }> = {
          "Software": { x: 300, y: 80 },
          "Research": { x: 450, y: 40 },
          "Community": { x: 320, y: 120 },
          "Activism": { x: 380, y: 140 },
        };

        const position = blogPositions[blog.name] || { x: 300 + index * 150, y: 80 + index * 100 };
        // Research has little content now, so give it a shorter window
        const blogSizes: Record<string, { width: number; height: number }> = {
          "Research": { width: 450, height: 450 },
          "Software": { width: 656, height: 489 },
        };
        const size = blogSizes[blog.name];

        return (
          <Window
            key={blog.id}
            title={blog.name}
            onClose={() => closeBlogWindow(blog.id)}
            defaultPosition={position}
            defaultSize={size}
            width="w-[450px]"
            icon={blogIcons[blog.name] || "📝"}
            zIndex={windowZIndex[blog.id] || 10}
            onFocus={() => bringWindowToFront(blog.id)}
            isMinimized={minimizedWindows[blog.id]}
            onMinimize={(minimized) => handleMinimize(blog.id, minimized)}
          >
            <BlogWindow
              blogName={blog.name}
              onOpenAcademicWork={() => openWindow("academicWork")}
            />
          </Window>
        );
      })}

      {/* Focus Area Windows */}
      {openFocusAreas.map((area, index) => {
        const windowId = `focus-${area.id}`;
        const baseX = 220 + (index % 4) * 40;
        const baseY = 80 + (index % 4) * 30;
        // Roughly 1/3 of a typical macOS viewport
        const fwidth = Math.min(560, typeof window !== "undefined" ? window.innerWidth - 40 : 560);
        const fheight = Math.min(620, typeof window !== "undefined" ? window.innerHeight - 100 : 620);
        return (
          <Window
            key={windowId}
            title={area.name}
            onClose={() => closeFocusAreaWindow(area.id)}
            defaultPosition={{ x: baseX, y: baseY }}
            defaultSize={{ width: fwidth, height: fheight }}
            width={`w-[${fwidth}px]`}
            icon={area.icon}
            zIndex={windowZIndex[windowId] || 10}
            onFocus={() => bringWindowToFront(windowId)}
            isMinimized={minimizedWindows[windowId]}
            onMinimize={(minimized) => handleMinimize(windowId, minimized)}
          >
            <FocusAreaWindow focusAreaId={area.id} />
          </Window>
        );
      })}

      {/* Start Menu */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onOpenBlog={openBlogWindow}
        onOpenWindow={openWindow}
      />

      {/* Taskbar */}
      <Taskbar
        onStartClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        windows={taskbarWindows}
        onWindowClick={handleWindowClick}
      />
    </div>
  );
};

export default Index;
