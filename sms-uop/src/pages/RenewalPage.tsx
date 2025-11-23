import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext'; // Keep only for addActivityLog
import { SocietyRenewal } from '../types';
import StepIndicator from '../components/Common/StepIndicator';
import ApplicantInfoStep from '../components/Registration/steps/ApplicantInfoStep';
import SocietyInfoStep from '../components/Registration/steps/SocietyInfoStep';
import OfficialsStep from '../components/Registration/steps/OfficialsStep';
import MembersStep from '../components/Registration/steps/MembersStep';
import ReviewStep from '../components/Registration/steps/ReviewStep';
import { apiService } from '../services/api'; // Import API Service

const steps = [
  { title: 'Applicant', description: 'Personal information' },
  { title: 'Society', description: 'Basic details' },
  { title: 'Officials', description: 'Committee members' },
  { title: 'Members', description: 'Society members' },
  { title: 'Review', description: 'Final review' }
];

const RenewalPage: React.FC = () => {
  const navigate = useNavigate();
  const { addActivityLog } = useData(); // Removed addRenewal
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<Partial<SocietyRenewal>>({
    applicantFullName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantFaculty: '',
    applicantMobile: '',
    societyName: '',
    bankAccount: '',
    bankName: '',
    agmDate: '',
    website: '',
    difficulties: '', // Specific to Renewal
    seniorTreasurer: { title: '', name: '', designation: '', department: '', email: '', address: '', mobile: '' },
    president: { regNo: '', name: '', address: '', email: '', mobile: '' },
    vicePresident: { regNo: '', name: '', address: '', email: '', mobile: '' },
    juniorTreasurer: { regNo: '', name: '', address: '', email: '', mobile: '' },
    secretary: { regNo: '', name: '', address: '', email: '', mobile: '' },
    jointSecretary: { regNo: '', name: '', address: '', email: '', mobile: '' },
    editor: { regNo: '', name: '', address: '', email: '', mobile: '' },
    advisoryBoard: [{ name: '', designation: '', department: '' }],
    committeeMember: [{ regNo: '', name: '' }],
    member: [{ regNo: '', name: '' }],
    planningEvents: [{ month: '', activity: '' }],
    previousActivities: [{ month: '', activity: '' }] // Specific to Renewal
  });

  const updateFormData = (updates: Partial<SocietyRenewal>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Flatten Data for Backend DTO
      const payload = {
        ...formData,
        // Flatten Senior Treasurer
        seniorTreasurerTitle: formData.seniorTreasurer?.title,
        seniorTreasurerFullName: formData.seniorTreasurer?.name,
        seniorTreasurerDesignation: formData.seniorTreasurer?.designation,
        seniorTreasurerDepartment: formData.seniorTreasurer?.department,
        seniorTreasurerEmail: formData.seniorTreasurer?.email,
        seniorTreasurerAddress: formData.seniorTreasurer?.address,
        seniorTreasurerMobile: formData.seniorTreasurer?.mobile,

        // Flatten Officials
        presidentRegNo: formData.president?.regNo, presidentName: formData.president?.name, presidentAddress: formData.president?.address, presidentEmail: formData.president?.email, presidentMobile: formData.president?.mobile,
        vicePresidentRegNo: formData.vicePresident?.regNo, vicePresidentName: formData.vicePresident?.name, vicePresidentAddress: formData.vicePresident?.address, vicePresidentEmail: formData.vicePresident?.email, vicePresidentMobile: formData.vicePresident?.mobile,
        secretaryRegNo: formData.secretary?.regNo, secretaryName: formData.secretary?.name, secretaryAddress: formData.secretary?.address, secretaryEmail: formData.secretary?.email, secretaryMobile: formData.secretary?.mobile,
        juniorTreasurerRegNo: formData.juniorTreasurer?.regNo, juniorTreasurerName: formData.juniorTreasurer?.name, juniorTreasurerAddress: formData.juniorTreasurer?.address, juniorTreasurerEmail: formData.juniorTreasurer?.email, juniorTreasurerMobile: formData.juniorTreasurer?.mobile,
        jointSecretaryRegNo: formData.jointSecretary?.regNo, jointSecretaryName: formData.jointSecretary?.name, jointSecretaryAddress: formData.jointSecretary?.address, jointSecretaryEmail: formData.jointSecretary?.email, jointSecretaryMobile: formData.jointSecretary?.mobile,
        editorRegNo: formData.editor?.regNo, editorName: formData.editor?.name, editorAddress: formData.editor?.address, editorEmail: formData.editor?.email, editorMobile: formData.editor?.mobile,

        // Lists
        advisoryBoard: formData.advisoryBoard,
        committeeMember: formData.committeeMember,
        member: formData.member,

        // Map events correctly
        planningEvents: formData.planningEvents?.map((evt: any) => ({
          month: evt.month || evt.date,
          activity: evt.activity
        })),
        previousActivities: formData.previousActivities
      };

      console.log("Sending Renewal Payload:", payload);

      // Call Backend API
      await apiService.renewals.submit(payload);

      addActivityLog('Renewal Application Submitted', formData.societyName || '', 'user', formData.applicantFullName || '');
      alert('Renewal application submitted successfully! Please check your email.');
      navigate('/');

    } catch (error: any) {
      console.error("Renewal failed:", error);
      const msg = error.response?.data?.message || "Failed to connect to server";
      alert(`Submission Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <ApplicantInfoStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 1: return <SocietyInfoStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 2: return <OfficialsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 3: return <MembersStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} isRenewal={true} />;
      case 4: return <ReviewStep formData={formData} onSubmit={handleSubmit} onPrev={prevStep} isRenewal={true} />;
      default: return null;
    }
  };

  if (isSubmitting) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Submitting renewal application...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Society Renewal</h1>
              <p className="text-gray-600">Renew your existing society registration</p>
            </div>
            <StepIndicator steps={steps} currentStep={currentStep} />
            {renderStep()}
          </div>
        </div>
      </div>
  );
};

export default RenewalPage;