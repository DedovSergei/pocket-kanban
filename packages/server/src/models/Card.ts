import { Schema, model, Types } from 'mongoose';

// Interface for what a Card should look like
interface Card {
  text: string;
  order: number;
  columnId: Types.ObjectId; // Reference to the column it belongs to
  boardId: Types.ObjectId;  // Reference to the board it belongs to
}

// Mongoose Schema for a Card
const CardSchema = new Schema<Card>(
  {
    text: { type: String, required: true },
    order: { type: Number, required: true },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export const CardModel = model<Card>('Card', CardSchema);