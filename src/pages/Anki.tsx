import { useEffect, useState } from "react";
import { supabase, type AnkiDeck, type AnkiCard } from "@/lib/supabase";
import { toast } from "sonner";
import { Home, Plus, Trash2, BookOpen, Brain, BarChart3, Plus as PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateSM2, getDueCards, formatInterval } from "@/lib/sm2";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type View = "decks" | "review" | "create-deck" | "create-card" | "browse-cards" | "edit-card" | "stats";

const Anki = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("decks");
  const [decks, setDecks] = useState<AnkiDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<AnkiDeck | null>(null);
  const [cards, setCards] = useState<AnkiCard[]>([]);
  const [currentCard, setCurrentCard] = useState<AnkiCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [deckStats, setDeckStats] = useState<{ [key: string]: { total: number; due: number; new: number } }>({});

  // Form states
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [editingCard, setEditingCard] = useState<AnkiCard | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const { data, error } = await supabase
        .from("anki_decks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDecks(data || []);

      // Load stats for each deck
      await loadDeckStats(data || []);
    } catch (error) {
      console.error("Error loading decks:", error);
      toast.error("Failed to load decks");
    } finally {
      setLoading(false);
    }
  };

  const loadDeckStats = async (decksToLoad: AnkiDeck[]) => {
    const stats: { [key: string]: { total: number; due: number; new: number } } = {};

    for (const deck of decksToLoad) {
      const { data, error } = await supabase
        .from("anki_cards")
        .select("*")
        .eq("deck_id", deck.id);

      if (!error && data) {
        const dueCards = getDueCards(data);
        const newCards = data.filter(c => c.state === "new");
        stats[deck.id] = {
          total: data.length,
          due: dueCards.length,
          new: newCards.length,
        };
      }
    }

    setDeckStats(stats);
  };

  const createDeck = async () => {
    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("anki_decks")
        .insert([{ name: deckName, description: deckDescription }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Deck created!");
      setDecks([data, ...decks]);
      setDeckName("");
      setDeckDescription("");
      setView("decks");
    } catch (error) {
      console.error("Error creating deck:", error);
      toast.error("Failed to create deck");
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!confirm("Are you sure? This will delete all cards in this deck.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("anki_decks")
        .delete()
        .eq("id", deckId);

      if (error) throw error;

      toast.success("Deck deleted");
      setDecks(decks.filter(d => d.id !== deckId));
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null);
      }
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast.error("Failed to delete deck");
    }
  };

  const createCard = async () => {
    if (!selectedDeck) {
      toast.error("Please select a deck first");
      return;
    }

    if (!cardFront.trim() || !cardBack.trim()) {
      toast.error("Please fill in both front and back of the card");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("anki_cards")
        .insert([{
          deck_id: selectedDeck.id,
          front: cardFront,
          back: cardBack,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Card created!");
      setCardFront("");
      setCardBack("");
      setCards([...cards, data]);

      // Update stats
      await loadDeckStats(decks);
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Failed to create card");
    }
  };

  const loadCardsForDeck = async (deck: AnkiDeck) => {
    try {
      const { data, error } = await supabase
        .from("anki_cards")
        .select("*")
        .eq("deck_id", deck.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCards(data || []);
      setSelectedDeck(deck);
      setView("browse-cards");
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Failed to load cards");
    }
  };

  const updateCard = async () => {
    if (!editingCard) return;

    if (!cardFront.trim() || !cardBack.trim()) {
      toast.error("Please fill in both front and back of the card");
      return;
    }

    try {
      const { error } = await supabase
        .from("anki_cards")
        .update({
          front: cardFront,
          back: cardBack,
        })
        .eq("id", editingCard.id);

      if (error) throw error;

      toast.success("Card updated!");

      // Update the card in the local state
      setCards(cards.map(c =>
        c.id === editingCard.id
          ? { ...c, front: cardFront, back: cardBack }
          : c
      ));

      setCardFront("");
      setCardBack("");
      setEditingCard(null);
      setView("browse-cards");

      // Update stats
      await loadDeckStats(decks);
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Failed to update card");
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("anki_cards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;

      toast.success("Card deleted");
      setCards(cards.filter(c => c.id !== cardId));

      // Update stats
      await loadDeckStats(decks);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Failed to delete card");
    }
  };

  const startEditCard = (card: AnkiCard) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setView("edit-card");
  };

  const startReview = async (deck: AnkiDeck) => {
    try {
      const { data, error } = await supabase
        .from("anki_cards")
        .select("*")
        .eq("deck_id", deck.id);

      if (error) throw error;

      const dueCards = getDueCards(data || []);

      if (dueCards.length === 0) {
        toast.info("No cards due for review!");
        return;
      }

      setCards(dueCards);
      setCurrentCard(dueCards[0]);
      setSelectedDeck(deck);
      setShowAnswer(false);
      setView("review");
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Failed to load cards");
    }
  };

  const answerCard = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;

    try {
      // Calculate new parameters using SM-2
      const result = calculateSM2(currentCard, rating);

      // Update card in database
      const { error } = await supabase
        .from("anki_cards")
        .update({
          ease_factor: result.ease_factor,
          interval: result.interval,
          repetitions: result.repetitions,
          due_date: result.due_date.toISOString(),
          state: result.state,
        })
        .eq("id", currentCard.id);

      if (error) throw error;

      // Log review
      await supabase
        .from("anki_reviews")
        .insert([{
          card_id: currentCard.id,
          rating,
        }]);

      // Move to next card
      const remainingCards = cards.filter(c => c.id !== currentCard.id);

      if (remainingCards.length === 0) {
        toast.success("Review session complete! 🎉");
        setView("decks");
        setCurrentCard(null);
        await loadDeckStats(decks);
      } else {
        setCurrentCard(remainingCards[0]);
        setCards(remainingCards);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Failed to save review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading Anki...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="win95-border bg-card sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="win95-border p-2 hover:bg-accent bg-white flex items-center gap-2"
                title="Back to Home"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-bold hidden sm:inline">Home</span>
              </button>
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Anki Flashcards
              </h1>
            </div>

            {view === "decks" && (
              <button
                onClick={() => setView("create-deck")}
                className="win95-border px-3 py-1.5 text-sm hover:bg-accent bg-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Deck</span>
              </button>
            )}

            {view === "review" && currentCard && (
              <div className="text-sm text-muted-foreground">
                {cards.length} card{cards.length !== 1 ? "s" : ""} remaining
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Decks View */}
        {view === "decks" && (
          <div className="space-y-4">
            <div className="win95-border bg-white p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Your Decks
              </h2>

              {decks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No decks yet. Create your first deck to get started!
                </p>
              ) : (
                <div className="grid gap-3">
                  {decks.map((deck) => (
                    <div key={deck.id} className="win95-border bg-background p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-base mb-1">{deck.name}</h3>
                          {deck.description && (
                            <p className="text-sm text-muted-foreground mb-2">{deck.description}</p>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>{deckStats[deck.id]?.total || 0} total</span>
                            <span className="text-primary font-bold">
                              {deckStats[deck.id]?.due || 0} due
                            </span>
                            <span className="text-blue-600">
                              {deckStats[deck.id]?.new || 0} new
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedDeck(deck);
                              setView("create-card");
                            }}
                            className="win95-border px-2 py-1 text-xs hover:bg-accent bg-white"
                            title="Add Card"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => loadCardsForDeck(deck)}
                            className="win95-border px-3 py-1 text-xs hover:bg-accent bg-white"
                            title="Browse Cards"
                          >
                            Browse
                          </button>
                          <button
                            onClick={() => startReview(deck)}
                            className="win95-border px-3 py-1 text-xs hover:bg-accent bg-white font-bold"
                            disabled={!deckStats[deck.id]?.due}
                          >
                            Study
                          </button>
                          <button
                            onClick={() => deleteDeck(deck.id)}
                            className="win95-border px-2 py-1 text-xs hover:bg-red-100 bg-white text-red-600"
                            title="Delete Deck"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Deck View */}
        {view === "create-deck" && (
          <div className="win95-border bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Create New Deck</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Deck Name</label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="win95-border-inset w-full p-2 text-sm bg-white"
                  placeholder="e.g., Spanish Vocabulary, Biology, Math Formulas"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description (optional)</label>
                <textarea
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="win95-border-inset w-full p-2 text-sm bg-white resize-none"
                  rows={3}
                  placeholder="What is this deck about?"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={createDeck}
                  className="win95-border px-4 py-2 text-sm hover:bg-accent bg-white font-bold"
                >
                  Create Deck
                </button>
                <button
                  onClick={() => setView("decks")}
                  className="win95-border px-4 py-2 text-sm hover:bg-accent bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Card View */}
        {view === "create-card" && selectedDeck && (
          <div className="win95-border bg-white p-6">
            <h2 className="text-lg font-bold mb-2">Add Card to: {selectedDeck.name}</h2>
            <p className="text-xs text-muted-foreground mb-4">Create flashcards to study later. Markdown supported: **bold**, `code`, etc.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Front (Question)</label>
                <textarea
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="win95-border-inset w-full p-3 text-sm bg-white resize-none font-mono"
                  rows={4}
                  placeholder="What is the question or prompt?"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Back (Answer)</label>
                <textarea
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="win95-border-inset w-full p-3 text-sm bg-white resize-none font-mono"
                  rows={4}
                  placeholder="What is the answer?"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={createCard}
                  className="win95-border px-4 py-2 text-sm hover:bg-accent bg-white font-bold"
                >
                  Add Card
                </button>
                <button
                  onClick={() => setView("decks")}
                  className="win95-border px-4 py-2 text-sm hover:bg-accent bg-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Browse Cards View */}
        {view === "browse-cards" && selectedDeck && (
          <div className="win95-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Cards in: {selectedDeck.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setView("create-card")}
                  className="win95-border px-3 py-1.5 text-sm hover:bg-accent bg-white flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Card
                </button>
                <button
                  onClick={() => setView("decks")}
                  className="win95-border px-3 py-1.5 text-sm hover:bg-accent bg-white"
                >
                  Back to Decks
                </button>
              </div>
            </div>

            {cards.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No cards in this deck yet.{" "}
                <button
                  onClick={() => setView("create-card")}
                  className="text-primary underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => (
                  <div key={card.id} className="win95-border bg-background p-4">
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">FRONT</div>
                      <div className="text-sm mb-3 win95-border-inset bg-white p-2">
                        <MarkdownRenderer content={card.front} />
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">BACK</div>
                      <div className="text-sm win95-border-inset bg-white p-2">
                        <MarkdownRenderer content={card.back} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        State: {card.state} | Interval: {formatInterval(card.interval, card.state)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditCard(card)}
                          className="win95-border px-3 py-1 text-xs hover:bg-accent bg-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="win95-border px-3 py-1 text-xs hover:bg-red-100 bg-white text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Card View */}
        {view === "edit-card" && editingCard && selectedDeck && (
          <div className="win95-border bg-white p-6">
            <h2 className="text-lg font-bold mb-2">Edit Card in: {selectedDeck.name}</h2>
            <p className="text-xs text-muted-foreground mb-4">Update your flashcard. Markdown supported: **bold**, `code`, etc.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Front (Question)</label>
                <textarea
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="win95-border-inset w-full p-3 text-sm bg-white resize-none font-mono"
                  rows={4}
                  placeholder="What is the question or prompt?"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Back (Answer)</label>
                <textarea
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="win95-border-inset w-full p-3 text-sm bg-white resize-none font-mono"
                  rows={4}
                  placeholder="What is the answer?"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={updateCard}
                  className="win95-border px-4 py-2 text-sm hover:bg-accent bg-white font-bold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setView("browse-cards");
                    setEditingCard(null);
                    setCardFront("");
                    setCardBack("");
                  }}
                  className="win95-border px-4 py-2 text-sm hover:bg-accent bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review View */}
        {view === "review" && currentCard && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-2xl">
              <div className="win95-border bg-white p-8 min-h-[300px] flex flex-col">
                {/* Card Content */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full">
                    {!showAnswer ? (
                      <div>
                        <div className="text-xs text-muted-foreground mb-4 text-center">QUESTION</div>
                        <div className="text-lg">
                          <MarkdownRenderer content={currentCard.front} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <div className="text-xs text-muted-foreground mb-2 text-center">QUESTION</div>
                          <div className="text-base text-muted-foreground">
                            <MarkdownRenderer content={currentCard.front} />
                          </div>
                        </div>
                        <div className="win95-border-inset bg-background p-4">
                          <div className="text-xs text-muted-foreground mb-2 text-center">ANSWER</div>
                          <div className="text-lg">
                            <MarkdownRenderer content={currentCard.back} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8">
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="win95-border px-6 py-3 text-sm hover:bg-accent bg-white font-bold w-full"
                    >
                      Show Answer
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => answerCard(1)}
                        className="win95-border px-3 py-2 text-xs hover:bg-red-100 bg-white"
                      >
                        <div className="font-bold">Again</div>
                        <div className="text-[10px] text-muted-foreground mt-1">&lt;10m</div>
                      </button>
                      <button
                        onClick={() => answerCard(2)}
                        className="win95-border px-3 py-2 text-xs hover:bg-yellow-100 bg-white"
                      >
                        <div className="font-bold">Hard</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {currentCard.state === 'new' ? '10m' : formatInterval(Math.round(currentCard.interval * 1.2), 'review')}
                        </div>
                      </button>
                      <button
                        onClick={() => answerCard(3)}
                        className="win95-border px-3 py-2 text-xs hover:bg-green-100 bg-white"
                      >
                        <div className="font-bold">Good</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {currentCard.state === 'new' ? '10m' : formatInterval(Math.round(currentCard.interval * currentCard.ease_factor), 'review')}
                        </div>
                      </button>
                      <button
                        onClick={() => answerCard(4)}
                        className="win95-border px-3 py-2 text-xs hover:bg-blue-100 bg-white"
                      >
                        <div className="font-bold">Easy</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {currentCard.state === 'new' ? '4d' : formatInterval(Math.round(currentCard.interval * currentCard.ease_factor * 1.3), 'review')}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  State: {currentCard.state} | Ease: {currentCard.ease_factor.toFixed(2)} |
                  Interval: {formatInterval(currentCard.interval, currentCard.state)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 win95-border bg-muted py-2 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-muted-foreground text-center">
            Spaced repetition using SM-2 algorithm. Markdown supported: **bold**, `code`, ```js code blocks```
          </p>
        </div>
      </div>
    </div>
  );
};

export default Anki;
