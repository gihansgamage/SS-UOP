import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Download, Send, Plus, Trash2, Eye } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { FACULTIES, SocietyRenewal, AdvisoryBoardMember, CommitteeMember, Member, PlanningEvent } from '../types';
import FormField from '../components/Common/FormField';
import StepIndicator from '../components/Common/StepIndicator';

const steps = [
  { title: 'Applicant', description: 'Personal information' },
  { title: 'Society', description: 'Basic details' },
  { title: 'Officials', description: 'Committee members' },
  { title: 'Activities', description: 'Past & Future' },
  { title: 'Review', description: 'Final review' }
];

const RenewalPage: React.FC = () => {
  const navigate = useNavigate();
  const { societies, addRenewal, addActivityLog } = useData();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<SocietyRenewal>>({
    applicantFullName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantFaculty: '',
    applicantMobile: '',
    societyName: '',
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
    previousActivities: [{ date: '', activity: '' }],
    difficulties: '',
    planningEvents: [{ date: '', activity: '' }],
    website: ''
  });

  const activeSocieties = societies.filter(s => s.status === 'active');

  const updateFormData = (updates: Partial<SocietyRenewal>) => {
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
    const renewal: SocietyRenewal = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending_dean',
      isDeanApproved: false,
      isARApproved: false,
      isVCApproved: false,
      submittedDate: new Date().toISOString(),
      year: new Date().getFullYear()
    } as SocietyRenewal;

    addRenewal(renewal);
    addActivityLog(
      'Society Renewal Submitted',
      renewal.societyName,
      'user-' + renewal.applicantRegNo,
      renewal.applicantFullName
    );

    alert(`Renewal application submitted successfully! A confirmation email has been sent to ${renewal.applicantEmail}`);
    navigate('/');
  };

  const handleDownloadPDF = () => {
    alert('PDF download feature will be implemented with backend integration. The PDF will include all renewal details with proper formatting, signatures, and university letterhead.');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <RenewalApplicantStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        );
      case 1:
        return (
          <RenewalSocietyStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            activeSocieties={activeSocieties}
          />
        );
      case 2:
        return (
          <RenewalOfficialsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <RenewalActivitiesStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <RenewalReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            onDownloadPDF={handleDownloadPDF}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Society Renewal</h1>
            <p className="text-gray-600">Renew your existing society registration for the current academic year</p>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />
          
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

// Renewal Applicant Step
interface RenewalApplicantStepProps {
  formData: Partial<SocietyRenewal>;
  updateFormData: (updates: Partial<SocietyRenewal>) => void;
  onNext: () => void;
}

const RenewalApplicantStep: React.FC<RenewalApplicantStepProps> = ({
  formData,
  updateFormData,
  onNext
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleNext = () => {
    const required = ['applicantFullName', 'applicantRegNo', 'applicantEmail', 'applicantFaculty', 'applicantMobile'];
    const isValid = required.every(field => formData[field as keyof SocietyRenewal]);
    
    if (!isValid) {
      alert('Please fill in all required fields');
      return;
    }
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Applicant Information</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          label="Full Name"
          name="applicantFullName"
          value={formData.applicantFullName || ''}
          onChange={handleChange}
          required
        />
        
        <FormField
          label="Registration Number"
          name="applicantRegNo"
          value={formData.applicantRegNo || ''}
          onChange={handleChange}
          required
        />
        
        <FormField
          label="Email Address"
          name="applicantEmail"
          type="email"
          value={formData.applicantEmail || ''}
          onChange={handleChange}
          required
        />
        
        <FormField
          label="Faculty"
          name="applicantFaculty"
          as="select"
          options={FACULTIES}
          value={formData.applicantFaculty || ''}
          onChange={handleChange}
          required
        />
        
        <FormField
          label="Mobile Number"
          name="applicantMobile"
          value={formData.applicantMobile || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Renewal Society Step
interface RenewalSocietyStepProps {
  formData: Partial<SocietyRenewal>;
  updateFormData: (updates: Partial<SocietyRenewal>) => void;
  onNext: () => void;
  onPrev: () => void;
  activeSocieties: any[];
}

const RenewalSocietyStep: React.FC<RenewalSocietyStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  activeSocieties
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleSeniorTreasurerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData({
      seniorTreasurer: {
        ...formData.seniorTreasurer!,
        [name]: value
      }
    });
  };

  const addAdvisoryMember = () => {
    const newMember: AdvisoryBoardMember = { name: '', designation: '', department: '' };
    updateFormData({
      advisoryBoard: [...(formData.advisoryBoard || []), newMember]
    });
  };

  const removeAdvisoryMember = (index: number) => {
    const updated = formData.advisoryBoard?.filter((_, i) => i !== index) || [];
    updateFormData({ advisoryBoard: updated });
  };

  const updateAdvisoryMember = (index: number, field: keyof AdvisoryBoardMember, value: string) => {
    const updated = formData.advisoryBoard?.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ) || [];
    updateFormData({ advisoryBoard: updated });
  };

  const handleNext = () => {
    const required = ['societyName', 'bankAccount', 'bankName'];
    const seniorTreasurerRequired = ['title', 'name', 'designation', 'department', 'email', 'address', 'mobile'];
    const isBasicValid = required.every(field => formData[field as keyof SocietyRenewal]);
    const isTreasurerValid = seniorTreasurerRequired.every(field => 
      formData.seniorTreasurer?.[field as keyof typeof formData.seniorTreasurer]
    );
    const hasAdvisoryBoard = formData.advisoryBoard && formData.advisoryBoard.length > 0 &&
      formData.advisoryBoard.every(member => member.name && member.designation && member.department);
    
    if (!isBasicValid || !isTreasurerValid || !hasAdvisoryBoard) {
      alert('Please fill in all required fields including at least one advisory board member');
      return;
    }
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Society Information</h2>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-1 gap-6">
          <FormField
            label="Society Name"
            name="societyName"
            as="select"
            options={activeSocieties.map(s => s.societyName)}
            value={formData.societyName || ''}
            onChange={handleChange}
            required
          />
          
          <FormField
            label="Website (Optional)"
            name="website"
            type="url"
            value={formData.website || ''}
            onChange={handleChange}
            placeholder="https://your-society-website.com"
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Bank Account Number"
              name="bankAccount"
              value={formData.bankAccount || ''}
              onChange={handleChange}
              required
            />
            <FormField
              label="Bank Name"
              name="bankName"
              value={formData.bankName || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Senior Treasurer Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Title"
              name="title"
              value={formData.seniorTreasurer?.title || ''}
              onChange={handleSeniorTreasurerChange}
              required
            />
            <FormField
              label="Full Name"
              name="name"
              value={formData.seniorTreasurer?.name || ''}
              onChange={handleSeniorTreasurerChange}
              required
            />
            <FormField
              label="Designation"
              name="designation"
              value={formData.seniorTreasurer?.designation || ''}
              onChange={handleSeniorTreasurerChange}
              required
            />
            <FormField
              label="Department"
              name="department"
              value={formData.seniorTreasurer?.department || ''}
              onChange={handleSeniorTreasurerChange}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.seniorTreasurer?.email || ''}
              onChange={handleSeniorTreasurerChange}
              required
            />
            <FormField
              label="Mobile Number"
              name="mobile"
              value={formData.seniorTreasurer?.mobile || ''}
              onChange={handleSeniorTreasurerChange}
              required
            />
            <div className="md:col-span-2">
              <FormField
                label="Address"
                name="address"
                value={formData.seniorTreasurer?.address || ''}
                onChange={handleSeniorTreasurerChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Advisory Board Members</h3>
            <button
              type="button"
              onClick={addAdvisoryMember}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
          
          {formData.advisoryBoard?.map((member, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Advisory Member {index + 1}</span>
                {formData.advisoryBoard!.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAdvisoryMember(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Name *"
                  value={member.name}
                  onChange={(e) => updateAdvisoryMember(index, 'name', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Designation *"
                  value={member.designation}
                  onChange={(e) => updateAdvisoryMember(index, 'designation', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Department *"
                  value={member.department}
                  onChange={(e) => updateAdvisoryMember(index, 'department', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Renewal Officials Step
interface RenewalOfficialsStepProps {
  formData: Partial<SocietyRenewal>;
  updateFormData: (updates: Partial<SocietyRenewal>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const RenewalOfficialsStep: React.FC<RenewalOfficialsStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev
}) => {
  const updateOfficial = (officialType: string, field: string, value: string) => {
    updateFormData({
      [officialType]: {
        ...formData[officialType as keyof SocietyRenewal] as any,
        [field]: value
      }
    });
  };

  const handleNext = () => {
    const officials = ['president', 'vicePresident', 'juniorTreasurer', 'secretary', 'jointSecretary', 'editor'];
    const requiredFields = ['regNo', 'name', 'address', 'email', 'mobile'];
    
    const isValid = officials.every(official => 
      requiredFields.every(field => 
        (formData[official as keyof SocietyRenewal] as any)?.[field]
      )
    );

    if (!isValid || !formData.agmDate) {
      alert('Please fill in all required fields');
      return;
    }
    onNext();
  };

  const renderOfficialSection = (title: string, officialKey: string) => (
    <div className="border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Registration Number"
          name="regNo"
          value={(formData[officialKey as keyof SocietyRenewal] as any)?.regNo || ''}
          onChange={(e) => updateOfficial(officialKey, 'regNo', e.target.value)}
          required
        />
        <FormField
          label="Full Name"
          name="name"
          value={(formData[officialKey as keyof SocietyRenewal] as any)?.name || ''}
          onChange={(e) => updateOfficial(officialKey, 'name', e.target.value)}
          required
        />
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={(formData[officialKey as keyof SocietyRenewal] as any)?.email || ''}
          onChange={(e) => updateOfficial(officialKey, 'email', e.target.value)}
          required
        />
        <FormField
          label="Mobile Number"
          name="mobile"
          value={(formData[officialKey as keyof SocietyRenewal] as any)?.mobile || ''}
          onChange={(e) => updateOfficial(officialKey, 'mobile', e.target.value)}
          required
        />
        <div className="md:col-span-2">
          <FormField
            label="Address"
            name="address"
            value={(formData[officialKey as keyof SocietyRenewal] as any)?.address || ''}
            onChange={(e) => updateOfficial(officialKey, 'address', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Society Officials</h2>
      
      <div className="space-y-6">
        {renderOfficialSection('President', 'president')}
        {renderOfficialSection('Vice President', 'vicePresident')}
        {renderOfficialSection('Junior Treasurer', 'juniorTreasurer')}
        {renderOfficialSection('Secretary', 'secretary')}
        {renderOfficialSection('Joint Secretary', 'jointSecretary')}
        {renderOfficialSection('Editor', 'editor')}

        <div className="border-t pt-6">
          <FormField
            label="Annual General Meeting Date"
            name="agmDate"
            type="date"
            value={formData.agmDate || ''}
            onChange={(e) => updateFormData({ agmDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Renewal Activities Step
interface RenewalActivitiesStepProps {
  formData: Partial<SocietyRenewal>;
  updateFormData: (updates: Partial<SocietyRenewal>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const RenewalActivitiesStep: React.FC<RenewalActivitiesStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev
}) => {
  const addCommitteeMember = () => {
    const newMember: CommitteeMember = { regNo: '', name: '' };
    updateFormData({
      committeeMember: [...(formData.committeeMember || []), newMember]
    });
  };

  const removeCommitteeMember = (index: number) => {
    const updated = formData.committeeMember?.filter((_, i) => i !== index) || [];
    updateFormData({ committeeMember: updated });
  };

  const updateCommitteeMember = (index: number, field: keyof CommitteeMember, value: string) => {
    const updated = formData.committeeMember?.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ) || [];
    updateFormData({ committeeMember: updated });
  };

  const addMember = () => {
    const newMember: Member = { regNo: '', name: '' };
    updateFormData({
      member: [...(formData.member || []), newMember]
    });
  };

  const removeMember = (index: number) => {
    const updated = formData.member?.filter((_, i) => i !== index) || [];
    updateFormData({ member: updated });
  };

  const updateMember = (index: number, field: keyof Member, value: string) => {
    const updated = formData.member?.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ) || [];
    updateFormData({ member: updated });
  };

  const addPreviousActivity = () => {
    const newActivity: PlanningEvent = { month: '', activity: '' };
    updateFormData({
      previousActivities: [...(formData.previousActivities || []), newActivity]
    });
  };

  const removePreviousActivity = (index: number) => {
    const updated = formData.previousActivities?.filter((_, i) => i !== index) || [];
    updateFormData({ previousActivities: updated });
  };

  const updatePreviousActivity = (index: number, field: keyof PlanningEvent, value: string) => {
    const updated = formData.previousActivities?.map((activity, i) => 
      i === index ? { ...activity, [field]: value } : activity
    ) || [];
    updateFormData({ previousActivities: updated });
  };

  const addPlanningEvent = () => {
    const newEvent: PlanningEvent = { month: '', activity: '' };
    updateFormData({
      planningEvents: [...(formData.planningEvents || []), newEvent]
    });
  };

  const removePlanningEvent = (index: number) => {
    const updated = formData.planningEvents?.filter((_, i) => i !== index) || [];
    updateFormData({ planningEvents: updated });
  };

  const updatePlanningEvent = (index: number, field: keyof PlanningEvent, value: string) => {
    const updated = formData.planningEvents?.map((event, i) => 
      i === index ? { ...event, [field]: value } : event
    ) || [];
    updateFormData({ planningEvents: updated });
  };

  const handleNext = () => {
    const hasCommitteeMembers = formData.committeeMember && formData.committeeMember.length > 0 && 
      formData.committeeMember.every(member => member.regNo && member.name);
    const hasMembers = formData.member && formData.member.length > 0 && 
      formData.member.every(member => member.regNo && member.name);
    const hasPreviousActivities = formData.previousActivities && formData.previousActivities.length > 0 &&
      formData.previousActivities.every(activity => activity.month && activity.activity);
    const hasPlanningEvents = formData.planningEvents && formData.planningEvents.length > 0 && 
      formData.planningEvents.every(event => event.month && event.activity);
    const hasDifficulties = formData.difficulties && formData.difficulties.trim();
    
    if (!hasCommitteeMembers || !hasMembers || !hasPreviousActivities || !hasPlanningEvents || !hasDifficulties) {
      alert('Please add at least one committee member, general member, previous activity, planning event, and describe difficulties faced');
      return;
    }
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Members & Activities</h2>
      
      <div className="space-y-8">
        {/* Committee Members */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Committee Members</h3>
            <button
              type="button"
              onClick={addCommitteeMember}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {formData.committeeMember?.map((member, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Committee Member {index + 1}</span>
                {formData.committeeMember!.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCommitteeMember(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Registration Number *"
                  value={member.regNo}
                  onChange={(e) => updateCommitteeMember(index, 'regNo', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={member.name}
                  onChange={(e) => updateCommitteeMember(index, 'name', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        {/* General Members */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">General Members</h3>
            <button
              type="button"
              onClick={addMember}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {formData.member?.map((member, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Member {index + 1}</span>
                {formData.member!.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Registration Number *"
                  value={member.regNo}
                  onChange={(e) => updateMember(index, 'regNo', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={member.name}
                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        {/* Previous Activities */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Previous Activities</h3>
            <button
              type="button"
              onClick={addPreviousActivity}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {formData.previousActivities?.map((activity, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Previous Activity {index + 1}</span>
                {formData.previousActivities!.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePreviousActivity(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <select
                  value={activity.month}
                  onChange={(e) => updatePreviousActivity(index, 'month', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
                <input
                  type="text"
                  placeholder="Activity Description *"
                  value={activity.activity}
                  onChange={(e) => updatePreviousActivity(index, 'activity', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        {/* Difficulties */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Difficulties Faced</h3>
          <textarea
            placeholder="Describe any difficulties faced during the previous year..."
            value={formData.difficulties || ''}
            onChange={(e) => updateFormData({ difficulties: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            required
          />
        </div>

        {/* Planning Events */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Future Planning Events</h3>
            <button
              type="button"
              onClick={addPlanningEvent}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {formData.planningEvents?.map((event, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Planning Event {index + 1}</span>
                {formData.planningEvents!.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlanningEvent(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <select
                  value={event.month}
                  onChange={(e) => updatePlanningEvent(index, 'month', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
                <input
                  type="text"
                  placeholder="Activity Description *"
                  value={event.activity}
                  onChange={(e) => updatePlanningEvent(index, 'activity', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Renewal Review Step
interface RenewalReviewStepProps {
  formData: Partial<SocietyRenewal>;
  onSubmit: () => void;
  onPrev: () => void;
  onDownloadPDF: () => void;
}

const RenewalReviewStep: React.FC<RenewalReviewStepProps> = ({
  formData,
  onSubmit,
  onPrev,
  onDownloadPDF
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = () => {
    if (confirm('Are you sure you want to submit this renewal application? Once submitted, it cannot be modified.')) {
      onSubmit();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review Renewal Application</h2>
      
      <div className="space-y-6">
        {/* Applicant Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><strong>Name:</strong> {formData.applicantFullName}</div>
            <div><strong>Registration No:</strong> {formData.applicantRegNo}</div>
            <div><strong>Email:</strong> {formData.applicantEmail}</div>
            <div><strong>Faculty:</strong> {formData.applicantFaculty}</div>
            <div><strong>Mobile:</strong> {formData.applicantMobile}</div>
          </div>
        </div>

        {/* Society Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Society Information</h3>
          <div className="text-sm space-y-2">
            <div><strong>Society Name:</strong> {formData.societyName}</div>
            <div><strong>Bank Account:</strong> {formData.bankAccount}</div>
            <div><strong>Bank Name:</strong> {formData.bankName}</div>
            <div><strong>AGM Date:</strong> {formData.agmDate}</div>
            {formData.website && <div><strong>Website:</strong> {formData.website}</div>}
          </div>
        </div>

        {/* Senior Treasurer */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Senior Treasurer</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><strong>Name:</strong> {formData.seniorTreasurer?.name}</div>
            <div><strong>Title:</strong> {formData.seniorTreasurer?.title}</div>
            <div><strong>Department:</strong> {formData.seniorTreasurer?.department}</div>
            <div><strong>Email:</strong> {formData.seniorTreasurer?.email}</div>
          </div>
        </div>

        {/* Activities Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities Summary</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {formData.previousActivities?.length || 0}
              </div>
              <div className="text-sm text-blue-800">Previous Activities</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {formData.planningEvents?.length || 0}
              </div>
              <div className="text-sm text-green-800">Future Events</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {formData.member?.length || 0}
              </div>
              <div className="text-sm text-purple-800">Total Members</div>
            </div>
          </div>
        </div>

        {/* Difficulties */}
        {formData.difficulties && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulties Faced</h3>
            <p className="text-sm text-gray-700">{formData.difficulties}</p>
          </div>
        )}

        {/* Summary Cards */}
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Renewal Application Preview</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Society Renewal Application
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Applicant Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Full Name:</strong> {formData.applicantFullName}</div>
                    <div><strong>Registration No:</strong> {formData.applicantRegNo}</div>
                    <div><strong>Email:</strong> {formData.applicantEmail}</div>
                    <div><strong>Faculty:</strong> {formData.applicantFaculty}</div>
                    <div><strong>Mobile:</strong> {formData.applicantMobile}</div>
                  </div>
                </div>

                {/* Society Information */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Society Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Society Name:</strong> {formData.societyName}</div>
                    <div><strong>AGM Date:</strong> {formData.agmDate}</div>
                    <div><strong>Bank Account:</strong> {formData.bankAccount}</div>
                    <div><strong>Bank Name:</strong> {formData.bankName}</div>
                    {formData.website && <div><strong>Website:</strong> {formData.website}</div>}
                  </div>
                </div>

                {/* Difficulties */}
                {formData.difficulties && (
                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Difficulties Faced</h4>
                    <p className="text-sm text-gray-700 bg-white p-4 rounded border">{formData.difficulties}</p>
                  </div>
                )}

                {/* Previous Activities */}
                {formData.previousActivities && formData.previousActivities.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Previous Activities ({formData.previousActivities.length})</h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {formData.previousActivities.map((activity, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                          <div className="text-sm font-medium text-gray-900">{activity.activity}</div>
                          <div className="text-sm text-gray-600">{activity.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Society Officials */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Society Officials</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { title: 'President', data: formData.president },
                      { title: 'Vice President', data: formData.vicePresident },
                      { title: 'Secretary', data: formData.secretary },
                      { title: 'Joint Secretary', data: formData.jointSecretary },
                      { title: 'Junior Treasurer', data: formData.juniorTreasurer },
                      { title: 'Editor', data: formData.editor }
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Senior Treasurer</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Title:</strong> {formData.seniorTreasurer?.title}</div>
                    <div><strong>Name:</strong> {formData.seniorTreasurer?.name}</div>
                    <div><strong>Designation:</strong> {formData.seniorTreasurer?.designation}</div>
                    <div><strong>Department:</strong> {formData.seniorTreasurer?.department}</div>
                    <div><strong>Email:</strong> {formData.seniorTreasurer?.email}</div>
                    <div><strong>Mobile:</strong> {formData.seniorTreasurer?.mobile}</div>
                    <div className="md:col-span-2"><strong>Address:</strong> {formData.seniorTreasurer?.address}</div>
                  </div>
                </div>

                {/* Advisory Board */}
                {formData.advisoryBoard && formData.advisoryBoard.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Advisory Board Members ({formData.advisoryBoard.length})</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {formData.advisoryBoard.map((member, index) => (
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
                {formData.committeeMember && formData.committeeMember.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Committee Members ({formData.committeeMember.length})</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {formData.committeeMember.map((member, index) => (
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
                {formData.member && formData.member.length > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">General Members ({formData.member.length})</h4>
                    <div className="grid md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                      {formData.member.map((member, index) => (
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
                {formData.planningEvents && formData.planningEvents.length > 0 && (
                  <div className="bg-pink-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Future Planning Events ({formData.planningEvents.length})</h4>
                    <div className="space-y-3">
                      {formData.planningEvents.map((event, index) => (
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

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formData.advisoryBoard?.length || 0}
            </div>
            <div className="text-sm text-orange-800">Advisory Board Members</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {formData.committeeMember?.length || 0}
            </div>
            <div className="text-sm text-indigo-800">Committee Members</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              7
            </div>
            <div className="text-sm text-emerald-800">Key Officials</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Application</span>
          </button>
          
          <button
            onClick={onDownloadPDF}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send for Approval</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalPage;