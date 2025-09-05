import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Send, Eye } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { EventPermission } from '../types';
import FormField from '../components/Common/FormField';
import { validateEmail, validateStudentEmail, validateMobile, validateStaffEmail } from '../utils/validation';

const EventPermissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { societies, addEventPermission, addActivityLog } = useData();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<Partial<EventPermission>>({
    societyName: '',
    applicantName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantPosition: '',
    applicantMobile: '',
    eventName: '',
    eventDate: '',
    timeFrom: '',
    timeTo: '',
    place: '',
    isInsideUniversity: true,
    latePassRequired: false,
    outsidersInvited: false,
    outsidersList: '',
    firstYearParticipation: false,
    budgetEstimate: '',
    fundCollectionMethods: '',
    studentFeeAmount: '',
    seniorTreasurerName: '',
    seniorTreasurerDepartment: '',
    seniorTreasurerMobile: '',
    premisesOfficerName: '',
    premisesOfficerDesignation: '',
    premisesOfficerDivision: '',
    receiptNumber: '',
    paymentDate: ''
  });

  const activeSocieties = societies.filter(s => s.status === 'active');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation
    const newErrors: { [key: string]: string } = {};
    
    // Required field validation
    const requiredFields = [
      'societyName', 'applicantName', 'applicantRegNo', 'applicantPosition', 'applicantMobile',
      'applicantEmail',
      'eventName', 'eventDate', 'timeFrom', 'timeTo', 'place',
      'budgetEstimate', 'fundCollectionMethods',
      'seniorTreasurerName', 'seniorTreasurerDepartment', 'seniorTreasurerMobile',
      'premisesOfficerName', 'premisesOfficerDesignation', 'premisesOfficerDivision'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof EventPermission] || 
          (formData[field as keyof EventPermission] as string).trim() === '') {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });
    
    // Email validation for applicant
    if (formData.applicantEmail) {
      const emailError = validateEmail(formData.applicantEmail);
      if (emailError) newErrors.applicantEmail = emailError;
    }
    
    // Mobile validation
    if (formData.applicantMobile) {
      const mobileError = validateMobile(formData.applicantMobile);
      if (mobileError) newErrors.applicantMobile = mobileError;
    }
    
    if (formData.seniorTreasurerMobile) {
      const mobileError = validateMobile(formData.seniorTreasurerMobile);
      if (mobileError) newErrors.seniorTreasurerMobile = mobileError;
    }
    
    // Date validation
    if (formData.eventDate) {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.eventDate = 'Event date must be today or in the future';
      }
    }
    
    // Time validation
    if (formData.timeFrom && formData.timeTo) {
      const timeFrom = new Date(`2000-01-01T${formData.timeFrom}`);
      const timeTo = new Date(`2000-01-01T${formData.timeTo}`);
      
      if (timeTo <= timeFrom) {
        newErrors.timeTo = 'End time must be after start time';
      }
    }
    
    // Outsiders list validation
    if (formData.outsidersInvited && (!formData.outsidersList || formData.outsidersList.trim() === '')) {
      newErrors.outsidersList = 'Please provide list of outsiders when outsiders are invited';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      alert('Please fix all validation errors before submitting');
      return;
    }
    
    const permission: EventPermission = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending_ar', // Event permissions skip dean approval
      isARApproved: false,
      isVCApproved: false,
      submittedDate: new Date().toISOString()
    } as EventPermission;

    addEventPermission(permission);
    addActivityLog(
      'Event Permission Submitted',
      permission.eventName,
      'user-' + permission.applicantRegNo,
      permission.applicantName
    );

    alert(`Event permission application submitted successfully! You will receive updates via email.`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Permission Request</h1>
            <p className="text-gray-600">Request permission to hold society events</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Society & Applicant Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Society & Applicant Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Society Name"
                  name="societyName"
                  as="select"
                  options={activeSocieties.map(s => s.societyName)}
                  value={formData.societyName || ''}
                  onChange={handleChange}
                 error={errors.societyName}
                  required
                />
                
                <FormField
                  label="Applicant Name"
                  name="applicantName"
                  value={formData.applicantName || ''}
                  onChange={handleChange}
                 error={errors.applicantName}
                  required
                />
                
                <FormField
                  label="Email Address"
                  name="applicantEmail"
                  type="email"
                  value={formData.applicantEmail || ''}
                  onChange={handleChange}
                 error={errors.applicantEmail}
                 validate={validateEmail}
                  required
                />
                
                <FormField
                  label="Registration Number"
                  name="applicantRegNo"
                  value={formData.applicantRegNo || ''}
                  onChange={handleChange}
                 error={errors.applicantRegNo}
                  required
                />
                
                <FormField
                  label="Position"
                  name="applicantPosition"
                  value={formData.applicantPosition || ''}
                  onChange={handleChange}
                 error={errors.applicantPosition}
                  required
                />
                
                <FormField
                  label="Mobile Number"
                  name="applicantMobile"
                  value={formData.applicantMobile || ''}
                  onChange={handleChange}
                 error={errors.applicantMobile}
                 validate={validateMobile}
                  required
                />
              </div>
            </div>

            {/* Event Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Event Name"
                  name="eventName"
                  value={formData.eventName || ''}
                  onChange={handleChange}
                 error={errors.eventName}
                  required
                />
                
                <FormField
                  label="Event Date"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate || ''}
                  onChange={handleChange}
                 error={errors.eventDate}
                  required
                />
                
                <FormField
                  label="Time From"
                  name="timeFrom"
                  type="time"
                  value={formData.timeFrom || ''}
                  onChange={handleChange}
                 error={errors.timeFrom}
                  required
                />
                
                <FormField
                  label="Time To"
                  name="timeTo"
                  type="time"
                  value={formData.timeTo || ''}
                  onChange={handleChange}
                 error={errors.timeTo}
                  required
                />
                
                <div className="md:col-span-2">
                  <FormField
                    label="Place"
                    name="place"
                    value={formData.place || ''}
                    onChange={handleChange}
                   error={errors.place}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isInsideUniversity"
                    name="isInsideUniversity"
                    checked={formData.isInsideUniversity}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isInsideUniversity" className="ml-2 text-sm text-gray-900">
                    Event is inside university premises
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="latePassRequired"
                    name="latePassRequired"
                    checked={formData.latePassRequired}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="latePassRequired" className="ml-2 text-sm text-gray-900">
                    Late passes required for female resident students
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="outsidersInvited"
                    name="outsidersInvited"
                    checked={formData.outsidersInvited}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="outsidersInvited" className="ml-2 text-sm text-gray-900">
                    Outsiders are invited to this event
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="firstYearParticipation"
                    name="firstYearParticipation"
                    checked={formData.firstYearParticipation}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="firstYearParticipation" className="ml-2 text-sm text-gray-900">
                    First-year students are participating
                  </label>
                </div>
              </div>

              {formData.outsidersInvited && (
                <div className="mt-4">
                  <FormField
                    label="List of Outsiders (Names and Addresses)"
                    name="outsidersList"
                    as="textarea"
                    value={formData.outsidersList || ''}
                    onChange={handleChange}
                   error={errors.outsidersList}
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Financial Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Budget Estimate"
                  name="budgetEstimate"
                  value={formData.budgetEstimate || ''}
                  onChange={handleChange}
                 error={errors.budgetEstimate}
                  required
                />
                
                <FormField
                  label="Fund Collection Methods"
                  name="fundCollectionMethods"
                  value={formData.fundCollectionMethods || ''}
                  onChange={handleChange}
                 error={errors.fundCollectionMethods}
                  required
                />
                
                <FormField
                  label="Amount Expected from Students"
                  name="studentFeeAmount"
                  value={formData.studentFeeAmount || ''}
                  onChange={handleChange}
                 error={errors.studentFeeAmount}
                />
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Please attach your detailed budget with this application.
                </p>
              </div>
            </div>

            {/* Senior Treasurer Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Senior Treasurer Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  label="Name"
                  name="seniorTreasurerName"
                  value={formData.seniorTreasurerName || ''}
                  onChange={handleChange}
                 error={errors.seniorTreasurerName}
                  required
                />
                
                <FormField
                  label="Department"
                  name="seniorTreasurerDepartment"
                  value={formData.seniorTreasurerDepartment || ''}
                  onChange={handleChange}
                 error={errors.seniorTreasurerDepartment}
                  required
                />
                
                <FormField
                  label="Mobile Number"
                  name="seniorTreasurerMobile"
                  value={formData.seniorTreasurerMobile || ''}
                  onChange={handleChange}
                 error={errors.seniorTreasurerMobile}
                 validate={validateMobile}
                  required
                />
              </div>
            </div>

            {/* Premises Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Premises Officer Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  label="Officer Name"
                  name="premisesOfficerName"
                  value={formData.premisesOfficerName || ''}
                  onChange={handleChange}
                 error={errors.premisesOfficerName}
                  required
                />
                
                <FormField
                  label="Designation"
                  name="premisesOfficerDesignation"
                  value={formData.premisesOfficerDesignation || ''}
                  onChange={handleChange}
                 error={errors.premisesOfficerDesignation}
                  required
                />
                
                <FormField
                  label="Division"
                  name="premisesOfficerDivision"
                  value={formData.premisesOfficerDivision || ''}
                  onChange={handleChange}
                 error={errors.premisesOfficerDivision}
                  required
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information (Optional)</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Receipt Number"
                  name="receiptNumber"
                  value={formData.receiptNumber || ''}
                  onChange={handleChange}
                />
                
                <FormField
                  label="Payment Date"
                  name="paymentDate"
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Event Permission Preview</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Event Permission Request
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Applicant Information */}
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div><strong>Name:</strong> {formData.applicantName}</div>
                          <div><strong>Registration No:</strong> {formData.applicantRegNo}</div>
                          <div><strong>Email:</strong> {formData.applicantEmail}</div>
                          <div><strong>Position:</strong> {formData.applicantPosition}</div>
                          <div><strong>Mobile:</strong> {formData.applicantMobile}</div>
                          <div><strong>Society:</strong> {formData.societyName}</div>
                        </div>
                      </div>

                      {/* Event Information */}
                      <div className="bg-green-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div><strong>Event Name:</strong> {formData.eventName}</div>
                          <div><strong>Date:</strong> {formData.eventDate}</div>
                          <div><strong>Time:</strong> {formData.timeFrom} - {formData.timeTo}</div>
                          <div><strong>Place:</strong> {formData.place}</div>
                          <div><strong>Inside University:</strong> {formData.isInsideUniversity ? 'Yes' : 'No'}</div>
                          <div><strong>Late Pass Required:</strong> {formData.latePassRequired ? 'Yes' : 'No'}</div>
                          <div><strong>Outsiders Invited:</strong> {formData.outsidersInvited ? 'Yes' : 'No'}</div>
                          <div><strong>First Year Participation:</strong> {formData.firstYearParticipation ? 'Yes' : 'No'}</div>
                        </div>
                        
                        {formData.outsidersInvited && formData.outsidersList && (
                          <div className="mt-4">
                            <strong>Outsiders List:</strong>
                            <p className="mt-1 text-gray-700 bg-white p-3 rounded border">{formData.outsidersList}</p>
                          </div>
                        )}
                      </div>

                      {/* Financial Information */}
                      <div className="bg-yellow-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div><strong>Budget Estimate:</strong> {formData.budgetEstimate}</div>
                          <div><strong>Fund Collection Methods:</strong> {formData.fundCollectionMethods}</div>
                          {formData.studentFeeAmount && (
                            <div><strong>Student Fee Amount:</strong> {formData.studentFeeAmount}</div>
                          )}
                        </div>
                      </div>

                      {/* Senior Treasurer Information */}
                      <div className="bg-purple-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Senior Treasurer Information</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div><strong>Name:</strong> {formData.seniorTreasurerName}</div>
                          <div><strong>Department:</strong> {formData.seniorTreasurerDepartment}</div>
                          <div><strong>Mobile:</strong> {formData.seniorTreasurerMobile}</div>
                        </div>
                      </div>

                      {/* Premises Officer Information */}
                      <div className="bg-indigo-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Premises Officer Information</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div><strong>Name:</strong> {formData.premisesOfficerName}</div>
                          <div><strong>Designation:</strong> {formData.premisesOfficerDesignation}</div>
                          <div><strong>Division:</strong> {formData.premisesOfficerDivision}</div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      {(formData.receiptNumber || formData.paymentDate) && (
                        <div className="bg-green-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            {formData.receiptNumber && <div><strong>Receipt Number:</strong> {formData.receiptNumber}</div>}
                            {formData.paymentDate && <div><strong>Payment Date:</strong> {formData.paymentDate}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Application</span>
              </button>
              
              <button
                type="button"
                onClick={() => alert('PDF download feature will be implemented with backend')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Application</span>
              </button>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send for Approval</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventPermissionPage;