const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let tickets = [];

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message);
  });

  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('userTyping', isTyping);
  });

  socket.on('createTicket', (ticket) => {
    tickets.push(ticket);
    io.emit('newTicket', ticket);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});