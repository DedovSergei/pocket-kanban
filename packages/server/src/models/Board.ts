import { Schema, model, Types } from 'mongoose';

interface Column {
  _id: Types.ObjectId;
  title: string;
  order: number;
}

interface Board {
  title: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema<Column>({
  title: { type: String, required: true },
  order: { type: Number, required: true },
});

const BoardSchema = new Schema<Board>(
  {
    title: { type: String, required: true },
    columns: { type: [ColumnSchema], default: [] },
  },
  { timestamps: true }
);

export const BoardModel = model<Board>('Board', BoardSchema);