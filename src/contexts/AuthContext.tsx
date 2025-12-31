import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Theme, Language } from '@/types';

interface AuthContextType {
  user: User | null;
  theme: Theme;
  language: Language;
  login: (username: string, password: string, remember: boolean) => boolean;
  register: (email: string, username: string, displayName: string, password: string, remember: boolean) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial admin account
const ADMIN_ACCOUNT: User = {
  id: 'admin-spektr',
  email: 'chats@spektr.ru',
  username: 'spektr',
  displayName: 'Spektr',
  password: 'zzzz-2014',
  isVerified: true,
  isAdmin: true,
  createdAt: new Date('2024-01-01'),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setThemeState] = useState<Theme>('crystal');
  const [language, setLanguageState] = useState<Language>('ru');
  const [users, setUsers] = useState<User[]>([ADMIN_ACCOUNT]);

  useEffect(() => {
    // Load from localStorage
    const savedUser = localStorage.getItem('spektr_user');
    const savedUsers = localStorage.getItem('spektr_users');
    const savedTheme = localStorage.getItem('spektr_theme') as Theme;
    const savedLanguage = localStorage.getItem('spektr_language') as Language;

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedTheme) {
      setThemeState(savedTheme);
      document.body.className = savedTheme === 'crystal' ? '' : `theme-${savedTheme}`;
    }

    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('spektr_theme', newTheme);
    document.body.className = newTheme === 'crystal' ? '' : `theme-${newTheme}`;
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('spektr_language', newLanguage);
  };

  const login = (username: string, password: string, remember: boolean): boolean => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      if (remember) {
        localStorage.setItem('spektr_user', JSON.stringify(foundUser));
      }
      return true;
    }
    return false;
  };

  const register = (email: string, username: string, displayName: string, password: string, remember: boolean): boolean => {
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      username,
      displayName,
      password,
      createdAt: new Date(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('spektr_users', JSON.stringify(updatedUsers));

    setUser(newUser);
    if (remember) {
      localStorage.setItem('spektr_user', JSON.stringify(newUser));
    }

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('spektr_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('spektr_users', JSON.stringify(updatedUsers));
      localStorage.setItem('spektr_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, theme, language, login, register, logout, updateUser, setTheme, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
