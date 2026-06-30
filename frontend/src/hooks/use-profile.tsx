import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './use-auth';

export function useProfile() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [missionHistory, setMissionHistory] = useState<any[]>([]);
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const isProduction = import.meta.env.PROD;
      const isDummy = import.meta.env.VITE_SUPABASE_ANON_KEY === 'dummy_anon_key' || !import.meta.env.VITE_SUPABASE_URL;

      const runMockDemo = !isProduction && isDummy;

      const useFallbackMock = () => {
        console.log("Klimora Profile: Using fallback mock profile mode");
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

        const history = [
          { id: "h1", title: "Planted Neem Sapling", status: "verified", date: "Oct 12, 2026", points: 100, confidence: 92, verifiedBy: "Klimora AI" },
          { id: "h2", title: "Public Transport Commute", status: "rejected", date: "Oct 10, 2026", points: 10, confidence: 45, verifiedBy: "Klimora AI" }
        ];
        const queue = [
          { id: "vq1", title: "Community Cleanup", status: "pending", submittedAt: "10:42 AM", confidence: 0, note: "Awaiting analysis" }
        ];
        setMissionHistory(history);
        setVerificationQueue(queue);
      };

      if (runMockDemo) {
        console.log("Klimora Profile: Using local demo sandbox mode");
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

        const history = [
          { id: "h1", title: "Planted Neem Sapling", status: "verified", date: "Oct 12, 2026", points: 100, confidence: 92, verifiedBy: "Klimora AI" },
          { id: "h2", title: "Public Transport Commute", status: "rejected", date: "Oct 10, 2026", points: 10, confidence: 45, verifiedBy: "Klimora AI" }
        ];
        const queue = [
          { id: "vq1", title: "Community Cleanup", status: "pending", submittedAt: "10:42 AM", confidence: 0, note: "Awaiting analysis" }
        ];
        setMissionHistory(history);
        setVerificationQueue(queue);
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile row, optionally joining home locality
        let dbProfile: any = null;
        let isNewProfile = false;

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select(`
            *,
            localities (
              name
            )
          `)
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Klimora Profile: Error fetching profile from database:", fetchError);
        } else {
          dbProfile = data;
        }

        // On first successful login/signup, automatically create a default profile row if none exists
        if (!dbProfile) {
          const defaultData = {
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Climate Defender',
            username: user.email?.split('@')[0] || 'user',
            total_points: 0,
            level: 1,
            created_at: new Date().toISOString(),
          };

          const { data: insertedData, error: insertError } = await supabase
            .from('profiles')
            .insert(defaultData)
            .select(`
              *,
              localities (
                name
              )
            `)
            .maybeSingle();

          if (insertError) {
            console.error("Klimora Profile: Failed to create default profile row for authenticated user:", insertError);
            dbProfile = {
              ...defaultData,
              localities: null
            };
          } else {
            dbProfile = insertedData || { ...defaultData, localities: null };
            isNewProfile = true;
          }
        }

        if (isNewProfile) {
          console.log("Klimora Profile: Profile row created for authenticated user");
        } else {
          console.log("Klimora Profile: Existing profile row loaded");
        }

        // Fetch submissions
        const { data: submissions, error: subError } = await supabase
          .from('mission_submissions')
          .select(`
            id, status, created_at, verified_at, mission_id
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (subError) throw subError;

        // Fetch missions metadata
        const { data: missionsData, error: missionsError } = await supabase
          .from('missions')
          .select('id, slug, title, points, category');
        
        if (missionsError) throw missionsError;

        const missionMap = (missionsData || []).reduce((acc: any, m: any) => ({ ...acc, [m.id]: m }), {});

        const history: any[] = [];
        const queue: any[] = [];
        let completedCount = 0;
        let weeklyPtsSum = 0;
        let monthlyPtsSum = 0;

        const nowTime = new Date().getTime();
        const oneWeekAgo = nowTime - (7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = nowTime - (30 * 24 * 60 * 60 * 1000);

        (submissions || []).forEach(sub => {
          const m = missionMap[sub.mission_id] || { title: 'Unknown Mission', points: 0, category: 'unknown' };
          const subDate = new Date(sub.created_at);
          const subTime = subDate.getTime();

          const item = {
            id: sub.id,
            title: m.title,
            status: sub.status,
            date: subDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            points: m.points,
            confidence: 0,
            verifiedBy: 'AI',
          };

          if (sub.status === 'verified') {
            completedCount++;
            if (subTime >= oneWeekAgo) {
              weeklyPtsSum += m.points;
            }
            if (subTime >= oneMonthAgo) {
              monthlyPtsSum += m.points;
            }
            history.push(item);
          } else if (sub.status === 'rejected') {
            history.push(item);
          } else {
            queue.push({
              ...item,
              submittedAt: subDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              note: 'Pending verification'
            });
          }
        });

        // Compute dynamic badges and title based on completed mission categories/slugs
        const completedMissionSlugs = new Set(
          submissions
            ?.filter(sub => sub.status === 'verified')
            ?.map(sub => missionMap[sub.mission_id]?.slug)
            ?.filter(Boolean)
        );

        const badges: string[] = [];
        if (completedMissionSlugs.has('plant-tree')) badges.push('Canopy Keeper');
        if (completedMissionSlugs.has('rooftop-garden')) badges.push('Heat Defender');
        
        const hasGreenMission = submissions?.some(sub => 
          sub.status === 'verified' && missionMap[sub.mission_id]?.category === 'green'
        );
        if (hasGreenMission) badges.push('Green Steward');

        if (completedMissionSlugs.has('rainwater-harvesting')) badges.push('Water Sentinel');
        if (completedMissionSlugs.has('civic-reporting')) badges.push('Climate Ranger');
        if (completedMissionSlugs.has('community-cleanup')) badges.push('Community Guardian');

        const title = badges[0] || 'Climate Defender';

        const level = dbProfile?.level || 1;
        const points = dbProfile?.total_points || 0;
        const nextLevelAt = level * 1000;

        const resolvedProfile = {
          fullName: dbProfile?.full_name || user.user_metadata?.full_name || 'Climate Defender',
          username: dbProfile?.username || user.email?.split('@')[0] || 'user',
          location: (dbProfile?.localities as any)?.name || 'Not Set',
          joined: new Date(dbProfile?.created_at || user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          level,
          points,
          nextLevelAt,
          weeklyPoints: weeklyPtsSum,
          monthlyPoints: monthlyPtsSum,
          completed: completedCount,
          title,
          badges,
        };

        console.log("Klimora Profile: Using production backend profile data");
        setProfile(resolvedProfile);
        setMissionHistory(history);
        setVerificationQueue(queue);

      } catch (err) {
        console.error('Failed to load profile data:', err);
        if (!isProduction) {
          useFallbackMock();
        } else {
          // Safe default empty profile state for production user if hydration fails
          const defaultCleanProfile = {
            fullName: user.user_metadata?.full_name || 'Climate Defender',
            username: user.email?.split('@')[0] || 'user',
            location: 'Not Set',
            joined: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            level: 1,
            points: 0,
            nextLevelAt: 1000,
            weeklyPoints: 0,
            monthlyPoints: 0,
            completed: 0,
            title: 'Climate Defender',
            badges: [],
          };
          setProfile(defaultCleanProfile);
          setMissionHistory([]);
          setVerificationQueue([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    
    // Poll for verification updates every 30s
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, [user, authLoading]);

  const updateProfile = async (fullName: string, locationName: string) => {
    try {
      const isDummy = import.meta.env.VITE_SUPABASE_ANON_KEY === 'dummy_anon_key' || !import.meta.env.VITE_SUPABASE_URL;
      if (isDummy) {
        setProfile((prev: any) => ({ ...prev, fullName, location: locationName }));
        console.log("[Mock Profile Update] Saved successfully:", { fullName, locationName });
        return;
      }
      
      // Look up locality ID by name or slug
      const { data: locData } = await supabase
        .from('localities')
        .select('id')
        .ilike('name', `%${locationName}%`)
        .limit(1);

      const localityId = locData && locData.length > 0 ? locData[0].id : null;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          ...(localityId ? { home_locality_id: localityId } : {})
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile((prev: any) => ({ 
        ...prev, 
        fullName, 
        location: localityId ? locationName : prev.location 
      }));
      console.log("[Profile Update] Profile updated successfully in Supabase:", { fullName, locationName, localityId });
    } catch (err) {
      console.error("[Profile Update] Error updating profile:", err);
      throw err;
    }
  };

  const deleteAccount = async () => {
    console.log("[Account Deletion] Triggering account deletion for user ID:", user?.id);
    try {
      const isDummy = import.meta.env.VITE_SUPABASE_ANON_KEY === 'dummy_anon_key' || !import.meta.env.VITE_SUPABASE_URL;
      if (!isDummy && user) {
        await supabase.from('profiles').delete().eq('id', user.id);
      }
      localStorage.removeItem('klimora_mock_session');
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error("Account deletion error:", err);
      throw err;
    }
  };

  return { profile, missionHistory, verificationQueue, loading, updateProfile, deleteAccount };
}
