import React, { useState } from 'react';
import { 
  FolderKanban, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  Search, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ThemePage, User } from '../../types';

interface InventorySectionProps {
  themes: ThemePage[];
  currentUser: User;
  onCreateTheme: (theme: Partial<ThemePage>) => void;
  onDeleteTheme: (id: string) => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  themes,
  currentUser,
  onCreateTheme,
  onDeleteTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'contracts_lib'>('themes');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hooks & Storyboards');
  const [desc, setDesc] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'XLSX'>('PDF');

  const filteredThemes = themes.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Hooks & Storyboards', 'Visual Assets', 'Scripts & Skits', 'Audio Library'];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTheme({
      name: title,
      category,
      description: desc,
      file_url: `/assets/templates/${title.toLowerCase().replace(/\s+/g, '_')}.${fileType.toLowerCase()}`,
      file_size: `2.4 MB ${fileType}`,
    });
    setShowUploadModal(false);
    setTitle('');
    setDesc('');
  };

  const handleDownloadSimulation = (fileName: string) => {
    const dummyContent = `GetVeevz Content Library Asset: ${fileName}\nConfidential & Proprietary to GetVeevz Creators.`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.replace(/\s+/g, '_') + '.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black font-['Manrope']">Inventory & Template Library</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Curated hook frameworks, Excel keyframe presets, trending sound logs, and legal templates.
          </p>
        </div>

        {(currentUser.role === 'CEO' || currentUser.role === 'PR_Manager') ? (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
        ) : (
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E3F2FD] text-[#0084FF] border border-[#0084FF]/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Clipper Creative Vault
          </span>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#E3F2FD] text-[#0084FF]'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates & themes..."
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E0E0E0] rounded-xl focus:border-[#0084FF] text-black"
          />
        </div>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredThemes.map((item) => {
          const isExcel = item.file_size?.includes('XLSX') || item.file_url.endsWith('.xlsx');

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs hover:border-[#0084FF] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${isExcel ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#0084FF]'}`}>
                    {isExcel ? <FileSpreadsheet className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                    {item.category}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-black line-clamp-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E0E0E0] flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium text-[11px]">{item.file_size || 'PDF Document'}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSimulation(item.name)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#E3F2FD] hover:bg-[#0084FF] hover:text-white text-[#0084FF] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {(currentUser.role === 'CEO' || currentUser.role === 'PR_Manager') && (
                    <button
                      onClick={() => onDeleteTheme(item.id)}
                      className="p-1 text-gray-400 hover:text-[#F44336] rounded-lg transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- UPLOAD MODAL ---------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E0E0E0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-base text-black">Upload Template / Theme Asset</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-black mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Viral Audio Transitions"
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                >
                  <option value="Hooks & Storyboards">Hooks & Storyboards</option>
                  <option value="Visual Assets">Visual Assets</option>
                  <option value="Scripts & Skits">Scripts & Skits</option>
                  <option value="Audio Library">Audio Library</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">File Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="ftype"
                      checked={fileType === 'PDF'}
                      onChange={() => setFileType('PDF')}
                    />
                    <span>PDF Document</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="ftype"
                      checked={fileType === 'XLSX'}
                      onChange={() => setFileType('XLSX')}
                    />
                    <span>Excel Spreadsheet (.xlsx)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe formatting, presets, or guidelines contained..."
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
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
