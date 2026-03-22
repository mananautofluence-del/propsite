import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/mock-data';
import { Building2, BarChart3, Plus, Eye, TrendingUp, FolderOpen, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ listings: 0, totalViews: 0, liveCount: 0, collections: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, headline, status, slug, total_views, price, transaction_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { count: collCount } = await supabase
        .from('collections')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const rows = listings || [];
      setStats({
        listings: rows.length,
        totalViews: rows.reduce((s: number, l: any) => s + (l.total_views || 0), 0),
        liveCount: rows.filter((l: any) => l.status === 'live').length,
        collections: collCount || 0,
      });
      setRecentListings(rows.slice(0, 3));
    };
    fetch();
  }, [user]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const statCards = [
    { label: 'Active Listings', value: stats.liveCount, icon: Building2, color: 'text-primary' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-[hsl(var(--amber))]' },
    { label: 'All Listings', value: stats.listings, icon: TrendingUp, color: 'text-primary' },
    { label: 'Collections', value: stats.collections, icon: FolderOpen, color: 'text-text-2' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="font-display text-[28px] font-medium text-text-1">Welcome back, {firstName}</h1>
        <p className="text-[14px] text-text-2 mt-1 font-sans">Here's what's happening with your listings</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-surface-2 ${card.color}`}>
                <card.icon size={18} />
              </div>
            </div>
            <div className="text-[32px] font-medium text-text-1 font-sans tabular-nums leading-none mb-1">{card.value}</div>
            <div className="text-[12px] text-text-3 font-sans">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {recentListings.length > 0 && (
        <div className="rounded-2xl p-5 mb-8" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-text-1 font-sans">Recent Activity</h2>
            <Link to="/dashboard/listings" className="text-[12px] text-primary font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentListings.map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer" onClick={() => navigate(`/l/${l.slug}`)}>
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
                  <Building2 size={16} className="text-text-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-text-1 font-sans truncate">{l.headline || 'Untitled Listing'}</div>
                  <div className="text-[11px] text-text-3 font-sans">
                    {l.total_views || 0} views · {l.status === 'live' ? '🟢 Live' : '⏸ Draft'}
                  </div>
                </div>
                <ExternalLink size={14} className="text-text-3 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Link to="/create" className="btn-primary flex items-center gap-1.5 h-11 px-5">
          <Plus size={16} /> New Listing
        </Link>
        <Link to="/dashboard/listings" className="btn-secondary flex items-center gap-1.5 h-11 px-5">
          <Building2 size={16} /> My Listings
        </Link>
        <Link to="/dashboard/analytics" className="btn-secondary flex items-center gap-1.5 h-11 px-5">
          <BarChart3 size={16} /> Analytics
        </Link>
      </div>
    </div>
  );
}
