
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Expense } from '@/pages/Index';

interface CategoryInsightsProps {
  expenses: Expense[];
  onBack: () => void;
}

export const CategoryInsights = ({ expenses, onBack }: CategoryInsightsProps) => {
  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalSpending) * 100,
      count: expenses.filter(e => e.category === category).length
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate monthly trends for top 3 categories
  const currentMonth = new Date().getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  
  const getMonthlySpending = (category: string, month: number) => {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && expense.category === category;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const top3Categories = categoryData.slice(0, 3).map(cat => {
    const currentSpending = getMonthlySpending(cat.category, currentMonth);
    const previousSpending = getMonthlySpending(cat.category, previousMonth);
    const trend = currentSpending > previousSpending ? 'up' : 'down';
    const trendPercentage = previousSpending > 0 
      ? Math.abs(((currentSpending - previousSpending) / previousSpending) * 100)
      : 0;
    
    return { ...cat, trend, trendPercentage, currentSpending, previousSpending };
  });

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <PieChart className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Category Deep Dive</h1>
            <p className="text-gray-600">Detailed breakdown of your spending categories</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(categoryTotals).length}
            </div>
            <div className="text-sm text-gray-600">Total Categories</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₱{totalSpending.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Spending</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ₱{categoryData.length > 0 ? (totalSpending / categoryData.length).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-600">Average per Category</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={category.category} className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-sm text-gray-600">
                      ₱{category.amount.toFixed(2)} ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {category.count} transaction{category.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends for Top Categories */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Monthly Trends - Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3Categories.map((category, index) => (
              <div key={category.category} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{category.category}</h3>
                  <div className={`flex items-center gap-1 text-sm ${
                    category.trend === 'up' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {category.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {category.trendPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>This Month:</span>
                    <span>₱{category.currentSpending.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Last Month:</span>
                    <span>₱{category.previousSpending.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryData.length > 0 && (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>{categoryData[0].category}</strong> is your largest expense category, 
                    accounting for <strong>{categoryData[0].percentage.toFixed(1)}%</strong> of your total spending.
                  </p>
                </div>
                {categoryData.length > 1 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm">
                      Your top 2 categories (<strong>{categoryData[0].category}</strong> and <strong>{categoryData[1].category}</strong>) 
                      make up <strong>{(categoryData[0].percentage + categoryData[1].percentage).toFixed(1)}%</strong> of your spending.
                    </p>
                  </div>
                )}
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm">
                    You have made a total of <strong>{expenses.length}</strong> transactions 
                    across <strong>{categoryData.length}</strong> different categories.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
