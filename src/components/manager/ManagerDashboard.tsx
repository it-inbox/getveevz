import React, { useState } from 'react';
import { 
  Megaphone, 
  Video, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  TrendingUp, 
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { Campaign, Submission, User, Payout } from '../../types';

interface ManagerDashboardProps {
  currentUser: User;
  campaigns: Campaign[];
  submissions: Submission[];
  payouts: Payout[];
  onUpdateSubmissionStatus: (submissionId: string, status: 'approved' | 'rejected', feedback?: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  currentUser,
  campaigns,
  submissions,
  payouts,
  onUpdateSubmissionStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'queue'>('overview');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [activeVideoModal, setActiveVideoModal] = useState<Submission | null>(null);
  const [feedbackSubmission, setFeedbackSubmission] = useState<Submission | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Manager filter: only their assigned campaigns
  const myCampaigns = campaigns.filter(
    (c) => c.assigned_managers.includes(currentUser.id) || c.assigned_managers.length === 0
  );
  const myCampaignIds = myCampaigns.map((c) => c.id);
  const mySubmissions = submissions.filter((s) => myCampaignIds.includes(s.campaign_id));
  const pendingSubmissions = mySubmissions.filter((s) => s.status === 'pending');
  const totalViews = mySubmissions.reduce((a, b) => a + (b.views || 0), 0);
  const totalApprovedPayouts = payouts
    .filter((p) => myCampaignIds.includes(p.campaign_id))
    .reduce((a, b) => a + (b.approved_amount || b.calculated_amount), 0);

  const isReadOnly = currentUser.role === 'Campaign_Manager_Assistant';

  const handleBulkApprove = () => {
    if (isReadOnly) return;
    pendingSubmissions.forEach((sub) => {
      onUpdateSubmissionStatus(sub.id, 'approved', 'Batch approved by campaign manager');
    });
    alert(`Bulk approved ${pendingSubmissions.length} submissions! Payouts generated.`);
  };

  return (
    <div className="space-y-6 font-['Manrope']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-black">Campaign Manager Hub</h2>
            {isReadOnly && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                Assistant (Read-Only)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Quality control review, video grading, and creator deliverables oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly && pendingSubmissions.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4CAF50] hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Bulk Approve ({pendingSubmissions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E0E0E0] pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-[#E3F2FD] text-[#0084FF]' : 'text-gray-600 hover:text-black'
          }`}
        >
          Performance Overview
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'queue' ? 'bg-[#E3F2FD] text-[#0084FF]' : 'text-gray-600 hover:text-black'
          }`}
        >
          Submissions Review Queue ({pendingSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'campaigns' ? 'bg-[#E3F2FD] text-[#0084FF]' : 'text-gray-600 hover:text-black'
          }`}
        >
          Assigned Campaigns ({myCampaigns.length})
        </button>
      </div>

      {/* ---------------- OVERVIEW TAB ---------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Performance Cards (4 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* My Campaigns count & percentage of total */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">My Campaigns</span>
              <p className="text-3xl font-bold text-black mt-2">{myCampaigns.length}</p>
              <p className="text-xs text-[#0084FF] font-semibold mt-1">
                {campaigns.length ? Math.round((myCampaigns.length / campaigns.length) * 100) : 0}% of agency portfolio
              </p>
            </div>

            {/* Total Views */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">Verified Views</span>
              <p className="text-3xl font-bold text-black mt-2">{totalViews.toLocaleString()}</p>
              <span className="text-xs font-bold text-[#4CAF50] flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> High viral engagement
              </span>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">Pending Approvals</span>
              <p className="text-3xl font-bold text-[#FFA726] mt-2">{pendingSubmissions.length}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting your grading</p>
            </div>

            {/* Payouts Managed */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">Payouts Under Watch</span>
              <p className="text-3xl font-bold text-[#4CAF50] mt-2">₹{totalApprovedPayouts.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Assigned deliverables</p>
            </div>

          </div>

          {/* Recent Activity Feed (Last 5 Submissions & Actions) */}
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-black">Recent Deliverables & Activity (Last 5)</h3>
            <div className="space-y-3">
              {mySubmissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl border border-[#E0E0E0] hover:bg-[#E3F2FD] transition-colors flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setActiveVideoModal(sub)}
                >
                  <div className="flex items-center gap-3">
                    <img src={sub.thumbnail_url} alt={sub.title} className="w-12 h-8 rounded-md object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-black">{sub.title}</h4>
                      <p className="text-[11px] text-gray-500">
                        {sub.clipper_name} • {sub.campaign_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#0084FF] text-xs">{(sub.views || 0).toLocaleString()} views</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.status === 'approved' ? 'bg-[#4CAF50] text-white' :
                      sub.status === 'rejected' ? 'bg-[#F44336] text-white' : 'bg-[#FFA726] text-black'
                    }`}>
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ---------------- SUBMISSIONS QUEUE TAB ---------------- */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-black">Submissions Quality Control Queue</h3>
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    statusFilter === st ? 'bg-[#0084FF] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Video Clip</th>
                  <th className="p-3">Campaign</th>
                  <th className="p-3">Clipper</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] text-xs">
                {mySubmissions
                  .filter((s) => statusFilter === 'all' || s.status === statusFilter)
                  .map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-[#E3F2FD] transition-colors">
                      <td className="p-3">
                        <button
                          onClick={() => setActiveVideoModal(sub)}
                          className="flex items-center gap-2 text-left font-bold text-black hover:text-[#0084FF]"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#0084FF] text-[#0084FF]" />
                          <span className="line-clamp-1 max-w-[200px]">{sub.title}</span>
                        </button>
                      </td>
                      <td className="p-3 text-gray-700">{sub.campaign_name}</td>
                      <td className="p-3 font-semibold text-black">{sub.clipper_name}</td>
                      <td className="p-3 font-bold text-[#0084FF]">{sub.views.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'approved' ? 'bg-[#4CAF50] text-white' :
                          sub.status === 'rejected' ? 'bg-[#F44336] text-white' : 'bg-[#FFA726] text-black'
                        }`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {!isReadOnly && sub.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onUpdateSubmissionStatus(sub.id, 'approved', 'Meets quality threshold')}
                              className="px-2.5 py-1 bg-[#4CAF50] text-white font-bold rounded-lg hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setFeedbackSubmission(sub);
                                setFeedbackComment('');
                              }}
                              className="px-2.5 py-1 bg-[#F44336] text-white font-bold rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {isReadOnly && (
                          <span className="text-[10px] text-gray-400 italic">Read-only approval</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- CAMPAIGNS TAB ---------------- */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myCampaigns.map((camp) => (
            <div key={camp.id} className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4CAF50] text-white">
                  {camp.status.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-[#0084FF]">₹{camp.budget.toLocaleString()}</span>
              </div>
              <h4 className="font-bold text-sm text-black">{camp.name}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{camp.brief}</p>
              <div className="pt-2 border-t border-[#E0E0E0] flex justify-between text-xs text-gray-600">
                <span>Model: <strong>{camp.campaign_type}</strong></span>
                <span>Rate: <strong>₹{camp.rate_per_1k_views}/1k</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-[#E0E0E0] shadow-2xl">
            <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between">
              <span className="font-bold text-sm text-black truncate">{activeVideoModal.title}</span>
              <button onClick={() => setActiveVideoModal(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="relative bg-black aspect-9/16 max-h-[500px]">
              <video src={activeVideoModal.video_url} controls autoPlay className="w-full h-full object-contain" />
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

      {/* Reject Feedback Modal */}
      {feedbackSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-[#E0E0E0] shadow-2xl space-y-3">
            <h4 className="font-bold text-sm text-black">Rejection Reason & Required Edits</h4>
            <textarea
              rows={3}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="e.g. Please crop 9:16 aspect ratio properly and replace copyright music..."
              className="w-full p-2.5 text-xs border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setFeedbackSubmission(null)}
                className="px-3 py-1.5 border border-[#E0E0E0] rounded-xl text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateSubmissionStatus(feedbackSubmission.id, 'rejected', feedbackComment || 'Revisions required.');
                  setFeedbackSubmission(null);
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
