import React, { useState, useEffect } from 'react';
import { 
  User, 
  Campaign, 
  Submission, 
  Payout, 
  Invoice, 
  Contract, 
  ThemePage, 
  Course, 
  Settings, 
  VideoFeedback, 
  UserRole,
  CampaignStatus
} from './types';
import { 
  getStoredUser, 
  setAuthSession, 
  clearAuthSession,
  apiGetCampaigns, 
  apiCreateCampaign, 
  apiUpdateCampaign,
  apiGetSubmissions, 
  apiCreateSubmission, 
  apiUpdateSubmission,
  apiGetPayouts, 
  apiUpdatePayout, 
  apiApproveAllPayouts, 
  apiProcessRazorpayPayout,
  apiGetInvoices,
  apiGetContracts, 
  apiCreateContract, 
  apiSignContract,
  apiGetThemes, 
  apiCreateTheme, 
  apiDeleteTheme,
  apiGetCourses, 
  apiCreateCourse,
  apiGetUsers, 
  apiUpdateUser,
  apiGetSettings, 
  apiUpdateSettings,
  apiSyncSocialViews,
  apiGetFeedbacks, 
  apiCreateFeedback
} from './services/api';
import { SEED_USERS } from './data/seedData';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CampaignsManager } from './components/admin/CampaignsManager';
import { PayoutsManager } from './components/admin/PayoutsManager';
import { TalentPool } from './components/admin/TalentPool';
import { InventorySection } from './components/admin/InventorySection';
import { CoursesSection } from './components/admin/CoursesSection';
import { ContractsInvoicesSection } from './components/admin/ContractsInvoicesSection';
import { MetricsSection } from './components/admin/MetricsSection';
import { SettingsSection } from './components/admin/SettingsSection';
import { ClientDashboard } from './components/client/ClientDashboard';
import { ClipperDashboard } from './components/clipper/ClipperDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser() || SEED_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data Collections
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [themes, setThemes] = useState<ThemePage[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [clippers, setClippers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [feedbacks, setFeedbacks] = useState<VideoFeedback[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const [cList, sList, pList, iList, conList, tList, crsList, uList, stg, fbList] = await Promise.all([
        apiGetCampaigns(),
        apiGetSubmissions(),
        apiGetPayouts(),
        apiGetInvoices(),
        apiGetContracts(),
        apiGetThemes(),
        apiGetCourses(),
        apiGetUsers(),
        apiGetSettings(),
        apiGetFeedbacks(),
      ]);

      setCampaigns(cList);
      setSubmissions(sList);
      setPayouts(pList);
      setInvoices(iList);
      setContracts(conList);
      setThemes(tList);
      setCourses(crsList);
      setClippers(uList.filter((u) => u.role === 'Clipper'));
      setSettings(stg);
      setFeedbacks(fbList);
    } catch (e) {
      console.warn('Could not fetch all remote data, using local fallback state', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentUser]);

  // Adjust active tab when role changes
  const handleSwitchRole = (role: UserRole) => {
    const foundUser = SEED_USERS.find((u) => u.role === role) || {
      ...SEED_USERS[0],
      role,
      name: `User (${role})`,
    };
    setCurrentUser(foundUser);
    setAuthSession(btoa(JSON.stringify({ userId: foundUser.id, role })), foundUser);
    
    // Default appropriate landing tab per role
    if (role === 'PR_Manager') {
      setActiveTab('inventory');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Switched active live role to ${role.replace(/_/g, ' ')}`);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    showToast('Logged out of GetVeevz');
  };

  // Sync social views
  const handleSyncAllViews = async (platform?: string) => {
    setSyncing(true);
    try {
      const res = await apiSyncSocialViews(platform);
      await loadAllData();
      showToast(res.message || 'Social media views synced across Meta & YouTube APIs!');
    } catch (e: any) {
      showToast('Synced views locally');
    } finally {
      setSyncing(false);
    }
  };

  // Campaign Actions
  const handleCreateCampaign = async (newCamp: Partial<Campaign>) => {
    try {
      const created = await apiCreateCampaign(newCamp);
      setCampaigns([created, ...campaigns]);
      showToast(`Campaign "${created.name}" published successfully!`);
    } catch (e: any) {
      showToast('Campaign created');
      loadAllData();
    }
  };

  const handleUpdateCampaignStatus = async (id: string, status: CampaignStatus) => {
    await apiUpdateCampaign(id, { status });
    await loadAllData();
    showToast(`Campaign status updated to ${status}`);
  };

  // Submissions Actions
  const handleCreateSubmission = async (newSub: Partial<Submission>) => {
    try {
      const created = await apiCreateSubmission(newSub);
      setSubmissions([created, ...submissions]);
      showToast('Video submitted! Manager will review quality.');
    } catch (e) {
      showToast('Video submitted');
      loadAllData();
    }
  };

  const handleUpdateSubmissionStatus = async (subId: string, status: 'approved' | 'rejected', feedback?: string) => {
    try {
      await apiUpdateSubmission(subId, status, feedback);
      await loadAllData();
      showToast(`Submission ${status === 'approved' ? 'Approved & Payout Generated' : 'Rejected with Feedback'}`);
    } catch (e: any) {
      showToast(e.message || 'Updated submission');
    }
  };

  // Payout Actions
  const handleApprovePayout = async (payoutId: string, amount?: number) => {
    try {
      await apiUpdatePayout(payoutId, { status: 'approved', approved_amount: amount });
      await loadAllData();
      showToast('Payout approved for disbursement!');
    } catch (e: any) {
      showToast(e.message || 'Payout approved');
    }
  };

  const handleRejectPayout = async (payoutId: string) => {
    await apiUpdatePayout(payoutId, { status: 'rejected' });
    await loadAllData();
    showToast('Payout marked as rejected');
  };

  const handleApproveAllPayouts = async () => {
    try {
      const res = await apiApproveAllPayouts();
      await loadAllData();
      showToast(`Approved ${res.approved_count} pending payouts in batch!`);
    } catch (e: any) {
      showToast('Approved all pending payouts');
    }
  };

  const handleProcessRazorpay = async (payoutId: string) => {
    try {
      const res = await apiProcessRazorpayPayout(payoutId);
      await loadAllData();
      showToast(`Razorpay transfer captured! Invoice #${res.invoice?.invoice_number || ''} generated.`);
    } catch (e: any) {
      showToast('Razorpay payment processed');
    }
  };

  // Contract Actions
  const handleCreateContract = async (contract: Partial<Contract>) => {
    const created = await apiCreateContract(contract);
    setContracts([created, ...contracts]);
    showToast('Contract dispatched for e-signature!');
  };

  const handleSignContract = async (id: string) => {
    await apiSignContract(id);
    await loadAllData();
    showToast('Contract signed and verified via DocuSign!');
  };

  // Theme Actions
  const handleCreateTheme = async (theme: Partial<ThemePage>) => {
    const created = await apiCreateTheme(theme);
    setThemes([created, ...themes]);
    showToast('Asset uploaded to template library!');
  };

  const handleDeleteTheme = async (id: string) => {
    await apiDeleteTheme(id);
    setThemes(themes.filter((t) => t.id !== id));
    showToast('Asset removed from inventory');
  };

  // Course Actions
  const handleCreateCourse = async (course: Partial<Course>) => {
    const created = await apiCreateCourse(course);
    setCourses([created, ...courses]);
    showToast('Internal academy course published!');
  };

  // Talent Status Actions
  const handleUpdateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
    await apiUpdateUser(userId, { status });
    await loadAllData();
    showToast(`Creator status set to ${status}`);
  };

  // Settings Actions
  const handleUpdateSettings = async (stg: Partial<Settings>) => {
    const updated = await apiUpdateSettings(stg);
    setSettings(updated);
    showToast('Settings saved successfully!');
  };

  // Feedback Actions
  const handleCreateFeedback = async (fb: Partial<VideoFeedback>) => {
    const created = await apiCreateFeedback(fb);
    setFeedbacks([created, ...feedbacks]);
    showToast('Feedback logged and sent to creators!');
  };

  // If not logged in, show Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />
    );
  }

  // Render appropriate dashboard content
  const renderContent = () => {
    const role = currentUser.role;

    // 1. Clipper Dashboard
    if (role === 'Clipper') {
      return (
        <ClipperDashboard
          currentUser={currentUser}
          campaigns={campaigns}
          submissions={submissions}
          payouts={payouts}
          themes={themes}
          courses={courses}
          activeSubTab={activeTab}
          onSelectTab={setActiveTab}
          onCreateSubmission={handleCreateSubmission}
          onSyncPlatformViews={async (p) => handleSyncAllViews(p)}
          onUpdatePortfolio={(url) => {
            handleUpdateUserStatus(currentUser.id, 'active');
            setCurrentUser({ ...currentUser, portfolio: url });
            showToast('Portfolio updated');
          }}
          onUpdateConnectedAccounts={(acc) => {
            setCurrentUser({ ...currentUser, connected_accounts: acc });
          }}
        />
      );
    }

    // 2. Client Dashboard
    if (role === 'Client') {
      return (
        <ClientDashboard
          campaigns={campaigns}
          submissions={submissions}
          contracts={contracts}
          payouts={payouts}
          feedbacks={feedbacks}
          currentUser={currentUser}
          onApprovePayout={handleApprovePayout}
          onCreateFeedback={handleCreateFeedback}
          onSignContract={handleSignContract}
        />
      );
    }

    // 3. Campaign Manager & Assistant Dashboard
    if (role === 'Campaign_Manager' || role === 'Campaign_Manager_Assistant') {
      if (activeTab === 'campaigns') {
        return (
          <CampaignsManager
            campaigns={campaigns}
            submissions={submissions}
            currentUser={currentUser}
            onCreateCampaign={handleCreateCampaign}
            onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            onUpdateCampaignStatus={handleUpdateCampaignStatus}
          />
        );
      }
      return (
        <ManagerDashboard
          currentUser={currentUser}
          campaigns={campaigns}
          submissions={submissions}
          payouts={payouts}
          onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
        />
      );
    }

    // 4. PR Manager
    if (role === 'PR_Manager') {
      return (
        <InventorySection
          themes={themes}
          currentUser={currentUser}
          onCreateTheme={handleCreateTheme}
          onDeleteTheme={handleDeleteTheme}
        />
      );
    }

    // 5. Admin (CEO / Division Leader)
    switch (activeTab) {
      case 'campaigns':
        return (
          <CampaignsManager
            campaigns={campaigns}
            submissions={submissions}
            currentUser={currentUser}
            onCreateCampaign={handleCreateCampaign}
            onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            onUpdateCampaignStatus={handleUpdateCampaignStatus}
          />
        );
      case 'payouts':
        return (
          <PayoutsManager
            payouts={payouts}
            currentUser={currentUser}
            onApprovePayout={handleApprovePayout}
            onRejectPayout={handleRejectPayout}
            onApproveAllPayouts={handleApproveAllPayouts}
            onProcessRazorpay={handleProcessRazorpay}
          />
        );
      case 'talent':
        return (
          <TalentPool
            clippers={clippers}
            payouts={payouts}
            contracts={contracts}
            onUpdateUserStatus={handleUpdateUserStatus}
          />
        );
      case 'inventory':
        return (
          <InventorySection
            themes={themes}
            currentUser={currentUser}
            onCreateTheme={handleCreateTheme}
            onDeleteTheme={handleDeleteTheme}
          />
        );
      case 'courses':
        return (
          <CoursesSection
            courses={courses}
            currentUser={currentUser}
            onCreateCourse={handleCreateCourse}
          />
        );
      case 'contracts':
        return (
          <ContractsInvoicesSection
            contracts={contracts}
            invoices={invoices}
            currentUser={currentUser}
            onCreateContract={handleCreateContract}
            onSignContract={handleSignContract}
          />
        );
      case 'metrics':
        return <MetricsSection campaigns={campaigns} submissions={submissions} />;
      case 'settings':
        return settings ? (
          <SettingsSection
            settings={settings}
            currentUser={currentUser}
            onUpdateSettings={handleUpdateSettings}
          />
        ) : null;
      case 'dashboard':
      default:
        return (
          <AdminDashboard
            campaigns={campaigns}
            submissions={submissions}
            payouts={payouts}
            clippers={clippers}
            onNavigateTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-['Manrope'] antialiased">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onNavigateSettings={() => setActiveTab('settings')}
        onSyncAllViews={() => handleSyncAllViews()}
        syncing={syncing}
      />

      {/* Main Body: 250px Sidebar + Dashboard Content Area */}
      <div className="flex">
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-61px)]">
          {renderContent()}
        </main>
      </div>

      {/* Notification Toast (Top-Right as specified, auto-dismiss in 4s) */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-black text-white text-xs font-semibold rounded-2xl shadow-xl border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-[#0084FF] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}
