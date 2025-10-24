import { useEffect, useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { supabase, type CollaborativeDashboard } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Save,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("Anonymous");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const username = "Anonymous";
  const channelRef = useRef<RealtimeChannel | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start typing... ✨",
      }),
      Typography,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[calc(100vh-200px)] p-6 text-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save after 30 seconds of inactivity
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        handleSave(editor.getHTML());
      }, 30000);
    },
  });

  // Load initial content
  useEffect(() => {
    loadContent();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("collaborative_dashboard")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) throw error;

      if (data && editor) {
        editor.commands.setContent(data.content);
        setLastUpdatedBy(data.last_updated_by);
        setUpdatedAt(data.updated_at);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    channelRef.current = supabase
      .channel("collaborative_dashboard_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "collaborative_dashboard",
          filter: "id=eq.1",
        },
        (payload) => {
          const newData = payload.new as CollaborativeDashboard;

          // Only update if the change came from someone else
          if (newData.last_updated_by !== username && editor) {
            editor.commands.setContent(newData.content, false);
            setLastUpdatedBy(newData.last_updated_by);
            setUpdatedAt(newData.updated_at);
            toast.info(`Updated by ${newData.last_updated_by}`);
          }
        }
      )
      .subscribe();
  };

  const handleSave = useCallback(
    async (content: string) => {
      if (!content || saving) return;

      setSaving(true);
      try {
        const { error } = await supabase
          .from("collaborative_dashboard")
          .update({
            content,
            last_updated_by: username,
          })
          .eq("id", 1);

        if (error) throw error;

        setLastUpdatedBy(username);
        setUpdatedAt(new Date().toISOString());
      } catch (error) {
        console.error("Error saving:", error);
        toast.error("Failed to save changes");
      } finally {
        setSaving(false);
      }
    },
    [username, saving]
  );

  const handleManualSave = () => {
    if (editor) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      handleSave(editor.getHTML());
      toast.success("Saved!", {
        style: {
          background: "hsl(330, 100%, 95%)",
          color: "hsl(330, 70%, 40%)",
          border: "2px solid hsl(330, 85%, 65%)",
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="win95-border bg-card sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="win95-border p-2 hover:bg-accent bg-white flex items-center gap-2"
                title="Back to Home"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-bold hidden sm:inline">Home</span>
              </button>
              <h1 className="text-xl font-bold text-primary">
                📝 Collaborative Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Toolbar */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`win95-border p-1 hover:bg-accent ${
                  editor?.isActive("bold") ? "bg-primary/20" : "bg-white"
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`win95-border p-1 hover:bg-accent ${
                  editor?.isActive("italic") ? "bg-primary/20" : "bg-white"
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`win95-border p-1 hover:bg-accent ${
                  editor?.isActive("heading", { level: 1 })
                    ? "bg-primary/20"
                    : "bg-white"
                }`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`win95-border p-1 hover:bg-accent ${
                  editor?.isActive("heading", { level: 2 })
                    ? "bg-primary/20"
                    : "bg-white"
                }`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`win95-border p-1 hover:bg-accent ${
                  editor?.isActive("bulletList") ? "bg-primary/20" : "bg-white"
                }`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`win95-border p-1 hover:bg-accent ${
                  editor?.isActive("orderedList") ? "bg-primary/20" : "bg-white"
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`win95-border p-1 hover:bg-accent ${
                  editor?.isActive("blockquote") ? "bg-primary/20" : "bg-white"
                }`}
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                className="win95-border p-1 hover:bg-accent bg-white disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                className="win95-border p-1 hover:bg-accent bg-white disabled:opacity-50"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onClick={handleManualSave}
                disabled={saving}
                className="win95-border p-1 px-2 hover:bg-accent bg-white disabled:opacity-50 flex items-center gap-1"
                title="Save Now"
              >
                <Save className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">
                  {saving ? "Saving..." : "Save"}
                </span>
              </button>
            </div>

            {/* Last update info */}
            <div className="text-xs text-muted-foreground hidden md:block">
              {lastUpdatedBy !== username && (
                <span>Last updated by {lastUpdatedBy}</span>
              )}
              {updatedAt && (
                <span className="ml-2">
                  {new Date(updatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="mx-auto px-6">
        <div className="win95-border-inset bg-white my-6">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 win95-border bg-muted py-2 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-muted-foreground text-center">
            This is a collaborative space. Anyone can edit! Changes auto-save after
            30 seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
