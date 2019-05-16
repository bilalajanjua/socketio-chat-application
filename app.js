/*
 * Written by Bilal Ahmed Janjua <bilalahmjan@gmail.com>, May 2019
 */
const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

const PORT = 4500;

const users = [];

app.use(express.static(__dirname + '/public/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/index.html');
});

io.on('connection', socket => {
  socket.on('add user', username => {
    if (users.includes(username)) {
      socket.emit('username already exists', { username });
    } else {
      // Adding username property to socket.
      socket.username = username;
      // Adding new user to the connected users list.
      users.push(username);
      // Sending the new username to all connected sockets.
      io.emit('user connected', { username: username });
      // Telling the current socket about its username.
      socket.emit('i am connected', username);

      // Send the total users count to all connected sockets.
      io.emit('total users', { count: users.length, users: users.slice() });
    }
  });

  socket.on('disconnect', reason => {
    // Remove the username from list if the socket is disconnected.
    const index = users.indexOf(socket.username);
    if (index > -1) {
      users.splice(index, 1);
    }
    // Sending the updated count to all connected sockets.
    io.emit('total users', { count: users.length, users: users.slice() });
  });

  socket.on('chat message', msg => {
    socket.emit('my chat message', { message: msg, username: socket.username });
    // Sending message to the sockets other than sender.
    socket.broadcast.emit('chat message', {
      message: msg,
      username: socket.username
    });
  });
});

server.listen(PORT, () => {
  console.info('Listening on port: ' + PORT);
});
