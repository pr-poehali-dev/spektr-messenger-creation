import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chat, Message } from '@/types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  activeChat: string | null;
  setActiveChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string, type?: 'text' | 'image' | 'video' | 'audio' | 'file', mediaUrl?: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: '❤️' | '👍' | '👎') => void;
  createChat: (username: string) => Chat | null;
  archiveChat: (chatId: string) => void;
  pinChat: (chatId: string) => void;
  blockChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  searchUsers: (query: string) => any[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const OFFICIAL_CHAT_ID = 'official-spektr';
const SAVED_MESSAGES_ID = 'saved-messages';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Initialize official chat and saved messages
      const officialChat: Chat = {
        id: OFFICIAL_CHAT_ID,
        type: 'direct',
        name: 'Spektr',
        avatar: '/placeholder.svg',
        participants: [user.id, 'admin-spektr'],
        isArchived: false,
        isPinned: true,
        isOfficial: true,
        isVerified: true,
        username: 'spektr',
        unreadCount: 0,
      };

      const savedMessages: Chat = {
        id: SAVED_MESSAGES_ID,
        type: 'saved',
        name: 'Избранное',
        participants: [user.id],
        isArchived: false,
        isPinned: true,
        unreadCount: 0,
      };

      // Welcome message
      const welcomeMessage: Message = {
        id: 'welcome-msg',
        chatId: OFFICIAL_CHAT_ID,
        senderId: 'admin-spektr',
        content: 'Это официальный чат со Spektr, если у вас остались пожелания или вопросы, пожалуйста напишите их в чат.',
        type: 'text',
        reactions: [],
        isEdited: false,
        isDeleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      setChats([savedMessages, officialChat]);
      setMessages({ [OFFICIAL_CHAT_ID]: [welcomeMessage] });

      // Load from localStorage
      const savedChats = localStorage.getItem(`spektr_chats_${user.id}`);
      const savedMessages = localStorage.getItem(`spektr_messages_${user.id}`);

      if (savedChats) {
        setChats(JSON.parse(savedChats));
      }

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`spektr_chats_${user.id}`, JSON.stringify(chats));
      localStorage.setItem(`spektr_messages_${user.id}`, JSON.stringify(messages));
    }
  }, [chats, messages, user]);

  const sendMessage = (chatId: string, content: string, type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text', mediaUrl?: string) => {
    if (!user) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: user.id,
      content,
      type,
      mediaUrl,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage: newMessage, unreadCount: chat.id === activeChat ? 0 : chat.unreadCount + 1 }
        : chat
    ));
  };

  const editMessage = (messageId: string, newContent: string) => {
    setMessages(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(chatId => {
        updated[chatId] = updated[chatId].map(msg =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true, updatedAt: new Date() }
            : msg
        );
      });
      return updated;
    });
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(chatId => {
        updated[chatId] = updated[chatId].filter(msg => msg.id !== messageId);
      });
      return updated;
    });
  };

  const addReaction = (messageId: string, emoji: '❤️' | '👍' | '👎') => {
    if (!user) return;

    setMessages(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(chatId => {
        updated[chatId] = updated[chatId].map(msg => {
          if (msg.id === messageId) {
            const existingReaction = msg.reactions.find(r => r.userId === user.id);
            if (existingReaction) {
              if (existingReaction.emoji === emoji) {
                return { ...msg, reactions: msg.reactions.filter(r => r.userId !== user.id) };
              } else {
                return { ...msg, reactions: msg.reactions.map(r => r.userId === user.id ? { ...r, emoji } : r) };
              }
            } else {
              return { ...msg, reactions: [...msg.reactions, { userId: user.id, emoji }] };
            }
          }
          return msg;
        });
      });
      return updated;
    });
  };

  const createChat = (username: string): Chat | null => {
    if (!user) return null;

    const existingChat = chats.find(c => c.username === username);
    if (existingChat) {
      setActiveChat(existingChat.id);
      return existingChat;
    }

    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      type: 'direct',
      name: username,
      username,
      participants: [user.id, username],
      isArchived: false,
      isPinned: false,
      unreadCount: 0,
    };

    setChats(prev => [...prev, newChat]);
    setActiveChat(newChat.id);
    return newChat;
  };

  const archiveChat = (chatId: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
    ));
  };

  const pinChat = (chatId: string) => {
    if (chatId === OFFICIAL_CHAT_ID || chatId === SAVED_MESSAGES_ID) return;
    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  };

  const blockChat = (chatId: string) => {
    if (chatId === OFFICIAL_CHAT_ID) return;
    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isBlocked: !chat.isBlocked } : chat
    ));
  };

  const deleteChat = (chatId: string) => {
    if (chatId === OFFICIAL_CHAT_ID || chatId === SAVED_MESSAGES_ID) return;
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  const searchUsers = (query: string) => {
    const allUsers = JSON.parse(localStorage.getItem('spektr_users') || '[]');
    return allUsers.filter((u: any) => 
      u.username.toLowerCase().includes(query.toLowerCase()) && u.id !== user?.id
    );
  };

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      activeChat,
      setActiveChat,
      sendMessage,
      editMessage,
      deleteMessage,
      addReaction,
      createChat,
      archiveChat,
      pinChat,
      blockChat,
      deleteChat,
      searchUsers,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
