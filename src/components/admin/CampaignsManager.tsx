import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ArrowUpDown, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ExternalLink, 
  Play, 
  AlertCircle,
  FileText,
  DollarSign,
  Users,
  Video
} from 'lucide-react';
import { Campaign, Submission, User, CampaignStatus } from '../../types';

interface CampaignsManagerProps {
  campaigns: Campaign[];
  submissions: Submission[];
  currentUser: User;
  onCreateCampaign: (campaign: Partial<Campaign>) => void;
  onUpdateSubmissionStatus: (submissionId: string, status: 'approved' | 'rejected', feedback?: string) => void;
  onUpdateCampaignStatus?: (campaignId: string, status: CampaignStatus) => void;
}

export const CampaignsManager: React.FC<CampaignsManagerProps> = ({
  campaigns,
  submissions,
  currentUser,
  onCreateCampaign,
  onUpdateSubmissionStatus,
  onUpdateCampaignStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'budget' | 'created_at' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<Submission | null>(null);
  const [feedbackPromptSub, setFeedbackPromptSub] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Create Campaign Form state
  const [newCampName, setNewCampName] = useState('');
  const [newCampBrief, setNewCampBrief] = useState('');
  const [newCampType, setNewCampType] = useState<'CPM' | 'Retainer' | 'Hybrid'>('CPM');
  const [newCampBudget, setNewCampBudget] = useState('1500000');
  const [newCampRate, setNewCampRate] = useState('35');
  const [newCampMargin, setNewCampMargin] = useState('25');
  const [newCampRetainer, setNewCampRetainer] = useState('15000');

  // Filter & Sort
  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  filtered.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'name') comp = a.name.localeCompare(b.name);
    else if (sortBy === 'budget') comp = (a.budget || 0) - (b.budget || 0);
    else if (sortBy === 'created_at') comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    else if (sortBy === 'status') comp = a.status.localeCompare(b.status);
    return sortOrder === 'asc' ? comp : -comp;
  });

  const handleSort = (field: 'name' | 'budget' | 'created_at' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCampaign({
      name: newCampName,
      brief: newCampBrief,
      campaign_type: newCampType,
      budget: Number(newCampBudget),
      rate_per_1k_views: Number(newCampRate),
      gross_margin: Number(newCampMargin),
      retainer_amount: Number(newCampRetainer),
      minimum_payout_threshold: 1000,
      maximum_payout_per_clipper: 150000,
      assigned_managers: ['user_mgr_1'],
      status: 'active',
    });
    setShowCreateModal(false);
    setNewCampName('');
    setNewCampBrief('');
  };

  // Status Badge Helper
  const renderStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4CAF50] text-white">Active</span>;
      case 'paused':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFA726] text-black">Paused</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0084FF] text-white">Completed</span>;
      case 'draft':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">Draft</span>;
    }
  };

  // Selected Campaign Submissions
  const campSubmissions = selectedCampaign 
    ? submissions.filter((s) => s.campaign_id === selectedCampaign.id)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Search bar + Status Filter + Create Campaign Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Bar with sky blue focus border */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-hidden focus:border-[#0084FF] focus:ring-2 focus:ring-[#0084FF]/20 font-['Manrope']"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs font-semibold text-black focus:outline-hidden focus:border-[#0084FF] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
            <option value="completed">Completed Only</option>
            <option value="draft">Draft Only</option>
          </select>

          {/* Create Campaign Button: Sky blue bg, white text, Manrope 600 */}
          {currentUser.role !== 'Client' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-['Manrope']">
            {/* Header: #F5F5F5, black text 600 */}
            <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Campaign Name</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('budget')}>
                  <div className="flex items-center gap-1.5">
                    <span>Budget</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Clippers</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Payouts</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Rows: alternating white / #FAFAFA, hover #E3F2FD */}
            <tbody className="divide-y divide-[#E0E0E0]">
              {filtered.map((camp, index) => {
                const campSubs = submissions.filter((s) => s.campaign_id === camp.id);
                const totalViews = campSubs.reduce((acc, curr) => acc + (curr.views || 0), 0);
                const clippersCount = new Set(campSubs.map((s) => s.clipper_id)).size;

                return (
                  <tr
                    key={camp.id}
                    className={`transition-colors hover:bg-[#E3F2FD] cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                    onClick={() => setSelectedCampaign(camp)}
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-black">{camp.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {camp.campaign_type} • {camp.rate_per_1k_views ? `₹${camp.rate_per_1k_views}/1k views` : `₹${camp.retainer_amount} Retainer`}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-black">
                      ₹{camp.budget.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      {renderStatusBadge(camp.status)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      <span className="font-semibold">{clippersCount || camp.clippers_count || 0}</span> creators
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#0084FF]">
                      {(totalViews || camp.total_views || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-black">
                      ₹{(camp.total_payouts || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCampaign(camp)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#0084FF] bg-[#E3F2FD] hover:bg-[#0084FF] hover:text-white rounded-lg transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- CAMPAIGN DETAIL MODAL / VIEW ---------------- */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#E0E0E0] shadow-2xl p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E0E0E0]">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-black">{selectedCampaign.name}</h3>
                  {renderStatusBadge(selectedCampaign.status)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type: <strong>{selectedCampaign.campaign_type}</strong> | Gross Margin: <strong>{selectedCampaign.gross_margin}%</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Campaign Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-[#E0E0E0]">
              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold">Budget</span>
                <p className="text-base font-bold text-black">₹{selectedCampaign.budget.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold">Total Views</span>
                <p className="text-base font-bold text-[#0084FF]">
                  {campSubmissions.reduce((a, b) => a + (b.views || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold">Submissions</span>
                <p className="text-base font-bold text-black">{campSubmissions.length} clips</p>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold">Payout Rate</span>
                <p className="text-base font-bold text-black">
                  {selectedCampaign.rate_per_1k_views ? `₹${selectedCampaign.rate_per_1k_views}/1k` : `₹${selectedCampaign.retainer_amount}`}
                </p>
              </div>
            </div>

            {/* Campaign Brief (Markdown display) */}
            <div className="p-4 rounded-xl border border-[#E0E0E0] bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Campaign Brief</h4>
              <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-sans">
                {selectedCampaign.brief}
              </div>
            </div>

            {/* Submissions Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-black">
                  Submissions Queue ({campSubmissions.length})
                </h4>

                {/* Approve all button */}
                {currentUser.role !== 'Client' && currentUser.role !== 'Campaign_Manager_Assistant' && (
                  <button
                    onClick={() => {
                      campSubmissions.filter(s => s.status === 'pending').forEach(s => {
                        onUpdateSubmissionStatus(s.id, 'approved', 'Bulk approved by campaign manager');
                      });
                    }}
                    className="px-3 py-1.5 bg-[#4CAF50] hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ✓ Approve All Pending
                  </button>
                )}
              </div>

              {campSubmissions.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E0E0E0] rounded-xl text-gray-400 text-xs">
                  No submissions yet for this campaign.
                </div>
              ) : (
                <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] font-semibold text-black">
                      <tr>
                        <th className="py-2.5 px-3">Clipper Name</th>
                        <th className="py-2.5 px-3">Video</th>
                        <th className="py-2.5 px-3">Views</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Payout</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {campSubmissions.map((sub) => {
                        const calculatedPayout = Math.round(((sub.views || 0) * (selectedCampaign.rate_per_1k_views || 35)) / 1000);
                        return (
                          <tr key={sub.id} className="hover:bg-[#E3F2FD]">
                            <td className="py-2.5 px-3 font-semibold text-black">
                              {sub.clipper_name}
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                onClick={() => setActiveVideoModal(sub)}
                                className="flex items-center gap-1.5 text-[#0084FF] hover:underline font-semibold"
                              >
                                <Play className="w-3 h-3 fill-[#0084FF]" />
                                <span className="line-clamp-1 max-w-[180px]">{sub.title}</span>
                              </button>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-black">
                              {sub.views.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  sub.status === 'approved'
                                    ? 'bg-[#4CAF50] text-white'
                                    : sub.status === 'rejected'
                                    ? 'bg-[#F44336] text-white'
                                    : 'bg-yellow-400 text-black'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-black">
                              ₹{calculatedPayout.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-1">
                              {sub.status === 'pending' && currentUser.role !== 'Campaign_Manager_Assistant' && (
                                <>
                                  <button
                                    onClick={() => onUpdateSubmissionStatus(sub.id, 'approved', 'Meets quality guidelines')}
                                    className="px-2 py-1 bg-[#4CAF50] hover:bg-[#0084FF] text-white rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setFeedbackPromptSub(sub);
                                      setFeedbackText('');
                                    }}
                                    className="px-2 py-1 bg-[#F44336] hover:bg-red-700 text-white rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {sub.feedback && (
                                <span
                                  className="text-[10px] text-gray-500 italic block cursor-help"
                                  title={sub.feedback}
                                >
                                  Feedback logged
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#E0E0E0] flex justify-end">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- CREATE CAMPAIGN MODAL ---------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E0E0E0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-lg text-black font-['Manrope']">Create New Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-black mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  placeholder="e.g. Neon Horizon Earbuds Launch"
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-black focus:outline-hidden focus:border-[#0084FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-black mb-1">Campaign Type</label>
                  <select
                    value={newCampType}
                    onChange={(e) => setNewCampType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-black focus:outline-hidden focus:border-[#0084FF]"
                  >
                    <option value="CPM">CPM (Rate / 1k views)</option>
                    <option value="Retainer">Retainer (Fixed Fee)</option>
                    <option value="Hybrid">Hybrid (Base + CPM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-black mb-1">Budget (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newCampBudget}
                    onChange={(e) => setNewCampBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-black focus:outline-hidden focus:border-[#0084FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-black mb-1">Rate per 1k Views (₹)</label>
                  <input
                    type="number"
                    value={newCampRate}
                    onChange={(e) => setNewCampRate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-black focus:outline-hidden focus:border-[#0084FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-black mb-1">Gross Margin (%)</label>
                  <input
                    type="number"
                    value={newCampMargin}
                    onChange={(e) => setNewCampMargin(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-black focus:outline-hidden focus:border-[#0084FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Campaign Brief (Markdown)</label>
                <textarea
                  rows={4}
                  required
                  value={newCampBrief}
                  onChange={(e) => setNewCampBrief(e.target.value)}
                  placeholder="### Objective&#10;Describe key product features, requirements, and hashtags..."
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-black focus:outline-hidden focus:border-[#0084FF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold rounded-xl"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- VIDEO PLAYER MODAL ---------------- */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-[#E0E0E0] shadow-2xl">
            <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between">
              <span className="font-bold text-sm text-black truncate max-w-[360px]">{activeVideoModal.title}</span>
              <button onClick={() => setActiveVideoModal(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="relative bg-black aspect-9/16 max-h-[500px] flex items-center justify-center">
              <video
                src={activeVideoModal.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-gray-50 text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-black">{activeVideoModal.clipper_name}</p>
                <p className="text-gray-500">{activeVideoModal.views.toLocaleString()} verified views</p>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-3 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-black font-semibold hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- REJECTION FEEDBACK MODAL ---------------- */}
      {feedbackPromptSub && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-[#E0E0E0] shadow-2xl space-y-3">
            <h4 className="font-bold text-sm text-black">Provide Rejection Feedback</h4>
            <p className="text-xs text-gray-500">
              Explain why this submission needs revisions so the creator can improve.
            </p>
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Subtitles cut off at the bottom, audio balance is too low..."
              className="w-full p-2.5 text-xs border border-[#E0E0E0] rounded-xl focus:border-[#0084FF] text-black"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setFeedbackPromptSub(null)}
                className="px-3 py-1.5 border border-[#E0E0E0] rounded-xl text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateSubmissionStatus(feedbackPromptSub.id, 'rejected', feedbackText || 'Quality guidelines not met.');
                  setFeedbackPromptSub(null);
                }}
                className="px-3 py-1.5 bg-[#F44336] text-white font-semibold rounded-xl hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
