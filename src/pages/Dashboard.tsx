import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, type CollaborativeDashboard } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Save, Home, Edit, Eye, Bold, Italic, Code, Heading1, Heading2, Heading3, Highlighter, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("Anonymous");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const username = "Anonymous";
  const channelRef = useRef<RealtimeChannel | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

      if (data) {
        // Check if content is HTML (from old TipTap) and convert to plain text
        let contentToSet = data.content || "";

        // If content has HTML tags, strip them for now
        if (contentToSet.includes('<') && contentToSet.includes('>')) {
          console.log("Found HTML content, converting to plain text");
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = contentToSet;
          contentToSet = tempDiv.textContent || tempDiv.innerText || "";
        }

        setContent(contentToSet);
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
          if (newData.last_updated_by !== username) {
            let contentToSet = newData.content || "";

            // Strip HTML if present
            if (contentToSet.includes('<') && contentToSet.includes('>')) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = contentToSet;
              contentToSet = tempDiv.textContent || tempDiv.innerText || "";
            }

            setContent(contentToSet);
            setLastUpdatedBy(newData.last_updated_by);
            setUpdatedAt(newData.updated_at);
            toast.info(`Updated by ${newData.last_updated_by}`);
          }
        }
      )
      .subscribe();
  };

  const handleSave = useCallback(
    async (contentToSave: string) => {
      if (saving) return;

      setSaving(true);
      try {
        const { error } = await supabase
          .from("collaborative_dashboard")
          .update({
            content: contentToSave,
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

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleDoneEditing = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    handleSave(content);
    setIsEditing(false);
    toast.success("Saved!", {
      style: {
        background: "hsl(330, 100%, 95%)",
        color: "hsl(330, 70%, 40%)",
        border: "2px solid hsl(330, 85%, 65%)",
      },
    });
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);
    handleContentChange(newText);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => insertMarkdown('**', '**');
  const formatItalic = () => insertMarkdown('*', '*');
  const formatCode = () => insertMarkdown('`', '`');
  const formatH1 = () => insertMarkdown('# ', '');
  const formatH2 = () => insertMarkdown('## ', '');
  const formatH3 = () => insertMarkdown('### ', '');
  const formatHighlight = () => insertMarkdown('<mark style="background-color: #ffb3d9;">', '</mark>');
  const formatLighterColor = () => insertMarkdown('<span style="color: #d4a5d4;">', '</span>');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
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

            {/* Edit/Done Button */}
            <button
              onClick={isEditing ? handleDoneEditing : () => setIsEditing(true)}
              disabled={saving}
              className={`win95-border px-3 py-1.5 text-sm hover:bg-accent ${
                isEditing ? "bg-primary/20" : "bg-white"
              } disabled:opacity-50 flex items-center gap-2`}
              title={isEditing ? "Done Editing" : "Edit"}
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              <span>{isEditing ? (saving ? "Saving..." : "Done") : "Edit"}</span>
            </button>
          </div>

          {/* Formatting Toolbar - Only show when editing */}
          {isEditing && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={formatBold}
                  className="win95-border p-1 hover:bg-accent bg-white"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={formatItalic}
                  className="win95-border p-1 hover:bg-accent bg-white"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={formatCode}
                  className="win95-border p-1 hover:bg-accent bg-white"
                  title="Inline Code"
                >
                  <Code className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  onClick={formatHighlight}
                  className="win95-border p-1 hover:bg-accent bg-white"
                  title="Highlight (Light Pink)"
                >
                  <Highlighter className="w-4 h-4" />
                </button>
                <button
                  onClick={formatLighterColor}
                  className="win95-border p-1 hover:bg-accent bg-white"
                  title="Lighter Color Text"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  onClick={formatH1}
                  className="win95-border p-1 hover:bg-accent bg-white"
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  onClick={formatH2}
                  className="win95-border p-1 hover:bg-accent bg-white"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  onClick={formatH3}
                  className="win95-border p-1 hover:bg-accent bg-white"
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
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
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {isEditing ? (
          /* Edit Mode */
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="win95-border-inset w-full min-h-[calc(100vh-250px)] p-6 text-sm resize-none bg-white font-mono"
            placeholder="Start typing... Markdown supported: [link](url), **bold**, `code`, etc."
            autoFocus
          />
        ) : (
          /* View Mode - Rendered Markdown */
          <div className="win95-border bg-white p-8 min-h-[calc(100vh-250px)]">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No content yet. Click "Edit" to start writing.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 win95-border bg-muted py-2 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-muted-foreground text-center">
            Collaborative space. Click "Edit" to write markdown. Click "Done" to save.
            Markdown: [link](url), **bold**, `code`, ```js code blocks ```
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
