const fs = require('fs');
const path = require('path');
const chatPage = fs.readFileSync(path.join(__dirname, '/templates', 'chat.html'));
const authPage = fs.readFileSync(path.join(__dirname, '/templates', 'auth.html'));
const Message = require('./messages/models/message.model')
const fastify = require("fastify")({logger: true});
const jwt = require('@fastify/jwt');
const cookie = require('@fastify/cookie');
const bcrypt = require('fastify-bcrypt');
const static = require('@fastify/static');

fastify.register(require('@fastify/websocket'))
require('dotenv').config({path: `./.env`})

// Register static file serving
fastify.register(static, {
  root: path.join(__dirname),
  prefix: '/',
});

// Register plugins
fastify.register(cookie);
fastify.register(jwt, {
  secret: 'supersecret',
});
fastify.register(bcrypt, {
  saltWorkFactor: 12,
});

module.exports = fastify

// Connect to the database
require("./config/connectDB");

// Import user and message routes
const userRoutes = require("./users/routes/user.routes");
const messageRoutes = require("./messages/routes/message.routes");

// Register user routes with a prefix
fastify.register(async (instance) => {
  userRoutes.forEach((route) => {
    instance.route(route);
  });
}, { prefix: '/api/users' }); // Prefix for user routes

// Register message routes with a prefix
fastify.register(async (instance) => {
  messageRoutes.forEach((route) => {
    instance.route(route);
  });
}, { prefix: '/api/messages' }); // Prefix for message routes

// Home route
fastify.get('/', (req, rep) => {
  if (req.cookies.token) {
    return rep.type('text/html').send(chatPage);
  }
  rep.redirect('/auth');
});

// Authentication route
fastify.get('/auth', (req, rep) => {
  if (!req.cookies.token) {
    return rep.type('text/html').send(authPage);
  }
  rep.redirect('/');
});

// WebSocket route
// WebSocket route
fastify.register(async function (fastify) {
  const clients = new Set(); // Store connected clients

  fastify.get('/ws', { websocket: true }, (socket, req) => {
    const username = req.cookies.username;

    // Add the new client to the set of connected clients
    clients.add(socket);

    // Fetch existing messages when the connection is established
    (async () => {
      try {
        const response = await fetch(`http://${process.env.URL}:${process.env.PORT}/api/messages`, {
          method: "GET",
        });

        if (!response.ok) {
          console.error('Failed to fetch messages:', response.statusText);
          return;
        }

        const messages = await response.json(); // Parse the response as JSON
        messages.forEach(msg => {
          socket.send(`${msg.sender}: ${msg.content}`);
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    })();

    socket.on('message', async (message) => {
      try {
        // Send the message back to the client that sent it
        socket.send(`${username}: ${message}`);

        // Broadcast the message to all connected clients
        clients.forEach(client => {
          if (client !== socket) { // Don't send the message back to the sender
            client.send(`${username}: ${message}`);
          }
        });

        // Send the message to the API
        const response = await fetch(`http://${process.env.URL}:${process.env.PORT}/api/messages/add-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: username,
            content: message.toString(), // Ensure message is a string
            group_name: 'test',
          }),
        });

        // Optionally handle the response from the API
        if (!response.ok) {
          console.error('Failed to send message to API:', response.statusText);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Remove the client from the set when they disconnect
    socket.on('close', () => {
      clients.delete(socket);
    });
  });
});




fastify.listen({ port: process.env.PORT, host: process.env.URL }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})