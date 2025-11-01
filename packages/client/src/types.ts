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