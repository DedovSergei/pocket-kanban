import { Schema, model, Types } from 'mongoose';

interface Card {
  text: string;
  order: number;
  columnId: Types.ObjectId;
  boardId: Types.ObjectId;
}

const CardSchema = new Schema<Card>(
  {
    text: { type: String, required: true },
    order: { type: Number, required: true },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  },
  { timestamps: true }
);

export const CardModel = model<Card>('Card', CardSchema);