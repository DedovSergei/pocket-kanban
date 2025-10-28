// This defines what a "Board" object looks like for frontend
export interface Board {
  _id: string;
  title: string;
  columns: any[]; 
}

const API_BASE = 'http://localhost:3001';

// Function to get all boards
export async function fetchBoards(): Promise<Board[]> {
  const res = await fetch(`${API_BASE}/boards`);
  if (!res.ok) throw new Error('Failed to fetch boards');
  return res.json();
}

// Function to create a new board
export async function createBoard(title: string): Promise<Board> {
  const res = await fetch(`${API_BASE}/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create board');
  return res.json();
}