import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useStore } from "../../../context/StoreContext";
import { submitOnboarding } from "../../../services/onboardingService";
import { toast } from "react-toastify";
import { ChevronRight, ChevronLeft, Upload, CheckCircle2 } from "lucide-react";

export default function OnboardingForm() {
    const { user, setUser } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    if (user?.onboardingStatus === "approved") return <Navigate to="/" replace />;
    if (user?.onboardingStatus === "pending_approval") return <Navigate to="/onboarding/pending" replace />;

    const [formData, setFormData] = useState({
        email: user?.email || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
        alternateMobile: "",
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        gender: user?.gender || "",
        linkedInProfile: "",
        permanentAddress: "",
        currentAddress: "",
        yearsOfExperience: "",
        personalReferences: [
            { name: "", mobile: "", relation: "" },
            { name: "", mobile: "", relation: "" }
        ],
        previousCompany: {
            name: "", designation: "", website: "", dateOfJoining: "", dateOfLastWorkingDay: "",
            employeeId: "", hrName: "", hrContact: "", hrEmail: "", officialEmail: "",
            address: "", phone: "", reasonForLeaving: "", lastSalary: "", linkedInProfile: ""
        },
        professionalReferences: [
            { name: "", mobile: "", designation: "", company: "" },
            { name: "", mobile: "", designation: "", company: "" }
        ]
    });

    const [files, setFiles] = useState({});

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is larger than 10MB (10 * 1024 * 1024)
            if (file.size > 10485760) {
                toast.error(`File size is too large! Maximum allowed size is 10 MB. (Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
                e.target.value = ""; // clear the input
                return;
            }
            setFiles({ ...files, [e.target.name]: file });
        }
    };

    const handleNestedChange = (category, index, field, value) => {
        const newData = { ...formData };
        if (index !== null) newData[category][index][field] = value;
        else newData[category][field] = value;
        setFormData(newData);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep !== 4) {
            nextStep();
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (["personalReferences", "professionalReferences", "previousCompany"].includes(key)) {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            Object.keys(files).forEach(key => {
                if (files[key]) data.append(key, files[key]);
            });

            await submitOnboarding(data);
            toast.success("Application submitted successfully!");
            setUser({ ...user, onboardingStatus: "pending_approval" });
            navigate("/onboarding/pending");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to submit form");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, name: "Personal Details" },
        { id: 2, name: "Documents" },
        { id: 3, name: "References" },
        { id: 4, name: "Experience" }
    ];

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-10 text-white text-center">
                    <h2 className="text-3xl font-extrabold mb-3">Employment Onboarding Form</h2>
                    <p className="text-blue-100 max-w-3xl mx-auto text-sm leading-relaxed">
                        Fill all the Details Carefully. These details are required to start Employment with the Company and will be used for background verification. We will call/mail the references for verification.
                    </p>
                    <p className="text-yellow-300 mt-2 text-xs font-semibold tracking-wide">
                        Cross Check every detail. Document must be uploaded in a single file (PDF/Image, Max 10MB).
                    </p>
                </div>

                {/* Stepper */}
                <div className="bg-gray-50 border-b px-8 py-5">
                    <div className="flex items-center justify-between max-w-3xl mx-auto">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex flex-col items-center relative z-10 w-1/4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 ${
                                    currentStep > step.id ? "bg-green-500 border-green-500 text-white" : 
                                    currentStep === step.id ? "bg-blue-600 border-blue-600 text-white shadow-lg" : 
                                    "bg-white border-gray-300 text-gray-400"
                                }`}>
                                    {currentStep > step.id ? <CheckCircle2 size={20} /> : step.id}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"}`}>
                                    {step.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    
                    {/* STEP 1: PERSONAL DETAILS */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Basic & Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Email ID *</label><input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Candidate First Name *</label><input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Last Name *</label><input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Mobile Number *</label><input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Alternate Mobile Number</label>
                                    <p className="text-[10px] text-gray-400 mb-1">If not available then input any family member number</p>
                                    <input type="text" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Date Of Birth *</label><input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Gender *</label>
                                    <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option>
                                    </select>
                                </div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Candidate LinkedIn Profile Link</label><input type="url" name="linkedInProfile" value={formData.linkedInProfile} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Permanent Full Address *</label>
                                    <p className="text-[10px] text-gray-400 mb-1">Street Address, City, District, State, Pincode</p>
                                    <textarea required name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} rows="2" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Full Address *</label>
                                    <p className="text-[10px] text-gray-400 mb-1">Street Address, City, District, State, Pincode</p>
                                    <textarea required name="currentAddress" value={formData.currentAddress} onChange={handleChange} rows="2" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DOCUMENTS */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Document Uploads</h3>
                            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-6">
                                Upload 1 supported file: PDF, document, or image. Max 10 MB. For multiple pages, create a single PDF file first.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[
                                    { name: "cvFile", label: "Upload Latest CV", req: true },
                                    { name: "highSchoolCertificate", label: "Upload High School Marksheet & Certificate", req: true },
                                    { name: "intermediateCertificate", label: "Upload Intermediate Marksheet & Certificate", req: false },
                                    { name: "diplomaCertificate", label: "Upload Diploma Certificate & Marksheet", desc: "If completed, upload all in 1 PDF", req: false },
                                    { name: "graduationCertificate", label: "Upload Graduation Certificate & Marksheet", desc: "B.Tech, BCA, upload all in 1 PDF", req: false },
                                    { name: "aadharFront", label: "Upload Adhar Card (Front side)", req: true },
                                    { name: "aadharBack", label: "Upload Adhar Card (Back side)", req: false },
                                    { name: "panCard", label: "Upload PAN Card", req: true },
                                    { name: "bankPassbook", label: "Upload Bank Account (Passbook)", req: true },
                                    { name: "passportPhoto", label: "Upload Passport Size Photo", req: true, imgOnly: true },
                                    { name: "fullSizePhoto", label: "Upload Full Size Photo", req: true, imgOnly: true }
                                ].map((f) => (
                                    <div key={f.name} className="border border-gray-300 rounded-xl p-4 bg-gray-50 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition">
                                        <div>
                                            <label className="text-sm font-bold text-gray-800 mb-1 flex items-start gap-1">
                                                <Upload size={14} className="mt-0.5 text-blue-600 shrink-0"/> 
                                                <span>{f.label} {f.req && <span className="text-red-500">*</span>}</span>
                                            </label>
                                            {f.desc && <p className="text-[10px] text-gray-500 mb-2">{f.desc}</p>}
                                        </div>
                                        <input type="file" name={f.name} onChange={handleFileChange} required={f.req} accept={f.imgOnly ? "image/*" : ".pdf,.jpg,.jpeg,.png,.doc,.docx"} className="text-xs w-full text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 mt-3 cursor-pointer" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REFERENCES */}
                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Personal References</h3>
                                <p className="text-sm text-gray-500 mb-4">Provide 2 Personal References for Background Verification.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[0, 1].map((idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                            <h4 className="font-bold text-blue-700">{idx === 0 ? "First" : "Second"} Person</h4>
                                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label><input required type="text" value={formData.personalReferences[idx].name} onChange={(e) => handleNestedChange("personalReferences", idx, "name", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Mobile *</label><input required type="text" value={formData.personalReferences[idx].mobile} onChange={(e) => handleNestedChange("personalReferences", idx, "mobile", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Relation *</label><input required type="text" value={formData.personalReferences[idx].relation} onChange={(e) => handleNestedChange("personalReferences", idx, "relation", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Professional References</h3>
                                <p className="text-sm text-gray-500 mb-4">Give 2 Professional References for Background Verification.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[0, 1].map((idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                            <h4 className="font-bold text-indigo-700">{idx === 0 ? "First" : "Second"} Person</h4>
                                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label><input required type="text" value={formData.professionalReferences[idx].name} onChange={(e) => handleNestedChange("professionalReferences", idx, "name", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500" /></div>
                                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Mobile *</label><input required type="text" value={formData.professionalReferences[idx].mobile} onChange={(e) => handleNestedChange("professionalReferences", idx, "mobile", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500" /></div>
                                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Designation *</label><input required type="text" value={formData.professionalReferences[idx].designation} onChange={(e) => handleNestedChange("professionalReferences", idx, "designation", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500" /></div>
                                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Working Company Name *</label><input required type="text" value={formData.professionalReferences[idx].company} onChange={(e) => handleNestedChange("professionalReferences", idx, "company", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500" /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* STEP 4: EXPERIENCE */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Experience & Previous Company</h3>
                            
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                                <label className="block text-sm font-bold text-blue-900 mb-2">Year Of Experience *</label>
                                <input required type="number" min="0" step="0.1" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="w-full md:w-1/3 px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white shadow-sm font-semibold" placeholder="e.g. 2.5 (Enter 0 if Fresher)" />
                            </div>

                            {Number(formData.yearsOfExperience) > 0 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="lg:col-span-3"><h4 className="font-bold text-gray-800 text-lg border-b pb-2">Previous/Current Company Details</h4></div>
                                        
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Full Name of Company</label><input type="text" value={formData.previousCompany.name} onChange={(e) => handleNestedChange("previousCompany", null, "name", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Current/Last Designation</label><input type="text" value={formData.previousCompany.designation} onChange={(e) => handleNestedChange("previousCompany", null, "designation", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Company Website *</label><input required type="url" value={formData.previousCompany.website} onChange={(e) => handleNestedChange("previousCompany", null, "website", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Date of Joining</label><input type="date" value={formData.previousCompany.dateOfJoining} onChange={(e) => handleNestedChange("previousCompany", null, "dateOfJoining", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Date Of Last working day</label><input type="date" value={formData.previousCompany.dateOfLastWorkingDay} onChange={(e) => handleNestedChange("previousCompany", null, "dateOfLastWorkingDay", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Employee ID</label><input type="text" value={formData.previousCompany.employeeId} onChange={(e) => handleNestedChange("previousCompany", null, "employeeId", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">HR/Manager Name</label><input type="text" value={formData.previousCompany.hrName} onChange={(e) => handleNestedChange("previousCompany", null, "hrName", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">HR/Manager Contact Number</label><input type="text" value={formData.previousCompany.hrContact} onChange={(e) => handleNestedChange("previousCompany", null, "hrContact", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">HR/Manager Email ID</label><input type="email" value={formData.previousCompany.hrEmail} onChange={(e) => handleNestedChange("previousCompany", null, "hrEmail", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Company Official Mail ID</label><input type="email" value={formData.previousCompany.officialEmail} onChange={(e) => handleNestedChange("previousCompany", null, "officialEmail", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Company Phone Number</label><input type="text" value={formData.previousCompany.phone} onChange={(e) => handleNestedChange("previousCompany", null, "phone", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Last/Current In Hand Salary (Monthly) *</label><input required type="number" value={formData.previousCompany.lastSalary} onChange={(e) => handleNestedChange("previousCompany", null, "lastSalary", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                        <div className="lg:col-span-3"><label className="block text-xs font-bold text-gray-700 mb-1">Company Address</label><textarea value={formData.previousCompany.address} onChange={(e) => handleNestedChange("previousCompany", null, "address", e.target.value)} rows="2" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" placeholder="Street Address, City, District, State, Pincode"></textarea></div>
                                        <div className="lg:col-span-3"><label className="block text-xs font-bold text-gray-700 mb-1">Describe Reason behind Leaving Current/Last Job</label><textarea value={formData.previousCompany.reasonForLeaving} onChange={(e) => handleNestedChange("previousCompany", null, "reasonForLeaving", e.target.value)} rows="2" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"></textarea></div>
                                        <div className="lg:col-span-3"><label className="block text-xs font-bold text-gray-700 mb-1">Company LinkedIn Profile Link</label><input type="url" value={formData.previousCompany.linkedInProfile} onChange={(e) => handleNestedChange("previousCompany", null, "linkedInProfile", e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="md:col-span-2"><h4 className="font-bold text-gray-800 text-lg border-b pb-2">Experience Documents</h4></div>
                                        
                                        <div className="border rounded-xl p-4 bg-gray-50">
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Upload Last Job Offer Letter</label>
                                            <p className="text-[10px] text-gray-500 mb-2">Max 10 MB (PDF/Image)</p>
                                            <input type="file" name="offerLetterFile" onChange={handleFileChange} className="text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1.5 w-full cursor-pointer hover:file:bg-blue-700" />
                                        </div>
                                        <div className="border rounded-xl p-4 bg-gray-50">
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Upload Experience Letter</label>
                                            <p className="text-[10px] text-gray-500 mb-2">Max 10 MB (PDF/Image)</p>
                                            <input type="file" name="experienceLetterFile" onChange={handleFileChange} className="text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1.5 w-full cursor-pointer hover:file:bg-blue-700" />
                                        </div>
                                        <div className="border rounded-xl p-4 bg-gray-50">
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Upload Relieving Letter</label>
                                            <p className="text-[10px] text-gray-500 mb-2">Max 10 MB (PDF/Image)</p>
                                            <input type="file" name="relievingLetterFile" onChange={handleFileChange} className="text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1.5 w-full cursor-pointer hover:file:bg-blue-700" />
                                        </div>
                                        <div className="border rounded-xl p-4 bg-gray-50">
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Upload Salary Slips (Last 3 Months)</label>
                                            <p className="text-[10px] text-red-500 font-semibold mb-2">Create a single PDF file for all 3 salary slips</p>
                                            <input type="file" name="salarySlipsFile" onChange={handleFileChange} className="text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1.5 w-full cursor-pointer hover:file:bg-blue-700" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-10 pt-6 border-t flex items-center justify-between">
                        <button type="button" onClick={prevStep} disabled={currentStep === 1} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                            <ChevronLeft size={20} /> Back
                        </button>

                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 text-lg rounded-full shadow-lg transform hover:-translate-y-0.5 transition-all">
                            {loading ? "Processing..." : currentStep === 4 ? "Final Submit Application" : "Save & Continue"}
                            {currentStep !== 4 && <ChevronRight size={20} />}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
