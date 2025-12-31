import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const { register, language } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const texts = {
    ru: {
      register: 'Регистрация',
      email: 'E-mail',
      username: 'Имя пользователя',
      displayName: 'Отображаемое имя',
      password: 'Пароль',
      remember: 'Запомнить меня',
      submit: 'Зарегистрироваться',
      hasAccount: 'Уже есть аккаунт?',
      login: 'Войти',
      error: 'Это имя пользователя уже занято',
    },
    en: {
      register: 'Registration',
      email: 'E-mail',
      username: 'Username',
      displayName: 'Display Name',
      password: 'Password',
      remember: 'Remember me',
      submit: 'Register',
      hasAccount: 'Already have an account?',
      login: 'Login',
      error: 'This username is already taken',
    },
  };

  const t = texts[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (register(email, username, displayName, password, remember)) {
      // Success - handled by AuthContext
    } else {
      setError(t.error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <img src="/placeholder.svg" alt="Spektr" className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">{t.register}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">{t.email}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>

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
          <Label htmlFor="displayName">{t.displayName}</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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
          <span className="text-muted-foreground">{t.hasAccount} </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            {t.login}
          </button>
        </div>
      </form>
    </div>
  );
};
