require('dotenv').config();

const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const healthRoutes = require('./src/routes/healthRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT) || 5000;

fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api', apiRoutes);
app.use('/uploads', express.static('uploads'));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`DMS backend is listening on port ${port}`);
});
