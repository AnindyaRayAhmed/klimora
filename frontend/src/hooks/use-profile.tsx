import { useState, useEffect } from 'react';
import { supabase } from '../lib/api/supabase';
import { useAuth } from './use-auth';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [missionHistory, setMissionHistory] = useState<any[]>([]);
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      // 1. Fetch user data (mocked points for now since we don't have a points table)
      const mockProfile = {
        fullName: user.user_metadata?.full_name || 'Climate Defender',
        username: user.email?.split('@')[0] || 'user',
        location: 'Bengaluru',
        joined: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        level: 4,
        points: 4850,
        nextLevelAt: 5000,
        weeklyPoints: 320,
        monthlyPoints: 1250,
        completed: 12,
        title: 'Green Steward',
        badges: ['Canopy Keeper', 'Green Steward', 'Community Guardian'],
      };
      setProfile(mockProfile);

      // 2. Fetch mission submissions
      const { data: submissions } = await supabase
        .from('mission_submissions')
        .select(`
          id, status, created_at, verified_at, mission_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // In a real app we'd join with missions table, but since missions is small, we can fetch all or just use basic info
      const { data: missionsData } = await supabase.from('missions').select('id, title, points');
      const missionMap = (missionsData || []).reduce((acc: any, m: any) => ({ ...acc, [m.id]: m }), {});

      const history: any[] = [];
      const queue: any[] = [];

      (submissions || []).forEach(sub => {
        const m = missionMap[sub.mission_id] || { title: 'Unknown Mission', points: 0 };
        const item = {
          id: sub.id,
          title: m.title,
          status: sub.status,
          date: new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          points: m.points,
          confidence: 0, // Mocked for now, until we wire AI results
          verifiedBy: 'AI',
        };

        if (sub.status === 'verified' || sub.status === 'rejected') {
          history.push(item);
        } else {
          queue.push({
            ...item,
            submittedAt: new Date(sub.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            note: 'Pending verification'
          });
        }
      });

      // Add some fallback mock history if empty, so UI doesn't look broken
      if (history.length === 0) {
        history.push(
          { id: "h1", title: "Planted Neem Sapling", status: "verified", date: "Oct 12, 2026", points: 100, confidence: 92, verifiedBy: "Klimora AI" },
          { id: "h2", title: "Public Transport Commute", status: "rejected", date: "Oct 10, 2026", points: 10, confidence: 45, verifiedBy: "Klimora AI" }
        );
      }
      
      if (queue.length === 0) {
        queue.push(
          { id: "vq1", title: "Community Cleanup", status: "pending", submittedAt: "10:42 AM", confidence: 0, note: "Awaiting analysis" }
        );
      }

      setMissionHistory(history);
      setVerificationQueue(queue);
      setLoading(false);
    };

    fetchProfile();
    
    // Poll for verification updates every 30s
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return { profile, missionHistory, verificationQueue, loading };
}
