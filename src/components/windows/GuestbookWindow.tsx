import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase, GuestbookEntry as SupabaseGuestbookEntry } from "@/lib/supabase";

interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

const ENTRIES_PER_PAGE = 2;

export const GuestbookWindow = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchEntries();
    const timer = setTimeout(() => setBookOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching guestbook entries:', error);
      toast.error("Failed to load guestbook entries");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    try {
      const { data, error } = await supabase
        .from('guestbook')
        .insert([{ name: name.trim(), message: message.trim() }])
        .select()
        .single();

      if (error) throw error;

      setEntries([data, ...entries]);
      setName("");
      setMessage("");
      setPage(0);
      toast.success("Thanks for signing the guestbook!");
    } catch (error) {
      console.error('Error adding guestbook entry:', error);
      toast.error("Failed to add entry. Please try again.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(entries.length / ENTRIES_PER_PAGE));
  const pagedEntries = entries.slice(
    page * ENTRIES_PER_PAGE,
    (page + 1) * ENTRIES_PER_PAGE
  );

  const ruledLines = `repeating-linear-gradient(
    transparent,
    transparent 27px,
    #d8c8e844 27px,
    #d8c8e844 28px
  )`;

  const pageStyle = {
    background: ruledLines,
    backgroundPositionY: "12px",
  };

  // Shared entry rendering
  const renderEntry = (entry: GuestbookEntry) => (
    <div
      key={entry.id}
      className="pb-3 mb-3"
      style={{ borderBottom: "1px dashed #d8c8e888" }}
    >
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-bold" style={{ color: "hsl(330, 85%, 65%)", fontSize: "1.1em" }}>
          {entry.name}
        </span>
        <span style={{ color: "#b794c9", fontSize: "0.85em" }}>
          {new Date(entry.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="leading-relaxed" style={{ color: "#3d2248" }}>
        {entry.message}
      </p>
    </div>
  );

  // Shared form rendering
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 flex-shrink-0">
      <div>
        <label className="font-bold block mb-1" style={{ color: "#7d5a8e" }}>
          Name:
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent px-1 py-1 outline-none"
          style={{ borderBottom: "1px solid #b794c9", color: "#3d2248" }}
          placeholder="Your name"
          required
        />
      </div>
      <div>
        <label className="font-bold block mb-1" style={{ color: "#7d5a8e" }}>
          Message:
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-transparent px-1 py-1 resize-none outline-none"
          style={{
            borderBottom: "1px solid #b794c9",
            color: "#3d2248",
            backgroundImage: ruledLines,
            backgroundPositionY: "0px",
          }}
          rows={3}
          placeholder="Leave a message..."
          required
        />
      </div>
      <button
        type="submit"
        className="px-4 py-1.5 font-bold rounded-sm transition-colors"
        style={{ background: "hsl(330, 85%, 65%)", color: "#fff", border: "1px solid hsl(330, 85%, 55%)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(330, 85%, 72%)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(330, 85%, 65%)")}
      >
        Sign
      </button>
    </form>
  );

  const goToPrevPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (page > 0) setPage(page - 1);
  };

  const goToNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (page < totalPages - 1) setPage(page + 1);
  };

  // Page navigation
  const renderPageNav = () => (
    <div
      className="flex items-center justify-center gap-3 mt-auto pt-3 flex-shrink-0"
      style={{ borderTop: "1px solid #d8c8e844", position: "relative", zIndex: 5 }}
    >
      <button
        onMouseDown={goToPrevPage}
        disabled={page === 0}
        className="px-2 py-1 disabled:opacity-30 transition-opacity cursor-pointer"
        style={{ color: "#6b3a7d" }}
      >
        &laquo; prev
      </button>
      <span style={{ color: "#b794c9" }}>
        {page + 1} / {totalPages}
      </span>
      <button
        onMouseDown={goToNextPage}
        disabled={page >= totalPages - 1}
        className="px-2 py-1 disabled:opacity-30 transition-opacity cursor-pointer"
        style={{ color: "#6b3a7d" }}
      >
        next &raquo;
      </button>
    </div>
  );

  return (
    <div className="h-full w-full" style={{ perspective: "1500px" }}>
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background: "#f8f0ff",
          borderRadius: "2px 6px 6px 2px",
          boxShadow: "inset 2px 0 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Desktop: two-page spread */}
        <div
          className="hidden md:grid grid-cols-2 h-full"
          style={{ fontFamily: "'Caveat', 'Indie Flower', 'Patrick Hand', cursive", fontSize: "1.1rem" }}
        >
          {/* Left page — form */}
          <div
            className="flex flex-col p-5"
            style={{
              ...pageStyle,
              borderRight: "1px solid #d8c8e888",
              boxShadow: "inset -4px 0 8px -4px rgba(0,0,0,0.1)",
            }}
          >
            <h2 className="font-bold mb-4 text-center" style={{ color: "#6b3a7d", fontSize: "1.4em" }}>
              Sign the Guestbook
            </h2>
            {renderForm()}
          </div>

          {/* Right page — entries with pagination */}
          <div
            className="flex flex-col p-5"
            style={{
              ...pageStyle,
              boxShadow: "inset 4px 0 8px -4px rgba(0,0,0,0.1)",
            }}
          >
            <h2 className="font-bold mb-4 text-center" style={{ color: "#6b3a7d", fontSize: "1.4em" }}>
              Messages
            </h2>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4" style={{ color: "#b794c9" }}>
                  Loading...
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-4" style={{ color: "#b794c9" }}>
                  No entries yet. Be the first to sign!
                </div>
              ) : (
                <div className="space-y-2">
                  {pagedEntries.map(renderEntry)}
                </div>
              )}
            </div>

            {entries.length > ENTRIES_PER_PAGE && renderPageNav()}
          </div>
        </div>

        {/* Mobile: single column stacked */}
        <div
          className="md:hidden flex flex-col h-full overflow-y-auto"
          style={{ fontFamily: "'Caveat', 'Indie Flower', 'Patrick Hand', cursive", fontSize: "1.1rem", ...pageStyle }}
        >
          <div className="p-4">
            <h2 className="font-bold mb-4 text-center" style={{ color: "#6b3a7d", fontSize: "1.4em" }}>
              Sign the Guestbook
            </h2>
            {renderForm()}
          </div>

          <div className="p-4" style={{ borderTop: "1px solid #d8c8e888" }}>
            <h2 className="font-bold mb-4 text-center" style={{ color: "#6b3a7d", fontSize: "1.4em" }}>
              Messages
            </h2>

            {loading ? (
              <div className="text-center text-sm py-4" style={{ color: "#b794c9" }}>
                Loading...
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center text-sm py-4" style={{ color: "#b794c9" }}>
                No entries yet. Be the first to sign!
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {pagedEntries.map(renderEntry)}
                </div>
                {entries.length > ENTRIES_PER_PAGE && renderPageNav()}
              </>
            )}
          </div>
        </div>

        {/* Book cover — flips open on mount */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #6b3a7d 0%, #8b4a9e 30%, #7d4090 70%, #5c2a6e 100%)",
            borderRadius: "2px 6px 6px 2px",
            transformOrigin: "left center",
            transform: bookOpen ? "rotateY(-180deg)" : "rotateY(0deg)",
            transition: "transform 0.8s ease-in-out",
            backfaceVisibility: "hidden",
            boxShadow: bookOpen
              ? "none"
              : "2px 2px 10px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)",
            border: "2px solid #4a1f5c",
            zIndex: bookOpen ? -1 : 10,
            pointerEvents: bookOpen ? "none" : "auto",
          }}
        >
          <div
            className="text-center px-6"
            style={{ border: "2px solid #d4a0e055", padding: "30px 40px", borderRadius: "2px" }}
          >
            <div
              className="text-2xl font-bold tracking-wide mb-2"
              style={{
                color: "#f0c0e0",
                fontFamily: "Georgia, serif",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              Guestbook
            </div>
            <div className="text-xs tracking-widest uppercase" style={{ color: "#d4a0e0" }}>
              Please sign
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
