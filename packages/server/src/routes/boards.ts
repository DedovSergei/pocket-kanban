import { Router } from 'express';
import { BoardModel } from '../models/Board';
import { Types } from 'mongoose';
import { CardModel } from '../models/Card';

const router = Router();

// POST /boards - Create a new board
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

// GET /boards - Fetch all boards
router.get('/', async (_req, res) => {
  try {
    const boards = await BoardModel.find().sort({ createdAt: -1 });
    return res.json(boards);
  } catch (err) {
    console.error('Error fetching boards:', err);
    return res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// GET /boards/:id - Get a single board by its ID
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

// POST /boards/:id/columns - Add a new column to a board
router.post('/:id/columns', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

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
    return res.status(201).json(newColumn);

  } catch (err) {
    console.error('Error adding column:', err);
    return res.status(500).json({ error: 'Failed to add column' });
  }
});

// GET /boards/:id/cards - Get all cards for a specific board
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

// PATCH /boards/:id/reorder-columns - Update the order of columns
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

export default router;