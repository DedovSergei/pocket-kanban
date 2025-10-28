export interface Column {
  _id: string;
  title: string;
  order: number;
}

export interface Board {
  _id: string;
  title: string;
  columns: Column[];
}

const API_BASE = 'http://localhost:3001';

export async function fetchBoards(): Promise<Board[]> {
  const res = await fetch(`${API_BASE}/boards`);
  if (!res.ok) throw new Error('Failed to fetch boards');
  return res.json();
}

export async function createBoard(title: string): Promise<Board> {
  const res = await fetch(`${API_BASE}/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create board');
  return res.json();
}

export async function fetchBoardById(id: string): Promise<Board> {
  const res = await fetch(`${API_BASE}/boards/${id}`);
  if (!res.ok) throw new Error('Failed to fetch board');
  return res.json();
}

export async function addColumn(boardId: string, title: string): Promise<Column> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/columns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to add column');
  return res.json();
}