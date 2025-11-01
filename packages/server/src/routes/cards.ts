import { Router } from 'express';
import { CardModel } from '../models/Card';
import { BoardModel } from '../models/Board';
import { Types } from 'mongoose';

const router = Router();

// POST /cards - Create a new card
router.post('/', async (req, res) => {
  try {
    const { text, columnId, boardId } = req.body;
    const io = req.app.get('socketio');

    if (!text || !columnId || !boardId) {
      return res.status(400).json({ error: 'Missing text, columnId, or boardId' });
    }

    const board = await BoardModel.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    const column = board.columns.find(c => c._id.toString() === columnId);
    if (!column) {
      return res.status(404).json({ error: 'Column not found on this board' });
    }

    const cardCount = await CardModel.countDocuments({ columnId, boardId });

    const newCard = await CardModel.create({
      text,
      boardId,
      columnId,
      order: cardCount,
    });

    io.emit(`card:create:${boardId}`, newCard);

    return res.status(201).json(newCard);

  } catch (err) {
    console.error('Error creating card:', err);
    return res.status(500).json({ error: 'Failed to create card' });
  }
});

// PATCH /cards/reorder - Update card order
router.patch('/reorder', async (req, res) => {
  try {
    const { cards } = req.body;
    const io = req.app.get('socketio');

    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ error: 'Expected a "cards" array.' });
    }

    const operations = cards.map(card => ({
      updateOne: {
        filter: { _id: card._id },
        update: { $set: { order: card.order, columnId: card.columnId } }
      }
    }));

    await CardModel.bulkWrite(operations);

    if (cards.length > 0) {
      const boardId = cards[0].boardId;
      
      // Re-fetch the full, updated card documents from the database
      const updatedCardIds = cards.map(c => c._id);
      const updatedFullCards = await CardModel.find({ _id: { $in: updatedCardIds } });

      // Emit the complete card objects, not the partial ones
      io.emit(`card:reorder:${boardId}`, updatedFullCards);
    }

    return res.status(200).json({ message: 'Cards reordered successfully' });

  } catch (err) {
    console.error('Error reordering cards:', err);
    return res.status(500).json({ error: 'Failed to reorder cards' });
  }
});

export default router;