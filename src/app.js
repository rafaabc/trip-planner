const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const specPath = path.join(__dirname, '..', 'resources', 'swagger.yaml');
const specText = fs.readFileSync(specPath, 'utf8');
const swaggerDocument = YAML.parse(specText);

const app = express();
app.use(cors());
app.use(express.json());

// Swagger: rendered UI and raw YAML file
app.get('/api-docs.yaml', (req, res) => res.type('application/yaml').send(specText));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => res.redirect('/api-docs'));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/trips', require('./routes/trip.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Malformed JSON bodies and other unexpected errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
