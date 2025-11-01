import { Card, Column, Board } from './types'; // We'll move types to their own file
export * from './types'; // And re-export them

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

export async function fetchCardsForBoard(boardId: string): Promise<Card[]> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/cards`);
  if (!res.ok) throw new Error('Failed to fetch cards');
  return res.json();
}

export async function createCard(boardId: string, columnId: string, text: string): Promise<Card> {
  const res = await fetch(`${API_BASE}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boardId, columnId, text }),
  });
  if (!res.ok) throw new Error('Failed to create card');
  return res.json();
}

// --- THIS TYPE IS UPDATED ---
type CardReorderPayload = {
  _id: string;
  order: number;
  columnId: string;
  boardId: string; // <-- This was added
}

export async function updateCardOrder(cards: CardReorderPayload[]) {
  const res = await fetch(`${API_BASE}/cards/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards }),
  });
  if (!res.ok) throw new Error('Failed to update card order');
  return res.json();
}

export async function updateColumnOrder(boardId: string, columns: Column[]): Promise<Column[]> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/reorder-columns`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns }),
  });
  if (!res.ok) throw new Error('Failed to update column order');
  return res.json();
}