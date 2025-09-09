import React, { useState } from 'react';
import { Download, Eye, Filter, ChevronLeft, ChevronRight, Search, Grid, List } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const AdminSocieties: React.FC = () => {
  const { societies } = useData();
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedSociety, setSelectedSociety] = useState<any>(null);

  const filteredSocieties = societies.filter(society => {
    const yearMatch = yearFilter === 'all' || society.year.toString() === yearFilter;
    const statusMatch = statusFilter === 'all' || society.status === statusFilter;
    const searchMatch = searchTerm === '' || 
      society.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.president.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.secretary.name.toLowerCase().includes(searchTerm.toLowerCase());
    return yearMatch && statusMatch && searchMatch;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.societyName.localeCompare(b.societyName);
        break;
      case 'date':
        comparison = new Date(a.registeredDate).getTime() - new Date(b.registeredDate).getTime();
        break;
      case 'year':
        comparison = a.year - b.year;
        break;
      case 'president':
        comparison = a.president.name.localeCompare(b.president.name);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSocieties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSocieties = filteredSocieties.slice(startIndex, endIndex);

  const handleDownloadExcel = () => {
    alert('Excel export feature will be implemented with backend integration');
  };

  const handleDownloadPDF = (society: any) => {
    alert(`PDF download for ${society.societyName} will be implemented with backend integration`);
  };

  const availableYears = [...new Set(societies.map(s => s.year))].sort((a, b) => b - a);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Society Management</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search societies, presidents, or secretaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
        
        {/* Results Info */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredSocieties.length)} of {filteredSocieties.length} societies
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Society Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Society {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('president')}
                  >
                    President {sortBy === 'president' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Secretary
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    Registered {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('year')}
                  >
                    Year {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSocieties.map((society) => (
                  <tr key={society.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{society.societyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{society.president.name}</div>
                      <div className="text-sm text-gray-500">{society.president.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{society.secretary.name}</div>
                      <div className="text-sm text-gray-500">{society.secretary.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(society.registeredDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {society.year}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        society.status === 'active' ? 'bg-green-100 text-green-800' :
                        society.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {society.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedSociety(society)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(society)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {currentSocieties.map((society) => (
            <div key={society.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{society.societyName}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                    society.status === 'active' ? 'bg-green-100 text-green-800' :
                    society.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {society.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div><strong>Year:</strong> {society.year}</div>
                  <div><strong>President:</strong> {society.president.name}</div>
                  <div><strong>Secretary:</strong> {society.secretary.name}</div>
                  <div><strong>Registered:</strong> {new Date(society.registeredDate).toLocaleDateString()}</div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSociety(society)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(society)}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredSocieties.length)} of {filteredSocieties.length} societies
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Society Details Modal */}
      {selectedSociety && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{selectedSociety.societyName}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Society Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Society Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Society Name:</strong> {selectedSociety.societyName}</div>
                    <div><strong>Registration Date:</strong> {new Date(selectedSociety.registeredDate).toLocaleDateString()}</div>
                    <div><strong>Academic Year:</strong> {selectedSociety.year}</div>
                    <div><strong>Status:</strong> {selectedSociety.status.toUpperCase()}</div>
                    {selectedSociety.website && <div><strong>Website:</strong> <a href={selectedSociety.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedSociety.website}</a></div>}
                  </div>
                </div>

                {/* Society Officials */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Society Officials</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* President */}
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">President</h5>
                      <div className="text-sm space-y-1">
                        <div><strong>Name:</strong> {selectedSociety.president.name}</div>
                        <div><strong>Email:</strong> {selectedSociety.president.email}</div>
                        <div><strong>Mobile:</strong> {selectedSociety.president.mobile}</div>
                        {selectedSociety.president.regNo && <div><strong>Reg No:</strong> {selectedSociety.president.regNo}</div>}
                        {selectedSociety.president.address && <div><strong>Address:</strong> {selectedSociety.president.address}</div>}
                      </div>
                    </div>

                    {/* Vice President */}
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Vice President</h5>
                      <div className="text-sm space-y-1">
                        <div><strong>Name:</strong> {selectedSociety.vicePresident.name}</div>
                        <div><strong>Email:</strong> {selectedSociety.vicePresident.email}</div>
                        <div><strong>Mobile:</strong> {selectedSociety.vicePresident.mobile}</div>
                        {selectedSociety.vicePresident.regNo && <div><strong>Reg No:</strong> {selectedSociety.vicePresident.regNo}</div>}
                        {selectedSociety.vicePresident.address && <div><strong>Address:</strong> {selectedSociety.vicePresident.address}</div>}
                      </div>
                    </div>

                    {/* Secretary */}
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Secretary</h5>
                      <div className="text-sm space-y-1">
                        <div><strong>Name:</strong> {selectedSociety.secretary.name}</div>
                        <div><strong>Email:</strong> {selectedSociety.secretary.email}</div>
                        <div><strong>Mobile:</strong> {selectedSociety.secretary.mobile}</div>
                        {selectedSociety.secretary.regNo && <div><strong>Reg No:</strong> {selectedSociety.secretary.regNo}</div>}
                        {selectedSociety.secretary.address && <div><strong>Address:</strong> {selectedSociety.secretary.address}</div>}
                      </div>
                    </div>

                    {/* Joint Secretary */}
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Joint Secretary</h5>
                      <div className="text-sm space-y-1">
                        <div><strong>Name:</strong> {selectedSociety.jointSecretary.name}</div>
                        <div><strong>Email:</strong> {selectedSociety.jointSecretary.email}</div>
                        <div><strong>Mobile:</strong> {selectedSociety.jointSecretary.mobile}</div>
                        {selectedSociety.jointSecretary.regNo && <div><strong>Reg No:</strong> {selectedSociety.jointSecretary.regNo}</div>}
                        {selectedSociety.jointSecretary.address && <div><strong>Address:</strong> {selectedSociety.jointSecretary.address}</div>}
                      </div>
                    </div>

                    {/* Junior Treasurer */}
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Junior Treasurer</h5>
                      <div className="text-sm space-y-1">
                        <div><strong>Name:</strong> {selectedSociety.juniorTreasurer.name}</div>
                        <div><strong>Email:</strong> {selectedSociety.juniorTreasurer.email}</div>
                        <div><strong>Mobile:</strong> {selectedSociety.juniorTreasurer.mobile}</div>
                        {selectedSociety.juniorTreasurer.regNo && <div><strong>Reg No:</strong> {selectedSociety.juniorTreasurer.regNo}</div>}
                        {selectedSociety.juniorTreasurer.address && <div><strong>Address:</strong> {selectedSociety.juniorTreasurer.address}</div>}
                      </div>
                    </div>

                    {/* Editor */}
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Editor</h5>
                      <div className="text-sm space-y-1">
                        <div><strong>Name:</strong> {selectedSociety.editor.name}</div>
                        <div><strong>Email:</strong> {selectedSociety.editor.email}</div>
                        <div><strong>Mobile:</strong> {selectedSociety.editor.mobile}</div>
                        {selectedSociety.editor.regNo && <div><strong>Reg No:</strong> {selectedSociety.editor.regNo}</div>}
                        {selectedSociety.editor.address && <div><strong>Address:</strong> {selectedSociety.editor.address}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Senior Treasurer */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Senior Treasurer</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {selectedSociety.seniorTreasurer.name}</div>
                    <div><strong>Email:</strong> {selectedSociety.seniorTreasurer.email}</div>
                    <div><strong>Mobile:</strong> {selectedSociety.seniorTreasurer.mobile}</div>
                    {selectedSociety.seniorTreasurer.title && <div><strong>Title:</strong> {selectedSociety.seniorTreasurer.title}</div>}
                    {selectedSociety.seniorTreasurer.designation && <div><strong>Designation:</strong> {selectedSociety.seniorTreasurer.designation}</div>}
                    {selectedSociety.seniorTreasurer.department && <div><strong>Department:</strong> {selectedSociety.seniorTreasurer.department}</div>}
                    {selectedSociety.seniorTreasurer.address && <div className="md:col-span-2"><strong>Address:</strong> {selectedSociety.seniorTreasurer.address}</div>}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedSociety(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSocieties;