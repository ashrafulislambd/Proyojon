import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Bell, CheckCircle, AlertTriangle, DollarSign, Info } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const typeConfig = (type: string) => {
  switch (type) {
    case 'payment_success': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
    case 'payment_reminder': return { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    case 'late_fee': return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    case 'plan_change': return { icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
    default: return { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
  }
};

export function Notifications() {
  const { notifications, fetchNotifications, markNotificationAsRead } = useApp();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const handleMarkAllRead = async () => {
    for (const n of unread) {
      await markNotificationAsRead(n.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unread.length} unread notification{unread.length !== 1 ? 's' : ''}
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No Notifications</h2>
          <p className="text-gray-500 mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const cfg = typeConfig(notification.type);
            const Icon = cfg.icon;
            return (
              <Card
                key={notification.id}
                className={`border cursor-pointer transition-opacity ${cfg.bg} ${notification.read ? 'opacity-70' : ''}`}
                onClick={() => !notification.read && handleMarkRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 ${cfg.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <Badge className="bg-blue-500 ml-2 shrink-0">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notification.date, 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
