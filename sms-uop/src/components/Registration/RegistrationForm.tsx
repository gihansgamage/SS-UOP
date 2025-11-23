import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { SocietyRegistration } from '../../types';
import StepIndicator from '../Common/StepIndicator';
import ApplicantInfoStep from './steps/ApplicantInfoStep';
import SocietyInfoStep from './steps/SocietyInfoStep';
import OfficialsStep from './steps/OfficialsStep';
import MembersStep from './steps/MembersStep';
import ReviewStep from './steps/ReviewStep';
import { apiService } from '../../services/api';

const steps = [
  { title: 'Applicant', description: 'Personal information' },
  { title: 'Society', description: 'Basic details' },
  { title: 'Officials', description: 'Committee members' },
  { title: 'Members', description: 'Society members' },
  { title: 'Review', description: 'Final review' }
];

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { addActivityLog } = useData();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FIX: Changed 'date' to 'month' to match SocietyRegistration interface ---
  const [formData, setFormData] = useState<Partial<SocietyRegistration>>({
    applicantFullName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantFaculty: '',
    applicantMobile: '',
    societyName: '',
    aims: '',
    seniorTreasurer: {
      title: '', name: '', designation: '', department: '', email: '', address: '', mobile: ''
    },
    advisoryBoard: [{ name: '', designation: '', department: '' }],
    bankAccount: '',
    bankName: '',
    president: { regNo: '', name: '', address: '', email: '', mobile: '' },
    vicePresident: { regNo: '', name: '', address: '', email: '', mobile: '' },
    juniorTreasurer: { regNo: '', name: '', address: '', email: '', mobile: '' },
    secretary: { regNo: '', name: '', address: '', email: '', mobile: '' },
    jointSecretary: { regNo: '', name: '', address: '', email: '', mobile: '' },
    editor: { regNo: '', name: '', address: '', email: '', mobile: '' },
    committeeMember: [{ regNo: '', name: '' }],
    agmDate: '',
    member: [{ regNo: '', name: '' }],
    planningEvents: [{ month: '', activity: '' }] // <--- FIXED: Now uses 'month'
  });

  const updateFormData = (updates: Partial<SocietyRegistration>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare flat payload for Backend DTO
      const payload = {
        applicantFullName: formData.applicantFullName,
        applicantRegNo: formData.applicantRegNo,
        applicantEmail: formData.applicantEmail,
        applicantFaculty: formData.applicantFaculty,
        applicantMobile: formData.applicantMobile,
        societyName: formData.societyName,
        aims: formData.aims,
        agmDate: formData.agmDate,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,

        // Senior Treasurer
        seniorTreasurerTitle: formData.seniorTreasurer?.title,
        seniorTreasurerFullName: formData.seniorTreasurer?.name,
        seniorTreasurerDesignation: formData.seniorTreasurer?.designation,
        seniorTreasurerDepartment: formData.seniorTreasurer?.department,
        seniorTreasurerEmail: formData.seniorTreasurer?.email,
        seniorTreasurerAddress: formData.seniorTreasurer?.address,
        seniorTreasurerMobile: formData.seniorTreasurer?.mobile,

        // Officials
        presidentRegNo: formData.president?.regNo,
        presidentName: formData.president?.name,
        presidentAddress: formData.president?.address,
        presidentEmail: formData.president?.email,
        presidentMobile: formData.president?.mobile,

        vicePresidentRegNo: formData.vicePresident?.regNo,
        vicePresidentName: formData.vicePresident?.name,
        vicePresidentAddress: formData.vicePresident?.address,
        vicePresidentEmail: formData.vicePresident?.email,
        vicePresidentMobile: formData.vicePresident?.mobile,

        secretaryRegNo: formData.secretary?.regNo,
        secretaryName: formData.secretary?.name,
        secretaryAddress: formData.secretary?.address,
        secretaryEmail: formData.secretary?.email,
        secretaryMobile: formData.secretary?.mobile,

        jointSecretaryRegNo: formData.jointSecretary?.regNo,
        jointSecretaryName: formData.jointSecretary?.name,
        jointSecretaryAddress: formData.jointSecretary?.address,
        jointSecretaryEmail: formData.jointSecretary?.email,
        jointSecretaryMobile: formData.jointSecretary?.mobile,

        juniorTreasurerRegNo: formData.juniorTreasurer?.regNo,
        juniorTreasurerName: formData.juniorTreasurer?.name,
        juniorTreasurerAddress: formData.juniorTreasurer?.address,
        juniorTreasurerEmail: formData.juniorTreasurer?.email,
        juniorTreasurerMobile: formData.juniorTreasurer?.mobile,

        editorRegNo: formData.editor?.regNo,
        editorName: formData.editor?.name,
        editorAddress: formData.editor?.address,
        editorEmail: formData.editor?.email,
        editorMobile: formData.editor?.mobile,

        // Lists
        advisoryBoard: formData.advisoryBoard,
        committeeMember: formData.committeeMember,
        member: formData.member,

        // Map planning events (now consistently using 'month')
        planningEvents: formData.planningEvents?.map((evt) => ({
          month: evt.month,
          activity: evt.activity
        }))
      };

      console.log("Sending Payload:", payload);

      await apiService.societies.register(payload);

      addActivityLog(
          'Society Registration Submitted',
          formData.societyName || 'Unknown Society',
          'user-' + formData.applicantRegNo,
          formData.applicantFullName || 'Unknown User'
      );

      alert(`Application submitted successfully! Confirmation sent to ${formData.applicantEmail}`);
      navigate('/');

    } catch (error: any) {
      console.error("Registration failed:", error);
      const msg = error.response?.data?.message || "Connection failed";
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
      case 3: return <MembersStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 4: return <ReviewStep formData={formData} onSubmit={handleSubmit} onPrev={prevStep} />;
      default: return null;
    }
  };

  if (isSubmitting) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Submitting application to University Database...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Society Registration</h1>
              <p className="text-gray-600">Register your society with the University of Peradeniya</p>
            </div>
            <StepIndicator steps={steps} currentStep={currentStep} />
            {renderStep()}
          </div>
        </div>
      </div>
  );
};

export default RegistrationForm;