import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, FileText, User, Users, Shield, Calendar, Clock, AlertCircle, DollarSign, MapPin, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const AdminApprovals: React.FC = () => {
  const { user } = useAuth();
  const { 
    registrations, 
    renewals, 
    eventPermissions, 
    updateRegistrationStatus, 
    updateRenewalStatus, 
    updateEventPermissionStatus,
    addActivityLog,
    approveSociety,
    approveRenewal
  } = useData();

  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; id: string } | null>(null);

  const getPendingItems = () => {
    let items: any[] = [];

    if (user?.role === 'dean') {
      items = [
        ...registrations.filter(reg => reg.status === 'pending_dean' && 
          reg.applicantFaculty === user.faculty).map(reg => ({ ...reg, type: 'registration' })),
        ...renewals.filter(renewal => renewal.status === 'pending_dean' && 
          renewal.applicantFaculty === user.faculty).map(renewal => ({ ...renewal, type: 'renewal' }))
      ];
    } else if (user?.role === 'assistant_registrar') {
      items = [
        ...registrations.filter(reg => reg.status === 'pending_ar').map(reg => ({ ...reg, type: 'registration' })),
        ...renewals.filter(renewal => renewal.status === 'pending_ar').map(renewal => ({ ...renewal, type: 'renewal' })),
        ...eventPermissions.filter(permission => permission.status === 'pending_ar').map(permission => ({ ...permission, type: 'event' }))
      ];
    } else if (user?.role === 'vice_chancellor') {
      items = [
        ...registrations.filter(reg => reg.status === 'pending_vc').map(reg => ({ ...reg, type: 'registration' })),
        ...renewals.filter(renewal => renewal.status === 'pending_vc').map(renewal => ({ ...renewal, type: 'renewal' })),
        ...eventPermissions.filter(permission => permission.status === 'pending_vc').map(permission => ({ ...permission, type: 'event' }))
      ];
    }

    return items.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime());
  };

  const handleApprove = (item: any) => {
    const nextStatus = getNextStatus(item.status);
    
    if (item.type === 'registration') {
      updateRegistrationStatus(item.id, nextStatus);
      if (nextStatus === 'approved') {
        approveSociety(item);
      }
    } else if (item.type === 'renewal') {
      updateRenewalStatus(item.id, nextStatus);
      if (nextStatus === 'approved') {
        approveRenewal(item);
      }
    } else if (item.type === 'event') {
      updateEventPermissionStatus(item.id, nextStatus);
    }

    addActivityLog(
      `${item.type} ${nextStatus === 'approved' ? 'approved' : 'forwarded'}`,
      item.societyName || item.eventName,
      user!.id,
      user!.name,
      user!.role
    );

    alert(`Application ${nextStatus === 'approved' ? 'approved' : 'forwarded'} successfully!`);
  };

  const handleReject = () => {
    if (!pendingAction || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    const item = getPendingItems().find(i => i.id === pendingAction.id);
    if (!item) return;

    if (pendingAction.type === 'registration') {
      updateRegistrationStatus(pendingAction.id, 'rejected', rejectionReason);
    } else if (pendingAction.type === 'renewal') {
      updateRenewalStatus(pendingAction.id, 'rejected', rejectionReason);
    } else if (pendingAction.type === 'event') {
      updateEventPermissionStatus(pendingAction.id, 'rejected', rejectionReason);
    }

    addActivityLog(
      `${pendingAction.type} rejected`,
      item.societyName || item.eventName,
      user!.id,
      user!.name,
      user!.role
    );

    setShowRejectModal(false);
    setRejectionReason('');
    setPendingAction(null);
    alert('Application rejected successfully!');
  };

  const getNextStatus = (currentStatus: string) => {
    if (currentStatus === 'pending_dean') return 'pending_ar';
    if (currentStatus === 'pending_ar') return 'pending_vc';
    if (currentStatus === 'pending_vc') return 'approved';
    return 'approved';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_dean':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">Pending Dean</span>;
      case 'pending_ar':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending AR</span>;
      case 'pending_vc':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Pending VC</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  const pendingItems = getPendingItems();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Approvals</h2>
        
        {pendingItems.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.type === 'event' ? item.eventName : item.societyName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      {item.type !== 'event' && ` - ${item.applicantFaculty}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(item.submittedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                <div className="text-sm text-gray-700 mb-4">
                  <strong>Applicant:</strong> {item.applicantName || item.applicantFullName} ({item.applicantRegNo || item.applicantRegNo})
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedApplication(item)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  
                  <button
                    onClick={() => handleApprove(item)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      getNextStatus(item.status) === 'approved' 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{getNextStatus(item.status) === 'approved' ? 'Approve' : 'Forward'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setPendingAction({ type: item.type, id: item.id });
                      setShowRejectModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {selectedApplication.type === 'event' ? selectedApplication.eventName : selectedApplication.societyName}
                </h3>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedApplication.status)}
                  <span className="text-sm text-gray-500">
                    {selectedApplication.type.charAt(0).toUpperCase() + selectedApplication.type.slice(1)}
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
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedApplication(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleApprove(selectedApplication)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  getNextStatus(selectedApplication.status) === 'approved' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{getNextStatus(selectedApplication.status) === 'approved' ? 'Approve' : 'Forward'}</span>
              </button>
              <button
                onClick={() => {
                  setPendingAction({ type: selectedApplication.type, id: selectedApplication.id });
                  setShowRejectModal(true);
                  setSelectedApplication(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Application</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setPendingAction(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Registration Details View Component
const RegistrationDetailsView: React.FC<{ application: any }> = ({ application }) => {
  return (
    <div className="space-y-6">
      {/* Applicant Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
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
          <Users className="w-5 h-5 mr-2 text-green-600" />
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

      {/* Senior Treasurer */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-purple-600" />
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

      {/* Society Officials */}
      <div className="bg-orange-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-600" />
          Society Officials
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          {/* President */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">President</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.president?.regNo}</div>
              <div><strong>Name:</strong> {application.president?.name}</div>
              <div><strong>Email:</strong> {application.president?.email}</div>
              <div><strong>Mobile:</strong> {application.president?.mobile}</div>
              <div><strong>Address:</strong> {application.president?.address}</div>
            </div>
          </div>

          {/* Vice President */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Vice President</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.vicePresident?.regNo}</div>
              <div><strong>Name:</strong> {application.vicePresident?.name}</div>
              <div><strong>Email:</strong> {application.vicePresident?.email}</div>
              <div><strong>Mobile:</strong> {application.vicePresident?.mobile}</div>
              <div><strong>Address:</strong> {application.vicePresident?.address}</div>
            </div>
          </div>

          {/* Secretary */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Secretary</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.secretary?.regNo}</div>
              <div><strong>Name:</strong> {application.secretary?.name}</div>
              <div><strong>Email:</strong> {application.secretary?.email}</div>
              <div><strong>Mobile:</strong> {application.secretary?.mobile}</div>
              <div><strong>Address:</strong> {application.secretary?.address}</div>
            </div>
          </div>

          {/* Joint Secretary */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Joint Secretary</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.jointSecretary?.regNo}</div>
              <div><strong>Name:</strong> {application.jointSecretary?.name}</div>
              <div><strong>Email:</strong> {application.jointSecretary?.email}</div>
              <div><strong>Mobile:</strong> {application.jointSecretary?.mobile}</div>
              <div><strong>Address:</strong> {application.jointSecretary?.address}</div>
            </div>
          </div>

          {/* Junior Treasurer */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Junior Treasurer</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.juniorTreasurer?.regNo}</div>
              <div><strong>Name:</strong> {application.juniorTreasurer?.name}</div>
              <div><strong>Email:</strong> {application.juniorTreasurer?.email}</div>
              <div><strong>Mobile:</strong> {application.juniorTreasurer?.mobile}</div>
              <div><strong>Address:</strong> {application.juniorTreasurer?.address}</div>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Editor</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.editor?.regNo}</div>
              <div><strong>Name:</strong> {application.editor?.name}</div>
              <div><strong>Email:</strong> {application.editor?.email}</div>
              <div><strong>Mobile:</strong> {application.editor?.mobile}</div>
              <div><strong>Address:</strong> {application.editor?.address}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Board */}
      {application.advisoryBoard && application.advisoryBoard.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
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
          <div className="grid md:grid-cols-3 gap-4">
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

// Renewal Details View Component
const RenewalDetailsView: React.FC<{ application: any }> = ({ application }) => {
  return (
    <div className="space-y-6">
      {/* Applicant Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
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
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Society Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>Society Name:</strong> {application.societyName}</div>
          <div><strong>AGM Date:</strong> {application.agmDate}</div>
          <div><strong>Bank Account:</strong> {application.bankAccount}</div>
          <div><strong>Bank Name:</strong> {application.bankName}</div>
          {application.website && <div><strong>Website:</strong> {application.website}</div>}
        </div>
      </div>

      {/* Difficulties (Renewal specific) */}
      {application.difficulties && (
        <div className="bg-red-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Difficulties Faced
          </h4>
          <p className="text-sm text-gray-700 bg-white p-4 rounded border">{application.difficulties}</p>
        </div>
      )}

      {/* Previous Activities (Renewal specific) */}
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

      {/* Senior Treasurer */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-purple-600" />
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

      {/* Society Officials */}
      <div className="bg-orange-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-600" />
          Society Officials
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          {/* President */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">President</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.president?.regNo}</div>
              <div><strong>Name:</strong> {application.president?.name}</div>
              <div><strong>Email:</strong> {application.president?.email}</div>
              <div><strong>Mobile:</strong> {application.president?.mobile}</div>
              <div><strong>Address:</strong> {application.president?.address}</div>
            </div>
          </div>

          {/* Vice President */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Vice President</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.vicePresident?.regNo}</div>
              <div><strong>Name:</strong> {application.vicePresident?.name}</div>
              <div><strong>Email:</strong> {application.vicePresident?.email}</div>
              <div><strong>Mobile:</strong> {application.vicePresident?.mobile}</div>
              <div><strong>Address:</strong> {application.vicePresident?.address}</div>
            </div>
          </div>

          {/* Secretary */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Secretary</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.secretary?.regNo}</div>
              <div><strong>Name:</strong> {application.secretary?.name}</div>
              <div><strong>Email:</strong> {application.secretary?.email}</div>
              <div><strong>Mobile:</strong> {application.secretary?.mobile}</div>
              <div><strong>Address:</strong> {application.secretary?.address}</div>
            </div>
          </div>

          {/* Joint Secretary */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Joint Secretary</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.jointSecretary?.regNo}</div>
              <div><strong>Name:</strong> {application.jointSecretary?.name}</div>
              <div><strong>Email:</strong> {application.jointSecretary?.email}</div>
              <div><strong>Mobile:</strong> {application.jointSecretary?.mobile}</div>
              <div><strong>Address:</strong> {application.jointSecretary?.address}</div>
            </div>
          </div>

          {/* Junior Treasurer */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Junior Treasurer</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.juniorTreasurer?.regNo}</div>
              <div><strong>Name:</strong> {application.juniorTreasurer?.name}</div>
              <div><strong>Email:</strong> {application.juniorTreasurer?.email}</div>
              <div><strong>Mobile:</strong> {application.juniorTreasurer?.mobile}</div>
              <div><strong>Address:</strong> {application.juniorTreasurer?.address}</div>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Editor</h5>
            <div className="text-sm space-y-1">
              <div><strong>Reg No:</strong> {application.editor?.regNo}</div>
              <div><strong>Name:</strong> {application.editor?.name}</div>
              <div><strong>Email:</strong> {application.editor?.email}</div>
              <div><strong>Mobile:</strong> {application.editor?.mobile}</div>
              <div><strong>Address:</strong> {application.editor?.address}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Board */}
      {application.advisoryBoard && application.advisoryBoard.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
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
          <div className="grid md:grid-cols-3 gap-4">
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

// Event Details View Component
const EventDetailsView: React.FC<{ application: any }> = ({ application }) => {
  return (
    <div className="space-y-6">
      {/* Applicant Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
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
          <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
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
          <Shield className="w-5 h-5 mr-2 text-purple-600" />
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
          <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
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
            <CreditCard className="w-5 h-5 mr-2 text-green-600" />
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

export default AdminApprovals;