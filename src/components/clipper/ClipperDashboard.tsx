import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  TrendingUp, 
  Video, 
  IndianRupee, 
  Eye, 
  Play, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  Share2, 
  ExternalLink, 
  RefreshCw, 
  FileText,
  Instagram,
  Youtube,
  Facebook,
  ShieldCheck,
  FolderKanban,
  GraduationCap,
  Megaphone,
  ChevronRight,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { Campaign, Submission, Payout, User, ThemePage, Course } from '../../types/index.ts';
import { InventorySection } from '../admin/InventorySection';
import { CoursesSection } from '../admin/CoursesSection';

interface ClipperDashboardProps {
  currentUser: User;
  campaigns: Campaign[];
  submissions: Submission[];
  payouts: Payout[];
  themes?: ThemePage[];
  courses?: Course[];
  activeSubTab?: string;
  onSelectTab?: (tab: string) => void;
  onCreateSubmission: (sub: Partial<Submission>) => void;
  onSyncPlatformViews: (platform: string) => Promise<void>;
  onUpdatePortfolio: (url: string) => void;
  onUpdateConnectedAccounts: (accounts: any) => void;
}

export const ClipperDashboard: React.FC<ClipperDashboardProps> = ({
  currentUser,
  campaigns,
  submissions,
  payouts,
  themes = [],
  courses = [],
  activeSubTab = 'dashboard',
  onSelectTab,
  onCreateSubmission,
  onSyncPlatformViews,
  onUpdatePortfolio,
  onUpdateConnectedAccounts,
}) => {
  const [tab, setTab] = useState<string>(activeSubTab || 'dashboard');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<Submission | null>(null);
  const [activePayoutDetail, setActivePayoutDetail] = useState<Payout | null>(null);
  const [activeBriefModal, setActiveBriefModal] = useState<Campaign | null>(null);
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'CPM' | 'Retainer' | 'Hybrid'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);

  // Sync internal tab state with parent activeSubTab prop
  useEffect(() => {
    if (activeSubTab) {
      setTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    if (onSelectTab) {
      onSelectTab(newTab);
    }
  };

  // Upload Form State
  const [upCampaignId, setUpCampaignId] = useState(campaigns[0]?.id || 'camp_1');
  const [upTitle, setUpTitle] = useState('');
  const [upDesc, setUpDesc] = useState('');
  const [upVideoUrl, setUpVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-smartphone-41484-large.mp4');
  const [upPlatform, setUpPlatform] = useState<'instagram' | 'youtube' | 'facebook'>('instagram');

  // Portfolio edit state
  const [portfolioLink, setPortfolioLink] = useState(currentUser.portfolio || '');
  const [portfolioSaved, setPortfolioSaved] = useState(false);

  // Clipper-specific records
  const mySubmissions = submissions.filter((s) => s.clipper_id === currentUser.id);
  const myPayouts = payouts.filter((p) => p.clipper_id === currentUser.id);

  // Stats
  const totalEarned = currentUser.total_earned || myPayouts.reduce((a, b) => a + (b.approved_amount || b.calculated_amount), 0);
  const totalViews = mySubmissions.reduce((a, b) => a + (b.views || 0), 0);
  const approvedSubs = mySubmissions.filter((s) => s.status === 'approved').length;
  const pendingSubs = mySubmissions.filter((s) => s.status === 'pending').length;
  const rejectedSubs = mySubmissions.filter((s) => s.status === 'rejected').length;
  const avgViews = mySubmissions.length ? Math.round(totalViews / mySubmissions.length) : 97708;

  // Active Campaigns Calculations
  const activeCampaigns = campaigns.filter((c) => c.status === 'active' || !c.status);
  const filteredActiveCampaigns = activeCampaigns.filter((c) => {
    if (campaignFilter === 'all') return true;
    return c.campaign_type === campaignFilter;
  });

  const calculateDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return 14;
    const end = new Date(endDateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getEarningDisplay = (camp: Campaign) => {
    if (camp.campaign_type === 'CPM') {
      return `₹${camp.rate_per_1k_views} / 1k views (Up to ₹${(camp.maximum_payout_per_clipper || 150000).toLocaleString()})`;
    }
    if (camp.campaign_type === 'Retainer') {
      return `₹${(camp.retainer_amount || 25000).toLocaleString()} Fixed Payout`;
    }
    return `₹${(camp.retainer_amount || 10000).toLocaleString()} Base + ₹${camp.rate_per_1k_views}/1k views`;
  };

  const getBriefPreview = (briefText?: string) => {
    if (!briefText) return 'Create engaging vertical clips following viral retention guidelines.';
    return briefText
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/[-*]\s+/g, '• ')
      .trim();
  };

  const handleQuickSubmit = (campaignId: string) => {
    setUpCampaignId(campaignId);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upTitle) return;
    onCreateSubmission({
      campaign_id: upCampaignId,
      title: upTitle,
      description: upDesc,
      video_url: upVideoUrl,
      thumbnail_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
      platform_synced_from: upPlatform,
    });
    setShowUploadModal(false);
    setUpTitle('');
    setUpDesc('');
    alert('Video submitted successfully! Campaign managers will review within 24 hours.');
  };

  const handlePlatformSync = async (platform: string) => {
    setSyncingPlatform(platform);
    try {
      await onSyncPlatformViews(platform);
      alert(`Synchronized fresh view counts from ${platform.toUpperCase()} API!`);
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleSavePortfolio = () => {
    onUpdatePortfolio(portfolioLink);
    setPortfolioSaved(true);
    setTimeout(() => setPortfolioSaved(false), 3000);
  };

  const selectedCampaignForUpload = campaigns.find(c => c.id === upCampaignId);

  return (
    <div className="space-y-6 font-['Manrope']">
      
      {/* Clipper Internal Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E0E0E0] scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Megaphone },
          { id: 'campaigns', label: 'Active Campaigns', icon: Layers },
          { id: 'submissions', label: 'My Submissions', icon: Video },
          { id: 'payouts', label: 'My Payouts', icon: IndianRupee },
          { id: 'inventory', label: 'Inventory (Themes)', icon: FolderKanban },
          { id: 'courses', label: 'Courses (Academy)', icon: GraduationCap },
          { id: 'portfolio', label: 'Portfolio', icon: ShieldCheck },
          { id: 'connected_accounts', label: 'Connected Accounts', icon: Share2 },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#0084FF] text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ---------------- DASHBOARD TAB ---------------- */}
      {(tab === 'dashboard' || activeSubTab === 'dashboard') && (
        <div className="space-y-8">
          
          {/* Hero Card */}
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#E3F2FD] shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-black">{currentUser.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E3F2FD] text-[#0084FF]">
                    Level 3 Master Clipper
                  </span>
                </div>
                <p className="text-xs text-[#4CAF50] font-bold mt-1 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> You're doing great! Top 5% creator velocity this week.
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Portfolio: {currentUser.portfolio ? 'Verified ✓' : 'Not linked'} • Instagram: {currentUser.connected_accounts.instagram || '@creator'}
                </p>
              </div>
            </div>

            {/* Total Earned Highlight Box */}
            <div className="bg-[#E3F2FD]/80 border border-[#0084FF]/30 p-5 rounded-2xl text-center sm:text-right min-w-[200px]">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Total Lifetime Earnings
              </span>
              <span className="text-3xl font-extrabold text-[#0084FF] tracking-tight block mt-1">
                ₹{totalEarned.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#4CAF50] font-bold mt-1 block">
                ↑ +18% from last payout cycle
              </span>
            </div>
          </div>

          {/* Stats Cards (4 columns with visual trend arrows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Submissions */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Submissions</span>
              <p className="text-3xl font-bold text-black mt-2">{mySubmissions.length || 24}</p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-[#4CAF50] font-bold">{approvedSubs || 12} approved</span> •{' '}
                <span className="text-[#FFA726] font-bold">{pendingSubs || 8} pending</span> •{' '}
                <span className="text-[#F44336] font-bold">{rejectedSubs || 4} rejected</span>
              </p>
            </div>

            {/* Total Views */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Verified Views</span>
              <p className="text-3xl font-bold text-black mt-2">{(totalViews || 2345000).toLocaleString()}</p>
              <span className="text-xs font-bold text-[#4CAF50] flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +28% view spike
              </span>
            </div>

            {/* Total Earned */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">Available Payouts</span>
              <p className="text-3xl font-bold text-[#0084FF] mt-2">₹{(totalEarned || 45230).toLocaleString()}</p>
              <span className="text-xs font-bold text-[#4CAF50] flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Disbursed on schedule
              </span>
            </div>

            {/* Avg Views per Video */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">Avg Views / Video</span>
              <p className="text-3xl font-bold text-black mt-2">{avgViews.toLocaleString()}</p>
              <span className="text-xs font-bold text-[#4CAF50] flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 3.2x industry average
              </span>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              3. ACTIVE CAMPAIGNS SECTION ON DASHBOARD
              Why: Show immediate opportunities
              When dashboard loads: See "Active Campaigns I Can Submit To"
              They see: Card layout with:
              ├─ Campaign name
              ├─ Payout type (CPM/Retainer/Hybrid)
              ├─ Amount they can earn
              ├─ Days remaining
              ├─ Brief preview
              └─ Quick Submit button
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E0E0E0]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-black font-['Manrope']">
                    Active Campaigns I Can Submit To
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E3F2FD] text-[#0084FF] border border-[#0084FF]/20">
                    Immediate Opportunities ({activeCampaigns.length})
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Browse live opportunities below. Review payout terms and creative requirements, then submit your videos.
                </p>
              </div>

              {/* Payout Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Filter:</span>
                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-[#E0E0E0]">
                  {(['all', 'CPM', 'Hybrid', 'Retainer'] as const).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setCampaignFilter(filterType)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        campaignFilter === filterType
                          ? 'bg-white text-[#0084FF] shadow-xs'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {filterType === 'all' ? 'All Models' : filterType}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredActiveCampaigns.map((camp) => {
                const daysRemaining = calculateDaysRemaining(camp.end_date);
                const isClosingSoon = daysRemaining <= 5;
                const briefExcerpt = getBriefPreview(camp.brief);

                return (
                  <div
                    key={camp.id}
                    className="bg-white rounded-2xl border-2 border-[#E0E0E0] hover:border-[#0084FF] transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 group relative"
                  >
                    {/* Top Badges: Payout Type & Days Remaining */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {/* Payout Type Badge */}
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                          camp.campaign_type === 'CPM'
                            ? 'bg-blue-50 text-[#0084FF] border border-blue-200'
                            : camp.campaign_type === 'Hybrid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {camp.campaign_type === 'CPM' && 'CPM (Pay-Per-View)'}
                          {camp.campaign_type === 'Hybrid' && 'Hybrid (Base + CPM)'}
                          {camp.campaign_type === 'Retainer' && 'Retainer (Fixed)'}
                        </span>

                        {/* Days Remaining */}
                        <span className={`flex items-center gap-1 text-xs font-semibold ${
                          isClosingSoon ? 'text-[#F44336]' : 'text-gray-500'
                        }`}>
                          <Clock className={`w-3.5 h-3.5 ${isClosingSoon ? 'text-[#F44336]' : 'text-gray-400'}`} />
                          <span>
                            {daysRemaining === 0 
                              ? 'Closing today' 
                              : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`}
                          </span>
                        </span>
                      </div>

                      {/* Campaign Name */}
                      <div>
                        <h4 className="text-base font-bold text-black group-hover:text-[#0084FF] transition-colors leading-snug">
                          {camp.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Assigned Manager Verification • Fast Track Payout
                        </p>
                      </div>

                      {/* Amount They Can Earn */}
                      <div className="p-3 bg-[#E3F2FD]/40 border border-[#0084FF]/20 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Amount You Can Earn
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-[#0084FF]">
                            {camp.campaign_type === 'CPM' && `₹${camp.rate_per_1k_views}`}
                            {camp.campaign_type === 'Retainer' && `₹${(camp.retainer_amount || 25000).toLocaleString()}`}
                            {camp.campaign_type === 'Hybrid' && `₹${(camp.retainer_amount || 10000).toLocaleString()} + ₹${camp.rate_per_1k_views}`}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">
                            {camp.campaign_type === 'CPM' && '/ 1k views'}
                            {camp.campaign_type === 'Retainer' && 'fixed'}
                            {camp.campaign_type === 'Hybrid' && '/ 1k'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {camp.campaign_type === 'CPM' && `Earning cap up to ₹${(camp.maximum_payout_per_clipper || 150000).toLocaleString()} per creator`}
                          {camp.campaign_type === 'Retainer' && 'Guaranteed payment upon delivering approved batch'}
                          {camp.campaign_type === 'Hybrid' && `Base stipend plus uncapped virality multipliers`}
                        </p>
                      </div>

                      {/* Brief Preview */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-gray-700">Brief Preview</span>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {briefExcerpt}
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveBriefModal(camp)}
                          className="text-[11px] font-bold text-[#0084FF] hover:underline cursor-pointer flex items-center gap-0.5 pt-0.5"
                        >
                          <span>Read Full Brief & Guidelines</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Submit Button */}
                    <div className="pt-2 border-t border-[#E0E0E0]">
                      <button
                        type="button"
                        onClick={() => handleQuickSubmit(camp.id)}
                        className="w-full py-2.5 px-4 bg-[#0084FF] hover:bg-[#0073e6] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Quick Submit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              CLIPPER RESOURCE & ACADEMY VAULT (Inventory & Courses)
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Inventory (Theme & Assets) Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 p-5 rounded-2xl border border-blue-200/80 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0084FF] text-white flex items-center justify-center shadow-xs shrink-0">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black">Inventory (Themes & Hook Blueprints)</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Access curated 3-second hook frameworks, CapCut keyframe caption styles, and weekly trending sound logs to maximize retention.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-xs">
                <span className="text-gray-500 font-semibold">{themes.length || 4} Asset packs available</span>
                <button
                  onClick={() => handleTabChange('inventory')}
                  className="px-3 py-1.5 bg-[#0084FF] hover:bg-[#0073e6] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Browse Inventory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Courses (Video Academy) Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5 rounded-2xl border border-emerald-200/80 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4CAF50] text-white flex items-center justify-center shadow-xs shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black">Clipper Academy & Masterclasses</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Watch video tutorials on 2-second hook psychology, subtitle animation pacing, and verification compliance to maximize payouts.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-xs">
                <span className="text-gray-500 font-semibold">{courses.length || 4} Video masterclasses</span>
                <button
                  onClick={() => handleTabChange('courses')}
                  className="px-3 py-1.5 bg-[#4CAF50] hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Watch Courses</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Upload Video Bar */}
          <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="font-bold text-base text-black">Ready to submit a new high-energy reel or short?</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Active campaigns are paying up to ₹40 per 1k views + milestone bonuses.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2.5 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Video</span>
            </button>
          </div>

          {/* Recent Submissions (Last 5 cards as requested) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-black">Recent Submissions (Last 5)</h3>
              <button
                onClick={() => setTab('submissions')}
                className="text-xs font-bold text-[#0084FF] hover:underline cursor-pointer"
              >
                View All Submissions →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySubmissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setActiveVideoModal(sub)}
                  className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs hover:border-[#0084FF] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-gray-900 group">
                    <img
                      src={sub.thumbnail_url}
                      alt={sub.title}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-md">
                      {sub.platform_synced_from.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-xs text-black line-clamp-1">{sub.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{sub.campaign_name}</p>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E0E0E0]">
                      <span className="font-bold text-[#0084FF]">{sub.views.toLocaleString()} views</span>
                      <span className="font-bold text-black">
                        Est: ₹{(sub.estimated_earnings || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        sub.status === 'approved'
                          ? 'bg-[#4CAF50] text-white'
                          : sub.status === 'rejected'
                          ? 'bg-[#F44336] text-white'
                          : 'bg-[#FFA726] text-black'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-[10px]">{sub.views_last_sync}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ---------------- MY SUBMISSIONS TAB ---------------- */}
      {(tab === 'submissions' || activeSubTab === 'submissions') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-black">My Video Submissions</h2>
              <p className="text-sm text-gray-500 mt-0.5">Track review statuses, view synchronization, and estimated payouts.</p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Video</span>
            </button>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Video Clip</th>
                  <th className="py-3 px-4">Platform Views</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Estimated Earnings</th>
                  <th className="py-3 px-4">Review Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] text-xs">
                {mySubmissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={`hover:bg-[#E3F2FD] transition-colors cursor-pointer ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                    onClick={() => setActiveVideoModal(sub)}
                  >
                    <td className="py-3 px-4 font-bold text-black">{sub.campaign_name}</td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={sub.thumbnail_url}
                          alt={sub.title}
                          className="w-10 h-7 rounded-md object-cover"
                        />
                        <span className="font-semibold text-black line-clamp-1 max-w-[160px]">{sub.title}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0084FF]">{sub.views.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 block">{sub.views_last_sync}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'approved' ? 'bg-[#4CAF50] text-white' :
                        sub.status === 'rejected' ? 'bg-[#F44336] text-white' : 'bg-[#FFA726] text-black'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-black">
                      ₹{(sub.estimated_earnings || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-gray-500">
                      {sub.approved_at ? new Date(sub.approved_at).toLocaleDateString() : 'Pending'}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveVideoModal(sub)}
                        className="px-2.5 py-1 bg-[#E3F2FD] text-[#0084FF] font-semibold rounded-lg hover:bg-[#0084FF] hover:text-white"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- MY PAYOUTS TAB ---------------- */}
      {(tab === 'payouts' || activeSubTab === 'payouts') && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-black">My Earnings & Disbursed Payouts</h2>
            <p className="text-sm text-gray-500 mt-0.5">Calculated using verified CPM formulas with automated Razorpay invoices.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Submission</th>
                  <th className="py-3 px-4">Views Tracked</th>
                  <th className="py-3 px-4">Approved Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Paid Date</th>
                  <th className="py-3 px-4 text-right">Details & Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] text-xs">
                {myPayouts.map((pay, idx) => (
                  <tr
                    key={pay.id}
                    className={`hover:bg-[#E3F2FD] transition-colors cursor-pointer ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                    onClick={() => setActivePayoutDetail(pay)}
                  >
                    <td className="py-3 px-4 font-bold text-black">{pay.campaign_name}</td>
                    <td className="py-3 px-4 text-gray-700">{pay.submission_title}</td>
                    <td className="py-3 px-4 font-bold text-[#0084FF]">{pay.views.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-black">
                      ₹{(pay.approved_amount || pay.calculated_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pay.status === 'paid' ? 'bg-[#4CAF50] text-white' :
                        pay.status === 'approved' ? 'bg-[#0084FF] text-white' : 'bg-[#FFA726] text-black'
                      }`}>
                        {pay.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {pay.paid_date ? new Date(pay.paid_date).toLocaleDateString() : 'In Queue'}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActivePayoutDetail(pay)}
                        className="px-3 py-1 bg-white border border-[#E0E0E0] hover:bg-[#E3F2FD] text-black font-semibold rounded-lg"
                      >
                        Breakdown
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- PORTFOLIO TAB ---------------- */}
      {(tab === 'portfolio' || activeSubTab === 'portfolio') && (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-lg text-black">Creator Portfolio & Showreel</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Link your public Google Drive folder, Vimeo showreel, or personal website for campaign managers to assign premium campaigns.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-black mb-1">Portfolio / Showreel URL</label>
              <input
                type="url"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                placeholder="https://drive.google.com/your-showreel-link"
                className="w-full p-2.5 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
              />
            </div>

            {portfolioSaved && (
              <p className="text-[#4CAF50] font-bold">✓ Portfolio link updated successfully!</p>
            )}

            <button
              onClick={handleSavePortfolio}
              className="px-5 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold rounded-xl cursor-pointer"
            >
              Save Portfolio
            </button>

            {currentUser.portfolio && (
              <div className="p-4 bg-gray-50 rounded-xl border border-[#E0E0E0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0084FF]" />
                  <div>
                    <p className="font-bold text-black">Current Showreel Attached</p>
                    <p className="text-[11px] text-gray-500 truncate max-w-sm">{currentUser.portfolio}</p>
                  </div>
                </div>
                <a
                  href={currentUser.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-white border border-[#E0E0E0] hover:bg-gray-100 rounded-lg text-black font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- CONNECTED ACCOUNTS TAB ---------------- */}
      {(tab === 'connected_accounts' || activeSubTab === 'connected_accounts') && (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-bold text-lg text-black">Connected Creator Accounts & OAuth Sync</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect your social profiles to enable automated real-time view verification and instant CPM calculations.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Instagram */}
            <div className="p-5 rounded-2xl border border-[#E0E0E0] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-pink-50 text-pink-600">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black">Instagram Graph API</h4>
                  <p className="text-xs text-gray-500">
                    {currentUser.connected_accounts.instagram 
                      ? `Linked: ${currentUser.connected_accounts.instagram} (${(currentUser.connected_accounts.instagram_followers || 142500).toLocaleString()} followers)` 
                      : 'Not linked'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Last synced: {currentUser.connected_accounts.last_synced || '2 hours ago'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlatformSync('instagram')}
                  disabled={syncingPlatform === 'instagram'}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-[#E3F2FD] text-gray-700 hover:text-[#0084FF] text-xs font-semibold rounded-xl border border-[#E0E0E0] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingPlatform === 'instagram' ? 'animate-spin text-[#0084FF]' : ''}`} />
                  <span>Sync Views</span>
                </button>
                <button
                  onClick={() => alert('Instagram account linked and verified via Meta OAuth!')}
                  className="px-3.5 py-1.5 bg-[#4CAF50] text-white text-xs font-semibold rounded-xl"
                >
                  ✓ Connected
                </button>
              </div>
            </div>

            {/* YouTube */}
            <div className="p-5 rounded-2xl border border-[#E0E0E0] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black">YouTube Shorts & Data API</h4>
                  <p className="text-xs text-gray-500">
                    {currentUser.connected_accounts.youtube 
                      ? `Linked: ${currentUser.connected_accounts.youtube} (${(currentUser.connected_accounts.youtube_subscribers || 289000).toLocaleString()} subscribers)` 
                      : 'Not linked'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Last synced: 2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlatformSync('youtube')}
                  disabled={syncingPlatform === 'youtube'}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-[#E3F2FD] text-gray-700 hover:text-[#0084FF] text-xs font-semibold rounded-xl border border-[#E0E0E0] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingPlatform === 'youtube' ? 'animate-spin text-[#0084FF]' : ''}`} />
                  <span>Sync Views</span>
                </button>
                <button
                  onClick={() => alert('YouTube account linked and verified via Google OAuth!')}
                  className="px-3.5 py-1.5 bg-[#4CAF50] text-white text-xs font-semibold rounded-xl"
                >
                  ✓ Connected
                </button>
              </div>
            </div>

            {/* Facebook */}
            <div className="p-5 rounded-2xl border border-[#E0E0E0] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <Facebook className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black">Facebook Reels Graph API</h4>
                  <p className="text-xs text-gray-500">
                    {currentUser.connected_accounts.facebook 
                      ? `Linked: ${currentUser.connected_accounts.facebook}` 
                      : 'Not linked'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Last synced: 3 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlatformSync('facebook')}
                  disabled={syncingPlatform === 'facebook'}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-[#E3F2FD] text-gray-700 hover:text-[#0084FF] text-xs font-semibold rounded-xl border border-[#E0E0E0] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingPlatform === 'facebook' ? 'animate-spin text-[#0084FF]' : ''}`} />
                  <span>Sync Views</span>
                </button>
                <button
                  onClick={() => alert('Facebook account connected!')}
                  className="px-3.5 py-1.5 bg-[#4CAF50] text-white text-xs font-semibold rounded-xl"
                >
                  ✓ Connected
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- ACTIVE CAMPAIGNS TAB ---------------- */}
      {(tab === 'campaigns' || activeSubTab === 'campaigns') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-black font-['Manrope']">Live Campaign Opportunities</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Browse client briefs, check target audiences and hook requirements, and claim instant submission quotas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">Filter:</span>
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-[#E0E0E0]">
                {(['all', 'CPM', 'Hybrid', 'Retainer'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setCampaignFilter(filterType)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      campaignFilter === filterType
                        ? 'bg-white text-[#0084FF] shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {filterType === 'all' ? 'All Models' : filterType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredActiveCampaigns.map((camp) => {
              const daysRemaining = calculateDaysRemaining(camp.end_date);
              const isClosingSoon = daysRemaining <= 5;
              const briefExcerpt = getBriefPreview(camp.brief);

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-2xl border-2 border-[#E0E0E0] hover:border-[#0084FF] transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                        camp.campaign_type === 'CPM'
                          ? 'bg-blue-50 text-[#0084FF] border border-blue-200'
                          : camp.campaign_type === 'Hybrid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {camp.campaign_type === 'CPM' && 'CPM (Pay-Per-View)'}
                        {camp.campaign_type === 'Hybrid' && 'Hybrid (Base + CPM)'}
                        {camp.campaign_type === 'Retainer' && 'Retainer (Fixed)'}
                      </span>

                      <span className={`flex items-center gap-1 text-xs font-semibold ${
                        isClosingSoon ? 'text-[#F44336]' : 'text-gray-500'
                      }`}>
                        <Clock className={`w-3.5 h-3.5 ${isClosingSoon ? 'text-[#F44336]' : 'text-gray-400'}`} />
                        <span>
                          {daysRemaining === 0 
                            ? 'Closing today' 
                            : `${daysRemaining} days remaining`}
                        </span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-black group-hover:text-[#0084FF] transition-colors leading-snug">
                        {camp.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Budget Pool: ₹{camp.budget.toLocaleString()} • Verified Webhooks
                      </p>
                    </div>

                    <div className="p-3 bg-[#E3F2FD]/40 border border-[#0084FF]/20 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Amount You Can Earn
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-[#0084FF]">
                          {camp.campaign_type === 'CPM' && `₹${camp.rate_per_1k_views}`}
                          {camp.campaign_type === 'Retainer' && `₹${(camp.retainer_amount || 25000).toLocaleString()}`}
                          {camp.campaign_type === 'Hybrid' && `₹${(camp.retainer_amount || 10000).toLocaleString()} + ₹${camp.rate_per_1k_views}`}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">
                          {camp.campaign_type === 'CPM' && '/ 1k views'}
                          {camp.campaign_type === 'Retainer' && 'fixed'}
                          {camp.campaign_type === 'Hybrid' && '/ 1k'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {camp.campaign_type === 'CPM' && `Earning cap up to ₹${(camp.maximum_payout_per_clipper || 150000).toLocaleString()}`}
                        {camp.campaign_type === 'Retainer' && 'Guaranteed payout upon approved batch'}
                        {camp.campaign_type === 'Hybrid' && `Base retainer + uncapped viral upside`}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-700">Brief Preview</span>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {briefExcerpt}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveBriefModal(camp)}
                        className="text-[11px] font-bold text-[#0084FF] hover:underline cursor-pointer flex items-center gap-0.5 pt-0.5"
                      >
                        <span>Read Full Brief & Guidelines</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E0E0E0]">
                    <button
                      type="button"
                      onClick={() => handleQuickSubmit(camp.id)}
                      className="w-full py-2.5 px-4 bg-[#0084FF] hover:bg-[#0073e6] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Quick Submit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- INVENTORY (THEMES) TAB ---------------- */}
      {(tab === 'inventory' || activeSubTab === 'inventory') && (
        <div className="space-y-4">
          <InventorySection
            themes={themes}
            currentUser={currentUser}
            onCreateTheme={() => {}}
            onDeleteTheme={() => {}}
          />
        </div>
      )}

      {/* ---------------- COURSES (ACADEMY) TAB ---------------- */}
      {(tab === 'courses' || activeSubTab === 'courses') && (
        <div className="space-y-4">
          <CoursesSection
            courses={courses}
            currentUser={currentUser}
            onCreateCourse={() => {}}
          />
        </div>
      )}

      {/* ---------------- UPLOAD NEW VIDEO MODAL ---------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E0E0E0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-base text-black">Submit New Campaign Video</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-black mb-1">Select Campaign</label>
                <select
                  value={upCampaignId}
                  onChange={(e) => setUpCampaignId(e.target.value)}
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                >
                  {campaigns.filter(c => c.status === 'active' || !c.status).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.campaign_type} • ₹{c.rate_per_1k_views}/1k)
                    </option>
                  ))}
                </select>
              </div>

              {selectedCampaignForUpload && (
                <div className="p-2.5 bg-[#E3F2FD]/50 border border-[#0084FF]/20 rounded-xl text-[11px] text-gray-700 flex items-center justify-between">
                  <span>Model: <strong>{selectedCampaignForUpload.campaign_type}</strong></span>
                  <span className="font-bold text-[#0084FF]">
                    {selectedCampaignForUpload.campaign_type === 'CPM' && `₹${selectedCampaignForUpload.rate_per_1k_views}/1k`}
                    {selectedCampaignForUpload.campaign_type === 'Retainer' && `₹${(selectedCampaignForUpload.retainer_amount || 25000).toLocaleString()} Fixed`}
                    {selectedCampaignForUpload.campaign_type === 'Hybrid' && `₹${(selectedCampaignForUpload.retainer_amount || 10000).toLocaleString()} + ₹${selectedCampaignForUpload.rate_per_1k_views}/1k`}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-black mb-1">Platform Source</label>
                <select
                  value={upPlatform}
                  onChange={(e) => setUpPlatform(e.target.value as any)}
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                >
                  <option value="instagram">Instagram Reel</option>
                  <option value="youtube">YouTube Short</option>
                  <option value="facebook">Facebook Reel</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Video Title / Hook</label>
                <input
                  type="text"
                  required
                  value={upTitle}
                  onChange={(e) => setUpTitle(e.target.value)}
                  placeholder="e.g. Neon Pulse 14 Pro: Night Mode Camera Test at 2AM"
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Video File / Preview URL</label>
                <input
                  type="url"
                  value={upVideoUrl}
                  onChange={(e) => setUpVideoUrl(e.target.value)}
                  placeholder="https://assets.mixkit.co/...mp4"
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Creative Description</label>
                <textarea
                  rows={3}
                  value={upDesc}
                  onChange={(e) => setUpDesc(e.target.value)}
                  placeholder="Audio used, pacing strategy, and target demographics..."
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 border border-[#E0E0E0] rounded-xl text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0084FF] text-white font-semibold rounded-xl hover:bg-[#0073e6]"
                >
                  Submit Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- SUBMISSION DETAIL MODAL ---------------- */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-[#E0E0E0] shadow-2xl">
            <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between">
              <span className="font-bold text-sm text-black truncate">{activeVideoModal.title}</span>
              <button onClick={() => setActiveVideoModal(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="relative bg-black aspect-9/16 max-h-[460px]">
              <video src={activeVideoModal.video_url} controls autoPlay className="w-full h-full object-contain" />
            </div>
            <div className="p-5 bg-white text-xs space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Verified Views</p>
                  <p className="text-base font-bold text-[#0084FF]">{activeVideoModal.views.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">Last synced: {activeVideoModal.views_last_sync}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Estimated Payout</p>
                  <p className="text-base font-bold text-black">₹{(activeVideoModal.estimated_earnings || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-[#4CAF50] font-semibold">({activeVideoModal.views.toLocaleString()} × ₹35) / 1000</p>
                </div>
              </div>

              {activeVideoModal.feedback && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <p className="font-bold text-[11px]">Approver Feedback:</p>
                  <p className="text-[11px] mt-0.5">{activeVideoModal.feedback}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PAYOUT DETAIL MODAL ---------------- */}
      {activePayoutDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E0E0E0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-base text-black">Payout Calculation & Invoice</h3>
              <button onClick={() => setActivePayoutDetail(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#E3F2FD] rounded-xl border border-[#0084FF]/20 space-y-1">
                <p className="font-bold text-black text-sm">₹{(activePayoutDetail.approved_amount || activePayoutDetail.calculated_amount).toLocaleString()} INR</p>
                <p className="text-[#0084FF] font-semibold">Status: {activePayoutDetail.status.toUpperCase()}</p>
              </div>

              <div className="space-y-2 border-t border-[#E0E0E0] pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Campaign:</span>
                  <span className="font-bold text-black">{activePayoutDetail.campaign_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified Platform Views:</span>
                  <span className="font-bold text-[#0084FF]">{activePayoutDetail.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate Applied:</span>
                  <span className="font-bold text-black">₹{activePayoutDetail.rate_used} per 1k views</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Formula Used:</span>
                  <span className="font-mono text-black">({activePayoutDetail.views.toLocaleString()} × {activePayoutDetail.rate_used}) / 1000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Razorpay Ref:</span>
                  <span className="font-mono text-xs text-gray-700">{activePayoutDetail.razorpay_order_id || 'Pending Batch'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E0E0E0] flex justify-between gap-2">
                <button
                  onClick={() => {
                    alert('Official Razorpay payment settlement receipt generated!');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Receipt</span>
                </button>
                <button
                  onClick={() => setActivePayoutDetail(null)}
                  className="px-4 py-1.5 bg-[#0084FF] text-white font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CAMPAIGN BRIEF DETAILS MODAL ---------------- */}
      {activeBriefModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[#E0E0E0] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeBriefModal.campaign_type === 'CPM'
                    ? 'bg-blue-50 text-[#0084FF] border border-blue-200'
                    : activeBriefModal.campaign_type === 'Hybrid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {activeBriefModal.campaign_type} Model
                </span>
                <h3 className="font-bold text-lg text-black mt-1">{activeBriefModal.name}</h3>
              </div>
              <button 
                onClick={() => setActiveBriefModal(null)}
                className="text-gray-400 hover:text-black font-bold text-sm p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-[#E0E0E0]">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Earnings Model</span>
                <span className="font-bold text-black mt-0.5 block">{getEarningDisplay(activeBriefModal)}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-[#E0E0E0]">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Timeline</span>
                <span className="font-bold text-black mt-0.5 block">{calculateDaysRemaining(activeBriefModal.end_date)} days remaining</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-[#E0E0E0] col-span-2 sm:col-span-1">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Min Payout Threshold</span>
                <span className="font-bold text-[#0084FF] mt-0.5 block">₹{activeBriefModal.minimum_payout_threshold.toLocaleString()}</span>
              </div>
            </div>

            {/* Full Brief Content */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-[#E0E0E0] space-y-2 text-xs">
              <h4 className="font-bold text-black text-sm">Campaign Guidelines & Objectives</h4>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line space-y-2">
                {activeBriefModal.brief}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-[#E0E0E0] flex justify-end gap-2">
              <button
                onClick={() => setActiveBriefModal(null)}
                className="px-4 py-2 border border-[#E0E0E0] hover:bg-gray-100 text-black font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const campId = activeBriefModal.id;
                  setActiveBriefModal(null);
                  handleQuickSubmit(campId);
                }}
                className="px-5 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Submit Video for This Campaign</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
