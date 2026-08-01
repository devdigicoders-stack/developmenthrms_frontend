import React, { useEffect, useState } from "react";
import api from "../../../services/axios";
import { toast } from "react-toastify";
import { Printer, CheckCircle } from "lucide-react";

export default function OfferLetter() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOfferLetter = async () => {
            try {
                const res = await api.get("/api/onboarding/my-offer-letter");
                setData(res.data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load offer letter");
            } finally {
                setLoading(false);
            }
        };
        fetchOfferLetter();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Offer Letter...</div>;
    if (!data) return <div className="p-8 text-center text-red-500 font-bold">Offer Letter not available.</div>;

    const { user, company, ctc, basic } = data;
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', dateOptions);
    const joinDate = new Date(user.dateOfJoining).toLocaleDateString('en-US', dateOptions);
    const currentYear = new Date().getFullYear();

    return (
        <div className="p-4 md:p-8 w-full h-full bg-gray-50 flex flex-col items-center overflow-y-auto">
            {/* Toolbar - hidden on print */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">My Offer Letter</h1>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-all"
                >
                    <Printer size={18} /> Print / Save PDF
                </button>
            </div>

            {/* Letter Paper */}
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-none md:rounded-lg border border-gray-200 p-8 md:p-16 print:shadow-none print:border-none print:p-0">
                {/* Header / Letterhead */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                    <div>
                        {company?.icon?.url ? (
                            <img src={company.icon.url} alt="Company Logo" className="h-16 object-contain" />
                        ) : (
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{company?.name || "Company Name"}</h2>
                        )}
                    </div>
                    <div className="text-right text-gray-600 text-sm">
                        <p className="font-bold text-gray-800">{company?.name || "HR Department"}</p>
                        <p>{company?.address || "Company Address Here"}</p>
                        <p>{company?.email || "hr@company.com"}</p>
                        <p>{company?.phone || "+91 XXXXXXXXXX"}</p>
                    </div>
                </div>

                {/* Date & Ref */}
                <div className="flex justify-between items-center text-sm font-medium mb-8">
                    <p>Date: {today}</p>
                    <p>Ref: HRMS/OL/{currentYear}/{user.firstName?.substring(0,3).toUpperCase()}</p>
                </div>

                {/* Greeting */}
                <div className="mb-6">
                    <p className="font-bold text-gray-900">To,</p>
                    <p className="font-bold text-lg text-gray-800">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-700">{user.email}</p>
                    <p className="text-gray-700">{user.phone}</p>
                </div>

                {/* Subject */}
                <div className="text-center font-bold text-xl underline underline-offset-4 mb-8">
                    Letter of Offer and Employment
                </div>

                {/* Body */}
                <div className="space-y-4 text-gray-800 leading-relaxed text-justify">
                    <p>
                        Dear <strong>{user.firstName}</strong>,
                    </p>
                    <p>
                        Following our recent discussions, we are delighted to offer you employment with <strong>{company?.name || "our organization"}</strong>. We believe that your skills and experience will be a valuable asset to our team.
                    </p>
                    <p>
                        Your employment will commence on or before <strong>{joinDate}</strong>.
                    </p>
                    
                    <h3 className="font-bold text-gray-900 mt-6 mb-2">Compensation & Benefits</h3>
                    <p>
                        Your Total Cost to Company (CTC) has been fixed at <strong>₹{ctc?.toLocaleString("en-IN")} per month</strong>. 
                        Your monthly Basic Salary will be <strong>₹{basic?.toLocaleString("en-IN")}</strong>. The detailed salary structure including allowances and statutory deductions (if applicable) is available in your payroll portal.
                    </p>

                    <h3 className="font-bold text-gray-900 mt-6 mb-2">Probation & Policies</h3>
                    <p>
                        You will be on a probation period of standard duration from your date of joining. Your employment will be governed by the standard policies, rules, and regulations of the company, which may be updated from time to time.
                    </p>
                    
                    <p>
                        We are excited to have you join our team and look forward to a mutually rewarding association. Please accept this offer by confirming on the HRMS portal.
                    </p>
                </div>

                {/* Signatures */}
                <div className="mt-16 flex justify-between items-end">
                    <div>
                        <div className="mb-2">
                            <span className="font-[signature] text-3xl text-blue-900">Authorized Signatory</span>
                        </div>
                        <div className="h-0.5 w-48 bg-gray-400 mb-1"></div>
                        <p className="font-bold text-gray-900">Human Resources</p>
                        <p className="text-sm text-gray-600">{company?.name || "Company"}</p>
                    </div>

                    <div className="text-center">
                        <div className="flex justify-center mb-2 text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <p className="text-sm text-gray-600 italic">Digitally Approved via HRMS</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
