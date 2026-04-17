import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/AdminDashboard';
import CRMDashboard from './pages/admin/CRMDashboard';
import ProspectDetail from './pages/admin/ProspectDetail';
import SubscriptionManager from './pages/admin/SubscriptionManager';
import SupportCenter from './pages/admin/SupportCenter';
import Board from './pages/admin/Board';
import BoardCommunication from './pages/admin/BoardCommunication';
import ChairmanZone from './pages/admin/ChairmanZone';
import Settings from './pages/admin/Settings';
import BoardImpactAnalytics from './pages/admin/BoardImpactAnalytics';
import BoardInsights from './pages/admin/BoardInsights';
import ApprovalImpactAnalysis from './pages/admin/ApprovalImpactAnalysis';
import BoardResolutionMemo from './pages/admin/BoardResolutionMemo';
import BoardStrategy from './pages/admin/BoardStrategy';
import BoardUnifiedLaunch from './pages/admin/BoardUnifiedLaunch';
import AdminLayout from './components/AdminLayout';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/crm" element={<CRMDashboard />} />
        <Route path="/admin/prospects/:id" element={<ProspectDetail />} />
        <Route path="/admin/subscriptions" element={<SubscriptionManager />} />
        <Route path="/admin/support" element={<SupportCenter />} />
        <Route path="/admin/board" element={<Board />} />
        <Route path="/admin/board-communication" element={<BoardCommunication />} />
        <Route path="/admin/chairman-zone" element={<ChairmanZone />} />
        <Route path="/admin/board-impact" element={<BoardImpactAnalytics />} />
        <Route path="/admin/board-insights" element={<BoardInsights />} />
        <Route path="/admin/approval-impact" element={<ApprovalImpactAnalysis />} />
        <Route path="/admin/board-resolution-memo" element={<BoardResolutionMemo />} />
        <Route path="/admin/strategy" element={<BoardStrategy />} />
        <Route path="/admin/launch" element={<BoardUnifiedLaunch />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App