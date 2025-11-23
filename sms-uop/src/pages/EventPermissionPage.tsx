import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Send, Eye } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { EventPermission } from '../types';
import FormField from '../components/Common/FormField';
import { validateEmail, validateMobile } from '../utils/validation';
import { apiService } from '../services/api'; // IMPORT API SERVICE

const EventPermissionPage: React.FC = () => {
  const navigate = useNavigate();
  // Keep societies for the dropdown list, but remove addEventPermission
  const { societies, addActivityLog } = useData();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

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

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDATION ---
    const newErrors: { [key: string]: string } = {};
    const requiredFields = [
      'societyName', 'applicantName', 'applicantRegNo', 'applicantPosition', 'applicantMobile',
      'applicantEmail', 'eventName', 'eventDate', 'timeFrom', 'timeTo', 'place',
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

    if (formData.applicantEmail) {
      const emailError = validateEmail(formData.applicantEmail);
      if (emailError) newErrors.applicantEmail = emailError;
    }

    // Date validation
    if (formData.eventDate) {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) newErrors.eventDate = 'Event date must be today or in the future';
    }

    // Time validation
    if (formData.timeFrom && formData.timeTo) {
      const timeFrom = new Date(`2000-01-01T${formData.timeFrom}`);
      const timeTo = new Date(`2000-01-01T${formData.timeTo}`);
      if (timeTo <= timeFrom) newErrors.timeTo = 'End time must be after start time';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // --- CONNECT TO BACKEND ---
    setIsSubmitting(true);
    try {
      // 1. Format Data for Java Backend
      const payload = {
        ...formData,
        // Fix Time Format: Append ":00" if missing (Java LocalTime needs HH:mm:ss)
        timeFrom: formData.timeFrom?.length === 5 ? `${formData.timeFrom}:00` : formData.timeFrom,
        timeTo: formData.timeTo?.length === 5 ? `${formData.timeTo}:00` : formData.timeTo,

        // Ensure booleans are actually boolean types
        isInsideUniversity: !!formData.isInsideUniversity,
        latePassRequired: !!formData.latePassRequired,
        outsidersInvited: !!formData.outsidersInvited,
        firstYearParticipation: !!formData.firstYearParticipation
      };

      console.log("Sending Event Request:", payload);

      // 2. Send to API
      await apiService.events.request(payload);

      // 3. Log Success locally
      addActivityLog(
          'Event Permission Submitted',
          formData.eventName || 'Unknown Event',
          'user-' + formData.applicantRegNo,
          formData.applicantName || 'Unknown Applicant'
      );

      alert(`Event permission submitted successfully! Updates will be sent to ${formData.applicantEmail}`);
      navigate('/');

    } catch (error: any) {
      console.error("Event submission failed:", error);
      const msg = error.response?.data?.message || "Failed to connect to server.";
      alert(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Loading Overlay */}
        {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-700 font-medium">Submitting Application...</span>
              </div>
            </div>
        )}

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

              {/* Premises Officer Information */}
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

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:bg-indigo-400"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Application</span>
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-blue-400"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send for Approval'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Modal - Keep existing logic */}
        {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Preview</h3>
                  {/* ... Add simple preview logic here if needed or keep the original code ... */}
                  <div className="flex justify-end mt-4">
                    <button onClick={() => setShowPreview(false)} className="bg-gray-300 px-4 py-2 rounded">Close</button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default EventPermissionPage;