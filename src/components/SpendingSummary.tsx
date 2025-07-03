
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Target, Filter } from 'lucide-react';
import { Expense } from '@/pages/Index';

interface SpendingSummaryProps {
  expenses: Expense[];
}

type FilterType = 'week' | 'month' | 'all';

export const SpendingSummary = ({ expenses }: SpendingSummaryProps) => {
  const [filter, setFilter] = useState<FilterType>('month');
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filter expenses based on selected filter
  const getFilteredExpenses = () => {
    switch (filter) {
      case 'week':
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          const daysDiff = (currentDate.getTime() - expenseDate.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 7;
        });
      case 'month':
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
      case 'all':
        return expenses;
      default:
        return expenses;
    }
  };

  const filteredExpenses = getFilteredExpenses();

  // Calculate previous month expenses for comparison
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === prevMonth && expenseDate.getFullYear() === prevYear;
  });

  const currentTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const prevMonthTotal = prevMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const monthlyChange = prevMonthTotal === 0 ? 0 : ((currentTotal - prevMonthTotal) / prevMonthTotal) * 100;
  const isIncrease = monthlyChange > 0;

  // Calculate daily average
  const days = filter === 'week' ? 7 : filter === 'month' ? new Date(currentYear, currentMonth + 1, 0).getDate() : 365;
  const dailyAverage = currentTotal / days;

  const getFilterLabel = () => {
    switch (filter) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
    }
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Spending Summary
        </h2>
        <Filter className="w-4 h-4 text-gray-500" />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={filter === 'week' ? 'default' : 'outline'}
          onClick={() => setFilter('week')}
          className="text-xs"
        >
          Week
        </Button>
        <Button
          size="sm"
          variant={filter === 'month' ? 'default' : 'outline'}
          onClick={() => setFilter('month')}
          className="text-xs"
        >
          Month
        </Button>
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="text-xs"
        >
          All Time
        </Button>
      </div>
      
      <div className="space-y-4">
        {/* Current Period */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">{getFilterLabel()}</p>
              <p className="font-semibold text-gray-900">₱{currentTotal.toFixed(2)}</p>
            </div>
          </div>
          {filter === 'month' && (
            <div className={`text-right ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
              <p className="text-xs">vs last month</p>
              <p className="font-medium">
                {isIncrease ? '+' : ''}{monthlyChange.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Daily Average */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="font-semibold text-gray-900">₱{dailyAverage.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right text-gray-600">
            <p className="text-xs">Total expenses</p>
            <p className="font-medium">{filteredExpenses.length}</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        {filter !== 'week' && (
          <div className="pt-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Months</h3>
            <div className="space-y-2">
              {filter === 'month' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="font-medium">₱{currentTotal.toFixed(2)}</span>
                </div>
              )}
              {prevMonthTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(prevYear, prevMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="font-medium text-gray-500">₱{prevMonthTotal.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
