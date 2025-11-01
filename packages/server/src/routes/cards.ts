import { Router } from 'express';
import { CardModel } from '../models/Card';
import { BoardModel } from '../models/Board';
import { Types } from 'mongoose';

const router = Router();

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
      const updatedCardIds = cards.map(c => c._id);
      const updatedFullCards = await CardModel.find({ _id: { $in: updatedCardIds } });
      io.emit(`card:reorder:${boardId}`, updatedFullCards);
    }
    return res.status(200).json({ message: 'Cards reordered successfully' });
  } catch (err) {
    console.error('Error reordering cards:', err);
    return res.status(500).json({ error: 'Failed to reorder cards' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get('socketio');
    const deletedCard = await CardModel.findByIdAndDelete(id);
    if (!deletedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    io.emit(`card:delete:${deletedCard.boardId}`, { cardId: deletedCard._id });
    return res.status(200).json({ message: 'Card deleted' });
  } catch (err) {
    console.error('Error deleting card:', err);
    return res.status(500).json({ error: 'Failed to delete card' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const io = req.app.get('socketio');

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const updatedCard = await CardModel.findByIdAndUpdate(
      id,
      { $set: { text: text } },
      { new: true }
    );
    if (!updatedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    io.emit(`card:update:${updatedCard.boardId}`, updatedCard);
    return res.status(200).json(updatedCard);
  } catch (err) {
    console.error('Error renaming card:', err);
    return res.status(500).json({ error: 'Failed to rename card' });
  }
});

export default router;