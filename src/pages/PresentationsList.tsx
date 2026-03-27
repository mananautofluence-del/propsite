import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { FileText, Plus, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

type PresentationRow = {
  id: string;
  title: string;
  theme: string;
  created_at: string;
  presentation_id: string;
  presenton_url: string;
  content: { edit_url?: string; presentation_id?: string; download_url?: string };
};

export default function PresentationsList() {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<PresentationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPresentations();
  }, [user]);

  const fetchPresentations = async () => {
    try {
      const { data, error } = await supabase
        .from('presentations' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresentations((data as any) || []);
    } catch {
      setPresentations([]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse bg-[#F7F7F7] min-h-screen">
        <div className="max-w-[800px] mx-auto">
          <div className="flex justify-between mb-8">
            <div className="h-8 w-48 bg-[#EBEBEB] rounded-lg" />
            <div className="h-10 w-32 bg-[#EBEBEB] rounded-lg" />
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#EBEBEB] rounded-[14px]" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#F7F7F7] min-h-screen font-sans">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[22px] font-bold text-[#111111]">My Presentations</h1>
          <Link to="/dashboard/presentations/new"
            className="bg-[#1A5C3A] hover:bg-[#14482D] text-white rounded-[12px] h-10 px-5 flex items-center gap-1.5 text-[14px] font-semibold transition-colors">
            <Plus size={16} /> New Presentation
          </Link>
        </div>

        {presentations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[20px] border border-[#EBEBEB] shadow-sm">
            <FileText size={48} className="text-[#CCCCCC] mb-4" />
            <h2 className="text-[18px] font-semibold text-[#111111] mb-1">No presentations yet</h2>
            <p className="text-[14px] text-[#888888] mb-6 max-w-sm">Create your first AI-designed property presentation in 30 seconds.</p>
            <Link to="/dashboard/presentations/new"
              className="bg-[#1A5C3A] hover:bg-[#14482D] text-white rounded-[14px] h-11 px-6 flex items-center gap-1.5 text-[14px] font-semibold transition-colors">
              <Plus size={16} /> Create Presentation
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {presentations.map(ppt => {
              const editUrl = ppt.content?.edit_url;
              return (
                <div key={ppt.id} className="bg-white rounded-[14px] border border-[#EBEBEB] shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[15px] font-semibold text-[#111111] line-clamp-1 max-w-[280px] sm:max-w-md">
                      {ppt.title || 'Untitled Presentation'}
                    </h3>
                    <div className="flex items-center gap-3 text-[13px] text-[#888888]">
                      <span>{formatDistanceToNow(new Date(ppt.created_at), { addSuffix: true })}</span>
                      <span className="w-1 h-1 rounded-full bg-[#D1D1D1]" />
                      <span className="capitalize">{ppt.theme} theme</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const url = `${ppt.presenton_url || 'https://manan345345435-propsite.hf.space'}/api/v1/ppt/presentation/${ppt.presentation_id}/download?format=pptx`;
                        window.open(url, '_blank');
                      }}
                      className="h-9 px-4 rounded-[10px] border border-[#EBEBEB] text-[#111111] text-[13px] font-semibold flex items-center gap-1.5 hover:bg-[#F7F7F7] transition-colors"
                    >
                      <FileText size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
