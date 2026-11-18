require('dotenv').config();
const app = require('./app');
const seed = require('./seed');

const PORT = process.env.PORT || 3000;

seed();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api-docs`);
});
