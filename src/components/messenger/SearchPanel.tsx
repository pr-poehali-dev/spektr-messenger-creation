import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

interface SearchPanelProps {
  onClose: () => void;
}

export const SearchPanel = ({ onClose }: SearchPanelProps) => {
  const { searchUsers, createChat } = useChat();
  const { language } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const texts = {
    ru: {
      search: 'Поиск пользователей',
      placeholder: 'Введите имя пользователя...',
      noResults: 'Пользователи не найдены',
      startChat: 'Начать чат',
      verified: 'Верифицирован',
    },
    en: {
      search: 'Search Users',
      placeholder: 'Enter username...',
      noResults: 'No users found',
      startChat: 'Start Chat',
      verified: 'Verified',
    },
  };

  const t = texts[language];

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const users = searchUsers(value.trim());
      setResults(users);
    } else {
      setResults([]);
    }
  };

  const handleStartChat = (username: string) => {
    createChat(username);
    onClose();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t.search}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t.placeholder}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {results.length === 0 && query ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t.noResults}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.displayName[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.displayName}</h3>
                    {user.isVerified && (
                      <Icon name="BadgeCheck" size={16} className="text-[hsl(var(--verified))]" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>

                <Button
                  onClick={() => handleStartChat(user.username)}
                  size="sm"
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  {t.startChat}
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
