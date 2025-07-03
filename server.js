import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Expense Schema
const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  amount: Number,
  category: String,
  date: String,
  note: String,
});
const Expense = mongoose.model('Expense', expenseSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// Middleware to authenticate JWT and set req.userId
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Example route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

app.get('/api/auth/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch user from DB if needed
    res.json({ user: { id: decoded.id, email: decoded.email, name: decoded.name } });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get all expenses for the logged-in user
app.get('/api/expenses', authenticate, async (req, res) => {
  const expenses = await Expense.find({ userId: req.userId });
  res.json({ expenses: expenses.map(e => ({
    id: e._id,
    description: e.description,
    amount: e.amount,
    category: e.category,
    date: e.date,
    note: e.note,
  })) });
});

// Add a new expense
app.post('/api/expenses', authenticate, async (req, res) => {
  const { description, amount, category, date, note } = req.body;
  const expense = await Expense.create({
    userId: req.userId,
    description,
    amount,
    category,
    date,
    note,
  });
  res.json({ expense: {
    id: expense._id,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    note: expense.note,
  } });
});

// Update an expense
app.put('/api/expenses/:id', authenticate, async (req, res) => {
  const { description, amount, category, date, note } = req.body;
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { description, amount, category, date, note },
    { new: true }
  );
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json({ expense: {
    id: expense._id,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    note: expense.note,
  } });
});

// Delete an expense
app.delete('/api/expenses/:id', authenticate, async (req, res) => {
  const result = await Expense.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) return res.status(404).json({ message: 'Expense not found' });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
