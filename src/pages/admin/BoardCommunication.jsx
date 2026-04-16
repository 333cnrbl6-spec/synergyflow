import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

export default function BoardCommunication() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('perspective');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [boardMembers, setBoardMembers] = useState([]);
  const [channelMembers, setChannelMembers] = useState([]);

  useEffect(() => {
    const initBoard = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const channelsList = await base44.entities.BoardChannel.list();
        setChannels(channelsList);
        
        // Load board members
        const members = await base44.entities.BoardMember.list();
        setBoardMembers(members);
        
        if (channelsList.length > 0) {
          setSelectedChannel(channelsList[0]);
          await loadChannelMessages(channelsList[0].id);
          
          // Set channel members
          const channelMemberNames = channelsList[0].members || [];
          const activeMembers = members.filter(m => channelMemberNames.includes(m.app_name));
          setChannelMembers(activeMembers);
        }

        // Load notifications
        await loadNotifications();
      } catch (error) {
        console.error('Failed to load board data:', error);
      } finally {
        setLoading(false);
      }
    };

    initBoard();

    // Poll for messages every 3 seconds for real-time feel
    const messageInterval = setInterval(() => {
      if (selectedChannel) {
        loadChannelMessages(selectedChannel.id);
      }
    }, 3000);

    // Poll for notifications every 5 seconds
    const notificationInterval = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(notificationInterval);
    };
  }, []);

  const loadChannelMessages = async (channelId) => {
    try {
      const response = await base44.functions.invoke('boardCommunications', {
        action: 'get_channel_messages',
        channel_id: channelId
      });
      setMessages(response.data.messages || []);

      const decisionsList = await base44.entities.BoardDecision.filter(
        { channel_id: channelId },
        '-created_date',
        50
      );
      setDecisions(decisionsList);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await base44.functions.invoke('boardCommunications', {
        action: 'get_notifications'
      });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.notifications?.length || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await base44.functions.invoke('boardCommunications', {
        action: 'mark_notification_read',
        notification_id: notificationId
      });
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedChannel) return;

    try {
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: selectedChannel.id,
        message_content: messageContent,
        message_type: messageType,
        from_member: user?.full_name || 'Anonymous'
      });

      setMessageContent('');
      await loadChannelMessages(selectedChannel.id);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleVoteDecision = async (decisionId, vote) => {
    try {
      await base44.functions.invoke('boardCommunications', {
        action: 'vote_decision',
        decision_id: decisionId,
        member: user?.full_name || 'Anonymous',
        vote
      });
      await loadChannelMessages(selectedChannel.id);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Notifications Banner */}
      {unreadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-900">{unreadCount} new notification{unreadCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notif) => (
              <div key={notif.id} className="flex items-start justify-between bg-white p-2 rounded text-sm">
                <div className="flex-1">
                  <p className="text-blue-900"><strong>{notif.from_member}</strong> posted in {notif.channel_name}</p>
                  <p className="text-blue-700 text-xs mt-1">{notif.message_preview}</p>
                </div>
                <button
                  onClick={() => markNotificationRead(notif.id)}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-900 whitespace-nowrap"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar: Channels + Board Members */}
        <div className="w-56 space-y-6 overflow-y-auto">
          {/* Channels Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm px-2 text-muted-foreground">CHANNELS</h3>
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={selectedChannel?.id === channel.id ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => {
                  setSelectedChannel(channel);
                  loadChannelMessages(channel.id);
                  const channelMemberNames = channel.members || [];
                  const activeMembers = boardMembers.filter(m => channelMemberNames.includes(m.app_name));
                  setChannelMembers(activeMembers);
                }}
              >
                <span className="mr-2">#</span>
                {channel.display_name}
              </Button>
            ))}
          </div>

          {/* Board Members Section */}
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold text-sm px-2 text-muted-foreground">BOARD MEMBERS ({boardMembers.filter(m => m.active).length})</h3>
            {boardMembers.filter(m => m.active).length === 0 ? (
              <p className="text-xs text-muted-foreground px-2">No active board members</p>
            ) : (
              <div className="space-y-2">
                {boardMembers.filter(m => m.active).map((member) => (
                  <div key={member.id} className="p-2 rounded bg-card border border-border text-xs space-y-1 hover:border-primary transition-colors">
                    <p className="font-semibold text-foreground">{member.member_name}</p>
                    <p className="text-muted-foreground">{member.app_name}</p>
                    <p className="text-muted-foreground text-xs">{member.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Communication Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Channel Header */}
          {selectedChannel && (
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold">#{selectedChannel.display_name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selectedChannel.description}</p>
            </div>
          )}

          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Members Present Sidebar */}
            <div className="w-48 border rounded-lg p-3 bg-card space-y-3 overflow-y-auto">
              <h4 className="font-semibold text-xs text-muted-foreground">MEMBERS PRESENT ({channelMembers.length})</h4>
              {channelMembers.length === 0 ? (
                <div className="text-xs text-muted-foreground p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-semibold text-yellow-900">No members configured</p>
                  <p className="text-yellow-700 mt-1">Add board members to this channel in the Board settings.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {channelMembers.map((member) => (
                    <div key={member.id} className="p-2 rounded bg-background border text-xs">
                      <p className="font-semibold text-foreground">{member.member_name}</p>
                      <p className="text-muted-foreground text-xs">{member.role}</p>
                      <p className="text-muted-foreground text-xs mt-1">{member.app_name}</p>
                      {member.expertise && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground">Expertise:</p>
                          <div className="flex flex-wrap gap-1">
                            {member.expertise.slice(0, 2).map((exp, idx) => (
                              <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto border rounded-lg p-4 bg-background">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mr-2 opacity-50" />
                  No messages yet. Start the conversation.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-2 p-3 rounded-lg bg-card border">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{msg.from_member}</span>
                      <Badge variant="outline" className="text-xs">{msg.message_type}</Badge>
                    </div>
                    <p className="text-sm text-foreground">{msg.message_content}</p>
                    <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            {/* Decisions Panel */}
            <div className="w-64 space-y-4 overflow-y-auto">
              <h3 className="font-semibold text-sm">DECISIONS</h3>
              {decisions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active decisions</p>
              ) : (
                decisions.map((dec) => (
                  <Card key={dec.id} className="text-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs">{dec.decision_title}</CardTitle>
                      <Badge className="w-fit text-xs mt-2">{dec.status}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground">{dec.description}</p>
                      {dec.status === 'voting' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex-1 h-7"
                            onClick={() => handleVoteDecision(dec.id, 'yes')}
                          >
                            ✓ Yes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex-1 h-7"
                            onClick={() => handleVoteDecision(dec.id, 'no')}
                          >
                            ✗ No
                          </Button>
                        </div>
                      )}
                      {dec.voting_results && (
                        <div className="text-xs space-y-1">
                          <div>✓ Yes: {dec.voting_results.yes_votes?.length || 0}</div>
                          <div>✗ No: {dec.voting_results.no_votes?.length || 0}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex gap-2">
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background text-sm h-10"
              >
                <option value="perspective">Perspective</option>
                <option value="proposal">Proposal</option>
                <option value="decision">Decision</option>
                <option value="announcement">Announcement</option>
                <option value="question">Question</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Share your perspective with the board..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="resize-none h-20"
              />
              <Button onClick={handleSendMessage} className="self-end" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-accent p-4 rounded-lg flex gap-2 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-accent-foreground" />
        <div>
          <p className="font-semibold">Native Board Communication Active</p>
          <p className="text-xs text-muted-foreground">This boardroom consumes zero development credits. All conversations, decisions, and voting remain within the platform.</p>
        </div>
      </div>
    </div>
  );
}