import React, { useState, useEffect } from 'react';
import { Eye, FileText, Calendar, Users, Filter, Search } from 'lucide-react';
import { apiService } from '../../services/api';

const StudentServiceMonitoring: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('registrations');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, activeTab, statusFilter, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.admin.getSSMonitoring();
      // Expecting a mixed list or map. Let's assume mixed list for now
      setData(res.data || []);
    } catch (error) {
      console.error("Failed to fetch monitoring data", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = data;

    // 1. Filter by Tab (Type)
    if (activeTab === 'registrations') {
      filtered = filtered.filter(item => !item.difficulties && !item.eventName && !item.registeredDate);
    } else if (activeTab === 'renewals') {
      filtered = filtered.filter(item => item.difficulties);
    } else if (activeTab === 'events') {
      filtered = filtered.filter(item => item.eventName);
    } else if (activeTab === 'societies') {
      filtered = filtered.filter(item => item.registeredDate); // Active societies
    }

    // 2. Filter by Status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // 3. Filter by Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
          (item.societyName || item.eventName || '').toLowerCase().includes(lowerSearch) ||
          (item.applicantFullName || item.applicantName || '').toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredData(filtered);
  };

  if (loading) return <div>Loading monitoring data...</div>;

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Student Service Monitoring</h2>
          <button onClick={fetchData} className="text-blue-600 hover:text-blue-800">Refresh</button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          {['registrations', 'renewals', 'events', 'societies'].map((tab) => (
              <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-4 font-medium capitalize ${
                      activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
              className="border rounded-lg px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending_dean">Pending Dean</option>
            <option value="pending_ar">Pending AR</option>
            <option value="pending_vc">Pending VC</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.societyName || item.eventName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.submittedDate || item.registeredDate).toLocaleDateString()}
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
              <div className="p-6 text-center text-gray-500">No records found matching your criteria.</div>
          )}
        </div>
      </div>
  );
};

export default StudentServiceMonitoring;