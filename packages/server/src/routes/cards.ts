import { Router } from 'express';
import { CardModel } from '../models/Card';
import { BoardModel } from '../models/Board';

const router = Router();

// POST /cards - Create a new card
router.post('/', async (req, res) => {
  try {
    const { text, columnId, boardId } = req.body;

    if (!text || !columnId || !boardId) {
      return res.status(400).json({ error: 'Missing text, columnId, or boardId' });
    }

    // Find the board and column to make sure they exist
    const board = await BoardModel.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    const column = board.columns.find(c => c._id.toString() === columnId);
    if (!column) {
      return res.status(404).json({ error: 'Column not found on this board' });
    }

    // Get the current card count for this column to set the order
    const cardCount = await CardModel.countDocuments({ columnId, boardId });

    const newCard = await CardModel.create({
      text,
      boardId,
      columnId,
      order: cardCount, 
    });

    return res.status(201).json(newCard);

  } catch (err) {
    console.error('Error creating card:', err);
    return res.status(500).json({ error: 'Failed to create card' });
  }
});

export default router;