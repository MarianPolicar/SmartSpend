
import { Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Expense } from '@/pages/Index';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const categoryConfig = {
  food: { label: '🍔 Food & Dining', color: 'bg-red-50 border-red-200' },
  transport: { label: '🚗 Transportation', color: 'bg-blue-50 border-blue-200' },
  bills: { label: '📄 Bills & Utilities', color: 'bg-yellow-50 border-yellow-200' },
  shopping: { label: '🛍️ Shopping', color: 'bg-purple-50 border-purple-200' },
  entertainment: { label: '🎬 Entertainment', color: 'bg-green-50 border-green-200' },
  health: { label: '🏥 Healthcare', color: 'bg-pink-50 border-pink-200' },
  education: { label: '📚 Education', color: 'bg-indigo-50 border-indigo-200' },
  other: { label: '📦 Other', color: 'bg-gray-50 border-gray-200' },
};

export const ExpenseList = ({ expenses, onEdit, onDelete }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">💸</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Start tracking your spending by adding your first expense!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {expenses.map((expense) => {
        const config = categoryConfig[expense.category as keyof typeof categoryConfig] || categoryConfig.other;
        
        return (
          <Card key={expense.id} className={`p-4 border ${config.color} hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    ₱{expense.amount.toFixed(2)}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium bg-white rounded-full">
                    {config.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(expense.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                
                {expense.note && (
                  <p className="text-sm text-gray-700 italic">"{expense.note}"</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(expense)}
                  className="hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(expense.id)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
