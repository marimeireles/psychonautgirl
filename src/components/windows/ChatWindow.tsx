import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase, ChatMessage as SupabaseChatMessage } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: number;
  username: string;
  message: string;
  created_at: string;
}

const emotes = ["😊", "😂", "❤️", "👍", "🎨", "✨", "🌸", "🎵", "☕", "🌙"];

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("Anon");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    channelRef.current = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ username: username.trim() || "Anon", message: input.trim() }]);

      if (error) throw error;

      setInput("");
      toast.success("Message sent!");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const insertEmote = (emote: string) => {
    setInput(input + emote);
  };

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto">
      {/* Messages Area */}
      <div className="win95-border-inset bg-white flex-1 overflow-y-auto p-2 font-mono text-xs">
        {loading ? (
          <div className="text-center text-muted-foreground py-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No messages yet. Start the conversation! 💬
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-1">
              <span className="text-muted-foreground">
                [{new Date(msg.created_at).toLocaleTimeString()}]
              </span>{" "}
              <span className="font-bold text-primary">{msg.username}:</span>{" "}
              <span className="text-foreground">{msg.message}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emotes */}
      <div className="win95-border-inset bg-muted p-1 flex gap-1 flex-wrap">
        {emotes.map((emote) => (
          <button
            key={emote}
            onClick={() => insertEmote(emote)}
            className="win95-border bg-card hover:bg-muted-foreground/10 px-2 py-1 text-sm"
          >
            {emote}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="win95-border-inset bg-input px-2 py-1 w-24 text-sm"
          placeholder="Name"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="win95-border-inset bg-input px-2 py-1 flex-1 text-sm"
          placeholder="Say something..."
        />
        <button
          type="submit"
          className="win95-border bg-card hover:bg-muted px-3 py-1 active:win95-border-inset"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
