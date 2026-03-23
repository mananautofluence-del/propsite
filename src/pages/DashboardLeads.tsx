import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { MessageCircle, Phone, CalendarDays, User, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  listing: {
    headline: string | null;
  } | null;
}

export default function DashboardLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          phone,
          created_at,
          listing:listing_id ( headline )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setLeads(data as unknown as Lead[]);
      }
      setLoading(false);
    };

    fetchLeads();
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-text-3" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-sans max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-text-1">Leads CRM</h1>
          <p className="text-[13px] text-text-2 mt-1">Manage inquiries from your listings.</p>
        </div>
        <div className="bg-surface-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-text-1">
          {leads.length} Total
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-text-3" />
          </div>
          <h3 className="text-[16px] font-semibold text-text-1 mb-2">No leads yet</h3>
          <p className="text-[13px] text-text-2">When clients inquire about your properties, they'll appear here.</p>
        </div>
      ) : (
        <div className="hidden md:block bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-[#EBEBEB]">
                <th className="font-semibold text-[13px] text-text-2 py-3 px-4">Lead Info</th>
                <th className="font-semibold text-[13px] text-text-2 py-3 px-4">Property</th>
                <th className="font-semibold text-[13px] text-text-2 py-3 px-4">Date</th>
                <th className="font-semibold text-[13px] text-text-2 py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-[#EBEBEB] last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[14px] text-text-1">{lead.name || 'Anonymous'}</div>
                    <div className="text-[13px] text-text-3 font-mono mt-0.5">{lead.phone}</div>
                  </td>
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="text-[13px] text-text-1 line-clamp-1 font-medium">
                      {lead.listing?.headline || 'Unknown Property'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[13px] text-text-2">
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={`tel:${lead.phone}`}
                        className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-2 hover:bg-[#EBEBEB] hover:text-text-1 transition-colors"
                        title="Call"
                      >
                        <Phone size={14} />
                      </a>
                      <a 
                        href={`https://wa.me/91${lead.phone.replace(/[^0-9]/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-3 rounded-lg bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center gap-1.5 hover:bg-[#25D366]/20 transition-colors text-[12px] font-bold"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile view */}
      <div className="flex md:hidden flex-col gap-3 mt-4">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white border border-[#EBEBEB] rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-[15px] text-text-1">{lead.name || 'Anonymous'}</h4>
                <div className="text-[13px] text-text-3 font-mono mt-0.5">{lead.phone}</div>
              </div>
              <span className="text-[11px] text-text-3 bg-surface-2 px-2 py-1 rounded-md">
                {format(new Date(lead.created_at), 'dd MMM')}
              </span>
            </div>
            
            <div className="bg-surface-2 p-2.5 rounded-lg flex items-center gap-2">
              <FileText size={14} className="text-text-3 shrink-0" />
              <div className="text-[12px] text-text-1 font-medium line-clamp-1">
                {lead.listing?.headline || 'Unknown Property'}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a 
                href={`tel:${lead.phone}`}
                className="flex-1 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-2 hover:bg-[#EBEBEB] hover:text-text-1 transition-colors font-semibold text-[13px] gap-2"
              >
                <Phone size={16} /> Call
              </a>
              <a 
                href={`https://wa.me/91${lead.phone.replace(/[^0-9]/g, '').slice(-10)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-[2] h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors text-[14px] font-bold"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
