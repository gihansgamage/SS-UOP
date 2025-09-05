import React, { useState } from 'react';
import { Calendar, Filter, Eye, CheckCircle, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const AdminEvents: React.FC = () => {
  const { eventPermissions, societies } = useData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const filteredEvents = eventPermissions.filter(event => {
    return statusFilter === 'all' || event.status === statusFilter;
  });

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.eventDate) > new Date()
  ).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const pastEvents = filteredEvents.filter(event => 
    new Date(event.eventDate) <= new Date()
  ).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <CheckCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Rejected</span>;
      case 'pending_ar':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">Pending AR</span>;
      case 'pending_vc':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Pending VC</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending_ar">Pending AR</option>
            <option value="pending_vc">Pending VC</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Upcoming Events ({upcomingEvents.length})
        </h3>
        
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{event.eventName}</h4>
                    <p className="text-gray-600 text-sm mb-2">{event.societyName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-700">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{event.eventDate}</span>
                      </div>
                      <span>{event.timeFrom} - {event.timeTo}</span>
                      <span>{event.place}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(event.status)}
                    {getStatusBadge(event.status)}
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming events</p>
        )}
      </div>

      {/* Past Events */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-gray-600" />
          Past Events ({pastEvents.length})
        </h3>
        
        {pastEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Society
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pastEvents.slice(0, 20).map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{event.eventName}</div>
                      <div className="text-sm text-gray-500">{event.timeFrom} - {event.timeTo}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{event.societyName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No past events</p>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{selectedEvent.eventName}</h3>
              <p className="text-sm text-gray-600">{selectedEvent.societyName}</p>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Date:</strong> {selectedEvent.eventDate}</div>
                    <div><strong>Time:</strong> {selectedEvent.timeFrom} - {selectedEvent.timeTo}</div>
                    <div><strong>Place:</strong> {selectedEvent.place}</div>
                    <div><strong>Inside University:</strong> {selectedEvent.isInsideUniversity ? 'Yes' : 'No'}</div>
                    <div><strong>Late Pass Required:</strong> {selectedEvent.latePassRequired ? 'Yes' : 'No'}</div>
                    <div><strong>Outsiders Invited:</strong> {selectedEvent.outsidersInvited ? 'Yes' : 'No'}</div>
                    <div><strong>First Year Participation:</strong> {selectedEvent.firstYearParticipation ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Financial Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Budget Estimate:</strong> {selectedEvent.budgetEstimate}</div>
                    <div><strong>Fund Collection:</strong> {selectedEvent.fundCollectionMethods}</div>
                    {selectedEvent.studentFeeAmount && (
                      <div><strong>Student Fee:</strong> {selectedEvent.studentFeeAmount}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
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

export default AdminEvents;