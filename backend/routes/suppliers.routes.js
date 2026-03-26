import express from 'express';

// Dummy suppliers route for 404 fix
const router = express.Router();

// Return empty array or dummy data for now
router.get('/suppliers', (req, res) => {
  res.json({ suppliers: [] });
});

export default router;
