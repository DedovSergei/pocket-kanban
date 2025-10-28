// packages/client/src/pages/BoardListPage.tsx
import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { fetchBoards, createBoard, Board } from '../api';

export function BoardListPage() { 
  const [boards, setBoards] = useState<Board[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This runs once when the component loads
  useEffect(() => {
    fetchBoards()
      .then(data => setBoards(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []); // The empty array [] means "run only once"

  // This runs when you submit the form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return; // Don't create empty boards
    try {
      const newBoard = await createBoard(newTitle);
      // Add the new board to the top of the list
      setBoards(prev => [newBoard, ...prev]);
      setNewTitle(''); // Clear the input field
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Pocket Kanban</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', display: 'flex' }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.currentTarget.value)}
          placeholder="New board title"
          style={{ padding: '0.5rem', flexGrow: 1, marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Create
        </button>
      </form>

      {loading && <p>Loading boards...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && boards.length === 0 && <p>No boards yet. Create one!</p>}

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {boards.map(b => (
          // This <li> is now a <Link>
          <Link 
            key={b._id} 
            to={`/board/${b._id}`} // This sets the URL
            style={{ 
              display: 'block', // Makes the whole block clickable
              textDecoration: 'none', // Removes underline
              color: 'inherit', // Keeps your text color
              marginBottom: '0.5rem', 
              background: '#333', 
              padding: '1rem', 
              borderRadius: '4px' 
            }}
          >
            {b.title}
          </Link>
        ))}
      </ul>
    </div>
  );
}
