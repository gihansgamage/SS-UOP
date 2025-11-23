import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, FileText, User, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext'; // Keep for addActivityLog
import { apiService } from '../../services/api'; // Import API

const AdminApprovals: React.FC = () => {
  const { user } = useAuth();
  const { addActivityLog } = useData();

  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; id: string } | null>(null);

  // 1. Fetch Data from Backend on Load
  useEffect(() => {
    fetchPendingItems();
  }, [user]);

  const fetchPendingItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let res;
      let items: any[] = [];

      if (user.role === 'dean') {
        res = await apiService.admin.getDeanPending();
        // Combine registrations and renewals
        const regs = (res.data.registrations || []).map((r: any) => ({ ...r, type: 'registration' }));
        const rens = (res.data.renewals || []).map((r: any) => ({ ...r, type: 'renewal' }));
        items = [...regs, ...rens];
      } else if (user.role === 'assistant_registrar') {
        res = await apiService.admin.getARPending();
        // Backend returns mixed list, we tag them manually based on fields if needed,
        // or ensure backend sends 'type'. Assuming simple detection:
        items = res.data.map((item: any) => ({
          ...item,
          type: item.eventName ? 'event' : (item.difficulties ? 'renewal' : 'registration')
        }));
      } else if (user.role === 'vice_chancellor') {
        res = await apiService.admin.getVCPending();
        items = res.data.map((item: any) => ({
          ...item,
          type: item.eventName ? 'event' : (item.difficulties ? 'renewal' : 'registration')
        }));
      }
      setPendingItems(items);
    } catch (error) {
      console.error("Failed to fetch pending approvals", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Approval via API
  const handleApprove = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to approve this application?')) return;

    try {
      if (type === 'registration') {
        await apiService.admin.approveRegistration(id, { comments: 'Approved via Admin Panel' });
      } else if (type === 'renewal') {
        await apiService.renewals.approve(id, { comments: 'Approved via Admin Panel' });
      } else if (type === 'event') {
        await apiService.events.approve(id, { comments: 'Approved via Admin Panel' });
      }

      addActivityLog('Approved Application', `${type} ID: ${id}`, user?.id || 'admin', user?.name || 'Admin');
      alert('Application approved successfully!');
      setSelectedApplication(null);
      fetchPendingItems(); // Refresh list
    } catch (error) {
      console.error("Approval failed", error);
      alert("Failed to approve application.");
    }
  };

  // 3. Handle Rejection via API
  const handleReject = async () => {
    if (!pendingAction || !rejectionReason.trim()) return;

    try {
      const { id, type } = pendingAction;

      if (type === 'registration') {
        await apiService.admin.rejectRegistration(id, { reason: rejectionReason });
      } else if (type === 'renewal') {
        await apiService.renewals.reject(id, { reason: rejectionReason });
      } else if (type === 'event') {
        await apiService.events.reject(id, { reason: rejectionReason });
      }

      addActivityLog('Rejected Application', `${type} ID: ${id}`, user?.id || 'admin', user?.name || 'Admin');
      alert('Application rejected.');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApplication(null);
      fetchPendingItems(); // Refresh list
    } catch (error) {
      console.error("Rejection failed", error);
      alert("Failed to reject application.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading pending approvals...</div>;

  return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>

        {pendingItems.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No pending items found. You're all caught up!</p>
            </div>
        ) : (
            <div className="grid gap-4">
              {pendingItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'registration' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'renewal' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                  }`}>
                    {item.type.toUpperCase()}
                  </span>
                        <h3 className="font-medium text-gray-900">
                          {item.societyName || item.eventName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted by: {item.applicantFullName || item.applicantName} | Date: {new Date(item.submittedDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                          onClick={() => setSelectedApplication(item)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                          title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                          onClick={() => handleApprove(item.id, item.type)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                          onClick={() => {
                            setPendingAction({ type: item.type, id: item.id });
                            setShowRejectModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Details Modal (Simplified for brevity, ensure to include full detail fields as in your original code) */}
        {selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Application Details</h3>
                  <button onClick={() => setSelectedApplication(null)} className="text-gray-500 hover:text-gray-700">Close</button>
                </div>

                <div className="space-y-6">
                  {/* Render details based on type */}
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Applicant Info</h4>
                    <p>Name: {selectedApplication.applicantFullName || selectedApplication.applicantName}</p>
                    <p>Email: {selectedApplication.applicantEmail}</p>
                    <p>Faculty: {selectedApplication.applicantFaculty}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Society / Event Info</h4>
                    <p>Name: {selectedApplication.societyName || selectedApplication.eventName}</p>
                    <p>Status: {selectedApplication.status}</p>
                    {selectedApplication.aims && <p>Aims: {selectedApplication.aims}</p>}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                      onClick={() => handleApprove(selectedApplication.id, selectedApplication.type)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve Application
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Reject Application</h3>
                <textarea
                    className="w-full border rounded p-2 mb-4"
                    rows={4}
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                  <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded">Confirm Rejection</button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminApprovals;