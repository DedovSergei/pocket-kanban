import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchBoards, createBoard, Board, deleteBoard } from '../api';

export function BoardListPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data fetch
  useEffect(() => {
    fetchBoards()
      .then(data => setBoards(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    const socket = io('http://localhost:3001');

    const deleteHandler = (data: { boardId: string }) => {
      setBoards(prevBoards => prevBoards.filter(b => b._id !== data.boardId));
    };

    const createHandler = (newBoard: Board) => {
      setBoards(prevBoards => [newBoard, ...prevBoards]);
    };

    socket.on('board:delete', deleteHandler);
    socket.on('board:create', createHandler); // Listens for new boards

    return () => {
      socket.off('board:delete', deleteHandler);
      socket.off('board:create', createHandler);
      socket.disconnect();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      // We don't need to update state, the socket will
      await createBoard(newTitle);
      setNewTitle('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    // We just call the API. The 'board:delete' socket will update state.
    try {
      await deleteBoard(boardId);
    } catch (err) {
      console.error('Failed to delete board', err);
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
          <li 
            key={b._id} 
            style={{ 
              marginBottom: '0.5rem', 
              background: '#333', 
              padding: '1rem', 
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Link 
              to={`/board/${b._id}`}
              style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}
            >
              {b.title}
            </Link>
            <button 
              onClick={() => handleDeleteBoard(b._id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: '1',
                padding: '0 4px'
              }}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}