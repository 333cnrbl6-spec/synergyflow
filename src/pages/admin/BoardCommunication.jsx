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

  useEffect(() => {
    const initBoard = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const channelsList = await base44.entities.BoardChannel.list();
        setChannels(channelsList);
        if (channelsList.length > 0) {
          setSelectedChannel(channelsList[0]);
          await loadChannelMessages(channelsList[0].id);
        }
      } catch (error) {
        console.error('Failed to load board data:', error);
      } finally {
        setLoading(false);
      }
    };

    initBoard();
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
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Channels Sidebar */}
        <div className="w-48 space-y-2 overflow-y-auto">
          <h3 className="font-semibold text-sm px-2 text-muted-foreground">CHANNELS</h3>
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant={selectedChannel?.id === channel.id ? 'default' : 'ghost'}
              className="w-full justify-start text-left"
              onClick={() => {
                setSelectedChannel(channel);
                loadChannelMessages(channel.id);
              }}
            >
              <span className="mr-2">#</span>
              {channel.display_name}
            </Button>
          ))}
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