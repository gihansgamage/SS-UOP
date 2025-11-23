import React, { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api'; // Import API Service

// Define types for the dashboard data
interface DashboardStats {
  totalSocieties: number;
  activeSocieties: number;
  pendingApprovals: number;
  currentYearRegistrations: number;
  upcomingEvents: any[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Local state for dashboard data
  const [stats, setStats] = useState<DashboardStats>({
    totalSocieties: 0,
    activeSocieties: 0,
    pendingApprovals: 0,
    currentYearRegistrations: 0,
    upcomingEvents: []
  });

  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [pendingRenewals, setPendingRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 1. Fetch General Dashboard Stats
        const dashboardRes = await apiService.admin.getDashboard();
        setStats(dashboardRes.data);

        // 2. Fetch Specific Pending Items based on Role
        let pendingRes;

        if (user.role === 'dean') {
          pendingRes = await apiService.admin.getDeanPending();
          // Dean API returns map: { registrations: [], renewals: [] }
          setPendingRegistrations(pendingRes.data.registrations || []);
          setPendingRenewals(pendingRes.data.renewals || []);

        } else if (user.role === 'assistant_registrar') {
          pendingRes = await apiService.admin.getARPending();
          // AR API returns mixed list
          const allItems = pendingRes.data || [];
          // Filter manually if the backend returns a mixed list
          setPendingRegistrations(allItems.filter((i: any) => i.hasOwnProperty('societyName') && !i.hasOwnProperty('difficulties')));
          setPendingRenewals(allItems.filter((i: any) => i.hasOwnProperty('difficulties')));

        } else if (user.role === 'vice_chancellor') {
          pendingRes = await apiService.admin.getVCPending();
          const allItems = pendingRes.data || [];
          setPendingRegistrations(allItems.filter((i: any) => i.hasOwnProperty('societyName') && !i.hasOwnProperty('difficulties')));
          setPendingRenewals(allItems.filter((i: any) => i.hasOwnProperty('difficulties')));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'dean' ? 'Dean\'s Dashboard' :
                user?.role === 'assistant_registrar' ? 'Assistant Registrar Dashboard' :
                    user?.role === 'vice_chancellor' ? 'Vice Chancellor Dashboard' :
                        'Admin Dashboard'}
          </h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
              title="Total Societies"
              value={stats.totalSocieties}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="bg-blue-50"
          />
          <StatCard
              title="Active Societies"
              value={stats.activeSocieties}
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              color="bg-green-50"
          />
          <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
              color="bg-orange-50"
          />
          <StatCard
              title="New Registrations"
              value={stats.currentYearRegistrations}
              icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
              color="bg-purple-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Required Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Action Required
            </h3>

            <div className="space-y-4">
              {pendingRegistrations.length === 0 && pendingRenewals.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No pending items requiring your attention.</p>
              ) : (
                  <>
                    {pendingRegistrations.map((reg) => (
                        <div key={reg.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div>
                            <div className="font-medium text-gray-900">{reg.societyName}</div>
                            <div className="text-sm text-gray-600">New Registration Application</div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                      Review
                    </span>
                        </div>
                    ))}

                    {pendingRenewals.map((renewal) => (
                        <div key={renewal.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div>
                            <div className="font-medium text-gray-900">{renewal.societyName}</div>
                            <div className="text-sm text-gray-600">Renewal Application</div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      Review
                    </span>
                        </div>
                    ))}
                  </>
              )}
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Upcoming Approved Events
            </h3>
            {stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingEvents.map((event: any) => (
                      <div key={event.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-900">{event.eventName}</div>
                          <div className="text-sm text-gray-600">{event.societyName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{event.eventDate}</div>
                          <div className="text-xs text-gray-500">{event.timeFrom}</div>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming events scheduled.</p>
            )}
          </div>
        </div>
      </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center">
      <div className={`p-3 rounded-full ${color} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
);

export default AdminDashboard;