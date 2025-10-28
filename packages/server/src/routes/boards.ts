import { Router } from 'express';
import { BoardModel } from '../models/Board'; // Make sure this path is correct
import { Types } from 'mongoose';

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
    // Find all boards and sort them by newest first
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

    // Check if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid board ID format' });
    }

    const board = await BoardModel.findById(id);

    if (!board) {
      return res.status(44).json({ error: 'Board not found' });
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

    // Create the new column
    const newColumn = {
      _id: new Types.ObjectId(),
      title: title,
      order: board.columns.length, // Simple order: just add to the end
    };

    // Add it to the board's columns array
    board.columns.push(newColumn);

    // Save the entire board
    await board.save();

    // Return just the newly created column
    return res.status(201).json(newColumn);

  } catch (err) {
    console.error('Error adding column:', err);
    return res.status(500).json({ error: 'Failed to add column' });
  }
});

export default router;