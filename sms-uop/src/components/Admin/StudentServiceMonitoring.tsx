import React, { useState } from 'react';
import { Eye, FileText, Calendar, Users, Filter, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const StudentServiceMonitoring: React.FC = () => {
  const { registrations, renewals, eventPermissions, societies } = useData();
  const [activeTab, setActiveTab] = useState('registrations');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const getFilteredData = () => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'registrations':
        data = registrations.map(reg => ({ ...reg, type: 'registration' }));
        break;
      case 'renewals':
        data = renewals.map(renewal => ({ ...renewal, type: 'renewal' }));
        break;
      case 'events':
        data = eventPermissions.map(event => ({ ...event, type: 'event' }));
        break;
      case 'societies':
        data = societies.map(society => ({ ...society, type: 'society' }));
        break;
    }

    // Apply filters
    if (statusFilter !== 'all') {
      data = data.filter(item => item.status === statusFilter);
    }

    if (searchTerm) {
      data = data.filter(item => 
        (item.societyName && item.societyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.eventName && item.eventName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.applicantFullName && item.applicantFullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.applicantName && item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return data.sort((a, b) => new Date(b.submittedDate || b.registeredDate).getTime() - new Date(a.submittedDate || a.registeredDate).getTime());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending_dean': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending Dean' },
      'pending_ar': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending AR' },
      'pending_vc': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending VC' },
      'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      'inactive': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <span className={`px-2 py-1 ${config.bg} ${config.text} text-xs font-medium rounded-full`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Monitoring</h2>
        <p className="text-gray-600">Monitor all society applications and activities (Read-only access)</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'registrations', label: 'Registrations', icon: FileText },
            { id: 'renewals', label: 'Renewals', icon: Clock },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'societies', label: 'Societies', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending_dean">Pending Dean</option>
              <option value="pending_ar">Pending AR</option>
              <option value="pending_vc">Pending VC</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              {activeTab === 'societies' && (
                <>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'events' ? 'Event' : 'Society'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'societies' ? 'Registered' : 'Submitted'}
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
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.eventName || item.societyName}
                    </div>
                    {item.type === 'event' && (
                      <div className="text-sm text-gray-500">{item.societyName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.applicantName || item.applicantFullName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.applicantRegNo || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.submittedDate || item.registeredDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      {getStatusBadge(item.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedApplication(item)}
                      className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {selectedApplication.eventName || selectedApplication.societyName}
                </h3>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedApplication.status)}
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {selectedApplication.type.charAt(0).toUpperCase() + selectedApplication.type.slice(1)} - Read Only
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {selectedApplication.type === 'registration' && (
                <RegistrationDetailsView application={selectedApplication} />
              )}
              {selectedApplication.type === 'renewal' && (
                <RenewalDetailsView application={selectedApplication} />
              )}
              {selectedApplication.type === 'event' && (
                <EventDetailsView application={selectedApplication} />
              )}
              {selectedApplication.type === 'society' && (
                <SocietyDetailsView application={selectedApplication} />
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedApplication(null)}
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

// Society Details View Component
const SocietyDetailsView: React.FC<{ application: any }> = ({ application }) => {
  return (
    <div className="space-y-6">
      {/* Basic Society Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Society Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Society Name:</strong> {application.societyName}</div>
          <div><strong>Registration Date:</strong> {new Date(application.registeredDate).toLocaleDateString()}</div>
          <div><strong>Academic Year:</strong> {application.year}</div>
          <div><strong>Status:</strong> {application.status.toUpperCase()}</div>
          {application.website && (
            <div className="md:col-span-2">
              <strong>Website:</strong> 
              <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                {application.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Society Officials */}
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Society Officials
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          {/* President */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">President</h5>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {application.president.name}</div>
              <div><strong>Email:</strong> {application.president.email}</div>
              <div><strong>Mobile:</strong> {application.president.mobile}</div>
              {application.president.regNo && <div><strong>Reg No:</strong> {application.president.regNo}</div>}
              {application.president.address && <div><strong>Address:</strong> {application.president.address}</div>}
            </div>
          </div>

          {/* Vice President */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Vice President</h5>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {application.vicePresident.name}</div>
              <div><strong>Email:</strong> {application.vicePresident.email}</div>
              <div><strong>Mobile:</strong> {application.vicePresident.mobile}</div>
              {application.vicePresident.regNo && <div><strong>Reg No:</strong> {application.vicePresident.regNo}</div>}
              {application.vicePresident.address && <div><strong>Address:</strong> {application.vicePresident.address}</div>}
            </div>
          </div>

          {/* Secretary */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Secretary</h5>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {application.secretary.name}</div>
              <div><strong>Email:</strong> {application.secretary.email}</div>
              <div><strong>Mobile:</strong> {application.secretary.mobile}</div>
              {application.secretary.regNo && <div><strong>Reg No:</strong> {application.secretary.regNo}</div>}
              {application.secretary.address && <div><strong>Address:</strong> {application.secretary.address}</div>}
            </div>
          </div>

          {/* Joint Secretary */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Joint Secretary</h5>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {application.jointSecretary.name}</div>
              <div><strong>Email:</strong> {application.jointSecretary.email}</div>
              <div><strong>Mobile:</strong> {application.jointSecretary.mobile}</div>
              {application.jointSecretary.regNo && <div><strong>Reg No:</strong> {application.jointSecretary.regNo}</div>}
              {application.jointSecretary.address && <div><strong>Address:</strong> {application.jointSecretary.address}</div>}
            </div>
          </div>

          {/* Junior Treasurer */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Junior Treasurer</h5>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {application.juniorTreasurer.name}</div>
              <div><strong>Email:</strong> {application.juniorTreasurer.email}</div>
              <div><strong>Mobile:</strong> {application.juniorTreasurer.mobile}</div>
              {application.juniorTreasurer.regNo && <div><strong>Reg No:</strong> {application.juniorTreasurer.regNo}</div>}
              {application.juniorTreasurer.address && <div><strong>Address:</strong> {application.juniorTreasurer.address}</div>}
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Editor</h5>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {application.editor.name}</div>
              <div><strong>Email:</strong> {application.editor.email}</div>
              <div><strong>Mobile:</strong> {application.editor.mobile}</div>
              {application.editor.regNo && <div><strong>Reg No:</strong> {application.editor.regNo}</div>}
              {application.editor.address && <div><strong>Address:</strong> {application.editor.address}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Senior Treasurer */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Senior Treasurer
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Name:</strong> {application.seniorTreasurer.name}</div>
          <div><strong>Email:</strong> {application.seniorTreasurer.email}</div>
          <div><strong>Mobile:</strong> {application.seniorTreasurer.mobile}</div>
          {application.seniorTreasurer.title && <div><strong>Title:</strong> {application.seniorTreasurer.title}</div>}
          {application.seniorTreasurer.designation && <div><strong>Designation:</strong> {application.seniorTreasurer.designation}</div>}
          {application.seniorTreasurer.department && <div><strong>Department:</strong> {application.seniorTreasurer.department}</div>}
          {application.seniorTreasurer.address && <div className="md:col-span-2"><strong>Address:</strong> {application.seniorTreasurer.address}</div>}
        </div>
      </div>
    </div>
  );
};

// Registration Details View Component (reused from AdminApprovals)
const RegistrationDetailsView: React.FC<{ application: any }> = ({ application }) => {
  return (
    <div className="space-y-6">
      {/* Applicant Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Applicant Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Full Name:</strong> {application.applicantFullName}</div>
          <div><strong>Registration No:</strong> {application.applicantRegNo}</div>
          <div><strong>Email:</strong> {application.applicantEmail}</div>
          <div><strong>Faculty:</strong> {application.applicantFaculty}</div>
          <div><strong>Mobile:</strong> {application.applicantMobile}</div>
          <div><strong>Submitted Date:</strong> {new Date(application.submittedDate).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Society Information */}
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-green-600" />
          Society Information
        </h4>
        <div className="space-y-3 text-sm">
          <div><strong>Society Name:</strong> {application.societyName}</div>
          <div><strong>AGM Date:</strong> {application.agmDate}</div>
          {application.bankAccount && (
            <>
              <div><strong>Bank Account:</strong> {application.bankAccount}</div>
              <div><strong>Bank Name:</strong> {application.bankName}</div>
            </>
          )}
          {application.aims && (
            <div>
              <strong>Aims & Objectives:</strong>
              <p className="mt-1 text-gray-700 bg-white p-3 rounded border">{application.aims}</p>
            </div>
          )}
        </div>
      </div>

      {/* Complete Officials Details */}
      <div className="bg-orange-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-600" />
          Society Officials
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          {/* All officials with complete details */}
          {[
            { title: 'President', data: application.president },
            { title: 'Vice President', data: application.vicePresident },
            { title: 'Secretary', data: application.secretary },
            { title: 'Joint Secretary', data: application.jointSecretary },
            { title: 'Junior Treasurer', data: application.juniorTreasurer },
            { title: 'Editor', data: application.editor }
          ].map((official, index) => (
            <div key={index} className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">{official.title}</h5>
              <div className="text-sm space-y-1">
                <div><strong>Reg No:</strong> {official.data?.regNo}</div>
                <div><strong>Name:</strong> {official.data?.name}</div>
                <div><strong>Email:</strong> {official.data?.email}</div>
                <div><strong>Mobile:</strong> {official.data?.mobile}</div>
                <div><strong>Address:</strong> {official.data?.address}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Senior Treasurer */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Senior Treasurer
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Title:</strong> {application.seniorTreasurer?.title}</div>
          <div><strong>Name:</strong> {application.seniorTreasurer?.name}</div>
          <div><strong>Designation:</strong> {application.seniorTreasurer?.designation}</div>
          <div><strong>Department:</strong> {application.seniorTreasurer?.department}</div>
          <div><strong>Email:</strong> {application.seniorTreasurer?.email}</div>
          <div><strong>Mobile:</strong> {application.seniorTreasurer?.mobile}</div>
          <div className="md:col-span-2"><strong>Address:</strong> {application.seniorTreasurer?.address}</div>
        </div>
      </div>

      {/* Advisory Board */}
      {application.advisoryBoard && application.advisoryBoard.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Advisory Board Members ({application.advisoryBoard.length})
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {application.advisoryBoard.map((member: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {member.name}</div>
                  <div><strong>Designation:</strong> {member.designation}</div>
                  <div><strong>Department:</strong> {member.department}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Committee Members */}
      {application.committeeMember && application.committeeMember.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-yellow-600" />
            Committee Members ({application.committeeMember.length})
          </h4>
          <div className="grid md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
            {application.committeeMember.map((member: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <div className="text-sm">
                  <div><strong>Reg No:</strong> {member.regNo}</div>
                  <div><strong>Name:</strong> {member.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Members */}
      {application.member && application.member.length > 0 && (
        <div className="bg-emerald-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-emerald-600" />
            General Members ({application.member.length})
          </h4>
          <div className="grid md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
            {application.member.map((member: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <div className="text-xs">
                  <div><strong>Reg No:</strong> {member.regNo}</div>
                  <div><strong>Name:</strong> {member.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planning Events */}
      {application.planningEvents && application.planningEvents.length > 0 && (
        <div className="bg-pink-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-pink-600" />
            Planning Events ({application.planningEvents.length})
          </h4>
          <div className="space-y-3">
            {application.planningEvents.map((event: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 flex justify-between items-center">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{event.activity}</div>
                </div>
                <div className="text-sm text-gray-600">{event.month}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Renewal Details View Component (reused from AdminApprovals)
const RenewalDetailsView: React.FC<{ application: any }> = ({ application }) => {
  return (
    <div className="space-y-6">
      {/* Applicant Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Applicant Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Full Name:</strong> {application.applicantFullName}</div>
          <div><strong>Registration No:</strong> {application.applicantRegNo}</div>
          <div><strong>Email:</strong> {application.applicantEmail}</div>
          <div><strong>Faculty:</strong> {application.applicantFaculty}</div>
          <div><strong>Mobile:</strong> {application.applicantMobile}</div>
          <div><strong>Submitted Date:</strong> {new Date(application.submittedDate).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Society Information */}
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-green-600" />
          Society Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Society Name:</strong> {application.societyName}</div>
          <div><strong>AGM Date:</strong> {application.agmDate}</div>
          <div><strong>Bank Account:</strong> {application.bankAccount}</div>
          <div><strong>Bank Name:</strong> {application.bankName}</div>
          {application.website && <div><strong>Website:</strong> <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{application.website}</a></div>}
        </div>
      </div>

      {/* Difficulties */}
      {application.difficulties && (
        <div className="bg-red-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-red-600" />
            Difficulties Faced
          </h4>
          <p className="text-sm text-gray-700 bg-white p-4 rounded border">{application.difficulties}</p>
        </div>
      )}

      {/* Previous Activities */}
      {application.previousActivities && application.previousActivities.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Previous Activities ({application.previousActivities.length})
          </h4>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {application.previousActivities.map((activity: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                <div className="text-sm font-medium text-gray-900">{activity.activity}</div>
                <div className="text-sm text-gray-600">{activity.month}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Officials Details - Same as Registration */}
      <div className="bg-orange-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-600" />
          Society Officials
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'President', data: application.president },
            { title: 'Vice President', data: application.vicePresident },
            { title: 'Secretary', data: application.secretary },
            { title: 'Joint Secretary', data: application.jointSecretary },
            { title: 'Junior Treasurer', data: application.juniorTreasurer },
            { title: 'Editor', data: application.editor }
          ].map((official, index) => (
            <div key={index} className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">{official.title}</h5>
              <div className="text-sm space-y-1">
                <div><strong>Reg No:</strong> {official.data?.regNo}</div>
                <div><strong>Name:</strong> {official.data?.name}</div>
                <div><strong>Email:</strong> {official.data?.email}</div>
                <div><strong>Mobile:</strong> {official.data?.mobile}</div>
                <div><strong>Address:</strong> {official.data?.address}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Senior Treasurer */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Senior Treasurer
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Title:</strong> {application.seniorTreasurer?.title}</div>
          <div><strong>Name:</strong> {application.seniorTreasurer?.name}</div>
          <div><strong>Designation:</strong> {application.seniorTreasurer?.designation}</div>
          <div><strong>Department:</strong> {application.seniorTreasurer?.department}</div>
          <div><strong>Email:</strong> {application.seniorTreasurer?.email}</div>
          <div><strong>Mobile:</strong> {application.seniorTreasurer?.mobile}</div>
          <div className="md:col-span-2"><strong>Address:</strong> {application.seniorTreasurer?.address}</div>
        </div>
      </div>

      {/* Advisory Board */}
      {application.advisoryBoard && application.advisoryBoard.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Advisory Board Members ({application.advisoryBoard.length})
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {application.advisoryBoard.map((member: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {member.name}</div>
                  <div><strong>Designation:</strong> {member.designation}</div>
                  <div><strong>Department:</strong> {member.department}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Committee Members */}
      {application.committeeMember && application.committeeMember.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-yellow-600" />
            Committee Members ({application.committeeMember.length})
          </h4>
          <div className="grid md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
            {application.committeeMember.map((member: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <div className="text-sm">
                  <div><strong>Reg No:</strong> {member.regNo}</div>
                  <div><strong>Name:</strong> {member.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Members */}
      {application.member && application.member.length > 0 && (
        <div className="bg-emerald-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-emerald-600" />
            General Members ({application.member.length})
          </h4>
          <div className="grid md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
            {application.member.map((member: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <div className="text-xs">
                  <div><strong>Reg No:</strong> {member.regNo}</div>
                  <div><strong>Name:</strong> {member.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planning Events */}
      {application.planningEvents && application.planningEvents.length > 0 && (
        <div className="bg-pink-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-pink-600" />
            Future Planning Events ({application.planningEvents.length})
          </h4>
          <div className="space-y-3">
            {application.planningEvents.map((event: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 flex justify-between items-center">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{event.activity}</div>
                </div>
                <div className="text-sm text-gray-600">{event.month}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Event Details View Component (reused from AdminApprovals)
const EventDetailsView: React.FC<{ application: any }> = ({ application }) => {
  return (
    <div className="space-y-6">
      {/* Applicant Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Applicant Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Name:</strong> {application.applicantName}</div>
          <div><strong>Registration No:</strong> {application.applicantRegNo}</div>
          <div><strong>Email:</strong> {application.applicantEmail}</div>
          <div><strong>Position:</strong> {application.applicantPosition}</div>
          <div><strong>Mobile:</strong> {application.applicantMobile}</div>
          <div><strong>Society:</strong> {application.societyName}</div>
          <div><strong>Submitted Date:</strong> {new Date(application.submittedDate).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Event Information */}
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-600" />
          Event Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Event Name:</strong> {application.eventName}</div>
          <div><strong>Date:</strong> {application.eventDate}</div>
          <div><strong>Time:</strong> {application.timeFrom} - {application.timeTo}</div>
          <div><strong>Place:</strong> {application.place}</div>
          <div><strong>Inside University:</strong> {application.isInsideUniversity ? 'Yes' : 'No'}</div>
          <div><strong>Late Pass Required:</strong> {application.latePassRequired ? 'Yes' : 'No'}</div>
          <div><strong>Outsiders Invited:</strong> {application.outsidersInvited ? 'Yes' : 'No'}</div>
          <div><strong>First Year Participation:</strong> {application.firstYearParticipation ? 'Yes' : 'No'}</div>
        </div>
        
        {application.outsidersInvited && application.outsidersList && (
          <div className="mt-4">
            <strong>Outsiders List:</strong>
            <p className="mt-1 text-gray-700 bg-white p-3 rounded border">{application.outsidersList}</p>
          </div>
        )}
      </div>

      {/* Financial Information */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-yellow-600" />
          Financial Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Budget Estimate:</strong> {application.budgetEstimate}</div>
          <div><strong>Fund Collection Methods:</strong> {application.fundCollectionMethods}</div>
          {application.studentFeeAmount && (
            <div><strong>Student Fee Amount:</strong> {application.studentFeeAmount}</div>
          )}
        </div>
      </div>

      {/* Senior Treasurer Information */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Senior Treasurer Information
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div><strong>Name:</strong> {application.seniorTreasurerName}</div>
          <div><strong>Department:</strong> {application.seniorTreasurerDepartment}</div>
          <div><strong>Mobile:</strong> {application.seniorTreasurerMobile}</div>
        </div>
      </div>

      {/* Premises Officer Information */}
      <div className="bg-indigo-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-600" />
          Premises Officer Information
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div><strong>Name:</strong> {application.premisesOfficerName}</div>
          <div><strong>Designation:</strong> {application.premisesOfficerDesignation}</div>
          <div><strong>Division:</strong> {application.premisesOfficerDivision}</div>
        </div>
      </div>

      {/* Payment Information */}
      {(application.receiptNumber || application.paymentDate) && (
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Payment Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {application.receiptNumber && <div><strong>Receipt Number:</strong> {application.receiptNumber}</div>}
            {application.paymentDate && <div><strong>Payment Date:</strong> {application.paymentDate}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentServiceMonitoring;