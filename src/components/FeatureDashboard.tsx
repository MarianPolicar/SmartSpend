
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  Calendar, 
  PieChart, 
  Download,
  Upload,
  Bell,
  CreditCard
} from 'lucide-react';
import { Expense } from '@/pages/Index';
import { BudgetGoals } from './features/BudgetGoals';
import { CategoryInsights } from './features/CategoryInsights';

interface FeatureDashboardProps {
  expenses: Expense[];
}

export const FeatureDashboard = ({ expenses }: FeatureDashboardProps) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'budget-goals',
      title: 'Budget Goals',
      description: 'Set and track monthly spending goals',
      icon: Target,
      color: 'bg-green-100 text-green-600',
      action: 'Set Goals',
      comingSoon: false
    },
    {
      id: 'expense-calculator',
      title: 'Expense Calculator',
      description: 'Calculate and split expenses with others',
      icon: Calculator,
      color: 'bg-blue-100 text-blue-600',
      action: 'Open Calculator',
      comingSoon: true
    },
    {
      id: 'expense-trends',
      title: 'Spending Trends',
      description: 'Analyze your spending patterns over time',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      action: 'View Trends',
      comingSoon: true
    },
    {
      id: 'recurring-expenses',
      title: 'Recurring Expenses',
      description: 'Track monthly bills and subscriptions',
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600',
      action: 'Manage Recurring',
      comingSoon: true
    },
    {
      id: 'category-insights',
      title: 'Category Deep Dive',
      description: 'Detailed breakdown of spending categories',
      icon: PieChart,
      color: 'bg-pink-100 text-pink-600',
      action: 'View Insights',
      comingSoon: false
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download your expense data as CSV/PDF',
      icon: Download,
      color: 'bg-indigo-100 text-indigo-600',
      action: 'Export',
      comingSoon: true
    },
    {
      id: 'import-data',
      title: 'Import Expenses',
      description: 'Import expenses from bank statements',
      icon: Upload,
      color: 'bg-teal-100 text-teal-600',
      action: 'Import',
      comingSoon: true
    },
    {
      id: 'expense-alerts',
      title: 'Smart Alerts',
      description: 'Get notified about unusual spending patterns',
      icon: Bell,
      color: 'bg-yellow-100 text-yellow-600',
      action: 'Setup Alerts',
      comingSoon: true
    },
    {
      id: 'payment-methods',
      title: 'Payment Tracking',
      description: 'Track expenses by payment method',
      icon: CreditCard,
      color: 'bg-red-100 text-red-600',
      action: 'Setup Methods',
      comingSoon: true
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    console.log(`Feature clicked: ${featureId}`);
    const feature = features.find(f => f.id === featureId);
    if (feature && !feature.comingSoon) {
      setActiveFeature(featureId);
    }
  };

  const handleBackToDashboard = () => {
    setActiveFeature(null);
  };

  // Render specific feature component
  if (activeFeature === 'budget-goals') {
    return <BudgetGoals expenses={expenses} onBack={handleBackToDashboard} />;
  }
  
  if (activeFeature === 'category-insights') {
    return <CategoryInsights expenses={expenses} onBack={handleBackToDashboard} />;
  }

  // Render main dashboard
  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Feature Dashboard</h2>
          <p className="text-sm text-gray-600">Explore additional tools and features</p>
        </div>
        <div className="text-sm text-gray-500">
          {expenses.length} total expenses
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="relative p-4 border rounded-lg hover:shadow-md transition-shadow bg-white/50"
          >
            {feature.comingSoon && (
              <div className="absolute top-2 right-2 bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                Coming Soon
              </div>
            )}
            
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${feature.color}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              </div>
            </div>

            <Button
              size="sm"
              variant={feature.comingSoon ? 'outline' : 'default'}
              disabled={feature.comingSoon}
              onClick={() => handleFeatureClick(feature.id)}
              className="w-full text-xs"
            >
              {feature.action}
            </Button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 px-4 gap-2"
            onClick={() => handleFeatureClick('quick-add')}
          >
            <Calculator className="w-4 h-4" />
            <span className="text-xs">Quick Add</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 px-4 gap-2"
            onClick={() => handleFeatureClick('monthly-summary')}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Monthly Summary</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 px-4 gap-2"
            onClick={() => handleFeatureClick('spending-goals')}
          >
            <Target className="w-4 h-4" />
            <span className="text-xs">Set Goals</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 px-4 gap-2"
            onClick={() => handleFeatureClick('insights')}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">View Insights</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
