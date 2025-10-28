import { Router } from 'express';
import { BoardModel } from '../models/Board'; // Make sure this path is correct

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

export default router;