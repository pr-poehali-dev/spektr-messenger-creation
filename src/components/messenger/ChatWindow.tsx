import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ChatWindow = () => {
  const { chats, messages, activeChat, sendMessage, editMessage, deleteMessage, addReaction } = useChat();
  const { user, language } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const texts = {
    ru: {
      typeMessage: 'Введите сообщение...',
      edit: 'Редактировать',
      delete: 'Удалить',
      react: 'Реакция',
      edited: '(изменено)',
      noChat: 'Выберите чат',
    },
    en: {
      typeMessage: 'Type a message...',
      edit: 'Edit',
      delete: 'Delete',
      react: 'React',
      edited: '(edited)',
      noChat: 'Select a chat',
    },
  };

  const t = texts[language];

  const currentChat = chats.find(c => c.id === activeChat);
  const currentMessages = activeChat ? messages[activeChat] || [] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleSend = () => {
    if (messageText.trim() && activeChat) {
      sendMessage(activeChat, messageText.trim());
      setMessageText('');
    }
  };

  const handleEdit = (msg: Message) => {
    setEditingMessage(msg.id);
    setEditText(msg.content);
  };

  const handleSaveEdit = () => {
    if (editingMessage && editText.trim()) {
      editMessage(editingMessage, editText.trim());
      setEditingMessage(null);
      setEditText('');
    }
  };

  const renderMessage = (msg: Message) => {
    const isOwn = msg.senderId === user?.id;
    const isEditing = editingMessage === msg.id;
    const isOfficial = currentChat?.isOfficial && msg.senderId !== user?.id;

    return (
      <div
        key={msg.id}
        className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={''} />
          <AvatarFallback>{isOwn ? user?.displayName[0] : currentChat?.name?.[0]}</AvatarFallback>
        </Avatar>

        <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {isEditing ? (
            <div className="flex gap-2 w-full">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSaveEdit}>
                <Icon name="Check" size={16} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingMessage(null)}>
                <Icon name="X" size={16} />
              </Button>
            </div>
          ) : (
            <div
              className={`group relative px-4 py-2 rounded-2xl ${
                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <p className="text-sm break-words">{msg.content}</p>
              {msg.isEdited && (
                <span className="text-xs opacity-70 ml-2">{t.edited}</span>
              )}

              {!isOfficial && isOwn && (
                <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Icon name="MoreVertical" size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(msg)}>
                        <Icon name="Edit" size={14} className="mr-2" />
                        {t.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteMessage(msg.id)}>
                        <Icon name="Trash" size={14} className="mr-2" />
                        {t.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          )}

          {msg.reactions.length > 0 && (
            <div className="flex gap-1">
              {['❤️', '👍', '👎'].map(emoji => {
                const count = msg.reactions.filter(r => r.emoji === emoji).length;
                if (count === 0) return null;
                return (
                  <button
                    key={emoji}
                    onClick={() => addReaction(msg.id, emoji as any)}
                    className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80"
                  >
                    {emoji} {count}
                  </button>
                );
              })}
            </div>
          )}

          {!isOfficial && (
            <div className="flex gap-1">
              {['❤️', '👍', '👎'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addReaction(msg.id, emoji as any)}
                  className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        {t.noChat}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={currentChat?.avatar} />
          <AvatarFallback>{currentChat?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{currentChat?.name || currentChat?.username}</h2>
            {currentChat?.isVerified && (
              <Icon name="BadgeCheck" size={18} className="text-[hsl(var(--verified))]" />
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {currentMessages.map(renderMessage)}
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.typeMessage}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
