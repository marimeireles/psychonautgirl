import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, type Flashcard } from "@/lib/supabase";
import { toast } from "sonner";
import { Home, Plus, Library, TrendingUp, Eye, EyeOff, Trash2, Edit2, Code } from "lucide-react";
import { DolphinSR } from "dolphinsr";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type Rating = "easy" | "good" | "hard" | "again";

interface DolphinCard {
  master: string;
  combination: number;
  front?: string;
  back?: string;
}

const Anki = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [dolphin, setDolphin] = useState<DolphinSR | null>(null);
  const [currentCard, setCurrentCard] = useState<DolphinCard | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [view, setView] = useState<"review" | "library" | "add">("review");

  // Form states
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  // Statistics
  const [stats, setStats] = useState({ due: 0, later: 0, learning: 0, overdue: 0 });

  // Initialize DolphinSR and load cards
  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const cards = data || [];
      setFlashcards(cards);

      // Initialize DolphinSR
      const d = new DolphinSR();

      // Add all cards as masters to DolphinSR
      const masters = cards.map((card) => ({
        id: card.id,
        combinations: [{ front: [0], back: [1] }],
        fields: [card.front, card.back],
      }));

      if (masters.length > 0) {
        d.addMasters(...masters);
      }

      setDolphin(d);

      // Get first card and stats
      const nextCard = d.nextCard();
      if (nextCard) {
        const cardData = cards.find(c => c.id === nextCard.master);
        setCurrentCard({
          ...nextCard,
          front: cardData?.front,
          back: cardData?.back,
        });
      }

      setStats(d.summary());
    } catch (error) {
      console.error("Error loading flashcards:", error);
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating: Rating) => {
    if (!dolphin || !currentCard) return;

    try {
      // Submit review to DolphinSR
      dolphin.addReviews({
        master: currentCard.master,
        combination: currentCard.combination,
        ts: new Date(),
        rating,
      });

      // Save review to database
      await supabase.from("flashcard_reviews").insert({
        card_id: currentCard.master,
        rating,
        reviewed_at: new Date().toISOString(),
        dolphin_state: {}, // You could serialize the dolphin state here if needed
      });

      // Get next card
      const nextCard = dolphin.nextCard();
      if (nextCard) {
        const cardData = flashcards.find(c => c.id === nextCard.master);
        setCurrentCard({
          ...nextCard,
          front: cardData?.front,
          back: cardData?.back,
        });
        setShowBack(false);
      } else {
        setCurrentCard(null);
        toast.success("All cards reviewed for now!");
      }

      // Update stats
      setStats(dolphin.summary());
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const handleAddCard = async () => {
    if (!newFront.trim() || !newBack.trim()) {
      toast.error("Please fill in both front and back");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("flashcards")
        .insert({
          front: newFront,
          back: newBack,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Card added!");
      setNewFront("");
      setNewBack("");

      // Reload to refresh DolphinSR
      loadFlashcards();
      setView("review");
    } catch (error) {
      console.error("Error adding card:", error);
      toast.error("Failed to add card");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;

      toast.success("Card deleted!");
      loadFlashcards();
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Failed to delete card");
    }
  };

  const handleUpdateCard = async () => {
    if (!editingCard || !newFront.trim() || !newBack.trim()) return;

    try {
      const { error } = await supabase
        .from("flashcards")
        .update({
          front: newFront,
          back: newBack,
        })
        .eq("id", editingCard.id);

      if (error) throw error;

      toast.success("Card updated!");
      setEditingCard(null);
      setNewFront("");
      setNewBack("");
      loadFlashcards();
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Failed to update card");
    }
  };

  const startEdit = (card: Flashcard) => {
    setEditingCard(card);
    setNewFront(card.front);
    setNewBack(card.back);
    setView("add");
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setNewFront("");
    setNewBack("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading flashcards...</p>
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
                🎴 Anki Flashcards
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("review")}
              className={`win95-border px-3 py-1.5 text-sm flex items-center gap-2 ${
                view === "review" ? "bg-primary/20" : "bg-white hover:bg-accent"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Review
            </button>
            <button
              onClick={() => setView("library")}
              className={`win95-border px-3 py-1.5 text-sm flex items-center gap-2 ${
                view === "library" ? "bg-primary/20" : "bg-white hover:bg-accent"
              }`}
            >
              <Library className="w-4 h-4" />
              Library
            </button>
            <button
              onClick={() => {
                setView("add");
                cancelEdit();
              }}
              className={`win95-border px-3 py-1.5 text-sm flex items-center gap-2 ${
                view === "add" ? "bg-primary/20" : "bg-white hover:bg-accent"
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
          </div>

          {/* Stats */}
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span>📚 Total: {flashcards.length}</span>
            <span>🔴 Due: {stats.due}</span>
            <span>📖 Learning: {stats.learning}</span>
            <span>⏰ Overdue: {stats.overdue}</span>
            <span>✅ Later: {stats.later}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {view === "review" && (
          <div className="space-y-6">
            {currentCard ? (
              <>
                {/* Card Display */}
                <div className="win95-border bg-white p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-6 w-full">
                    <div className="text-sm text-muted-foreground mb-4">
                      {showBack ? "Back" : "Front"}
                    </div>

                    <div className="text-2xl font-medium px-4">
                      <MarkdownRenderer
                        content={currentCard.front || ""}
                        className="prose-lg text-left"
                      />
                    </div>

                    {showBack && (
                      <div className="border-t-2 border-primary/20 pt-6 mt-6">
                        <div className="text-xl text-primary px-4">
                          <MarkdownRenderer
                            content={currentCard.back || ""}
                            className="prose-lg text-left"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!showBack ? (
                  <button
                    onClick={() => setShowBack(true)}
                    className="win95-border w-full p-4 bg-primary/10 hover:bg-primary/20 font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Show Answer
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      How well did you know this?
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleRating("again")}
                        className="win95-border p-3 bg-red-50 hover:bg-red-100 border-red-300"
                      >
                        <div className="text-sm font-medium">Again</div>
                        <div className="text-xs text-muted-foreground">&lt;1m</div>
                      </button>
                      <button
                        onClick={() => handleRating("hard")}
                        className="win95-border p-3 bg-orange-50 hover:bg-orange-100 border-orange-300"
                      >
                        <div className="text-sm font-medium">Hard</div>
                        <div className="text-xs text-muted-foreground">&lt;10m</div>
                      </button>
                      <button
                        onClick={() => handleRating("good")}
                        className="win95-border p-3 bg-green-50 hover:bg-green-100 border-green-300"
                      >
                        <div className="text-sm font-medium">Good</div>
                        <div className="text-xs text-muted-foreground">1d</div>
                      </button>
                      <button
                        onClick={() => handleRating("easy")}
                        className="win95-border p-3 bg-blue-50 hover:bg-blue-100 border-blue-300"
                      >
                        <div className="text-sm font-medium">Easy</div>
                        <div className="text-xs text-muted-foreground">4d</div>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="win95-border bg-white p-12 text-center">
                <p className="text-lg font-medium text-muted-foreground mb-4">
                  🎉 All caught up!
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  No cards due for review right now.
                </p>
                <button
                  onClick={() => setView("add")}
                  className="win95-border px-4 py-2 bg-primary/10 hover:bg-primary/20 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Card
                </button>
              </div>
            )}
          </div>
        )}

        {view === "library" && (
          <div className="space-y-4">
            <div className="win95-border bg-card p-4">
              <h2 className="font-bold mb-2">Card Library</h2>
              <p className="text-sm text-muted-foreground">
                Manage your flashcard collection
              </p>
            </div>

            {flashcards.length === 0 ? (
              <div className="win95-border bg-white p-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  No flashcards yet. Create your first card to get started!
                </p>
                <button
                  onClick={() => setView("add")}
                  className="win95-border px-4 py-2 bg-primary/10 hover:bg-primary/20 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Card
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {flashcards.map((card) => (
                  <div
                    key={card.id}
                    className="win95-border bg-white p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="text-sm font-medium">
                          <MarkdownRenderer content={card.front} />
                        </div>
                        <div className="text-sm text-muted-foreground border-t pt-2">
                          <MarkdownRenderer content={card.back} />
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(card)}
                          className="win95-border p-2 bg-white hover:bg-accent"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="win95-border p-2 bg-white hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "add" && (
          <div className="space-y-4">
            <div className="win95-border bg-card p-4">
              <h2 className="font-bold mb-2 flex items-center gap-2">
                <Code className="w-5 h-5" />
                {editingCard ? "Edit Card" : "Add New Card"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {editingCard
                  ? "Update the flashcard content (supports Markdown & syntax highlighting)"
                  : "Create a new flashcard with Markdown & code syntax highlighting"}
              </p>
            </div>

            <div className="win95-border bg-white p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Front (Question)
                  <span className="text-xs text-muted-foreground font-normal">
                    • Markdown supported
                  </span>
                </label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="win95-border-inset w-full p-3 text-sm resize-none bg-white font-mono"
                  rows={6}
                  placeholder="Enter the question or prompt...&#10;&#10;Use markdown: **bold**, `code`, etc.&#10;&#10;Code blocks:&#10;```javascript&#10;const x = 42;&#10;```"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Back (Answer)
                  <span className="text-xs text-muted-foreground font-normal">
                    • Markdown supported
                  </span>
                </label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="win95-border-inset w-full p-3 text-sm resize-none bg-white font-mono"
                  rows={6}
                  placeholder="Enter the answer...&#10;&#10;Use markdown: **bold**, `code`, etc.&#10;&#10;Code blocks:&#10;```python&#10;print('hello')&#10;```"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={editingCard ? handleUpdateCard : handleAddCard}
                  className="win95-border flex-1 px-4 py-3 bg-primary/10 hover:bg-primary/20 font-medium"
                >
                  {editingCard ? "Update Card" : "Add Card"}
                </button>
                {editingCard && (
                  <button
                    onClick={cancelEdit}
                    className="win95-border px-4 py-3 bg-white hover:bg-accent"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="win95-border bg-card p-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Markdown Tips:</strong>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• Code blocks: <code className="bg-muted px-1">```language</code> (supports JS, Python, etc.)</li>
                <li>• Inline code: <code className="bg-muted px-1">`code here`</code></li>
                <li>• Bold: <code className="bg-muted px-1">**bold text**</code></li>
                <li>• Lists: Use <code className="bg-muted px-1">-</code> or <code className="bg-muted px-1">1.</code></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Anki;
