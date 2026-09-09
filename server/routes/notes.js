const express = require('express');
const { notes } = require('../notesData');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ notes });
});

module.exports = router;
