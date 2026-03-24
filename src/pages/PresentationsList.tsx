import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Plus, Download, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function PresentationsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPresentations();
  }, [user]);

  const fetchPresentations = () => {
    try {
      const all = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      // Filter by user if logged in
      const userPresentations = user ? all.filter((p: any) => p.user_id === user.id) : all;
      setPresentations(userPresentations.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (e) {
      console.error('Failed to load presentations:', e);
      setPresentations([]);
    }
    setLoading(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this presentation?')) return;
    
    try {
      const all = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      const filtered = all.filter((p: any) => p.id !== id);
      localStorage.setItem('propsite_presentations', JSON.stringify(filtered));
      setPresentations(prev => prev.filter(p => p.id !== id));
      toast.success('Presentation deleted');
    } catch (e) {
      toast.error('Failed to delete presentation');
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'penthouse': return { bg: '#F8F5EE', text: '#C9A96E' };
      case 'signature': return { bg: '#EAF3ED', text: '#1A5C3A' };
      case 'estate': return { bg: '#F4F7F2', text: '#6B8F71' };
      case 'corporate': return { bg: '#EFF6FF', text: '#3B82F6' };
      case 'highstreet': return { bg: '#FDF7F5', text: '#C4715B' };
      case 'logistics': return { bg: '#FFFBEB', text: '#F59E0B' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse font-sans">
        <div className="flex justify-between mb-8">
          <div className="h-8 w-48 bg-surface-2 rounded-lg"></div>
          <div className="h-10 w-32 bg-surface-2 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="h-[280px] bg-surface-2 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-[22px] font-bold text-[#111111]">My Presentations</h1>
        <Link 
          to="/dashboard/presentations/new" 
          className="bg-[#1A5C3A] hover:bg-[#14482D] text-white rounded-[12px] h-10 px-5 flex items-center justify-center gap-1.5 text-[14px] font-semibold transition-colors"
        >
          <Plus size={16} /> New Presentation
        </Link>
      </div>

      {presentations.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <FileText size={48} className="text-[#CCCCCC] mb-4" />
          <h2 className="text-[18px] font-semibold text-[#111111] mb-1">No presentations yet</h2>
          <p className="text-[14px] text-[#888888] mb-6 max-w-sm">Create your first property PPT in minutes. Share beautiful PDFs with your clients.</p>
          <Link 
            to="/dashboard/presentations/new" 
            className="bg-[#1A5C3A] hover:bg-[#14482D] text-white rounded-[12px] h-11 px-6 flex items-center justify-center gap-1.5 text-[14px] font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Presentation
          </Link>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {presentations.map((ppt) => {
            const colors = getThemeColor(ppt.theme);
            const coverPhoto = (ppt.photo_tags && ppt.photo_urls) 
              ? ppt.photo_urls[ppt.photo_tags.indexOf('cover')] || ppt.photo_urls[0] 
              : null;
              
            return (
              <div 
                key={ppt.id} 
                className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden flex flex-col transition-shadow hover:shadow-md cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                onClick={() => navigate(`/dashboard/presentations/${ppt.id}`)}
              >
                {/* Card Top: Preview Area */}
                <div className="h-[160px] w-full relative bg-surface-2 overflow-hidden flex items-center justify-center border-b border-[#F5F5F5]">
                  {/* Simplistic preview placeholder instead of full transform rendering for list view performance */}
                  {coverPhoto ? (
                    <img src={coverPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${colors.bg} 0%, #FFFFFF 100%)` }}></div>
                  )}
                  <div className="absolute inset-0 bg-black/10"></div>
                  <FileText className="absolute text-white/50 w-12 h-12" />
                </div>
                
                {/* Card Body */}
                <div className="p-[14px] flex-1">
                  <h3 className="text-[15px] font-semibold text-[#111111] line-clamp-1 mb-2">
                    {ppt.title || 'Untitled Property'}
                  </h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span 
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {ppt.theme}
                    </span>
                    <span className="text-[12px] text-[#888888]">
                      {formatDistanceToNow(new Date(ppt.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="border-t border-[#F5F5F5] p-[10px] px-[14px] flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/presentations/${ppt.id}`); }}
                    className="flex-1 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold text-[#1A5C3A] hover:bg-[#EAF3ED] transition-colors"
                  >
                    View / Download
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, ppt.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888888] hover:bg-[#FFF0F0] hover:text-[#DC2626] transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
