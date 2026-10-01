import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Check, 
  X, 
  CheckCheck, 
  Filter, 
  Search, 
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Payout, User } from '../../types';

interface PayoutsManagerProps {
  payouts: Payout[];
  currentUser: User;
  onApprovePayout: (payoutId: string, approvedAmount?: number) => void;
  onRejectPayout: (payoutId: string) => void;
  onApproveAllPayouts: () => void;
  onProcessRazorpay: (payoutId: string) => void;
}

export const PayoutsManager: React.FC<PayoutsManagerProps> = ({
  payouts,
  currentUser,
  onApprovePayout,
  onRejectPayout,
  onApproveAllPayouts,
  onProcessRazorpay,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filtered list
  const filtered = payouts.filter((p) => {
    const matchesTab = activeTab === 'queue' ? p.status !== 'paid' : p.status === 'paid';
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = 
      (p.clipper_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.campaign_name || '').toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesStatus && matchesSearch;
  });

  const pendingCount = payouts.filter((p) => p.status === 'pending').length;
  const totalPendingAmount = payouts
    .filter((p) => p.status === 'pending')
    .reduce((acc, curr) => acc + (curr.calculated_amount || 0), 0);

  const handleExportCSV = () => {
    const headers = ['ID', 'Campaign', 'Clipper', 'Views', 'Rate', 'Amount (INR)', 'Status', 'Razorpay Order', 'Created At'];
    const rows = payouts.map((p) => [
      p.id,
      `"${p.campaign_name || ''}"`,
      `"${p.clipper_name || ''}"`,
      p.views,
      p.rate_used,
      p.approved_amount || p.calculated_amount,
      p.status,
      p.razorpay_order_id || 'N/A',
      p.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `getveevz_payouts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRazorpayClick = async (payoutId: string) => {
    setProcessingId(payoutId);
    try {
      await onProcessRazorpay(payoutId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black font-['Manrope']">Global Payouts & Settlements</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Razorpay liquidity gateway, formula reconciliations, and instant creator disbursements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E0E0E0] hover:bg-[#E3F2FD] text-black font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#0084FF]" />
            <span>Download CSV</span>
          </button>

          {/* Approve All button (sky blue) */}
          {(currentUser.role === 'CEO' || currentUser.role === 'Division_Leader') && pendingCount > 0 && (
            <button
              onClick={onApproveAllPayouts}
              className="flex items-center gap-2 px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Approve All ({pendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-xs">
          <span className="text-xs text-gray-500 font-semibold uppercase">Pending Verification</span>
          <p className="text-xl font-bold text-black mt-1">₹{totalPendingAmount.toLocaleString()}</p>
          <p className="text-xs text-[#FFA726] font-semibold mt-0.5">{pendingCount} requests awaiting manager sign-off</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-xs">
          <span className="text-xs text-gray-500 font-semibold uppercase">Disbursed This Month</span>
          <p className="text-xl font-bold text-[#4CAF50] mt-1">₹45,23,000</p>
          <p className="text-xs text-gray-500 mt-0.5">Automated 100% via Razorpay Instant Payouts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-xs">
          <span className="text-xs text-gray-500 font-semibold uppercase">Formula Verification</span>
          <p className="text-xl font-bold text-black mt-1">(Views × Rate) / 1,000</p>
          <p className="text-xs text-[#0084FF] font-semibold mt-0.5">Strict backend audit trail enforced</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#E3F2FD] text-[#0084FF]'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            Payout Queue ({payouts.filter(p => p.status !== 'paid').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#E3F2FD] text-[#0084FF]'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            Settlement History ({payouts.filter(p => p.status === 'paid').length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creator or campaign..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E0E0E0] rounded-xl focus:border-[#0084FF] focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E0E0E0] rounded-xl text-black focus:outline-hidden"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-['Manrope']">
            <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Clipper</th>
                <th className="py-3 px-4">Views Tracked</th>
                <th className="py-3 px-4">Formula & Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Razorpay Ref</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filtered.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`hover:bg-[#E3F2FD] transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                  }`}
                >
                  <td className="py-3 px-4">
                    <p className="font-bold text-black text-xs">{p.campaign_name}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{p.submission_title}</p>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-black text-xs">{p.clipper_name}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-[#0084FF] text-xs">{(p.views || 0).toLocaleString()}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div>
                      <p className="font-bold text-black text-xs">
                        ₹{(p.approved_amount || p.calculated_amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        ({(p.views || 0).toLocaleString()} × ₹{p.rate_used}) / 1000
                      </p>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'paid'
                          ? 'bg-[#4CAF50] text-white'
                          : p.status === 'approved'
                          ? 'bg-[#0084FF] text-white'
                          : p.status === 'rejected'
                          ? 'bg-[#F44336] text-white'
                          : 'bg-[#FFA726] text-black'
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                    {p.razorpay_order_id ? (
                      <span className="text-[#0084FF] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#4CAF50]" />
                        {p.razorpay_order_id}
                      </span>
                    ) : (
                      <span className="text-gray-400">Pending order</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right space-x-1.5">
                    {p.status === 'pending' && (currentUser.role === 'CEO' || currentUser.role === 'Division_Leader') && (
                      <>
                        <button
                          onClick={() => onApprovePayout(p.id, p.calculated_amount)}
                          className="px-2.5 py-1 bg-[#4CAF50] hover:bg-green-600 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onRejectPayout(p.id)}
                          className="px-2.5 py-1 bg-[#F44336] hover:bg-red-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {p.status === 'approved' && (currentUser.role === 'CEO' || currentUser.role === 'Division_Leader') && (
                      <button
                        onClick={() => handleRazorpayClick(p.id)}
                        disabled={processingId === p.id}
                        className="px-3 py-1 bg-black hover:bg-gray-800 text-white font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        <span>{processingId === p.id ? 'Processing...' : 'Pay via Razorpay'}</span>
                      </button>
                    )}

                    {p.status === 'paid' && (
                      <span className="text-[11px] text-[#4CAF50] font-bold">
                        ✓ Settled {p.paid_date ? new Date(p.paid_date).toLocaleDateString() : ''}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
