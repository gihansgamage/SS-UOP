import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { FACULTIES, SocietyRegistration, AdvisoryBoardMember, CommitteeMember, Member, PlanningEvent } from '../../types';
import StepIndicator from '../Common/StepIndicator';
import ApplicantInfoStep from './steps/ApplicantInfoStep';
import SocietyInfoStep from './steps/SocietyInfoStep';
import OfficialsStep from './steps/OfficialsStep';
import MembersStep from './steps/MembersStep';
import ReviewStep from './steps/ReviewStep';

const steps = [
  { title: 'Applicant', description: 'Personal information' },
  { title: 'Society', description: 'Basic details' },
  { title: 'Officials', description: 'Committee members' },
  { title: 'Members', description: 'Society members' },
  { title: 'Review', description: 'Final review' }
];

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { addRegistration, addActivityLog } = useData();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<SocietyRegistration>>({
    applicantFullName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantFaculty: '',
    applicantMobile: '',
    societyName: '',
    aims: '',
    seniorTreasurer: {
      title: '',
      name: '',
      designation: '',
      department: '',
      email: '',
      address: '',
      mobile: ''
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
    planningEvents: [{ date: '', activity: '' }]
  });

  const updateFormData = (updates: Partial<SocietyRegistration>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const registration: SocietyRegistration = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending_dean',
      isDeanApproved: false,
      isARApproved: false,
      isVCApproved: false,
      submittedDate: new Date().toISOString(),
      year: new Date().getFullYear()
    } as SocietyRegistration;

    addRegistration(registration);
    addActivityLog(
      'Society Registration Submitted',
      registration.societyName,
      'user-' + registration.applicantRegNo,
      registration.applicantFullName
    );

    // Simulate email notification
    alert(`Application submitted successfully! A confirmation email has been sent to ${registration.applicantEmail}`);
    
    navigate('/');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ApplicantInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        );
      case 1:
        return (
          <SocietyInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 2:
        return (
          <OfficialsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <MembersStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <ReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

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