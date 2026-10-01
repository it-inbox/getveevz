import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Download, 
  Send, 
  Plus, 
  PenTool, 
  Eye, 
  Mail, 
  Receipt,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Contract, Invoice, User } from '../../types';

interface ContractsInvoicesSectionProps {
  contracts: Contract[];
  invoices: Invoice[];
  currentUser: User;
  onCreateContract: (contract: Partial<Contract>) => void;
  onSignContract: (contractId: string) => void;
  onPayInvoice?: (invoiceId: string) => void;
}

export const ContractsInvoicesSection: React.FC<ContractsInvoicesSectionProps> = ({
  contracts,
  invoices,
  currentUser,
  onCreateContract,
  onSignContract,
  onPayInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'invoices'>('contracts');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showSignModal, setShowSignModal] = useState<Contract | null>(null);
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [showInvoicePdfModal, setShowInvoicePdfModal] = useState<Invoice | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [emailSentId, setEmailSentId] = useState<string | null>(null);

  // New Contract form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'campaign' | 'talent_agreement'>('campaign');
  const [newContent, setNewContent] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateContract({
      title: newTitle,
      contract_type: newType,
      content: newContent,
      clipper_id: 'user_clipper_1',
      status: 'sent',
      esignature_status: 'pending',
    });
    setShowCreateContractModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleSignConfirm = () => {
    if (!showSignModal) return;
    onSignContract(showSignModal.id);
    setShowSignModal(null);
    setSignatureName('');
    alert('Contract signed and verified successfully!');
  };

  const handleEmailSimulation = (invId: string) => {
    setEmailSentId(invId);
    setTimeout(() => setEmailSentId(null), 3000);
  };

  return (
    <div className="space-y-6 font-['Manrope']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Contracts & Financial Invoices</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            E-signature legal agreements, automated GST/INR billing, and disbursement receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'contracts' && currentUser.role === 'CEO' && (
            <button
              onClick={() => setShowCreateContractModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Contract</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E0E0E0] pb-2">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'contracts'
              ? 'bg-[#E3F2FD] text-[#0084FF]'
              : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contracts ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-[#E3F2FD] text-[#0084FF]'
              : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices & Receipts ({invoices.length})</span>
        </button>
      </div>

      {/* ---------------- CONTRACTS TAB ---------------- */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Contract Title</th>
                <th className="py-3 px-4">Party / Clipper</th>
                <th className="py-3 px-4">Agreement Type</th>
                <th className="py-3 px-4">E-Signature Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] text-xs">
              {contracts.map((c, idx) => (
                <tr
                  key={c.id}
                  className={`hover:bg-[#E3F2FD] transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-black">
                    {c.title || 'GetVeevz Agreement'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-semibold">
                    {c.clipper_name || 'Sarah Jenkins'}
                  </td>
                  <td className="py-3 px-4 capitalize text-gray-600">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium">
                      {c.contract_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.esignature_status === 'signed' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4CAF50] text-white flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" /> Signed & Verified
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFA726] text-black flex items-center gap-1 w-max">
                        <Clock className="w-3 h-3" /> Pending Signature
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedContract(c)}
                      className="px-2.5 py-1 bg-white border border-[#E0E0E0] hover:bg-[#E3F2FD] text-black font-semibold rounded-lg"
                    >
                      View
                    </button>
                    {c.esignature_status !== 'signed' && (
                      <button
                        onClick={() => {
                          setShowSignModal(c);
                          setSignatureName(currentUser.name);
                        }}
                        className="px-2.5 py-1 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold rounded-lg"
                      >
                        Sign Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- INVOICES TAB ---------------- */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Creator / Recipient</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] text-xs">
              {invoices.map((inv, idx) => (
                <tr
                  key={inv.id}
                  className={`hover:bg-[#E3F2FD] transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#0084FF]">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3 px-4 font-semibold text-black">
                    {inv.clipper_name || 'Sarah Jenkins'}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {inv.campaign_name || 'Neon Pulse Launch'}
                  </td>
                  <td className="py-3 px-4 font-bold text-black">
                    ₹{inv.amount.toLocaleString()} {inv.currency}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'paid'
                          ? 'bg-[#4CAF50] text-white'
                          : 'bg-[#FFA726] text-black'
                      }`}
                    >
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setShowInvoicePdfModal(inv)}
                      className="px-2.5 py-1 bg-white border border-[#E0E0E0] hover:bg-[#E3F2FD] text-black font-semibold rounded-lg inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#0084FF]" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => handleEmailSimulation(inv.id)}
                      className="px-2.5 py-1 bg-gray-50 border border-[#E0E0E0] hover:bg-gray-100 text-gray-700 font-semibold rounded-lg inline-flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{emailSentId === inv.id ? 'Sent ✓' : 'Email'}</span>
                    </button>

                    {inv.status !== 'paid' && onPayInvoice && (
                      <button
                        onClick={() => onPayInvoice(inv.id)}
                        className="px-2.5 py-1 bg-[#4CAF50] text-white font-semibold rounded-lg hover:bg-green-600"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- VIEW CONTRACT MODAL ---------------- */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#E0E0E0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-base text-black">{selectedContract.title}</h3>
              <button onClick={() => setSelectedContract(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-[#E0E0E0] max-h-72 overflow-y-auto text-xs text-gray-800 font-mono whitespace-pre-line leading-relaxed">
              {selectedContract.content}
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <div>
                <p className="text-gray-500">Sign status: <strong className="text-black">{selectedContract.esignature_status}</strong></p>
                {selectedContract.signed_at && (
                  <p className="text-[#4CAF50] font-bold">Verified on: {new Date(selectedContract.signed_at).toLocaleString()}</p>
                )}
              </div>

              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DOCUSIGN E-SIGNATURE SIMULATOR MODAL ---------------- */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E0E0E0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-[#0084FF]" />
                <h3 className="font-bold text-base text-black">DocuSign E-Signature Verification</h3>
              </div>
              <button onClick={() => setShowSignModal(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <p className="text-xs text-gray-600">
              You are electronically signing <strong>{showSignModal.title}</strong> under GetVeevz Zero-Trust compliance.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-black">Type Full Legal Name as Signature:</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full p-2.5 text-sm border-2 border-[#0084FF] rounded-xl text-black font-serif italic"
              />
            </div>

            <div className="p-3 bg-[#E3F2FD] rounded-xl text-[11px] text-[#0084FF] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>IP Address & Timestamp will be cryptographically sealed.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setShowSignModal(null)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignConfirm}
                className="px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-bold rounded-xl"
              >
                Sign & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CREATE CONTRACT MODAL ---------------- */}
      {showCreateContractModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E0E0E0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-base text-black">Create Legal Contract</h3>
              <button onClick={() => setShowCreateContractModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-black mb-1">Agreement Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q4 Master Influencer Representation Contract"
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Contract Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                >
                  <option value="campaign">Campaign Agreement</option>
                  <option value="talent_agreement">Talent Guild Agreement</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Contract Legal Content</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Insert clauses, terms of service, payment schedules, and obligations..."
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateContractModal(false)}
                  className="px-3 py-1.5 border border-[#E0E0E0] rounded-xl text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0084FF] text-white font-semibold rounded-xl hover:bg-[#0073e6]"
                >
                  Send for E-Signature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- INVOICE PDF PREVIEW MODAL ---------------- */}
      {showInvoicePdfModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 border border-[#E0E0E0] shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start pb-4 border-b border-[#E0E0E0]">
              <div>
                <h3 className="text-xl font-bold text-black leading-none">Get<span className="text-[#0084FF]">Veevz</span></h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Tax Invoice & Settlement Receipt</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#0084FF]">{showInvoicePdfModal.invoice_number}</span>
                <p className="text-[10px] text-gray-400">{new Date(showInvoicePdfModal.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-gray-400 uppercase text-[10px]">Billed To (Creator):</p>
                <p className="font-bold text-black mt-1">{showInvoicePdfModal.clipper_name}</p>
                <p className="text-gray-500">Verified GetVeevz Clipper Partner</p>
              </div>

              <div>
                <p className="font-bold text-gray-400 uppercase text-[10px]">Issued By:</p>
                <p className="font-bold text-black mt-1">GetVeevz Media Tech Pvt. Ltd.</p>
                <p className="text-gray-500">GSTIN: 27AABCG1234F1Z8</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-[#E0E0E0] text-xs">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Campaign Description:</span>
                <span className="font-bold text-black">{showInvoicePdfModal.campaign_name}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-[#E0E0E0] mt-1 pt-1">
                <span className="text-gray-600">Disbursement Status:</span>
                <span className="font-bold text-[#4CAF50]">PAID (Razorpay Direct Transfer)</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold border-t border-[#E0E0E0] mt-2 pt-2">
                <span>Total Settled Amount:</span>
                <span className="text-[#0084FF]">₹{showInvoicePdfModal.amount.toLocaleString()} INR</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowInvoicePdfModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Invoice PDF downloaded!');
                  setShowInvoicePdfModal(null);
                }}
                className="px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
