
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Expense } from '@/pages/Index';

interface BudgetGoal {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
}

interface BudgetGoalsProps {
  expenses: Expense[];
  onBack: () => void;
}

export const BudgetGoals = ({ expenses, onBack }: BudgetGoalsProps) => {
  const [goals, setGoals] = useState<BudgetGoal[]>([
    { id: '1', category: 'Food', monthlyLimit: 5000, currentSpent: 0 },
    { id: '2', category: 'Transportation', monthlyLimit: 2000, currentSpent: 0 }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ category: '', monthlyLimit: 0 });

  // Calculate current month spending by category
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const getCurrentMonthSpending = (category: string) => {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear &&
               expense.category.toLowerCase() === category.toLowerCase();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Update current spent amounts
  const updatedGoals = goals.map(goal => ({
    ...goal,
    currentSpent: getCurrentMonthSpending(goal.category)
  }));

  const addGoal = () => {
    if (newGoal.category && newGoal.monthlyLimit > 0) {
      const goal: BudgetGoal = {
        id: Date.now().toString(),
        category: newGoal.category,
        monthlyLimit: newGoal.monthlyLimit,
        currentSpent: getCurrentMonthSpending(newGoal.category)
      };
      setGoals([...goals, goal]);
      setNewGoal({ category: '', monthlyLimit: 0 });
      setShowForm(false);
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Goals</h1>
            <p className="text-gray-600">Set and track your monthly spending limits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {updatedGoals.map((goal) => {
          const percentage = (goal.currentSpent / goal.monthlyLimit) * 100;
          const isOverBudget = percentage > 100;
          
          return (
            <Card key={goal.id} className={`p-4 ${isOverBudget ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{goal.category}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Spent: ₱{goal.currentSpent.toFixed(2)}</span>
                  <span>Limit: ₱{goal.monthlyLimit.toFixed(2)}</span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${isOverBudget ? 'bg-red-200' : ''}`}
                />
                <div className="text-center">
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {isOverBudget ? 'Over Budget!' : `${(100 - percentage).toFixed(1)}% remaining`}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className="p-4 border-dashed border-2 border-gray-300">
          {!showForm ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
              <Plus className="w-8 h-8 text-gray-400 mb-2" />
              <h3 className="font-medium text-gray-700 mb-1">Add New Goal</h3>
              <p className="text-sm text-gray-500 mb-4">Set a spending limit for a category</p>
              <Button onClick={() => setShowForm(true)} size="sm">
                Create Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">New Budget Goal</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    placeholder="e.g., Entertainment"
                  />
                </div>
                <div>
                  <Label htmlFor="limit">Monthly Limit (₱)</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={newGoal.monthlyLimit || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, monthlyLimit: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addGoal} size="sm" className="flex-1">
                    Add Goal
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowForm(false)} 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Budget Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {updatedGoals.length}
            </div>
            <div className="text-sm text-blue-800">Active Goals</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ₱{updatedGoals.reduce((sum, goal) => sum + goal.monthlyLimit, 0).toFixed(2)}
            </div>
            <div className="text-sm text-green-800">Total Budget</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ₱{updatedGoals.reduce((sum, goal) => sum + goal.currentSpent, 0).toFixed(2)}
            </div>
            <div className="text-sm text-purple-800">Total Spent</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
