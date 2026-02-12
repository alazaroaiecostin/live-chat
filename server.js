const express = require('express');
const cors = require('cors');

const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: { origin: '*' }
});

app.use(cors());

app.get('/', (req, res) => {
  res.send('');
});

let userList = new Map();

io.on('connection', (socket) => {
  let userName = socket.handshake.query.userName;
  addUser(userName, socket.id);

  socket.broadcast.emit('user-list', [...userList.keys()]);
  socket.emit('user-list', [...userList.keys()]);

  socket.broadcast.emit('user-joined', userName);

  socket.on('message', (msg) => {
    socket.broadcast.emit('message-broadcast', { message: msg, userName });
  });

  socket.on('disconnect', () => {
    removeUser(userName, socket.id);
    socket.broadcast.emit('user-left', userName);
    socket.broadcast.emit('user-list', [...userList.keys()]);
  });
});

function addUser(userName, id) {
  if (!userList.has(userName)) {
    userList.set(userName, new Set([id]));
  } else {
    userList.get(userName).add(id);
  }
}

function removeUser(userName, id) {
  if (userList.has(userName)) {
    let userIds = userList.get(userName);
    userIds.delete(id);

    if (userIds.size === 0) {
      userList.delete(userName);
    }
  }
}


http.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
