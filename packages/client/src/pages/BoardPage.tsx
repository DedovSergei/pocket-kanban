// packages/client/src/pages/BoardPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, FormEvent } from 'react';
import {
  fetchBoardById,
  addColumn,
  Board,
  Column, // <-- Import Column
  fetchCardsForBoard, // <-- Import card fetcher
  createCard,         // <-- Import card creator
  Card                // <-- Import Card type
} from '../api';

// --- New "Add Card" Form Component ---
// We're making this a separate component to keep the code clean
interface AddCardFormProps {
  columnId: string;
  boardId: string;
  onCardCreated: (newCard: Card) => void; // Callback to update state
}

function AddCardForm({ columnId, boardId, onCardCreated }: AddCardFormProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      // Call the API function we created
      const newCard = await createCard(boardId, columnId, text);
      onCardCreated(newCard); // Pass the new card up to the parent
      setText(""); // Clear input
      setError(null);
    } catch (err) {
      setError("Failed to create card");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <textarea
        value={text}
        onChange={e => setText(e.currentTarget.value)}
        placeholder="New card text"
        style={{ width: '100%', padding: '0.5rem', borderRadius: '3px' }}
        rows={3}
      />
      <button type="submit" style={{ padding: '0.5rem', marginTop: '0.5rem' }}>
        Add Card
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
    </form>
  );
}

// --- Main Board Page Component ---
export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<Card[]>([]); // <-- New state for cards
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  useEffect(() => {
    if (id) {
      // Load both board details and cards at the same time
      Promise.all([
        fetchBoardById(id),
        fetchCardsForBoard(id)
      ])
      .then(([boardData, cardsData]) => {
        setBoard(boardData);
        setCards(cardsData);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [id]);

  // --- Column Creation Handler ---
  const handleAddColumn = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newColumnTitle.trim()) return;
    try {
      const newColumn = await addColumn(id, newColumnTitle);
      setNewColumnTitle("");
      setBoard(prevBoard =>
        prevBoard ? { ...prevBoard, columns: [...prevBoard.columns, newColumn] } : null
      );
    } catch (err) {
      setError('Failed to add column');
    }
  };

  // --- Card Creation Handler ---
  // This is passed down to the AddCardForm
  const onCardCreated = (newCard: Card) => {
    setCards(prevCards => [...prevCards, newCard]);
  };

  // --- Render Logic ---
  if (loading) return <div style={{ padding: '2rem' }}>Loading board...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  if (!board) return <div style={{ padding: '2rem' }}>Board not found.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <Link to="/" style={{ color: '#ccc', textDecoration: 'none' }}>
        ← Back to Boards
      </Link>
      <h1 style={{ textAlign: 'center' }}>{board.title}</h1>

      {/* Main container for columns */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', alignItems: 'flex-start', overflowX: 'auto' }}>

        {/* Loop over columns */}
        {board.columns.map(column => {
          // Filter cards that belong to *this* column
          const columnCards = cards.filter(card => card.columnId === column._id);

          return (
            <div
              key={column._id}
              style={{ background: '#333', padding: '1rem', borderRadius: '4px', minWidth: '250px', flexShrink: 0 }}
            >
              <h3>{column.title}</h3>

              {/* Card List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {columnCards.map(card => (
                  <div key={card._id} style={{ background: '#444', padding: '0.5rem', borderRadius: '3px' }}>
                    {card.text}
                  </div>
                ))}
                {columnCards.length === 0 && <p style={{fontSize: '0.8rem', color: '#888'}}>No cards yet</p>}
              </div>

              {/* Add Card Form */}
              <AddCardForm
                columnId={column._id}
                boardId={board._id}
                onCardCreated={onCardCreated}
              />
            </div>
          );
        })}

        {/* Add New Column Form */}
        <form onSubmit={handleAddColumn} style={{ minWidth: '250px', flexShrink: 0 }}>
          <input
            value={newColumnTitle}
            onChange={e => setNewColumnTitle(e.currentTarget.value)}
            placeholder="New column title"
            style={{ padding: '0.5rem', width: '100%' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
            Add Column
          </button>
        </form>
      </div>
    </div>
  );
}