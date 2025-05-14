const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

// Routes
const studentRoutes = require('./routes/studentRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const applicationRoutes = require('./routes/applicationRoute');

const PORT = 6001;

app.use(express.json());
app.use(cors());
app.use('/students', studentRoutes);
app.use('/clients', clientRoutes);
app.use('/projects', projectRoutes);
app.use('/applications', applicationRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
