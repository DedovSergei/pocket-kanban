import { Router } from 'express';
import { BoardModel } from '../models/Board';
import { CardModel } from '../models/Card';
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

// GET /boards/:id/cards - Get all cards for a specific board
router.get('/:id/cards', async (req, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid board ID format' });
    }

    // Find all cards where the boardId matches our route param
    const cards = await CardModel.find({ boardId: id }).sort({ order: 1 });

    return res.json(cards);
  } catch (err) {
    console.error('Error fetching cards:', err);
    return res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// PATCH /boards/:id/reorder-columns - Update the order of columns on a board
router.patch('/:id/reorder-columns', async (req, res) => {
  try {
    const { id } = req.params;
    // Expect an array of the full column objects in the new order
    const { columns } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }
    if (!columns || !Array.isArray(columns)) {
      return res.status(400).json({ error: 'Missing columns array' });
    }

    // Find the board and update its 'columns' array directly
    const updatedBoard = await BoardModel.findByIdAndUpdate(
      id,
      { $set: { columns: columns } },
      { new: true } // Return the updated document
    );

    if (!updatedBoard) {
      return res.status(404).json({ error: 'Board not found' });
    }

    return res.status(200).json(updatedBoard.columns);

  } catch (err) {
    console.error('Error reordering columns:', err);
    return res.status(500).json({ error: 'Failed to reorder columns' });
  }
});

export default router;