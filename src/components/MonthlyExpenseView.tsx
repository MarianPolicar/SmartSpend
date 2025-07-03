
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Calendar, TrendingUp } from 'lucide-react';
import { Expense } from '@/pages/Index';
import { ExpenseList } from './ExpenseList';

interface MonthlyExpenseViewProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

interface MonthlyData {
  month: string;
  year: number;
  expenses: Expense[];
  total: number;
}

export const MonthlyExpenseView = ({ expenses, onEdit, onDelete }: MonthlyExpenseViewProps) => {
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  // Group expenses by month and year
  const monthlyData: MonthlyData[] = expenses.reduce((acc, expense) => {
    const expenseDate = new Date(expense.date);
    const monthYear = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;
    const monthName = expenseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const existingMonth = acc.find(item => `${item.year}-${new Date(Date.parse(item.month + ' 1, ' + item.year)).getMonth()}` === monthYear);

    if (existingMonth) {
      existingMonth.expenses.push(expense);
      existingMonth.total += expense.amount;
    } else {
      acc.push({
        month: monthName,
        year: expenseDate.getFullYear(),
        expenses: [expense],
        total: expense.amount
      });
    }

    return acc;
  }, [] as MonthlyData[]);

  // Sort by year and month (newest first)
  monthlyData.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return new Date(Date.parse(b.month + ' 1, ' + b.year)).getMonth() - new Date(Date.parse(a.month + ' 1, ' + a.year)).getMonth();
  });

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthKey) 
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  if (expenses.length === 0) {
    return (
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Expenses</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-500">No expenses to show by month</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Monthly Expenses
      </h2>
      
      <div className="space-y-3">
        {monthlyData.map((monthData) => {
          const monthKey = `${monthData.year}-${monthData.month}`;
          const isExpanded = expandedMonths.includes(monthKey);

          return (
            <div key={monthKey} className="border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                onClick={() => toggleMonth(monthKey)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{monthData.month}</h3>
                    <p className="text-sm text-gray-600">{monthData.expenses.length} expenses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-lg">₱{monthData.total.toFixed(2)}</span>
                </div>
              </Button>
              
              {isExpanded && (
                <div className="p-4 bg-gray-50">
                  <ExpenseList
                    expenses={monthData.expenses}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
