import { Router } from 'express';
import { BoardModel } from '../models/Board';
import { Types } from 'mongoose';
import { CardModel } from '../models/Card';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const board = await BoardModel.create({ title, columns: [] });
    return res.status(201).json(board);
  } catch (err) {
    console.error('Error creating board:', err);
    return res.status(500).json({ error: 'Failed to create board' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const boards = await BoardModel.find().sort({ createdAt: -1 });
    return res.json(boards);
  } catch (err) {
    console.error('Error fetching boards:', err);
    return res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid board ID format' });
    }
    const board = await BoardModel.findById(id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    return res.json(board);
  } catch (err) {
    console.error('Error fetching single board:', err);
    return res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// --- THIS ROUTE IS UPDATED ---
router.post('/:id/columns', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const io = req.app.get('socketio'); // 1. Get io

    if (!title) {
      return res.status(400).json({ error: 'Column title is required' });
    }
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid board ID format' });
    }

    const board = await BoardModel.findById(id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const newColumn = {
      _id: new Types.ObjectId(),
      title: title,
      order: board.columns.length,
    };

    board.columns.push(newColumn);
    await board.save();

    // 2. Emit the full board update
    io.emit(`board:update:${id}`, board);

    return res.status(201).json(newColumn);

  } catch (err) {
    console.error('Error adding column:', err);
    return res.status(500).json({ error: 'Failed to add column' });
  }
});

router.get('/:id/cards', async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid board ID format' });
    }
    const cards = await CardModel.find({ boardId: id }).sort({ order: 1 });
    return res.json(cards);
  } catch (err) {
    console.error('Error fetching cards:', err);
    return res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

router.patch('/:id/reorder-columns', async (req, res) => {
  try {
    const { id } = req.params;
    const { columns } = req.body;
    const io = req.app.get('socketio');
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }
    if (!columns || !Array.isArray(columns)) {
      return res.status(400).json({ error: 'Missing columns array' });
    }
    const updatedBoard = await BoardModel.findByIdAndUpdate(
      id,
      { $set: { columns: columns } },
      { new: true }
    );
    if (!updatedBoard) {
      return res.status(404).json({ error: 'Board not found' });
    }
    io.emit(`column:reorder:${id}`, updatedBoard.columns);
    return res.status(200).json(updatedBoard.columns);
  } catch (err) {
    console.error('Error reordering columns:', err);
    return res.status(500).json({ error: 'Failed to reorder columns' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const io = req.app.get('socketio');
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const updatedBoard = await BoardModel.findByIdAndUpdate(
      id,
      { $set: { title: title } },
      { new: true }
    );
    if (!updatedBoard) {
      return res.status(404).json({ error: 'Board not found' });
    }
    io.emit(`board:update:${id}`, updatedBoard);
    return res.status(200).json(updatedBoard);
  } catch (err) {
    console.error('Error renaming board:', err);
    return res.status(500).json({ error: 'Failed to rename board' });
  }
});

router.patch('/:id/columns/:columnId', async (req, res) => {
  try {
    const { id, columnId } = req.params;
    const { title } = req.body;
    const io = req.app.get('socketio');
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const board = await BoardModel.findById(id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    const column = board.columns.find(c => c._id.toString() === columnId);
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    column.title = title;
    await board.save();
    io.emit(`board:update:${id}`, board);
    return res.status(200).json(board);
  } catch (err) {
    console.error('Error renaming column:', err);
    return res.status(500).json({ error: 'Failed to rename column' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get('socketio');
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }
    await CardModel.deleteMany({ boardId: id });
    const deletedBoard = await BoardModel.findByIdAndDelete(id);
    if (!deletedBoard) {
      return res.status(404).json({ error: 'Board not found' });
    }
    io.emit('board:delete', { boardId: id });
    return res.status(200).json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Error deleting board:', err);
    return res.status(500).json({ error: 'Failed to delete board' });
  }
});

router.delete('/:id/columns/:columnId', async (req, res) => {
  try {
    const { id, columnId } = req.params;
    const io = req.app.get('socketio');
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(columnId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    await CardModel.deleteMany({ columnId: columnId });
    const updatedBoard = await BoardModel.findByIdAndUpdate(
      id,
      { $pull: { columns: { _id: columnId } } },
      { new: true }
    );
    if (!updatedBoard) {
      return res.status(404).json({ error: 'Board not found' });
    }
    io.emit(`board:update:${id}`, updatedBoard);
    return res.status(200).json(updatedBoard);
  } catch (err) {
    console.error('Error deleting column:', err);
    return res.status(500).json({ error: 'Failed to delete column' });
  }
});

export default router;