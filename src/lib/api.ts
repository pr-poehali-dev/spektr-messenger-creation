const API_URL = 'https://functions.poehali.dev/b47e1733-15ac-48e5-a46e-c28b9a44ac93';

export const api = {
  async login(username: string, password: string) {
    const response = await fetch(`${API_URL}/?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  async register(email: string, username: string, displayName: string, password: string) {
    const response = await fetch(`${API_URL}/?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, displayName, password }),
    });
    return response.json();
  },

  async getChats(userId: number) {
    const response = await fetch(`${API_URL}/?action=get_chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  async getMessages(chatId: number) {
    const response = await fetch(`${API_URL}/?action=get_messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId }),
    });
    return response.json();
  },

  async sendMessage(chatId: number, senderId: number, content: string, type = 'text', mediaUrl?: string) {
    const response = await fetch(`${API_URL}/?action=send_message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, senderId, content, type, mediaUrl }),
    });
    return response.json();
  },

  async updateProfile(userId: number, updates: any) {
    const response = await fetch(`${API_URL}/?action=update_profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    return response.json();
  },

  async searchUsers(query: string, userId: number) {
    const response = await fetch(`${API_URL}/?action=search_users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userId }),
    });
    return response.json();
  },
};
