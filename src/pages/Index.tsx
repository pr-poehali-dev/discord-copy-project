import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Server {
  id: string;
  name: string;
  icon: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  isActive?: boolean;
}

interface Message {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

const Index = () => {
  const [activeView, setActiveView] = useState<'chat' | 'friends' | 'profile'>('chat');
  const [selectedServer, setSelectedServer] = useState('1');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [messageInput, setMessageInput] = useState('');

  const servers: Server[] = [
    { id: '1', name: 'Игровое Братство', icon: '🎮' },
    { id: '2', name: 'Космические Путники', icon: '🚀' },
    { id: '3', name: 'Киберспорт', icon: '⚡' },
  ];

  const channels: Channel[] = [
    { id: 'general', name: 'общий', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
    { id: 'voice-1', name: 'Голосовой 1', type: 'voice', isActive: true },
    { id: 'voice-2', name: 'Голосовой 2', type: 'voice' },
  ];

  const messages: Message[] = [
    { id: '1', author: 'Космонавт_228', avatar: '👨‍🚀', content: 'Всем привет! Кто в деле на катку?', time: '14:32' },
    { id: '2', author: 'GamerPro', avatar: '🎯', content: 'Я в деле! Запускайте лобби', time: '14:33' },
    { id: '3', author: 'NeonKnight', avatar: '⚔️', content: 'Дайте 5 минут, подключаюсь', time: '14:35' },
  ];

  const friends: Friend[] = [
    { id: '1', name: 'Космонавт_228', avatar: '👨‍🚀', status: 'online' },
    { id: '2', name: 'GamerPro', avatar: '🎯', status: 'online' },
    { id: '3', name: 'NeonKnight', avatar: '⚔️', status: 'away' },
    { id: '4', name: 'ShadowHunter', avatar: '🦇', status: 'offline' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-[hsl(var(--darker-bg))] text-foreground overflow-hidden">
      <div className="w-[72px] bg-[hsl(var(--dark-bg))] flex flex-col items-center py-3 gap-2 border-r border-border">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary/80 hover:rounded-2xl transition-all duration-200 neon-glow"
          onClick={() => setActiveView('chat')}
        >
          <Icon name="Home" size={24} />
        </Button>
        <Separator className="w-8" />
        {servers.map((server) => (
          <Button
            key={server.id}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 text-2xl ${
              selectedServer === server.id ? 'bg-primary neon-glow rounded-2xl' : 'bg-muted hover:bg-primary/50'
            }`}
            onClick={() => {
              setSelectedServer(server.id);
              setActiveView('chat');
            }}
          >
            {server.icon}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-muted hover:bg-primary/50 hover:rounded-2xl transition-all duration-200"
        >
          <Icon name="Plus" size={24} />
        </Button>
      </div>

      <div className="w-60 bg-[hsl(var(--dark-bg))] flex flex-col border-r border-border">
        <div className="h-12 px-4 flex items-center justify-between border-b border-border">
          <h2 className="font-bold text-foreground">
            {servers.find(s => s.id === selectedServer)?.name}
          </h2>
          <Icon name="ChevronDown" size={16} />
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-1">
            <div className="px-2 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Icon name="MessageSquare" size={14} />
                Текстовые каналы
              </h3>
            </div>
            {channels.filter(c => c.type === 'text').map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                className={`w-full justify-start h-8 px-2 ${
                  selectedChannel === channel.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setSelectedChannel(channel.id)}
              >
                <Icon name="Hash" size={16} className="mr-2" />
                {channel.name}
              </Button>
            ))}

            <div className="px-2 mt-4 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Icon name="Volume2" size={14} />
                Голосовые каналы
              </h3>
            </div>
            {channels.filter(c => c.type === 'voice').map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                className={`w-full justify-start h-8 px-2 relative ${
                  channel.isActive ? 'text-primary animate-pulse-glow' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon name="Volume2" size={16} className="mr-2" />
                {channel.name}
                {channel.isActive && (
                  <Badge variant="secondary" className="ml-auto text-xs bg-primary/20 text-primary">3</Badge>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="h-14 px-2 bg-[hsl(var(--darker-bg))] flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-sm">👨‍🚀</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Юра</p>
              <p className="text-xs text-muted-foreground">#1337</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setActiveView('profile')}>
              <Icon name="Settings" size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeView === 'chat' && (
          <>
            <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-[hsl(var(--dark-bg))]">
              <div className="flex items-center gap-2">
                <Icon name="Hash" size={20} className="text-muted-foreground" />
                <h2 className="font-semibold">{channels.find(c => c.id === selectedChannel)?.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setActiveView('friends')}>
                  <Icon name="Users" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Icon name="Search" size={20} />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3 hover:bg-muted/30 p-2 rounded-lg transition-colors animate-fade-in">
                    <Avatar className="w-10 h-10 mt-1">
                      <AvatarFallback className="bg-primary text-lg">{message.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-foreground">{message.author}</span>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-1">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-4 pb-6 pt-2">
              <div className="relative">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Сообщение в #${channels.find(c => c.id === selectedChannel)?.name}`}
                  className="pr-12 h-11 bg-muted border-none focus-visible:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      setMessageInput('');
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Icon name="Smile" size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'friends' && (
          <>
            <div className="h-12 px-4 flex items-center border-b border-border bg-[hsl(var(--dark-bg))]">
              <Icon name="Users" size={20} className="text-muted-foreground mr-2" />
              <h2 className="font-semibold">Друзья</h2>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary text-lg">{friend.avatar}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[hsl(var(--dark-bg))] ${getStatusColor(friend.status)}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{friend.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{friend.status}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="w-9 h-9">
                        <Icon name="MessageCircle" size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9">
                        <Icon name="MoreVertical" size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {activeView === 'profile' && (
          <>
            <div className="h-12 px-4 flex items-center border-b border-border bg-[hsl(var(--dark-bg))]">
              <Button variant="ghost" size="icon" className="w-9 h-9 mr-2" onClick={() => setActiveView('chat')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <h2 className="font-semibold">Настройки</h2>
            </div>

            <ScrollArea className="flex-1 px-6 py-6">
              <div className="max-w-2xl space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold mb-4 neon-text">Мой профиль</h3>
                  <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarFallback className="bg-primary text-4xl">👨‍🚀</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xl font-bold">Юра</p>
                        <p className="text-sm text-muted-foreground">Космонавт #1337</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Имя пользователя</label>
                        <Input defaultValue="Юра" className="mt-1 bg-muted border-none" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Email</label>
                        <Input defaultValue="yura@space.dev" className="mt-1 bg-muted border-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Настройки голоса</h3>
                  <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Устройство ввода</p>
                        <p className="text-sm text-muted-foreground">По умолчанию</p>
                      </div>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                        <Icon name="Mic" size={16} className="mr-2" />
                        Тест
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Устройство вывода</p>
                        <p className="text-sm text-muted-foreground">По умолчанию</p>
                      </div>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                        <Icon name="Volume2" size={16} className="mr-2" />
                        Тест
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Внешний вид</h3>
                  <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 p-4 border-2 border-primary rounded-lg bg-primary/10">
                        <div className="w-full h-20 bg-[hsl(var(--darker-bg))] rounded mb-2"></div>
                        <p className="text-center font-semibold neon-text">Темная тема</p>
                      </div>
                      <div className="flex-1 p-4 border-2 border-border rounded-lg opacity-50">
                        <div className="w-full h-20 bg-white rounded mb-2"></div>
                        <p className="text-center font-semibold">Светлая тема</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
