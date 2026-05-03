import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import OnboardingGate from '@/components/OnboardingGate';
import Landing from './pages/Landing';
import NDA from './pages/NDA';
import AdminDashboard from './pages/admin/AdminDashboard';
import CRMDashboard from './pages/admin/CRMDashboard';
import ProspectDetail from './pages/admin/ProspectDetail';
import SubscriptionManager from './pages/admin/SubscriptionManager';
import SupportCenter from './pages/admin/SupportCenter';
import Board from './pages/admin/Board';
import BoardCommunication from './pages/admin/BoardCommunication';
import ChairmanZone from './pages/admin/ChairmanZone';
import Settings from './pages/admin/Settings';
import TeamManagement from './pages/admin/TeamManagement';
import PricingManager from './pages/admin/PricingManager';
import StrategicMarketAnalysis from './pages/admin/StrategicMarketAnalysis';
import BoardImpactAnalytics from './pages/admin/BoardImpactAnalytics';
import BoardInsights from './pages/admin/BoardInsights';
import ApprovalImpactAnalysis from './pages/admin/ApprovalImpactAnalysis';
import BoardResolutionMemo from './pages/admin/BoardResolutionMemo';
import BoardStrategy from './pages/admin/BoardStrategy';
import BoardUnifiedLaunch from './pages/admin/BoardUnifiedLaunch';
import PortfolioMetrics from './pages/admin/PortfolioMetrics';
import ReportsManager from './pages/admin/ReportsManager';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import ProductVerificationDashboard from './pages/admin/ProductVerificationDashboard';
import StrategicJointVentures from './pages/admin/StrategicJointVentures';
import BoardConsensus from './pages/admin/BoardConsensus';
import NextSeriesVoting from './pages/admin/NextSeriesVoting';
import PostExecutionStrategy from './pages/admin/PostExecutionStrategy';
import ImplementationDashboard from './pages/admin/ImplementationDashboard';
import BoardReporting from './pages/admin/BoardReporting';
import ImplementationBacklog from './pages/admin/ImplementationBacklog';
import BuyerHandoverPack from './pages/admin/BuyerHandoverPack';
import ConfidentialTeaserDocument from './pages/admin/ConfidentialTeaserDocument';
import ArchitecturePrinciples from './pages/admin/ArchitecturePrinciples';
import AppRolloutWorkbench from './pages/admin/AppRolloutWorkbench';
import AppBriefs from './pages/admin/AppBriefs';
import TrialReadinessTracker from './pages/admin/TrialReadinessTracker';
import ComplianceDashboard from './pages/admin/ComplianceDashboard';
import DeadlineDashboard from './pages/admin/DeadlineDashboard';
import Onboarding from './pages/Onboarding';
import ProductPage from './pages/ProductPage';
import UserAnalyticsDashboard from './pages/UserAnalyticsDashboard';
import ProtectedAnalyticsRoute from './components/ProtectedAnalyticsRoute';
import AdminLayout from './components/AdminLayout';
import FinancialInsightsDashboard from './components/FinancialInsightsDashboard';
import ContractorPortal from './pages/ContractorPortal';
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
    <OnboardingGate>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/nda" element={<NDA />} />
      <Route path="/products/:slug" element={<ProductPage />} />
      <Route path="/contractor" element={<ContractorPortal />} />
      <Route path="/analytics" element={<ProtectedAnalyticsRoute><UserAnalyticsDashboard /></ProtectedAnalyticsRoute>} />
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
        <Route path="/admin/portfolio" element={<PortfolioMetrics />} />
        <Route path="/admin/reports" element={<ReportsManager />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="/admin/verification" element={<ProductVerificationDashboard />} />
        <Route path="/admin/joint-ventures" element={<StrategicJointVentures />} />
        <Route path="/admin/consensus" element={<BoardConsensus />} />
        <Route path="/admin/next-series" element={<NextSeriesVoting />} />
        <Route path="/admin/post-execution" element={<PostExecutionStrategy />} />
        <Route path="/admin/implementation" element={<ImplementationDashboard />} />
        <Route path="/admin/reporting" element={<BoardReporting />} />
        <Route path="/admin/backlog" element={<ImplementationBacklog />} />
        <Route path="/admin/buyer-handover" element={<BuyerHandoverPack />} />
        <Route path="/admin/teaser" element={<ConfidentialTeaserDocument />} />
        <Route path="/admin/architecture" element={<ArchitecturePrinciples />} />
        <Route path="/admin/rollout" element={<AppRolloutWorkbench />} />
        <Route path="/admin/app-briefs" element={<AppBriefs />} />
        <Route path="/admin/trial-tracker" element={<TrialReadinessTracker />} />
        <Route path="/admin/compliance" element={<ComplianceDashboard />} />
        <Route path="/admin/deadlines" element={<DeadlineDashboard />} />
        <Route path="/admin/pricing" element={<PricingManager />} />
        <Route path="/admin/market-strategy" element={<StrategicMarketAnalysis />} />
        <Route path="/admin/team" element={<TeamManagement />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/financial-insights" element={<FinancialInsightsDashboard />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
      </Routes>
    </OnboardingGate>
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