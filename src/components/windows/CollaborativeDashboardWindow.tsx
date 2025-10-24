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
} from "lucide-react";

export const CollaborativeDashboardWindow = () => {
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
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-3 text-foreground",
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
      toast.success("Saved!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="win95-border-inset bg-muted p-2 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            {lastUpdatedBy !== "Anonymous" && (
              <span>Last updated by {lastUpdatedBy}</span>
            )}
            {updatedAt && (
              <span className="ml-2">
                {new Date(updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`win95-border p-1 hover:bg-accent ${
              editor?.isActive("bold") ? "bg-primary/20" : "bg-card"
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`win95-border p-1 hover:bg-accent ${
              editor?.isActive("italic") ? "bg-primary/20" : "bg-card"
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
              editor?.isActive("heading", { level: 1 }) ? "bg-primary/20" : "bg-card"
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
              editor?.isActive("heading", { level: 2 }) ? "bg-primary/20" : "bg-card"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`win95-border p-1 hover:bg-accent ${
              editor?.isActive("bulletList") ? "bg-primary/20" : "bg-card"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`win95-border p-1 hover:bg-accent ${
              editor?.isActive("orderedList") ? "bg-primary/20" : "bg-card"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`win95-border p-1 hover:bg-accent ${
              editor?.isActive("blockquote") ? "bg-primary/20" : "bg-card"
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="win95-border p-1 hover:bg-accent bg-card disabled:opacity-50"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="win95-border p-1 hover:bg-accent bg-card disabled:opacity-50"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={handleManualSave}
            disabled={saving}
            className="win95-border p-1 px-2 hover:bg-accent bg-card disabled:opacity-50 flex items-center gap-1"
            title="Save Now"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs">{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 win95-border-inset bg-white overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="win95-border-inset bg-muted p-2 text-xs text-muted-foreground">
        <p>
          This is a collaborative space. Anyone can edit! Changes auto-save after
          30 seconds.
        </p>
      </div>
    </div>
  );
};
