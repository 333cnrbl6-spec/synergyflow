import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export default function ProtectedAnalyticsRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          // Not authenticated - redirect to login
          base44.auth.redirectToLogin('/analytics');
          setIsAuthorized(false);
        } else {
          // Check if user has subscription
          const subscriptions = await base44.entities.Subscription.filter({
            user_email: user.email,
            status: 'active'
          });

          if (subscriptions.length === 0) {
            console.warn('User has no active subscriptions');
          }

          setIsAuthorized(true);
        }
      } catch (err) {
        console.error('Authorization check failed:', err);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-600 mt-3">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8">
        <Card className="bg-red-50 border-red-200 max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-red-800 font-semibold">Access Denied</p>
            <p className="text-red-700 text-sm mt-2">
              You need an active subscription to access analytics. Please subscribe to a product first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}