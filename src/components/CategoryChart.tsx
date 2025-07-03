
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Filter, TrendingUp, ChevronDown } from 'lucide-react';
import { Expense } from '@/pages/Index';

interface CategoryChartProps {
  expenses: Expense[];
}

const categoryConfig = {
  food: { label: 'Food & Dining', color: '#EF4444' },
  transport: { label: 'Transportation', color: '#3B82F6' },
  bills: { label: 'Bills & Utilities', color: '#EAB308' },
  shopping: { label: 'Shopping', color: '#A855F7' },
  entertainment: { label: 'Entertainment', color: '#10B981' },
  health: { label: 'Healthcare', color: '#EC4899' },
  education: { label: 'Education', color: '#6366F1' },
  other: { label: 'Other', color: '#6B7280' },
};

type FilterType = 'week' | 'month' | 'all' | string; // string for specific months

export const CategoryChart = ({ expenses }: CategoryChartProps) => {
  const [filter, setFilter] = useState<FilterType>('month');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get unique months from expense records
  const getAvailableMonths = () => {
    const months = new Set<string>();
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthYear = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;
      months.add(monthYear);
    });
    
    return Array.from(months).sort().map(monthYear => {
      const [year, month] = monthYear.split('-').map(Number);
      return {
        key: monthYear,
        label: new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    });
  };

  const availableMonths = getAvailableMonths();

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
        // Specific month filter
        if (filter.includes('-')) {
          const [year, month] = filter.split('-').map(Number);
          return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
          });
        }
        return expenses;
    }
  };

  const filteredExpenses = getFilteredExpenses();

  // Group expenses by category
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data
  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: categoryConfig[category as keyof typeof categoryConfig]?.label || category,
    value: amount,
    color: categoryConfig[category as keyof typeof categoryConfig]?.color || '#6B7280',
  }));

  // Sort by value descending
  chartData.sort((a, b) => b.value - a.value);

  const getFilterLabel = () => {
    switch (filter) {
      case 'week': 
        return 'Last 7 Days';
      case 'month': 
        return 'This Month';
      case 'all': 
        return 'All Time';
      default:
        const selectedMonth = availableMonths.find(m => m.key === filter);
        return selectedMonth ? selectedMonth.label : 'Selected Month';
    }
  };

  if (filteredExpenses.length === 0) {
    return (
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Spending by Category</h2>
          <Filter className="w-4 h-4 text-gray-500" />
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
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
          
          {/* Month Dropdown */}
          <div className="relative">
            <Button
              size="sm"
              variant={!['week', 'month', 'all'].includes(filter) ? 'default' : 'outline'}
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="text-xs flex items-center gap-1"
            >
              Specific Month
              <ChevronDown className="w-3 h-3" />
            </Button>
            
            {showMonthDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto min-w-[150px]">
                {availableMonths.map((month) => (
                  <button
                    key={month.key}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                    onClick={() => {
                      setFilter(month.key);
                      setShowMonthDropdown(false);
                    }}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500">No expenses for {getFilterLabel().toLowerCase()}</p>
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">₱{data.value.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Spending by Category</h2>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">₱{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
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
        
        {/* Month Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            variant={!['week', 'month', 'all'].includes(filter) ? 'default' : 'outline'}
            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            className="text-xs flex items-center gap-1"
          >
            Specific Month
            <ChevronDown className="w-3 h-3" />
          </Button>
          
          {showMonthDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto min-w-[150px]">
              {availableMonths.map((month) => (
                <button
                  key={month.key}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                  onClick={() => {
                    setFilter(month.key);
                    setShowMonthDropdown(false);
                  }}
                >
                  {month.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{getFilterLabel()} • {filteredExpenses.length} expenses</p>
      
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {chartData.map((category, index) => {
          const percentage = ((category.value / totalAmount) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-700">{category.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">₱{category.value.toFixed(2)}</span>
                <span className="text-xs text-gray-500 ml-2">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
