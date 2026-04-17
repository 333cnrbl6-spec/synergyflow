import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, AlertCircle, Clock, Trash2, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unread');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initUser = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        await fetchNotifications(me.email);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    initUser();
  }, []);

  const fetchNotifications = async (userEmail) => {
    try {
      const boardMembers = await base44.entities.BoardMember.filter({});
      const currentMember = boardMembers.find(m => m.app_name === userEmail || m.member_name === userEmail);
      
      if (!currentMember) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const notifs = await base44.entities.ProposalNotification.filter(
        { recipient: currentMember.app_name },
        '-timestamp',
        100
      );
      setNotifications(notifs);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await base44.entities.ProposalNotification.update(notificationId, { read: true });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await base44.entities.ProposalNotification.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'discussion_required':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'needs_review':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'discussion_required':
        return 'bg-red-50 border-red-200';
      case 'needs_review':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : filter === 'action'
    ? notifications.filter(n => n.action_required)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionCount = notifications.filter(n => n.action_required && !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <Bell className="w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h2>
          <p className="text-sm text-slate-600">
            {unreadCount} unread • {actionCount} require action
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'action' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('action')}
        >
          Action Required ({actionCount})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No notifications in this view</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-2 ${getTypeColor(notification.notification_type)} ${!notification.read ? 'ring-2 ring-blue-400' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {getTypeIcon(notification.notification_type)}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {notification.proposal_title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Badge className="bg-blue-600">New</Badge>
                        )}
                        {notification.action_required && (
                          <Badge className="bg-red-600">Action</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs"
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}