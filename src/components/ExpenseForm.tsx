
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Expense } from '@/pages/Index';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id'> | Expense) => void;
  onCancel: () => void;
  initialData?: Expense | null;
}

const categories = [
  { value: 'food', label: '🍔 Food & Dining', color: 'bg-red-100 text-red-800' },
  { value: 'transport', label: '🚗 Transportation', color: 'bg-blue-100 text-blue-800' },
  { value: 'bills', label: '📄 Bills & Utilities', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'shopping', label: '🛍️ Shopping', color: 'bg-purple-100 text-purple-800' },
  { value: 'entertainment', label: '🎬 Entertainment', color: 'bg-green-100 text-green-800' },
  { value: 'health', label: '🏥 Healthcare', color: 'bg-pink-100 text-pink-800' },
  { value: 'education', label: '📚 Education', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'other', label: '📦 Other', color: 'bg-gray-100 text-gray-800' },
];

export const ExpenseForm = ({ onSubmit, onCancel, initialData }: ExpenseFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note);
    } else {
      // Set today's date as default
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !date) {
      return;
    }

    const expenseData = {
      amount: parseFloat(amount),
      category,
      date,
      note,
    };

    if (initialData) {
      onSubmit({ ...expenseData, id: initialData.id });
    } else {
      onSubmit(expenseData);
    }

    // Reset form
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount (₱)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium text-gray-700">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="note" className="text-sm font-medium text-gray-700">
            Note (Optional)
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this expense..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {initialData ? 'Update Expense' : 'Add Expense'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
