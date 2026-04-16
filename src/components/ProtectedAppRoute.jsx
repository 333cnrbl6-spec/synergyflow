import React from 'react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const ProtectedAppRoute = ({ appName, element }) => {
  const { entitlements, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!entitlements[appName]) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Lock className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>App Not Included</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Your subscription doesn't include <strong>{appName}</strong>. Upgrade to access this app.
            </p>
            <Button asChild className="w-full">
              <Link to="/admin">Upgrade Plan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return element;
};