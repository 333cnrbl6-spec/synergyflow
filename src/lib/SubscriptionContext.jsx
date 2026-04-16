import React from 'react';
import { base44 } from '@/api/base44Client';

const SubscriptionContext = React.createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [subscription, setSubscription] = React.useState(null);
  const [entitlements, setEntitlements] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const initializeContext = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const subs = await base44.entities.AppSubscription.filter({
          user_email: currentUser.email
        });

        if (subs.length > 0) {
          const sub = subs[0];
          setSubscription(sub);
          
          const appEntitlements = {};
          (sub.apps_included || []).forEach(app => {
            appEntitlements[app] = true;
          });
          setEntitlements(appEntitlements);
        }
      } catch (error) {
        console.error('Failed to initialize subscription context:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeContext();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ user, subscription, entitlements, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = React.useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};