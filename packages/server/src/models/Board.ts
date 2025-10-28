import { Schema, model, Types } from 'mongoose';

// Interface for what a Column should look like
interface Column {
  _id: Types.ObjectId;
  title: string;
  order: number;
}

// Interface for what a Board should look like
interface Board {
  title: string;
  columns: Column[];
  createdAt: Date; // Added by timestamps
  updatedAt: Date; // Added by timestamps
}

// Mongoose Schema for a Column
// We define this so we can embed it as a sub-document
const ColumnSchema = new Schema<Column>({
  title: { type: String, required: true },
  order: { type: Number, required: true },
});

// Mongoose Schema for a Board
const BoardSchema = new Schema<Board>(
  {
    title: { type: String, required: true },
    columns: { type: [ColumnSchema], default: [] }, // An array of Column sub-documents
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// This is the line that fixes the error
export const BoardModel = model<Board>('Board', BoardSchema);