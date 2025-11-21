import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  authorId: string;
  avatar: string;
  content: string;
  time: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  activity?: string;
}

interface DirectMessage {
  id: string;
  friendId: string;
  messages: Message[];
  unread: number;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎮', '🚀', '⚡'];

const Index = () => {
  const [activeView, setActiveView] = useState<'dm' | 'server' | 'friends' | 'profile' | 'add-friend'>('dm');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [inCall, setInCall] = useState(false);
  const [callWith, setCallWith] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [friendCode, setFriendCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [myCode] = useState('YURA#1337');
  const [language, setLanguage] = useState('ru');
  const [theme, setTheme] = useState('dark');
  const [inputDevice, setInputDevice] = useState('default');
  const [outputDevice, setOutputDevice] = useState('default');
  const [notifications, setNotifications] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const [myStatus, setMyStatus] = useState<'online' | 'away' | 'offline'>('online');

  const servers: Server[] = [
    { id: '1', name: 'Игровое Братство', icon: '🎮' },
    { id: '2', name: 'Космические Путники', icon: '🚀' },
    { id: '3', name: 'Киберспорт', icon: '⚡' },
  ];

  const channels: Channel[] = [
    { id: 'general', name: 'общий', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
    { id: 'voice-1', name: 'Голосовой 1', type: 'voice', isActive: false },
    { id: 'voice-2', name: 'Голосовой 2', type: 'voice', isActive: false },
  ];

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
    { id: 'dm1', friendId: '1', messages: [], unread: 0 },
    { id: 'dm2', friendId: '2', messages: [], unread: 0 },
  ]);

  const friends: Friend[] = [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        const randomUser = ['GamerPro', 'NeonKnight'][Math.floor(Math.random() * 2)];
        setTypingUsers([randomUser]);
        setTimeout(() => setTypingUsers([]), 2000);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isTyping]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      author: 'Юра',
      authorId: 'me',
      avatar: '👨‍🚀',
      content: messageInput,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    setIsTyping(false);

    setTimeout(() => {
      const responses = [
        'Понял, уже в деле!',
        'Отлично, начинаем!',
        'Согласен, поехали!',
        'Круто, я с вами',
      ];
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        author: ['GamerPro', 'NeonKnight'][Math.floor(Math.random() * 2)],
        authorId: Math.random().toString(),
        avatar: ['🎯', '⚔️'][Math.floor(Math.random() * 2)],
        content: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        reactions: [],
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes('me')) {
            return {
              ...msg,
              reactions: reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== 'me') }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            return {
              ...msg,
              reactions: reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, users: [...r.users, 'me'] }
                  : r
              )
            };
          }
        } else {
          return {
            ...msg,
            reactions: [...reactions, { emoji, count: 1, users: ['me'] }]
          };
        }
      }
      return msg;
    }));
    setShowEmojiPicker(null);
  };

  const startCall = (friendId: string, friendName: string) => {
    setInCall(true);
    setCallWith(friendName);
  };

  const endCall = () => {
    setInCall(false);
    setCallWith(null);
    setIsMuted(false);
    setIsDeafened(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleDeafen = () => setIsDeafened(!isDeafened);

  const addFriendByCode = () => {
    if (friendCode.trim()) {
      alert(`Запрос в друзья отправлен: ${friendCode}`);
      setFriendCode('');
    }
  };

  const copyMyCode = () => {
    navigator.clipboard.writeText(myCode);
    alert('Код скопирован в буфер обмена!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'В сети';
      case 'away': return 'Не на месте';
      default: return 'Не в сети';
    }
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDMWithFriend = (friendId: string) => {
    setActiveView('dm');
    setSelectedDM(friendId);
    const dm = directMessages.find(d => d.friendId === friendId);
    if (dm) {
      setMessages(dm.messages);
      setDirectMessages(directMessages.map(d => 
        d.friendId === friendId ? { ...d, unread: 0 } : d
      ));
    } else {
      const newDM: DirectMessage = {
        id: `dm${Date.now()}`,
        friendId,
        messages: [],
        unread: 0,
      };
      setDirectMessages([...directMessages, newDM]);
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen bg-[hsl(var(--darker-bg))] text-foreground overflow-hidden">
      <div className="w-[72px] bg-[hsl(var(--dark-bg))] flex flex-col items-center py-3 gap-2 border-r border-border">
        <Button
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 ${
            activeView === 'dm' ? 'bg-primary neon-glow rounded-2xl' : 'bg-primary/50 hover:bg-primary/80'
          }`}
          onClick={() => {
            setActiveView('dm');
            setSelectedServer(null);
          }}
        >
          <Icon name="MessageSquare" size={24} />
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
              setActiveView('server');
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
            {activeView === 'dm' ? 'Личные сообщения' : servers.find(s => s.id === selectedServer)?.name || 'Сервер'}
          </h2>
          <Icon name="ChevronDown" size={16} />
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          {activeView === 'dm' && (
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setActiveView('add-friend')}
              >
                <Icon name="UserPlus" size={18} className="mr-2" />
                Добавить друга
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setActiveView('friends')}
              >
                <Icon name="Users" size={18} className="mr-2" />
                Все друзья
              </Button>
              <Separator className="my-2" />
              <div className="px-2 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Личные чаты
                </h3>
              </div>
              {directMessages.length === 0 && (
                <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                  Нет активных чатов.<br/>Добавьте друзей!
                </p>
              )}
            </div>
          )}

          {activeView === 'server' && selectedServer && (
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
                  onClick={() => {
                    setSelectedChannel(channel.id);
                    setMessages([]);
                  }}
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
                  className="w-full justify-start h-8 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    if (!inCall) {
                      startCall(channel.id, channel.name);
                    }
                  }}
                >
                  <Icon name="Volume2" size={16} className="mr-2" />
                  {channel.name}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="h-14 px-2 bg-[hsl(var(--darker-bg))] flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-sm">👨‍🚀</AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[hsl(var(--darker-bg))] ${getStatusColor(myStatus)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Юра</p>
              <p className="text-xs text-muted-foreground">#1337</p>
            </div>
          </div>
          <div className="flex gap-1">
            {inCall && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`w-8 h-8 ${isMuted ? 'text-red-500' : ''}`}
                  onClick={toggleMute}
                >
                  <Icon name={isMuted ? "MicOff" : "Mic"} size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`w-8 h-8 ${isDeafened ? 'text-red-500' : ''}`}
                  onClick={toggleDeafen}
                >
                  <Icon name={isDeafened ? "VolumeX" : "Volume2"} size={16} />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setActiveView('profile')}>
              <Icon name="Settings" size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {inCall && (
          <div className="bg-primary/20 border-b border-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-semibold">Голосовой канал: {callWith}</span>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600"
            >
              <Icon name="PhoneOff" size={16} className="mr-2" />
              Отключиться
            </Button>
          </div>
        )}

        {activeView === 'add-friend' && (
          <>
            <div className="h-12 px-4 flex items-center border-b border-border bg-[hsl(var(--dark-bg))]">
              <Icon name="UserPlus" size={20} className="text-muted-foreground mr-2" />
              <h2 className="font-semibold">Добавить друга</h2>
            </div>

            <div className="flex-1 px-6 py-6">
              <div className="max-w-2xl space-y-6">
                <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Добавить по коду друга</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Введите код друга в формате Username#0000
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={friendCode}
                        onChange={(e) => setFriendCode(e.target.value)}
                        placeholder="Введите код друга"
                        className="bg-muted border-none"
                      />
                      <Button onClick={addFriendByCode} className="bg-primary hover:bg-primary/80">
                        Добавить
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-bold mb-2">Ваш код для друзей</h3>
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                      <code className="flex-1 font-mono text-primary">{myCode}</code>
                      <Button variant="ghost" size="sm" onClick={copyMyCode}>
                        <Icon name="Copy" size={16} className="mr-2" />
                        Копировать
                      </Button>
                    </div>
                  </div>
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

            <div className="px-4 py-3 border-b border-border">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск друзей..."
                  className="pl-10 bg-muted border-none"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">У вас пока нет друзей</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveView('add-friend')}
                  >
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Добавить друга
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary text-lg">{friend.avatar}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[hsl(var(--dark-bg))] ${getStatusColor(friend.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{friend.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {friend.activity || getStatusText(friend.status)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-9 h-9"
                          onClick={() => openDMWithFriend(friend.id)}
                        >
                          <Icon name="MessageCircle" size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-9 h-9"
                          onClick={() => startCall(friend.id, friend.name)}
                        >
                          <Icon name="Phone" size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-9 h-9">
                          <Icon name="MoreVertical" size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}

        {(activeView === 'dm' || activeView === 'server') && (
          <>
            <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-[hsl(var(--dark-bg))]">
              <div className="flex items-center gap-2">
                <Icon name="Hash" size={20} className="text-muted-foreground" />
                <h2 className="font-semibold">
                  {activeView === 'dm' ? 'Выберите чат' : channels.find(c => c.id === selectedChannel)?.name}
                </h2>
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

            <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3 hover:bg-muted/30 p-2 rounded-lg transition-colors animate-fade-in group relative">
                    <Avatar className="w-10 h-10 mt-1">
                      <AvatarFallback className="bg-primary text-lg">{message.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-foreground">{message.author}</span>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-1">{message.content}</p>
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction, idx) => (
                            <button
                              key={idx}
                              onClick={() => addReaction(message.id, reaction.emoji)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                                reaction.users.includes('me') 
                                  ? 'bg-primary/30 border border-primary' 
                                  : 'bg-muted hover:bg-muted/70'
                              }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8"
                          onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                        >
                          <Icon name="Smile" size={16} />
                        </Button>
                        {showEmojiPicker === message.id && (
                          <div className="absolute right-0 top-full mt-1 bg-[hsl(var(--dark-bg))] border border-border rounded-lg p-2 shadow-lg z-10 grid grid-cols-4 gap-1">
                            {EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(message.id, emoji)}
                                className="text-2xl hover:scale-125 transition-transform p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in px-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>{typingUsers.join(', ')} печатает...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="px-4 pb-6 pt-2">
              <div className="relative">
                <Input
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  placeholder={`Сообщение в #${activeView === 'dm' ? 'личные' : channels.find(c => c.id === selectedChannel)?.name}`}
                  className="pr-12 h-11 bg-muted border-none focus-visible:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      sendMessage();
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Icon name="Smile" size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8"
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Icon name="Send" size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'profile' && (
          <>
            <div className="h-12 px-4 flex items-center border-b border-border bg-[hsl(var(--dark-bg))]">
              <Button variant="ghost" size="icon" className="w-9 h-9 mr-2" onClick={() => setActiveView('dm')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <h2 className="font-semibold">Настройки</h2>
            </div>

            <ScrollArea className="flex-1 px-6 py-6">
              <div className="max-w-2xl space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold mb-4 neon-text">Мой профиль</h3>
                  <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarFallback className="bg-primary text-4xl">👨‍🚀</AvatarFallback>
                          </Avatar>
                          <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[hsl(var(--dark-bg))] ${getStatusColor(myStatus)}`} />
                        </div>
                        <div>
                          <p className="text-xl font-bold">Юра</p>
                          <p className="text-sm text-muted-foreground">Космонавт #1337</p>
                        </div>
                      </div>
                      <Select value={myStatus} onValueChange={(v: any) => setMyStatus(v)}>
                        <SelectTrigger className="w-[140px] bg-muted border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">В сети</SelectItem>
                          <SelectItem value="away">Не на месте</SelectItem>
                          <SelectItem value="offline">Не в сети</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-muted-foreground">Имя пользователя</Label>
                        <Input defaultValue="Юра" className="mt-1 bg-muted border-none" />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-muted-foreground">Email</Label>
                        <Input defaultValue="yura@space.dev" className="mt-1 bg-muted border-none" />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-muted-foreground">Статус активности</Label>
                        <Input 
                          placeholder="Играю в игру..." 
                          className="mt-1 bg-muted border-none" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Настройки голоса</h3>
                  <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Устройство ввода</Label>
                      <Select value={inputDevice} onValueChange={setInputDevice}>
                        <SelectTrigger className="bg-muted border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">По умолчанию</SelectItem>
                          <SelectItem value="mic1">Микрофон 1</SelectItem>
                          <SelectItem value="mic2">Микрофон 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Устройство вывода</Label>
                      <Select value={outputDevice} onValueChange={setOutputDevice}>
                        <SelectTrigger className="bg-muted border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">По умолчанию</SelectItem>
                          <SelectItem value="speaker1">Динамики 1</SelectItem>
                          <SelectItem value="speaker2">Наушники</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Шумоподавление</p>
                        <p className="text-sm text-muted-foreground">Фильтр фонового шума</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Эхоподавление</p>
                        <p className="text-sm text-muted-foreground">Убирает эхо в звонках</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Внешний вид</h3>
                  <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Тема</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="bg-muted border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Темная</SelectItem>
                          <SelectItem value="light">Светлая</SelectItem>
                          <SelectItem value="auto">Автоматически</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Язык</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-muted border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ua">Українська</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Компактный режим</p>
                        <p className="text-sm text-muted-foreground">Уменьшить отступы</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Анимации</p>
                        <p className="text-sm text-muted-foreground">Плавные переходы</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Уведомления</h3>
                  <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Включить уведомления</p>
                        <p className="text-sm text-muted-foreground">Получать push-уведомления</p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Звук уведомлений</p>
                        <p className="text-sm text-muted-foreground">Проигрывать звук</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Показывать статус</p>
                        <p className="text-sm text-muted-foreground">Друзья видят ваш статус</p>
                      </div>
                      <Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-red-500">Опасная зона</h3>
                  <div className="bg-[hsl(var(--dark-bg))] rounded-lg p-6 space-y-3">
                    <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                      Выйти из аккаунта
                    </Button>
                    <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                      Удалить аккаунт
                    </Button>
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
