import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Chat } from '@/types';

export const ChatList = () => {
  const { chats, activeChat, setActiveChat, messages } = useChat();
  const { language } = useAuth();

  const texts = {
    ru: { noChats: 'Нет чатов', saved: 'Избранное' },
    en: { noChats: 'No chats', saved: 'Saved Messages' },
  };

  const t = texts[language];

  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    const aLastMsg = messages[a.id]?.[messages[a.id].length - 1];
    const bLastMsg = messages[b.id]?.[messages[b.id].length - 1];
    
    if (!aLastMsg && !bLastMsg) return 0;
    if (!aLastMsg) return 1;
    if (!bLastMsg) return -1;
    
    return new Date(bLastMsg.createdAt).getTime() - new Date(aLastMsg.createdAt).getTime();
  });

  const renderChat = (chat: Chat) => {
    const lastMessage = messages[chat.id]?.[messages[chat.id].length - 1];
    const chatName = chat.type === 'saved' ? t.saved : chat.name || chat.username || 'User';

    return (
      <div
        key={chat.id}
        onClick={() => setActiveChat(chat.id)}
        className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
          activeChat === chat.id ? 'bg-accent' : ''
        }`}
      >
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={chat.avatar} />
          <AvatarFallback>
            {chat.type === 'saved' ? '⭐' : chatName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{chatName}</h3>
            {chat.isVerified && (
              <Icon name="BadgeCheck" size={16} className="text-[hsl(var(--verified))] flex-shrink-0" />
            )}
            {chat.isPinned && (
              <Icon name="Pin" size={14} className="text-muted-foreground flex-shrink-0" />
            )}
          </div>
          {lastMessage && (
            <p className="text-xs text-muted-foreground truncate">
              {lastMessage.type === 'text' ? lastMessage.content : `[${lastMessage.type}]`}
            </p>
          )}
        </div>

        {chat.unreadCount > 0 && (
          <Badge variant="default" className="ml-2 flex-shrink-0">
            {chat.unreadCount}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        {sortedChats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t.noChats}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedChats.map(renderChat)}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
