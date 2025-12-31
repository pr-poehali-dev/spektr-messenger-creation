export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  password: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  reactions: Reaction[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  userId: string;
  emoji: '❤️' | '👍' | '👎';
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel' | 'saved';
  name?: string;
  avatar?: string;
  participants: string[];
  lastMessage?: Message;
  isArchived: boolean;
  isPinned: boolean;
  isOfficial?: boolean;
  isBlocked?: boolean;
  createdBy?: string;
  description?: string;
  username?: string;
  isVerified?: boolean;
  unreadCount: number;
}

export type Theme = 'crystal' | 'purple-lime' | 'dark-blue' | 'white-black' | 'blue-light';

export type Language = 'ru' | 'en';
