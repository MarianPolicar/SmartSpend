import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleMode = () => setIsLogin(!isLogin);

  // Callback to redirect after auth
  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {isLogin ? (
        <LoginForm onToggleMode={toggleMode} onSuccess={handleSuccess} />
      ) : (
        <SignupForm onToggleMode={toggleMode} onSuccess={handleSuccess} />
      )}
    </div>
  );
};
