const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { attachUser } = require('./middleware/requireAuth');
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const leaderboardRoutes = require('./routes/leaderboard');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notes', notesRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`DSTALGO PWN3D running at http://localhost:${PORT}`);
});
