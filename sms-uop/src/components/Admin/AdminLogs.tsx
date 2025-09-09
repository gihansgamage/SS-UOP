import React, { useState } from 'react';
import { Activity, Filter, User, Calendar, Search, RefreshCw } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const AdminLogs: React.FC = () => {
  const { activityLogs } = useData();
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredLogs = activityLogs.filter(log => {
    const userMatch = userFilter === 'all' || log.userName.toLowerCase().includes(userFilter.toLowerCase());
    const actionMatch = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    const searchMatch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          dateMatch = logDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = logDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = logDate >= monthAgo;
          break;
      }
    }
    
    return userMatch && actionMatch && searchMatch && dateMatch;
  }).sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const uniqueUsers = [...new Set(activityLogs.map(log => log.userName))];
  const uniqueActions = [...new Set(activityLogs.map(log => log.action))];

  const clearFilters = () => {
    setUserFilter('all');
    setActionFilter('all');
    setDateFilter('all');
    setSearchTerm('');
    setSortOrder('newest');
  };

  const getActionIcon = (action: string) => {
    if (action.includes('approved')) return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    if (action.includes('rejected')) return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    if (action.includes('submitted')) return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Logs</h2>

      {/* Enhanced Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs by action, target, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
            
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span>Showing {filteredLogs.length} of {activityLogs.length} logs</span>
          </div>
          {(searchTerm || userFilter !== 'all' || actionFilter !== 'all' || dateFilter !== 'all') && (
            <span className="text-blue-600">Filters active</span>
          )}
        </div>
      </div>

      {/* Compact Activity Feed */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.slice(0, 100).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        {getActionIcon(log.action)}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm font-medium text-gray-900">{log.action}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-gray-700">{log.target}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-gray-600">{log.userName}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm">
                        {log.userRole && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.userRole === 'dean' ? 'bg-blue-100 text-blue-800' :
                            log.userRole === 'assistant_registrar' ? 'bg-green-100 text-green-800' :
                            log.userRole === 'vice_chancellor' ? 'bg-purple-100 text-purple-800' :
                            log.userRole === 'student_service' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.userRole.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length > 100 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Showing first 100 results. Use filters to narrow down the results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;