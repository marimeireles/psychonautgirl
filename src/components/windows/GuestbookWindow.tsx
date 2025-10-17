import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase, GuestbookEntry as SupabaseGuestbookEntry } from "@/lib/supabase";

interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export const GuestbookWindow = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries();
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
      toast.success("Thanks for signing the guestbook! ✨");
    } catch (error) {
      console.error('Error adding guestbook entry:', error);
      toast.error("Failed to add entry. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="win95-border bg-muted p-2 text-sm font-bold">
        📖 Sign My Guestbook
      </div>

      <form onSubmit={handleSubmit} className="win95-border-inset bg-muted p-3 space-y-2">
        <div>
          <label className="text-xs font-bold block mb-1">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full win95-border-inset bg-input px-2 py-1 text-sm"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold block mb-1">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full win95-border-inset bg-input px-2 py-1 text-sm resize-none"
            rows={3}
            placeholder="Leave a message..."
            required
          />
        </div>
        <button
          type="submit"
          className="win95-border bg-card hover:bg-muted px-4 py-1 text-sm font-bold active:win95-border-inset"
        >
          Sign Guestbook
        </button>
      </form>

      <div className="win95-border-inset bg-white p-2 max-h-60 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-4">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            No entries yet. Be the first to sign! ✨
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="win95-border bg-muted p-2 text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-primary">{entry.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs">{entry.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
