import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import boardsRouter from './routes/boards';
import cardsRouter from './routes/cards';

const MONGO_URL = process.env.MONGO_URL;
console.log('▶️ MONGO_URL:', MONGO_URL);

mongoose
  .connect(MONGO_URL as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: 'http://localhost:5173' }
});

app.use(express.json());

app.use((req, _res, next) => {
  req.app.set('socketio', io);
  next();
});

app.use('/boards', boardsRouter);
app.use('/cards', cardsRouter);

app.get('/hello', (_req, res) => {
  res.send('Hello from server!');
});

io.on('connection', socket => {
  console.log('Client connected:', socket.id);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});