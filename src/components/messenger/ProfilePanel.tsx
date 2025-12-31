import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { Theme, Language } from '@/types';

interface ProfilePanelProps {
  onClose: () => void;
}

export const ProfilePanel = ({ onClose }: ProfilePanelProps) => {
  const { user, logout, updateUser, theme, setTheme, language, setLanguage } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const texts = {
    ru: {
      profile: 'Профиль',
      email: 'E-mail',
      username: 'Имя пользователя',
      displayName: 'Отображаемое имя',
      bio: 'Описание',
      password: 'Новый пароль',
      theme: 'Тема',
      language: 'Язык',
      save: 'Сохранить изменения',
      logout: 'Выйти',
      themes: {
        crystal: 'Кристальная',
        'purple-lime': 'Фиолетово-лаймовая',
        'dark-blue': 'Темно-синяя',
        'white-black': 'Бело-черная',
        'blue-light': 'Сине-светлая',
      },
      languages: {
        ru: 'Русский',
        en: 'English',
      },
    },
    en: {
      profile: 'Profile',
      email: 'E-mail',
      username: 'Username',
      displayName: 'Display Name',
      bio: 'Bio',
      password: 'New Password',
      theme: 'Theme',
      language: 'Language',
      save: 'Save Changes',
      logout: 'Logout',
      themes: {
        crystal: 'Crystal',
        'purple-lime': 'Purple-Lime',
        'dark-blue': 'Dark Blue',
        'white-black': 'White-Black',
        'blue-light': 'Blue-Light',
      },
      languages: {
        ru: 'Русский',
        en: 'English',
      },
    },
  };

  const t = texts[language];

  const handleSave = () => {
    const updates: any = { email, bio, avatar };
    if (password) {
      updates.password = password;
    }
    updateUser(updates);
    onClose();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t.profile}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-2xl">
                {user?.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Input
              placeholder="Avatar URL"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.username}</Label>
            <Input value={user?.username} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Имя пользователя изменить нельзя' : 'Username cannot be changed'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t.displayName}</Label>
            <Input value={user?.displayName} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>{t.email}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.password}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'ru' ? 'Оставьте пустым, чтобы не менять' : 'Leave empty to keep current'}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.bio}</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={language === 'ru' ? 'Расскажите о себе...' : 'Tell about yourself...'}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.theme}</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crystal">{t.themes.crystal}</SelectItem>
                <SelectItem value="purple-lime">{t.themes['purple-lime']}</SelectItem>
                <SelectItem value="dark-blue">{t.themes['dark-blue']}</SelectItem>
                <SelectItem value="white-black">{t.themes['white-black']}</SelectItem>
                <SelectItem value="blue-light">{t.themes['blue-light']}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.language}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">{t.languages.ru}</SelectItem>
                <SelectItem value="en">{t.languages.en}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={handleSave} className="w-full">
              {t.save}
            </Button>
            <Button onClick={logout} variant="destructive" className="w-full">
              {t.logout}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
