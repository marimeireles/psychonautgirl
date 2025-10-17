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
import { BubbleBackground } from "@/components/BubbleBackground";
import desktopBg from "@/assets/desktop-bg.jpg";

type WindowType = "paint" | "chat" | "about" | "gallery" | "guestbook";

interface BlogWindow {
  id: string;
  name: string;
}

const Index = () => {
  const [openWindows, setOpenWindows] = useState<Set<WindowType>>(new Set(["about"]));
  const [blogWindows, setBlogWindows] = useState<BlogWindow[]>([
    { id: "software-1", name: "Software" },
    { id: "research-1", name: "Research" }
  ]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [windowZIndex, setWindowZIndex] = useState<Record<string, number>>({ about: 13, "software-1": 11, "research-1": 12 });
  const [topZIndex, setTopZIndex] = useState(13);
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
  };

  // Build taskbar windows list
  const blogIcons: Record<string, string> = {
    "Software": "💻",
    "Research": "🔬",
    "Community": "🌸",
    "Activism": "✊",
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
      <BubbleBackground />

      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col gap-4 z-10">
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
          icon="📚"
          label="Reading List"
          onClick={() => window.open('/reading-list.html', '_blank')}
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
          defaultPosition={{ x: 100, y: 50 }}
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
          defaultPosition={{ x: 600, y: 50 }}
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

      {openWindows.has("gallery") && (
        <Window
          title="My Art Gallery"
          onClose={() => closeWindow("gallery")}
          defaultPosition={{ x: 650, y: 100 }}
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
          defaultPosition={{ x: 200, y: 150 }}
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

      {/* Blog Windows */}
      {blogWindows.map((blog, index) => (
        <Window
          key={blog.id}
          title={blog.name}
          onClose={() => closeBlogWindow(blog.id)}
          defaultPosition={{ x: 300 + index * 150, y: 80 + index * 100 }}
          width="w-[450px]"
          icon={blogIcons[blog.name] || "📝"}
          zIndex={windowZIndex[blog.id] || 10}
          onFocus={() => bringWindowToFront(blog.id)}
          isMinimized={minimizedWindows[blog.id]}
          onMinimize={(minimized) => handleMinimize(blog.id, minimized)}
        >
          <BlogWindow blogName={blog.name} />
        </Window>
      ))}

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
