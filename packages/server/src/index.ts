import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

app.use(express.json());

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
