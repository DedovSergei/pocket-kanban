import { useParams, Link } from 'react-router-dom'; // Import Link
import { useEffect, useState, FormEvent } from 'react'; // Import FormEvent
import { fetchBoardById, addColumn, Board } from '../api'; // Import addColumn

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  useEffect(() => {
    if (id) {
      fetchBoardById(id)
        .then(data => setBoard(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // --- Handle creating a new column ---
  const handleAddColumn = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newColumnTitle.trim()) return;

    try {
      // 1. Call the API
      const newColumn = await addColumn(id, newColumnTitle);
      // 2. Clear the input
      setNewColumnTitle("");
      // 3. Update the local state to show the new column immediately
      setBoard(prevBoard => {
        if (!prevBoard) return null;
        return {
          ...prevBoard,
          columns: [...prevBoard.columns, newColumn]
        };
      });
    } catch (err) {
      setError('Failed to add column. Please try again.');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading board...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  if (!board) return <div style={{ padding: '2rem' }}>Board not found.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <Link to="/" style={{ color: '#ccc', textDecoration: 'none' }}>
        ← Back to Boards
      </Link>
      <h1 style={{ textAlign: 'center' }}>{board.title}</h1>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        
        {/* Loop over and display existing columns */}
        {board.columns.map(column => (
          <div 
            key={column._id} 
            style={{ background: '#333', padding: '1rem', borderRadius: '4px', minWidth: '250px' }}
          >
            <h3>{column.title}</h3>
            {/* Cards will go here */}
          </div>
        ))}

        {/* --- Add New Column Form --- */}
        <form onSubmit={handleAddColumn} style={{ minWidth: '250px' }}>
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