// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

// Create an express application
const app = express();

// Use cors
app.use(cors());

// Use body-parser
app.use(bodyParser.json());

// Create an object to store comments
const commentsByPostId = {};

// Create an endpoint to handle comment creation
app.post('/posts/:id/comments', async (req, res) => {
  // Get the post id from the request params
  const { id } = req.params;

  // Get the comment from the request body
  const { content } = req.body;

  // Get the comments from the commentsByPostId object
  const comments = commentsByPostId[id] || [];

  // Create a new comment object
  const newComment = {
    id: comments.length + 1,
    content,
    status: 'pending',
  };

  // Add the comment to the comments array
  comments.push(newComment);

  // Update the commentsByPostId object
  commentsByPostId[id] = comments;

  // Send the comment object as a response
  res.status(201).send(comments);
});

// Create an endpoint to handle comment moderation
app.post('/events', async (req, res) => {
  // Get the event type from the request body
  const { type, data } = req.body;

  // Check if the event type is comment moderated
  if (type === 'CommentModerated') {
    // Get the comment data from the request body
    const { id, postId, status, content } = data;

    // Get the comments from the commentsByPostId object
    const comments = commentsByPostId[postId];

    // Find the comment in the comments array
    const comment = comments.find((comment) => {
      return comment.id === id;
    });

    // Update the comment status
    comment.status = status;

    // Emit an event to the event bus
    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        postId,
        status,
        content,
      },
    });
  }

  // Send an empty object as a response
  res.send({});
});

// Create an endpoint to handle comment retrieval
app.get('/posts/:id/comments', (req,