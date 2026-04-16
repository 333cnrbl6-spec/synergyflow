import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Hash } from 'lucide-react';
import BoardroomTable from '@/components/boardroom/BoardroomTable';
import ReadinessDashboard from '@/components/boardroom/ReadinessDashboard';
import ChairmanPanel from '@/components/boardroom/ChairmanPanel';

export default function BoardCommunication() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('perspective');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [boardMembers, setBoardMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeMember, setActiveMember] = useState(null);
  const [sending, setSending] = useState(false);
  const [proposals, setProposals] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [currentUser, channelsList, members, prods] = await Promise.all([
          base44.auth.me(),
          base44.entities.BoardChannel.list(),
          base44.entities.BoardMember.list(),
          base44.entities.Product.list(),
        ]);
        setUser(currentUser);
        setChannels(channelsList);
        setBoardMembers(members.filter(m => m.active));
        setProducts(prods);
        if (channelsList.length > 0) {
          setSelectedChannel(channelsList[0]);
          await loadMessages(channelsList[0].id);
        }
        await loadProposals();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;
    const interval = setInterval(async () => {
      await loadMessages(selectedChannel.id);
      await loadProposals();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadProposals = async () => {
    try {
      const res = await base44.functions.invoke('boardCommunications', { action: 'get_proposals' });
      setProposals(res.data.proposals || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (channelId) => {
    try {
      const res = await base44.functions.invoke('boardCommunications', {
        action: 'get_channel_messages',
        channel_id: channelId,
      });
      setMessages(res.data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    if (!messageContent.trim() || !selectedChannel || sending) return;
    setSending(true);
    try {
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: selectedChannel.id,
        message_content: messageContent,
        message_type: messageType,
        from_member: user?.full_name || 'You',
      });
      setMessageContent('');
      await loadMessages(selectedChannel.id);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
  };

  const MEMBER_COLORS = {
    'Premiso': '#3b82f6',
    'Species Explorer': '#22c55e',
    'Age UK Bury': '#f97316',
    'CaseNarrative': '#a855f7',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="border-b border-slate-800 px-6 py-3 flex items-center gap-4 bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-bold text-white tracking-wide">THE BOARDROOM</span>
          <span className="text-xs text-slate-500 ml-1">— Permanently Convened</span>
        </div>
        <div className="flex gap-2 ml-4">
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => { setSelectedChannel(ch); loadMessages(ch.id); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedChannel?.id === ch.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Hash className="w-3 h-3" />
              {ch.display_name}
            </button>
          ))}
        </div>
      </div>

      {/* Main: table + chat side by side */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>

        {/* Left: Boardroom Table */}
        <div className="w-[480px] flex-shrink-0 p-4 flex flex-col gap-4 overflow-y-auto border-r border-slate-800">
          <BoardroomTable
            members={boardMembers}
            products={products}
            activeMember={activeMember}
            onMemberClick={setActiveMember}
          />
          <ReadinessDashboard members={boardMembers} products={products} />
          <ChairmanPanel proposals={proposals} onRefresh={loadProposals} />
        </div>

        {/* Right: Channel Discussion */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Channel header */}
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-3">
            <Hash className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-white">{selectedChannel?.display_name}</span>
            <span className="text-xs text-slate-500">{selectedChannel?.description}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                <div className="text-4xl">🪑</div>
                <p className="text-sm">The board is seated. Start the discussion.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCollective = msg.from_member === '📋 Board Collective';
                const isChairman = msg.from_member === '👑 Chairman';
                const isUser = !boardMembers.some(m => m.member_name === msg.from_member) && !isCollective && !isChairman;
                const memberColor = isChairman ? '#f59e0b' : isCollective ? '#6366f1' : (MEMBER_COLORS[msg.from_member] || '#64748b');
                return (
                  <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: memberColor }}
                      >
                        {msg.from_member?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[70%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isUser && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold" style={{ color: memberColor }}>{msg.from_member}</span>
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400 py-0">{msg.message_type}</Badge>
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : isCollective
                          ? 'bg-indigo-900/60 border border-indigo-500/30 text-indigo-100 rounded-tl-sm italic'
                          : isChairman
                          ? 'bg-amber-900/60 border border-amber-500/40 text-amber-100 rounded-tl-sm font-semibold'
                          : 'bg-slate-800 text-slate-100 rounded-tl-sm'
                      }`}>
                        {msg.message_content}
                      </div>
                      <span className="text-xs text-slate-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {user?.full_name?.slice(0, 2).toUpperCase() || 'ME'}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex gap-2 items-end">
              <select
                value={messageType}
                onChange={e => setMessageType(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-2 h-10"
              >
                <option value="perspective">Perspective</option>
                <option value="proposal">Proposal</option>
                <option value="question">Question</option>
                <option value="decision">Decision</option>
                <option value="announcement">Announcement</option>
              </select>
              <Textarea
                placeholder="Address the board… (Ctrl+Enter to send)"
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 rounded-xl"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={sending || !messageContent.trim()}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 h-10 w-10 flex-shrink-0"
              >
                {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-600">Board members will respond automatically from their product perspectives.</p>
          </div>
        </div>
      </div>
    </div>
  );
}