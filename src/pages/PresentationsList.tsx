import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { StoredPresentation } from '@/lib/presentationTypes';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function PresentationsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState<StoredPresentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPresentations();
  }, [user]);

  const fetchPresentations = () => {
    try {
      const all: StoredPresentation[] = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      const userPpts = user ? all.filter(p => p.user_id === user.id) : all;
      setPresentations(userPpts.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch {
      setPresentations([]);
    }
    setLoading(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this presentation?')) return;
    try {
      const all: StoredPresentation[] = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      localStorage.setItem('propsite_presentations', JSON.stringify(all.filter(p => p.id !== id)));
      setPresentations(prev => prev.filter(p => p.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse font-sans">
        <div className="flex justify-between mb-8">
          <div className="h-8 w-48 bg-[#F0F0F0] rounded-lg" />
          <div className="h-10 w-32 bg-[#F0F0F0] rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-[280px] bg-[#F0F0F0] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] font-bold text-[#111111]">My Presentations</h1>
        <Link to="/dashboard/presentations/new"
          className="bg-[#1A5C3A] hover:bg-[#14482D] text-white rounded-[12px] h-10 px-5 flex items-center gap-1.5 text-[14px] font-semibold transition-colors">
          <Plus size={16} /> New
        </Link>
      </div>

      {presentations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText size={48} className="text-[#CCCCCC] mb-4" />
          <h2 className="text-[18px] font-semibold text-[#111111] mb-1">No presentations yet</h2>
          <p className="text-[14px] text-[#888888] mb-6 max-w-sm">Create your first AI-designed property PPT in minutes.</p>
          <Link to="/dashboard/presentations/new"
            className="bg-[#1A5C3A] hover:bg-[#14482D] text-white rounded-[12px] h-11 px-6 flex items-center gap-1.5 text-[14px] font-semibold transition-colors shadow-sm">
            <Plus size={16} /> Create Presentation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {presentations.map(ppt => {
            const accent = ppt.presentation?.theme?.accentColor || '#1A5C3A';
            const coverUrl = ppt.photo_urls?.[0] || null;

            return (
              <div key={ppt.id}
                className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden flex flex-col hover:shadow-md cursor-pointer transition-shadow"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                onClick={() => navigate(`/dashboard/presentations/${ppt.id}`)}
              >
                <div className="h-[160px] w-full relative overflow-hidden bg-[#F5F5F5]">
                  {coverUrl ? (
                    <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}22 0%, #FFFFFF 100%)` }} />
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ppt.presentation?.slides?.length || 0} slides
                  </div>
                </div>

                <div className="p-[14px] flex-1">
                  <h3 className="text-[15px] font-semibold text-[#111111] line-clamp-1 mb-2">
                    {ppt.title || 'Untitled'}
                  </h3>
                  <span className="text-[12px] text-[#888888]">
                    {formatDistanceToNow(new Date(ppt.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="border-t border-[#F5F5F5] p-[10px] px-[14px] flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/presentations/${ppt.id}`); }}
                    className="flex-1 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold text-[#1A5C3A] hover:bg-[#EAF3ED] transition-colors">
                    View / Download
                  </button>
                  <button onClick={(e) => handleDelete(e, ppt.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888888] hover:bg-[#FFF0F0] hover:text-[#DC2626] transition-colors">
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
