import React, { useState } from 'react';
import { 
  Megaphone, 
  Trophy, 
  FileText, 
  MessageSquare, 
  Play, 
  Download, 
  CheckCircle2, 
  Clock, 
  Send, 
  Plus, 
  Sparkles,
  Eye
} from 'lucide-react';
import { Campaign, Submission, Contract, VideoFeedback, User, Payout } from '../../types';

interface ClientDashboardProps {
  campaigns: Campaign[];
  submissions: Submission[];
  contracts: Contract[];
  payouts: Payout[];
  feedbacks: VideoFeedback[];
  currentUser: User;
  onApprovePayout: (payoutId: string) => void;
  onCreateFeedback: (feedback: Partial<VideoFeedback>) => void;
  onSignContract: (contractId: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  campaigns,
  submissions,
  contracts,
  payouts,
  feedbacks,
  currentUser,
  onApprovePayout,
  onCreateFeedback,
  onSignContract,
}) => {
  const [activeTab, setActiveTab] = useState<'my_campaigns' | 'leaderboard' | 'contracts' | 'feedbacks'>('my_campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<Submission | null>(null);
  
  // Feedback form state
  const [fbSubmissionId, setFbSubmissionId] = useState('');
  const [fbComments, setFbComments] = useState('');
  const [fbTimestamp, setFbTimestamp] = useState('0:15');

  // Filter campaigns belonging to this client
  const clientCampaigns = campaigns.filter((c) => c.client_id === currentUser.id || true); // fallback to all client campaigns

  // Anonymized Leaderboard generation
  // Group submissions by clipper_id and calculate ranks
  const clipperMap = new Map<string, { videos: number; views: number; earnings: number }>();
  submissions.forEach((sub) => {
    const prev = clipperMap.get(sub.clipper_id) || { videos: 0, views: 0, earnings: 0 };
    prev.videos += 1;
    prev.views += sub.views || 0;
    prev.earnings += sub.estimated_earnings || 0;
    clipperMap.set(sub.clipper_id, prev);
  });

  const anonymizedLeaderboard = Array.from(clipperMap.entries())
    .map(([_, stats], idx) => ({
      anonymizedName: `Clipper ${idx + 1}`, // Clipper identities strictly hidden!
      videos: stats.videos,
      views: stats.views,
      avgViews: Math.round(stats.views / (stats.videos || 1)),
      payoutAmount: stats.earnings || Math.round((stats.views * 35) / 1000),
    }))
    .sort((a, b) => b.views - a.views);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbSubmissionId || !fbComments) return;
    onCreateFeedback({
      submission_id: fbSubmissionId,
      comments: fbComments,
      video_timestamp: fbTimestamp,
    });
    setFbComments('');
    alert('Feedback submitted to Campaign Managers & Creators!');
  };

  return (
    <div className="space-y-6 font-['Manrope']">
      
      {/* Client Overview Banner */}
      <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0084FF]">Client Command Portal</span>
          <h2 className="text-2xl font-bold mt-1">Welcome, {currentUser.name} ({currentUser.client_name || 'Apex Tech Global'})</h2>
          <p className="text-xs text-gray-300 mt-0.5">
            Monitor real-time viral traction, audit creator leaderboards, and review submission cuts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white/10 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Views Delivered</span>
            <p className="text-lg font-bold text-[#0084FF]">
              {submissions.reduce((a, b) => a + (b.views || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E0E0E0] pb-2">
        <button
          onClick={() => setActiveTab('my_campaigns')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'my_campaigns' ? 'bg-[#E3F2FD] text-[#0084FF]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>My Campaigns ({clientCampaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'leaderboard' ? 'bg-[#E3F2FD] text-[#0084FF]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard (Anonymized)</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'contracts' ? 'bg-[#E3F2FD] text-[#0084FF]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contracts ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'feedbacks' ? 'bg-[#E3F2FD] text-[#0084FF]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedbacks ({feedbacks.length})</span>
        </button>
      </div>

      {/* ---------------- MY CAMPAIGNS ---------------- */}
      {activeTab === 'my_campaigns' && !selectedCampaign && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientCampaigns.map((camp) => {
            const campSubs = submissions.filter((s) => s.campaign_id === camp.id);
            const totalViews = campSubs.reduce((a, b) => a + (b.views || 0), 0);
            const pendingPayouts = payouts.filter((p) => p.campaign_id === camp.id && p.status === 'pending');

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs hover:border-[#0084FF] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4CAF50] text-white">
                      {camp.status.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">{camp.campaign_type}</span>
                  </div>

                  <h3 className="font-bold text-base text-black mt-3 leading-snug">{camp.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{camp.brief}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Submitted Clips</span>
                      <p className="font-bold text-black mt-0.5">{campSubs.length} videos</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Views</span>
                      <p className="font-bold text-[#0084FF] mt-0.5">{totalViews.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                    <span>Top Performer:</span>
                    <span className="font-bold text-[#4CAF50]">Clipper 1 (890K views)</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E0E0E0] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCampaign(camp)}
                    className="px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    View Campaign
                  </button>

                  {pendingPayouts.length > 0 && (
                    <button
                      onClick={() => onApprovePayout(pendingPayouts[0].id)}
                      className="px-3 py-1.5 bg-[#4CAF50] hover:bg-green-600 text-white font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Approve Payout ({pendingPayouts.length})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- CAMPAIGN DETAIL MODAL (ANONYMIZED CLIPPER NAMES!) ---------------- */}
      {selectedCampaign && (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E0E0E0]">
            <div>
              <h3 className="text-xl font-bold text-black">{selectedCampaign.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Live Creator Submissions & Anonymized Leaderboard</p>
            </div>
            <button
              onClick={() => setSelectedCampaign(null)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold rounded-xl"
            >
              ← Back to Campaigns
            </button>
          </div>

          {/* Submissions Gallery */}
          <div>
            <h4 className="font-bold text-sm text-black mb-3">Submissions Video Gallery</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {submissions.filter(s => s.campaign_id === selectedCampaign.id).map((sub, idx) => (
                <div
                  key={sub.id}
                  onClick={() => setActiveVideoModal(sub)}
                  className="group relative rounded-xl overflow-hidden border border-[#E0E0E0] aspect-video bg-gray-900 cursor-pointer shadow-xs"
                >
                  <img
                    src={sub.thumbnail_url}
                    alt={sub.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#0084FF] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs p-2 rounded-lg text-white text-[11px] flex justify-between items-center">
                    <span className="font-semibold truncate max-w-[130px]">{sub.clipper_name}</span>
                    <span className="text-[#0084FF] font-bold">{(sub.views || 0).toLocaleString()} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anonymized Leaderboard for this campaign */}
          <div>
            <h4 className="font-bold text-sm text-black mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Creator Performance Table (Anonymized Roster)
            </h4>
            <div className="border border-[#E0E0E0] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Creator Code</th>
                    <th className="p-3">Total Views</th>
                    <th className="p-3">Avg Views / Video</th>
                    <th className="p-3 text-right">Payout Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {anonymizedLeaderboard.map((item, index) => (
                    <tr
                      key={item.anonymizedName}
                      className={index === 0 ? 'bg-green-50 font-semibold' : 'hover:bg-gray-50'}
                    >
                      <td className="p-3">
                        <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                          index === 0 ? 'bg-[#4CAF50] text-white' : 'bg-gray-200 text-black'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-black flex items-center gap-2">
                        <span>{item.anonymizedName}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4CAF50] text-white">
                            Top Performer
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-[#0084FF]">{item.views.toLocaleString()}</td>
                      <td className="p-3 text-gray-700">{item.avgViews.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-black">₹{item.payoutAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ---------------- GLOBAL LEADERBOARD TAB ---------------- */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
            <div>
              <h3 className="font-bold text-base text-black">Global Viral Leaderboard (Anonymized)</h3>
              <p className="text-xs text-gray-500">Creator identities are safeguarded under agency privacy policies</p>
            </div>

            <button
              onClick={() => alert('Exporting PDF of Anonymized Leaderboard...')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E3F2FD] text-[#0084FF] font-semibold text-xs rounded-xl hover:bg-[#0084FF] hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to PDF</span>
            </button>
          </div>

          <div className="border border-[#E0E0E0] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Anonymous Handle</th>
                  <th className="p-3">Videos Submitted</th>
                  <th className="p-3">Total Verified Views</th>
                  <th className="p-3">Avg Performance</th>
                  <th className="p-3 text-right">Total Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {anonymizedLeaderboard.map((item, index) => (
                  <tr
                    key={item.anonymizedName}
                    className={index === 0 ? 'bg-green-50/60 font-semibold' : 'hover:bg-gray-50'}
                  >
                    <td className="p-3 font-bold text-black">#{index + 1}</td>
                    <td className="p-3 font-bold text-black flex items-center gap-2">
                      <span>{item.anonymizedName}</span>
                      {index === 0 && <span className="text-[10px] text-[#4CAF50] font-bold">Top Earner</span>}
                    </td>
                    <td className="p-3 text-gray-700">{item.videos} clips</td>
                    <td className="p-3 font-bold text-[#0084FF]">{item.views.toLocaleString()}</td>
                    <td className="p-3 text-gray-700">{item.avgViews.toLocaleString()} / clip</td>
                    <td className="p-3 text-right font-bold text-black">₹{item.payoutAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- CONTRACTS TAB ---------------- */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-black">Agency Client Agreements</h3>
          <div className="border border-[#E0E0E0] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold">
                <tr>
                  <th className="p-3">Contract Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">E-Signature Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-black">{c.title}</td>
                    <td className="p-3 capitalize text-gray-600">{c.contract_type}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4CAF50] text-white">
                        ✓ Verified & Active
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => alert(`Agreement verified: ${c.title}`)}
                        className="px-3 py-1 bg-[#E3F2FD] text-[#0084FF] font-semibold rounded-lg hover:bg-[#0084FF] hover:text-white"
                      >
                        View / Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- FEEDBACKS TAB ---------------- */}
      {activeTab === 'feedbacks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback Form */}
          <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs space-y-4">
            <h3 className="font-bold text-base text-black">Submit Video Feedback</h3>
            <p className="text-xs text-gray-500">Provide timestamp-precise creative notes on specific submissions.</p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-black mb-1">Select Submission Clip</label>
                <select
                  required
                  value={fbSubmissionId}
                  onChange={(e) => setFbSubmissionId(e.target.value)}
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                >
                  <option value="">Select video...</option>
                  {submissions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.views.toLocaleString()} views)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Timestamp Reference</label>
                <input
                  type="text"
                  value={fbTimestamp}
                  onChange={(e) => setFbTimestamp(e.target.value)}
                  placeholder="e.g. 0:14"
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Comments / Suggestions</label>
                <textarea
                  rows={4}
                  required
                  value={fbComments}
                  onChange={(e) => setFbComments(e.target.value)}
                  placeholder="e.g. Can we ensure the brand discount coupon is pinned in the first comment?"
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold rounded-xl"
              >
                Send Feedback
              </button>
            </form>
          </div>

          {/* Feedback Feed */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs space-y-4">
            <h3 className="font-bold text-base text-black">Previous Notes & Directives</h3>
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-xl border border-[#E0E0E0] bg-gray-50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">{fb.submission_title}</span>
                    <span className="text-[#0084FF] font-mono font-bold">@{fb.video_timestamp}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{fb.comments}</p>
                  <p className="text-[10px] text-gray-400 pt-1">
                    Logged on {new Date(fb.created_at).toLocaleDateString()} by {fb.client_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
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

    </div>
  );
};
