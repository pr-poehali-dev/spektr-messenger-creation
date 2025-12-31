import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const { login, language } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const texts = {
    ru: {
      login: 'Вход',
      username: 'Имя пользователя',
      password: 'Пароль',
      remember: 'Запомнить меня',
      submit: 'Войти',
      noAccount: 'Нет аккаунта?',
      register: 'Зарегистрироваться',
      error: 'Неверное имя пользователя или пароль',
    },
    en: {
      login: 'Login',
      username: 'Username',
      password: 'Password',
      remember: 'Remember me',
      submit: 'Sign In',
      noAccount: "Don't have an account?",
      register: 'Register',
      error: 'Invalid username or password',
    },
  };

  const t = texts[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, password, remember)) {
      // Success - handled by AuthContext
    } else {
      setError(t.error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <img src="/placeholder.svg" alt="Spektr" className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">{t.login}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">{t.username}</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm cursor-pointer">
            {t.remember}
          </Label>
        </div>

        {error && (
          <div className="text-destructive text-sm text-center">{error}</div>
        )}

        <Button type="submit" className="w-full">
          {t.submit}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t.noAccount} </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:underline font-medium"
          >
            {t.register}
          </button>
        </div>
      </form>
    </div>
  );
};
