
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';
import { Expense } from '@/pages/Index';

interface ExpenseInsightsProps {
  expenses: Expense[];
}

export const ExpenseInsights = ({ expenses }: ExpenseInsightsProps) => {
  if (expenses.length === 0) {
    return (
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">💡 Smart Insights</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-500">Add more expenses to see personalized insights</p>
        </div>
      </Card>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Current month expenses
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  // Last month expenses
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
  });

  // Calculate trends
  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyChange = lastMonthTotal === 0 ? 0 : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

  // Find most expensive category this month
  const categoryTotals = thisMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

  // Calculate average expense
  const averageExpense = thisMonthExpenses.length > 0 
    ? thisMonthTotal / thisMonthExpenses.length 
    : 0;

  // Find spending patterns
  const expensesByDay = thisMonthExpenses.reduce((acc, expense) => {
    const day = new Date(expense.date).getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[day];
    acc[dayName] = (acc[dayName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topSpendingDay = Object.entries(expensesByDay).sort(([,a], [,b]) => b - a)[0];

  // Calculate weekly average
  const weeklyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const daysDiff = (now.getTime() - expenseDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7;
  });
  
  const weeklyTotal = weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const insights = [
    {
      icon: monthlyChange > 0 ? TrendingUp : TrendingDown,
      color: monthlyChange > 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50',
      title: 'Monthly Trend',
      value: `${monthlyChange > 0 ? '+' : ''}${monthlyChange.toFixed(1)}%`,
      description: monthlyChange > 0 
        ? 'Higher than last month' 
        : monthlyChange < 0 
          ? 'Lower than last month'
          : 'Same as last month'
    },
    {
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
      title: 'Top Category',
      value: topCategory ? `₱${topCategory[1].toFixed(2)}` : '₱0.00',
      description: topCategory ? topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1) : 'No data'
    },
    {
      icon: Clock,
      color: 'text-purple-600 bg-purple-50',
      title: 'Busiest Day',
      value: topSpendingDay ? `₱${topSpendingDay[1].toFixed(2)}` : '₱0.00',
      description: topSpendingDay ? `${topSpendingDay[0]}s` : 'No data'
    }
  ];

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">💡 Smart Insights</h2>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
            <div className={`p-2 rounded-full ${insight.color}`}>
              <insight.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{insight.title}</span>
                <span className="font-semibold">{insight.value}</span>
              </div>
              <p className="text-xs text-gray-500">{insight.description}</p>
            </div>
          </div>
        ))}

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">₱{averageExpense.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Avg. per expense</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">₱{weeklyTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-500">This week</p>
            </div>
          </div>
        </div>

        {/* Spending Tips */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">💰 Tip</h3>
          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
            {monthlyChange > 15 
              ? "Your spending increased significantly this month. Consider reviewing your expenses."
              : weeklyTotal > thisMonthTotal * 0.3
                ? "You're spending quite a bit this week. Maybe slow down a little?"
                : topCategory && topCategory[1] > thisMonthTotal * 0.4
                  ? `Most of your budget goes to ${topCategory[0]}. Consider setting a budget for this category.`
                  : "Great job managing your expenses! Keep tracking to maintain good habits."
            }
          </p>
        </div>
      </div>
    </Card>
  );
};
