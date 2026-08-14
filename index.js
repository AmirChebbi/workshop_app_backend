const express = require('express');
const { randomUUID } = require('crypto');

const app = express();
app.use(express.json());

// In-memory store (resets on cold start — fine for a demo/showcase)
let expenses = [
  { id: randomUUID(), title: 'Groceries', amount: 42.5, category: 'Food', createdAt: new Date().toISOString() },
  { id: randomUUID(), title: 'Bus ticket', amount: 1.2, category: 'Transport', createdAt: new Date().toISOString() },
  { id: randomUUID(), title: 'Netflix', amount: 12.99, category: 'Subscription', createdAt: new Date().toISOString() },
];

app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running 🚀' });
});

// GET /expenses?page=1&limit=10
app.get('/expenses', (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);

  const start = (page - 1) * limit;
  const end = start + limit;

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const paginated = sorted.slice(start, end);

  res.json({
    data: paginated,
    pagination: {
      page,
      limit,
      total: expenses.length,
      totalPages: Math.ceil(expenses.length / limit),
    },
  });
});

// POST /expenses
app.post('/expenses', (req, res) => {
  const { title, amount, category } = req.body;

  if (!title || typeof amount !== 'number') {
    return res.status(400).json({ error: 'title (string) and amount (number) are required' });
  }

  const expense = {
    id: randomUUID(),
    title,
    amount,
    category: category || 'Other',
    createdAt: new Date().toISOString(),
  };

  expenses.push(expense);
  res.status(201).json(expense);
});

// DELETE /expenses/:id
app.delete('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const index = expenses.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const [deleted] = expenses.splice(index, 1);
  res.json({ message: 'Deleted', expense: deleted });
});

// Local dev only — Vercel imports the app directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
}

module.exports = app;
