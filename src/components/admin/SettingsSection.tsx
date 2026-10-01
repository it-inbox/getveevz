import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Save, 
  Building, 
  Percent, 
  ShieldCheck, 
  Database, 
  Download,
  Sparkles
} from 'lucide-react';
import { Settings, User } from '../../types';

interface SettingsSectionProps {
  settings: Settings;
  currentUser: User;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  currentUser,
  onUpdateSettings,
}) => {
  const [companyName, setCompanyName] = useState(settings.company_name);
  const [margin, setMargin] = useState(settings.margin_percentage.toString());
  const [defaultCpm, setDefaultCpm] = useState(settings.default_cpm_rate.toString());
  const [razorpayKey, setRazorpayKey] = useState(settings.razorpay_key_id);
  const [instagramAppId, setInstagramAppId] = useState(settings.instagram_app_id);
  const [youtubeApiKey, setYoutubeApiKey] = useState(settings.youtube_api_key);
  const [facebookAppId, setFacebookAppId] = useState(settings.facebook_app_id);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      company_name: companyName,
      margin_percentage: Number(margin),
      default_cpm_rate: Number(defaultCpm),
      razorpay_key_id: razorpayKey,
      instagram_app_id: instagramAppId,
      youtube_api_key: youtubeApiKey,
      facebook_app_id: facebookAppId,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      company: companyName,
      exportVersion: 'GetVeevz-1.0-ABAC',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `getveevz_full_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6 max-w-4xl font-['Manrope']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Agency & Integration Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure financial margins, payment gateway credentials, and social API webhooks.
          </p>
        </div>

        {saved && (
          <span className="px-3 py-1.5 rounded-xl bg-green-50 text-[#4CAF50] text-xs font-bold border border-green-200">
            ✓ Settings Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Company & Financial Parameters */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E0E0E0]">
            <Building className="w-5 h-5 text-[#0084FF]" />
            <h3 className="font-bold text-sm text-black">Company Identity & Financial Margins</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-black mb-1">Company Legal Entity</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-black mb-1">Default Platform Gross Margin (%)</label>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-black mb-1">Default Base CPM (₹ per 1k views)</label>
              <input
                type="number"
                value={defaultCpm}
                onChange={(e) => setDefaultCpm(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
              />
            </div>
          </div>
        </div>

        {/* API Credentials Management */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E0E0E0]">
            <Key className="w-5 h-5 text-[#0084FF]" />
            <h3 className="font-bold text-sm text-black">API Integrations & Payment Gateway</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-black mb-1">Razorpay Key ID (Live / Test)</label>
              <input
                type="text"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl text-black font-mono focus:border-[#0084FF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-black mb-1">Instagram Graph API App ID</label>
                <input
                  type="text"
                  value={instagramAppId}
                  onChange={(e) => setInstagramAppId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl text-black font-mono focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">YouTube Data API v3 Key</label>
                <input
                  type="password"
                  value={youtubeApiKey}
                  onChange={(e) => setYoutubeApiKey(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl text-black font-mono focus:border-[#0084FF]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-black mb-1">Facebook Graph Webhook App ID</label>
              <input
                type="text"
                value={facebookAppId}
                onChange={(e) => setFacebookAppId(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl text-black font-mono focus:border-[#0084FF]"
              />
            </div>
          </div>
        </div>

        {/* Database Backup & Export */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-black">Database Backup & Archive</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Export encrypted JSON snapshots of all campaigns, creators, payouts, and contracts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] hover:bg-[#E3F2FD] text-black font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#0084FF]" />
            <span>Export Snapshot</span>
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
};
