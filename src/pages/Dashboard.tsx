import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ScrollReveal } from '@/components/ScrollReveal';
import { formatPrice } from '@/lib/mock-data';
import { Eye, Clock, MessageCircle, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalListings: 0, totalViews: 0, totalLeads: 0, avgTime: '0:00' });
  const [topListings, setTopListings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, headline, locality, city, total_views, avg_time_seconds, whatsapp_clicks')
        .eq('user_id', user.id)
        .order('total_views', { ascending: false });

      if (listings) {
        const totalViews = listings.reduce((sum, l) => sum + (l.total_views || 0), 0);
        const avgSec = listings.length ? Math.round(listings.reduce((sum, l) => sum + (l.avg_time_seconds || 0), 0) / listings.length) : 0;
        setStats({
          totalListings: listings.length,
          totalViews,
          totalLeads: 0,
          avgTime: `${Math.floor(avgSec / 60)}:${(avgSec % 60).toString().padStart(2, '0')}`
        });
        setTopListings(listings.slice(0, 3));
      }
    };
    fetchData();
  }, [user]);

  const statCards = [
    { label: 'Total Listings', value: String(stats.totalListings), delta: '', icon: Eye },
    { label: 'Total Views', value: String(stats.totalViews), delta: '', icon: Eye },
    { label: 'Leads', value: String(stats.totalLeads), delta: '', icon: Users },
    { label: 'Avg Time', value: stats.avgTime, delta: '', icon: Clock },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="card-base">
                <div className="text-label text-text-3 mb-1">{s.label}</div>
                <div className="text-stat text-text-1">{s.value}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid lg:grid-cols-[65%_35%] gap-4">
          <div className="space-y-4">
            <ScrollReveal delay={100}>
              <div className="card-base">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-h4 text-text-1">Top Listings</h3>
                </div>
                {topListings.length > 0 ? topListings.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="w-12 h-9 rounded bg-surface-2 flex items-center justify-center text-xs text-text-3">🏠</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-text-1 truncate">{l.headline}</div>
                      <div className="text-2xs text-text-3">{l.locality}, {l.city}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium text-text-1">{l.total_views || 0}</div>
                      <div className="text-2xs text-text-3">views</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-text-3 py-4">No listings yet. Create your first listing!</p>
                )}
              </div>
            </ScrollReveal>
          </div>

          <div className="space-y-4">
            <ScrollReveal delay={80}>
              <div className="card-base">
                <h3 className="text-h4 text-text-1 mb-3">Quick Actions</h3>
                <div className="space-y-1.5">
                  {[
                    { label: 'Create New Listing', to: '/dashboard/listings/new' },
                    { label: 'Create Collection', to: '/dashboard/collections' },
                    { label: 'Generate Brochure', to: '/dashboard/brochures' },
                  ].map((a, i) => (
                    <Link key={i} to={a.to} className="flex items-center justify-between h-9 px-3 bg-surface-2 rounded-md text-xs text-text-1 hover:bg-border/50 transition-colors">
                      {a.label} <ChevronRight size={14} className="text-text-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
