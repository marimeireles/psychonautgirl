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

const emotes = ["👹", "🫪", "👽", "🥰", "☠️", "👻", "☁️", "🫧", "🪷", "🌌"];
const ROOM = "#psychonautgirl";
const NUDGE_COOLDOWN_MS = 8000;

type ConnState = "connecting" | "online" | "offline";

// A tiny window being rattled: the nudge button icon
const NudgeIcon = () => (
  <svg width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <rect x="5" y="3" width="8" height="10" rx="0.5" />
    <path d="M5 5.6h8" />
    <path d="M2.4 5.2c-.9 1.2-.9 4.4 0 5.6" />
    <path d="M15.6 5.2c.9 1.2.9 4.4 0 5.6" />
    <path d="M.9 3.6C-.4 6 -.4 10 .9 12.4" strokeWidth="1.1" opacity="0.55" />
    <path d="M17.1 3.6c1.3 2.4 1.3 6.4 0 8.8" strokeWidth="1.1" opacity="0.55" />
  </svg>
);

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("Anon");
  const [loading, setLoading] = useState(true);
  const [conn, setConn] = useState<ConnState>("connecting");
  const [online, setOnline] = useState(0);
  const [nudgeReadyAt, setNudgeReadyAt] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const usernameRef = useRef(username);
  usernameRef.current = username;
  const localId = useRef(Math.random().toString(36).slice(2, 10));

  // Rattle the window this chat lives in
  const shake = () => {
    const win = rootRef.current?.closest<HTMLElement>("[data-window]");
    if (!win) return;
    win.classList.remove("window-nudge");
    void win.offsetWidth; // restart the animation if one is still running
    win.classList.add("window-nudge");
    win.addEventListener("animationend", () => win.classList.remove("window-nudge"), { once: true });
  };

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
    const channel = supabase.channel('chat_messages', {
      config: {
        presence: { key: localId.current },
        broadcast: { self: true },
      },
    });

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      // who's here
      .on('presence', { event: 'sync' }, () => {
        setOnline(Object.keys(channel.presenceState()).length);
      })
      // nudges
      .on('broadcast', { event: 'nudge' }, () => {
        shake();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConn("online");
          await channel.track({ username: usernameRef.current.trim() || "Anon" });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConn("offline");
        }
      });

    channelRef.current = channel;
  };

  // Keep presence name in sync with the name box
  useEffect(() => {
    if (conn !== "online") return;
    const t = setTimeout(() => {
      channelRef.current?.track({ username: username.trim() || "Anon" });
    }, 600);
    return () => clearTimeout(t);
  }, [username, conn]);

  const sendNudge = () => {
    const now = Date.now();
    if (now < nudgeReadyAt) {
      toast(`Craving is the root of suffering. Next nudge in ${Math.ceil((nudgeReadyAt - now) / 1000)}s.`);
      return;
    }
    setNudgeReadyAt(now + NUDGE_COOLDOWN_MS);
    channelRef.current?.send({
      type: 'broadcast',
      event: 'nudge',
      payload: { username: username.trim() || "Anon" },
    });
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
    <div ref={rootRef} className="flex flex-col gap-2 h-full overflow-y-auto">
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
        <button
          type="button"
          onClick={sendNudge}
          title="Send a nudge"
          className="win95-border bg-card hover:bg-muted px-2 py-1 active:win95-border-inset"
        >
          <NudgeIcon />
        </button>
      </form>

      {/* Status bar */}
      <div className="win95-border-inset bg-muted px-2 py-0.5 flex items-center gap-3 text-xs font-mono select-none">
        <span className="flex items-center gap-1">
          <span
            className={`inline-block w-2 h-2 rounded-full border border-black/40 ${
              conn === "online" ? "bg-green-500" : conn === "connecting" ? "bg-yellow-400" : "bg-red-500"
            }`}
          />
          {conn === "online" ? "Connected" : conn === "connecting" ? "Connecting…" : "Disconnected"}
        </span>
        <span className="border-l border-black/20 pl-3">
          {online} online
        </span>
        <span className="border-l border-black/20 pl-3 ml-auto">{ROOM}</span>
      </div>
    </div>
  );
};
