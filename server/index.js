const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For dev only! Restrict in production.
    methods: ['GET', 'POST']
  }
});

// Email invite endpoint
app.post('/invite', async (req, res) => {
  const { email, link } = req.body;
  if (!email || !link) return res.status(400).json({ error: 'Missing email or link' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'skgj0711@gmail.com',
      pass: 'zhac ohjo tvkg fwjv',
    },
  });

  try {
    await transporter.sendMail({
      from: 'Collaborative Whiteboard <skgj0711@gmail.com>',
      to: email,
      subject: 'You are invited to join a Collaborative Whiteboard session!',
      text: `Join the session using this link: ${link}`,
      html: `<p>Join the session using this link: <a href="${link}">${link}</a></p>`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

io.on('connection', (socket) => {
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
  });

  socket.on('chat-message', ({ sessionId, message }) => {
    io.to(sessionId).emit('chat-message', message);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
