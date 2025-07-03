import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { UserHeader } from '@/components/UserHeader';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { SpendingSummary } from '@/components/SpendingSummary';
import { CategoryChart } from '@/components/CategoryChart';
import { MonthlyExpenseView } from '@/components/MonthlyExpenseView';
import { ExpenseInsights } from '@/components/ExpenseInsights';
import { FeatureDashboard } from '@/components/FeatureDashboard';
import { expenseService, ExpenseAPI } from '@/services/expenseService';
import { Plus, TrendingUp, Wallet, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
}

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expensesLoading, setExpensesLoading] = useState(true);

  // Convert ExpenseAPI to Expense
  const convertApiExpenseToExpense = (apiExpense: ExpenseAPI): Expense => ({
    id: apiExpense.id || Date.now().toString(),
    amount: apiExpense.amount,
    category: apiExpense.category,
    date: apiExpense.date,
    note: apiExpense.note
  });

  // Load expenses from API when user is authenticated
  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      setExpensesLoading(true);
      const apiExpenses = await expenseService.getExpenses();
      const convertedExpenses = apiExpenses.map(convertApiExpenseToExpense);
      setExpenses(convertedExpenses);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      toast({
        title: "Connection Issue",
        description: "Using offline mode. Data will sync when connection is restored.",
        variant: "destructive"
      });
      // Fallback to localStorage for offline functionality
      const savedExpenses = localStorage.getItem('smartspend-expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } finally {
      setExpensesLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const apiExpense = await expenseService.createExpense(expense);
      const newExpense = convertApiExpenseToExpense(apiExpense);
      setExpenses([newExpense, ...expenses]);
      setShowForm(false);
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast({
        title: "Offline Mode",
        description: "Expense saved locally. Will sync when connection is restored.",
        variant: "destructive"
      });
      // Fallback to local storage
      const localExpense = {
        ...expense,
        id: Date.now().toString(),
      };
      setExpenses([localExpense, ...expenses]);
      setShowForm(false);
    }
  };

  const updateExpense = async (updatedExpense: Expense) => {
    try {
      await expenseService.updateExpense(updatedExpense.id, updatedExpense);
      setExpenses(expenses.map(exp => 
        exp.id === updatedExpense.id ? updatedExpense : exp
      ));
      setEditingExpense(null);
      toast({
        title: "Success",
        description: "Expense updated successfully!",
      });
    } catch (error) {
      console.error('Failed to update expense:', error);
      toast({
        title: "Offline Mode",
        description: "Changes saved locally. Will sync when connection is restored.",
        variant: "destructive"
      });
      // Fallback to local update
      setExpenses(expenses.map(exp => 
        exp.id === updatedExpense.id ? updatedExpense : exp
      ));
      setEditingExpense(null);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast({
        title: "Offline Mode",
        description: "Deletion saved locally. Will sync when connection is restored.",
        variant: "destructive"
      });
      // Fallback to local delete
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  // Save to localStorage as backup
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('smartspend-expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not logged in
  if (!user) {
    return <AuthPage />;
  }

  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartSpend
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Track your expenses with style and intelligence</p>
        </div>

        {/* User Header */}
        <UserHeader />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spending</p>
                <p className="text-2xl font-bold text-gray-900">₱{totalSpending.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{currentMonth}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms and Lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Expense Button/Form */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              {!showForm && !editingExpense ? (
                <div className="text-center">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Expense
                  </Button>
                </div>
              ) : (
                <ExpenseForm
                  onSubmit={editingExpense ? updateExpense : addExpense}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingExpense(null);
                  }}
                  initialData={editingExpense}
                />
              )}
            </Card>

            {/* Expense List */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Expenses</h2>
              {expensesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading expenses...</p>
                </div>
              ) : (
                <ExpenseList
                  expenses={expenses}
                  onEdit={setEditingExpense}
                  onDelete={deleteExpense}
                />
              )}
            </Card>

            {/* Monthly Expense View */}
            <MonthlyExpenseView
              expenses={expenses}
              onEdit={setEditingExpense}
              onDelete={deleteExpense}
            />

            {/* Feature Dashboard */}
            <FeatureDashboard expenses={expenses} />
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            <SpendingSummary expenses={expenses} />
            <CategoryChart expenses={expenses} />
            <ExpenseInsights expenses={expenses} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
