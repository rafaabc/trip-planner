// Wraps a controller action: sends the result, maps AppError to its status, anything else to 500.
function handle(status, action) {
  return (req, res) => {
    try {
      const result = action(req);
      if (status === 204) return res.status(204).end();
      return res.status(status).json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ message: err.message });
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

const idParam = (req, name) => Number(req.params[name]);

module.exports = { handle, idParam };
