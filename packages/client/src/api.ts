export interface Card {
  _id: string;
  text: string;
  order: number;
  columnId: string;
  boardId: string;
}

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

// Function to get a single board by its ID
export async function fetchBoardById(id: string): Promise<Board> {
  const res = await fetch(`${API_BASE}/boards/${id}`);
  if (!res.ok) throw new Error('Failed to fetch board');
  return res.json();
}

// Function to add a new column to a board
export async function addColumn(boardId: string, title: string): Promise<Column> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/columns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to add column');
  return res.json();
}

// Function to fetch all cards for a specific board
export async function fetchCardsForBoard(boardId: string): Promise<Card[]> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/cards`);
  if (!res.ok) throw new Error('Failed to fetch cards');
  return res.json();
}

// Function to create a new card
export async function createCard(boardId: string, columnId: string, text: string): Promise<Card> {
  const res = await fetch(`${API_BASE}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boardId, columnId, text }),
  });
  if (!res.ok) throw new Error('Failed to create card');
  return res.json();
}

// Type for the reorder payload
type CardReorderPayload = {
  _id: string;
  order: number;
  columnId: string;
}

// Function to update card order in bulk
export async function updateCardOrder(cards: CardReorderPayload[]) {
  const res = await fetch(`${API_BASE}/cards/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards }), // Send as { "cards": [...] }
  });
  if (!res.ok) throw new Error('Failed to update card order');
  return res.json();
}