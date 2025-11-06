import { useState } from "react";
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
import { ReadingListWindow } from "@/components/windows/ReadingListWindow";
import { JobPopupWindow } from "@/components/windows/JobPopupWindow";
import { AcademicWorkWindow } from "@/components/windows/AcademicWorkWindow";
import { BubbleBackground } from "@/components/BubbleBackground";
import desktopBg from "@/assets/desktop-bg.jpg";

type WindowType = "paint" | "chat" | "about" | "gallery" | "guestbook" | "readingList" | "jobPopup" | "academicWork";

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
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [windowZIndex, setWindowZIndex] = useState<Record<string, number>>({ about: 13, "software-1": 11, "research-1": 12, jobPopup: 20 });
  const [topZIndex, setTopZIndex] = useState(20);
  const [minimizedWindows, setMinimizedWindows] = useState<Record<string, boolean>>({});

  const openWindow = (window: WindowType) => {
    setOpenWindows(new Set(openWindows).add(window));
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
      bringWindowToFront(existingBlog.id);
    }
  };

  const closeBlogWindow = (id: string) => {
    setBlogWindows(blogWindows.filter(b => b.id !== id));
    const newZIndex = { ...windowZIndex };
    delete newZIndex[id];
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
    readingList: { title: "Reading List", icon: "📚" },
    jobPopup: { title: "Looking for Opportunities!", icon: "✨" },
    academicWork: { title: "Academic Work", icon: "🎓" },
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

      {/* Desktop Icons */}
      <div className="hidden md:flex absolute top-4 left-4 flex-col gap-4 z-10">
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
          icon="🔬"
          label="Research"
          onClick={() => openBlogWindow("Research")}
        />
        <DesktopIcon
          icon="🎓"
          label="Academic Work"
          onClick={() => openWindow("academicWork")}
        />
        <DesktopIcon
          icon="📚"
          label="Reading List"
          onClick={() => openWindow("readingList")}
        />
        <DesktopIcon
          icon="🌸"
          label="About"
          onClick={() => openWindow("about")}
        />
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
          width="w-[500px]"
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
          defaultPosition={{ x: 150, y: 100 }}
          defaultSize={{ width: 439, height: 590 }}
          width="w-96"
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

      {openWindows.has("guestbook") && (
        <Window
          title="Guestbook"
          onClose={() => closeWindow("guestbook")}
          defaultPosition={{ x: 40, y: 150 }}
          width="w-[400px]"
          icon="📖"
          zIndex={windowZIndex["guestbook"] || 10}
          onFocus={() => bringWindowToFront("guestbook")}
          isMinimized={minimizedWindows["guestbook"]}
          onMinimize={(minimized) => handleMinimize("guestbook", minimized)}
        >
          <GuestbookWindow />
        </Window>
      )}

      {openWindows.has("readingList") && (
        <Window
          title="Reading List"
          onClose={() => closeWindow("readingList")}
          defaultPosition={{ x: 50, y: 100 }}
          defaultSize={{ width: 600, height: 600 }}
          width="w-[800px]"
          icon="📚"
          zIndex={windowZIndex["readingList"] || 10}
          onFocus={() => bringWindowToFront("readingList")}
          isMinimized={minimizedWindows["readingList"]}
          onMinimize={(minimized) => handleMinimize("readingList", minimized)}
        >
          <ReadingListWindow />
        </Window>
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
            <AcademicWorkWindow />
          </div>
        </Window>
      )}

      {/* Blog Windows */}
      {blogWindows.map((blog, index) => {
        // Define specific positions for each blog type
        const blogPositions: Record<string, { x: number; y: number }> = {
          "Software": { x: 300, y: 80 },
          "Research": { x: 450, y: 180 },
          "Community": { x: 320, y: 120 },
          "Activism": { x: 380, y: 140 },
        };

        const position = blogPositions[blog.name] || { x: 300 + index * 150, y: 80 + index * 100 };

        return (
          <Window
            key={blog.id}
            title={blog.name}
            onClose={() => closeBlogWindow(blog.id)}
            defaultPosition={position}
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
