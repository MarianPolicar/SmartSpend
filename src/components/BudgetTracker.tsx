
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Edit, Plus, AlertTriangle } from 'lucide-react';
import { Expense } from '@/pages/Index';

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'week' | 'month';
}

interface BudgetTrackerProps {
  expenses: Expense[];
}

const categoryConfig = {
  food: { label: '🍔 Food & Dining', color: 'bg-red-100 text-red-800' },
  transport: { label: '🚗 Transportation', color: 'bg-blue-100 text-blue-800' },
  bills: { label: '📄 Bills & Utilities', color: 'bg-yellow-100 text-yellow-800' },
  shopping: { label: '🛍️ Shopping', color: 'bg-purple-100 text-purple-800' },
  entertainment: { label: '🎬 Entertainment', color: 'bg-green-100 text-green-800' },
  health: { label: '🏥 Healthcare', color: 'bg-pink-100 text-pink-800' },
  education: { label: '📚 Education', color: 'bg-indigo-100 text-indigo-800' },
  other: { label: '📦 Other', color: 'bg-gray-100 text-gray-800' },
};

export const BudgetTracker = ({ expenses }: BudgetTrackerProps) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: 'food',
    amount: '',
    period: 'month' as 'week' | 'month'
  });

  // Load budgets from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('smartspend-budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Save budgets to localStorage
  useEffect(() => {
    localStorage.setItem('smartspend-budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addBudget = () => {
    if (!newBudget.amount) return;
    
    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      amount: parseFloat(newBudget.amount),
      period: newBudget.period
    };

    setBudgets([...budgets, budget]);
    setNewBudget({ category: 'food', amount: '', period: 'month' });
    setShowAddForm(false);
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const getBudgetProgress = (budget: Budget) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let filteredExpenses = expenses.filter(expense => 
      expense.category === budget.category
    );

    if (budget.period === 'month') {
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      });
    } else {
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const daysDiff = (now.getTime() - expenseDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7;
      });
    }

    const spent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = (spent / budget.amount) * 100;
    
    return { spent, percentage: Math.min(percentage, 100), isOverBudget: spent > budget.amount };
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Budget Tracker
        </h2>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Budget
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Budget amount"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <select
              value={newBudget.period}
              onChange={(e) => setNewBudget({...newBudget, period: e.target.value as 'week' | 'month'})}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addBudget}>Add Budget</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-500">Set budgets to track your spending goals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const { spent, percentage, isOverBudget } = getBudgetProgress(budget);
            const config = categoryConfig[budget.category as keyof typeof categoryConfig];
            
            return (
              <div key={budget.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-sm text-gray-600">
                      {budget.period === 'week' ? 'Weekly' : 'Monthly'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverBudget && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteBudget(budget.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>₱{spent.toFixed(2)} spent</span>
                    <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
                      ₱{budget.amount.toFixed(2)} budget
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span>
                      {isOverBudget 
                        ? `₱${(spent - budget.amount).toFixed(2)} over budget`
                        : `₱${(budget.amount - spent).toFixed(2)} remaining`
                      }
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
