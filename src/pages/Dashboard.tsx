import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Eye, Clock, Flame, LayoutGrid, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

type ActivityRow = {
  id: string;
  started_at: string | null;
  duration_seconds: number | null;
  device_type: string | null;
  listings: { headline: string | null } | null;
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalListings: 0, totalViews: 0, hotLeads: 0, avgTime: '0:00' });
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, total_views, avg_time_seconds, whatsapp_clicks')
        .eq('user_id', user.id);

      if (listings) {
        const totalViews = listings.reduce((sum, l) => sum + (l.total_views || 0), 0);
        const hotLeads = listings.reduce((sum, l) => sum + (l.whatsapp_clicks || 0), 0);
        const avgSec = listings.length ? Math.round(listings.reduce((sum, l) => sum + (l.avg_time_seconds || 0), 0) / listings.length) : 0;
        setStats({
          totalListings: listings.length,
          totalViews,
          hotLeads,
          avgTime: `${Math.floor(avgSec / 60)}:${(avgSec % 60).toString().padStart(2, '0')}`,
        });

        const ids = listings.map(l => l.id);
        if (ids.length > 0) {
          const { data: sessions } = await supabase
            .from('listing_sessions')
            .select('id, started_at, duration_seconds, device_type, listing_id, listings(headline)')
            .in('listing_id', ids)
            .order('started_at', { ascending: false })
            .limit(5);
          setActivity((sessions as ActivityRow[]) || []);
        } else {
          setActivity([]);
        }
      }
    };
    fetchData();
  }, [user]);

  const statCards = [
    { label: 'Total Listings', value: String(stats.totalListings), icon: LayoutGrid },
    { label: 'Total Views', value: String(stats.totalViews), icon: Eye },
    { label: 'Hot Leads', value: String(stats.hotLeads), icon: Flame },
    { label: 'Avg Time', value: stats.avgTime, icon: Clock },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 60}>
              <div className="card-base">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-label text-text-3">{s.label}</div>
                  <s.icon size={14} className="text-text-3" />
                </div>
                <div className="text-stat text-text-1">{s.value}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid lg:grid-cols-[65%_35%] gap-4">
          <ScrollReveal delay={100}>
            <div className="card-base">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-h4 text-text-1">Recent activity</h3>
              </div>
              {activity.length > 0 ? (
                activity.map(row => (
                  <div key={row.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="w-12 h-9 rounded bg-surface-2 flex items-center justify-center text-xs text-text-3">👁</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-text-1 truncate">{row.listings?.headline || 'Listing view'}</div>
                      <div className="text-2xs text-text-3">
                        {row.started_at ? new Date(row.started_at).toLocaleString() : '—'}
                        {row.device_type ? ` · ${row.device_type}` : ''}
                        {row.duration_seconds != null ? ` · ${row.duration_seconds}s` : ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-3 py-4">No recent visits yet. Share your listings to see activity here.</p>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="card-base">
              <h3 className="text-h4 text-text-1 mb-3">Quick actions</h3>
              <div className="space-y-1.5">
                <Link to="/dashboard/listings/new" className="flex items-center justify-between h-9 px-3 bg-surface-2 rounded-md text-xs text-text-1 hover:bg-border/50 transition-colors">
                  Create Listing <ChevronRight size={14} className="text-text-3" />
                </Link>
                <Link to="/dashboard/analytics" className="flex items-center justify-between h-9 px-3 bg-surface-2 rounded-md text-xs text-text-1 hover:bg-border/50 transition-colors">
                  View Analytics <ChevronRight size={14} className="text-text-3" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </DashboardLayout>
  );
}
