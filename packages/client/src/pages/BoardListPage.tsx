import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchBoards, createBoard, Board, deleteBoard } from '../api';
import styles from './BoardListPage.module.css';

export function BoardListPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoards()
      .then(data => setBoards(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    const deleteHandler = (data: { boardId: string }) => {
      setBoards(prevBoards => prevBoards.filter(b => b._id !== data.boardId));
    };

    const createHandler = (newBoard: Board) => {
      setBoards(prevBoards => [newBoard, ...prevBoards]);
    };

    socket.on('board:delete', deleteHandler);
    socket.on('board:create', createHandler);

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
      await createBoard(newTitle);
      setNewTitle('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await deleteBoard(boardId);
    } catch (err) {
      console.error('Failed to delete board', err);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Pocket Kanban</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.currentTarget.value)}
          placeholder="New board title"
        />
        <button type="submit">
          Create
        </button>
      </form>

      {loading && <p className={styles.loading}>Loading boards...</p>}
      {error && <p className={styles.error}>Error: {error}</p>}
      {!loading && boards.length === 0 && <p className={styles.noBoards}>No boards yet. Create one!</p>}

      <ul className={styles.boardList}>
        {boards.map(b => (
          <li 
            key={b._id} 
            className={styles.boardItem}
          >
            <Link 
              to={`/board/${b._id}`}
              className={styles.boardLink}
            >
              {b.title}
            </Link>
            <button 
              onClick={() => handleDeleteBoard(b._id)}
              className={styles.deleteButton}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}