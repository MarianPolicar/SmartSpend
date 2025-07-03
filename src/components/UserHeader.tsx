
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const UserHeader = () => {
  const { user, logout } = useAuth();

  return (
    <Card className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Welcome back, {user?.name}!</h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </Card>
  );
};
