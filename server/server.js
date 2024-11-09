const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const imageRoutes = require('./routes/imageRoutes');
const authRoutes = require('./routes/authRoutes');
const followRoutes = require('./routes/followRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes');

const http = require('http');
const { initSocket } = require('./socket');

dotenv.config();
const app = express();
const port = 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use(cors());
app.use(express.json({ limit: '16mb' }));

app.use('/api', imageRoutes);
app.use('/auth', authRoutes);
app.use('/auth', followRoutes);
app.use('/auth', postRoutes);
app.use('/auth', profileRoutes);
app.use('/auth', searchRoutes);

const server = http.createServer(app);

initSocket(server);

server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});