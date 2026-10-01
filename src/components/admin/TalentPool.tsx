import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  LayoutGrid, 
  List, 
  ExternalLink, 
  Instagram, 
  Youtube, 
  Facebook, 
  FileText, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { User, Payout, Contract } from '../../types';

interface TalentPoolProps {
  clippers: User[];
  payouts: Payout[];
  contracts: Contract[];
  onUpdateUserStatus: (userId: string, status: 'active' | 'inactive') => void;
}

export const TalentPool: React.FC<TalentPoolProps> = ({
  clippers,
  payouts,
  contracts,
  onUpdateUserStatus,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClipper, setSelectedClipper] = useState<User | null>(null);

  const filtered = clippers.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Selected clipper data
  const clipperPayouts = selectedClipper
    ? payouts.filter((p) => p.clipper_id === selectedClipper.id)
    : [];
  const clipperContracts = selectedClipper
    ? contracts.filter((c) => c.clipper_id === selectedClipper.id)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black font-['Manrope']">Talent Pool (Clipper Roster)</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Verified creator roster, contract agreements, portfolio reels, and lifetime performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-[#E0E0E0]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#0084FF] shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#0084FF] shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, handle, or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E0E0E0] rounded-xl focus:border-[#0084FF] text-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white border border-[#E0E0E0] rounded-xl text-black"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-['Manrope']">
              <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Clipper</th>
                  <th className="py-3 px-4">Portfolio</th>
                  <th className="py-3 px-4">Campaigns</th>
                  <th className="py-3 px-4">Total Earned</th>
                  <th className="py-3 px-4">Connected Accounts</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {filtered.map((clipper, index) => (
                  <tr
                    key={clipper.id}
                    className={`hover:bg-[#E3F2FD] transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                    onClick={() => setSelectedClipper(clipper)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={clipper.avatar}
                          alt={clipper.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#E0E0E0]"
                        />
                        <div>
                          <p className="font-bold text-black text-xs">{clipper.name}</p>
                          <p className="text-[10px] text-gray-400">@{clipper.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {clipper.portfolio ? (
                        <a
                          href={clipper.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-[#0084FF] font-semibold flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Showreel Link</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No link</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-black text-xs">
                      {clipper.campaigns_completed || 12} done
                    </td>

                    <td className="py-3 px-4 font-bold text-black text-xs">
                      ₹{(clipper.total_earned || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        {clipper.connected_accounts?.instagram && (
                          <span className="flex items-center gap-1 text-[11px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md font-medium">
                            <Instagram className="w-3 h-3" />
                            {clipper.connected_accounts.instagram}
                          </span>
                        )}
                        {clipper.connected_accounts?.youtube && (
                          <span className="flex items-center gap-1 text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-medium">
                            <Youtube className="w-3 h-3" />
                            YT
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          clipper.status === 'active'
                            ? 'bg-[#4CAF50] text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {clipper.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedClipper(clipper)}
                        className="px-3 py-1 bg-[#E3F2FD] text-[#0084FF] font-semibold text-xs rounded-lg hover:bg-[#0084FF] hover:text-white transition-colors cursor-pointer"
                      >
                        Profile
                      </button>

                      <button
                        onClick={() => onUpdateUserStatus(clipper.id, clipper.status === 'active' ? 'inactive' : 'active')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          clipper.status === 'active'
                            ? 'bg-red-50 text-[#F44336] hover:bg-red-100'
                            : 'bg-green-50 text-[#4CAF50] hover:bg-green-100'
                        }`}
                      >
                        {clipper.status === 'active' ? 'Disconnect' : 'Connect'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((clipper) => (
            <div
              key={clipper.id}
              onClick={() => setSelectedClipper(clipper)}
              className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs hover:border-[#0084FF] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={clipper.avatar}
                      alt={clipper.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#E0E0E0]"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-black">{clipper.name}</h4>
                      <p className="text-xs text-gray-400">@{clipper.username}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      clipper.status === 'active' ? 'bg-[#4CAF50] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {clipper.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Earned</span>
                    <p className="font-bold text-black mt-0.5">₹{(clipper.total_earned || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Campaigns</span>
                    <p className="font-bold text-black mt-0.5">{clipper.campaigns_completed || 12}</p>
                  </div>
                </div>

                {/* Social Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  {clipper.connected_accounts?.instagram && (
                    <span className="px-2 py-0.5 rounded bg-pink-50 text-pink-700 font-medium flex items-center gap-1">
                      <Instagram className="w-3 h-3" />
                      {clipper.connected_accounts.instagram}
                    </span>
                  )}
                  {clipper.connected_accounts?.youtube && (
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-medium flex items-center gap-1">
                      <Youtube className="w-3 h-3" />
                      {clipper.connected_accounts.youtube}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E0E0E0] flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClipper(clipper);
                  }}
                  className="px-3 py-1.5 bg-[#0084FF] text-white text-xs font-semibold rounded-xl hover:bg-[#0073e6]"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- CLIPPER PROFILE MODAL ---------------- */}
      {selectedClipper && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E0E0E0] shadow-2xl p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E0E0E0]">
              <div className="flex items-center gap-4">
                <img
                  src={selectedClipper.avatar}
                  alt={selectedClipper.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#0084FF]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-black">{selectedClipper.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4CAF50] text-white">
                      Verified Clipper
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    @{selectedClipper.username} • {selectedClipper.phone} • {selectedClipper.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClipper(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 bg-[#E3F2FD]/50 p-4 rounded-xl border border-[#0084FF]/20 text-center">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Lifetime Earnings</span>
                <p className="text-lg font-bold text-[#0084FF]">₹{(selectedClipper.total_earned || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Campaigns Completed</span>
                <p className="text-lg font-bold text-black">{selectedClipper.campaigns_completed || 12}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Avg Views / Video</span>
                <p className="text-lg font-bold text-black">97,708</p>
              </div>
            </div>

            {/* Portfolio Preview */}
            <div className="p-4 rounded-xl border border-[#E0E0E0] bg-white">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                Portfolio Showreel
              </h4>
              {selectedClipper.portfolio ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-black">
                    <FileText className="w-4 h-4 text-[#0084FF]" />
                    <span>Verified Creator Showreel (Google Drive / Portfolio Site)</span>
                  </div>
                  <a
                    href={selectedClipper.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-[#0084FF] text-white text-xs font-semibold rounded-lg hover:bg-[#0073e6]"
                  >
                    Open Link
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No portfolio attached yet.</p>
              )}
            </div>

            {/* Connected Accounts */}
            <div className="p-4 rounded-xl border border-[#E0E0E0] bg-white">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">
                Connected Social Media Accounts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 border border-[#E0E0E0] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <div>
                      <p className="font-bold text-black">{selectedClipper.connected_accounts?.instagram || 'Not linked'}</p>
                      <p className="text-[10px] text-gray-500">{selectedClipper.connected_accounts?.instagram_followers ? `${selectedClipper.connected_accounts.instagram_followers.toLocaleString()} followers` : 'N/A'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4CAF50] font-bold">✓ Synced</span>
                </div>

                <div className="p-3 border border-[#E0E0E0] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="font-bold text-black">{selectedClipper.connected_accounts?.youtube || 'Not linked'}</p>
                      <p className="text-[10px] text-gray-500">{selectedClipper.connected_accounts?.youtube_subscribers ? `${selectedClipper.connected_accounts.youtube_subscribers.toLocaleString()} subs` : 'N/A'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4CAF50] font-bold">✓ Synced</span>
                </div>

                <div className="p-3 border border-[#E0E0E0] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-bold text-black">{selectedClipper.connected_accounts?.facebook || 'Not linked'}</p>
                      <p className="text-[10px] text-gray-500">{selectedClipper.connected_accounts?.facebook_followers ? `${selectedClipper.connected_accounts.facebook_followers.toLocaleString()} likes` : 'N/A'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4CAF50] font-bold">✓ Synced</span>
                </div>
              </div>
            </div>

            {/* Payouts History */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                Payment History ({clipperPayouts.length})
              </h4>
              <div className="border border-[#E0E0E0] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold">
                    <tr>
                      <th className="p-2.5">Campaign</th>
                      <th className="p-2.5">Views</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Razorpay Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {clipperPayouts.map((pay) => (
                      <tr key={pay.id} className="hover:bg-[#E3F2FD]">
                        <td className="p-2.5 font-bold text-black">{pay.campaign_name}</td>
                        <td className="p-2.5 text-[#0084FF] font-semibold">{pay.views.toLocaleString()}</td>
                        <td className="p-2.5 font-bold text-black">₹{(pay.approved_amount || pay.calculated_amount).toLocaleString()}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pay.status === 'paid' ? 'bg-[#4CAF50] text-white' : 'bg-[#FFA726] text-black'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[10px] text-gray-500">
                          {pay.razorpay_order_id || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E0E0E0] flex justify-end">
              <button
                onClick={() => setSelectedClipper(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold rounded-xl"
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
