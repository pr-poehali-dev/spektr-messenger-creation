import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ChatList } from '@/components/messenger/ChatList';
import { ChatWindow } from '@/components/messenger/ChatWindow';
import { ProfilePanel } from '@/components/messenger/ProfilePanel';
import { SearchPanel } from '@/components/messenger/SearchPanel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';

const MessengerLayout = () => {
  const { user, language } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const texts = {
    ru: { search: 'Поиск', profile: 'Профиль' },
    en: { search: 'Search', profile: 'Profile' },
  };

  const t = texts[language];

  return (
    <ChatProvider>
      <div className="h-screen flex flex-col bg-background">
        <header className="border-b px-4 py-3 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <img src="/placeholder.svg" alt="Spektr" className="w-8 h-8" />
            <h1 className="text-xl font-bold">Spektr</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              title={t.search}
            >
              <Icon name="Search" size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfile(true)}
              title={t.profile}
            >
              <Icon name="User" size={20} />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r bg-card flex-shrink-0">
            <ChatList />
          </div>

          <div className="flex-1 flex">
            <div className="flex-1">
              <ChatWindow />
            </div>

            {showProfile && (
              <div className="w-96 border-l bg-card flex-shrink-0 animate-in slide-in-from-right">
                <ProfilePanel onClose={() => setShowProfile(false)} />
              </div>
            )}

            {showSearch && (
              <div className="w-96 border-l bg-card flex-shrink-0 animate-in slide-in-from-right">
                <SearchPanel onClose={() => setShowSearch(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

const AuthLayout = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20">
      {showRegister ? (
        <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
      )}
    </div>
  );
};

const IndexPage = () => {
  const { user } = useAuth();

  return user ? <MessengerLayout /> : <AuthLayout />;
};

const Index = () => {
  return (
    <AuthProvider>
      <IndexPage />
    </AuthProvider>
  );
};

export default Index;
