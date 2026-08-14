import React, { useState, useEffect } from 'react';
import { resignationService } from '../../../services/resignationService';
import { toast } from 'react-toastify';
import { Send, FileText, CalendarClock, Info, LogOut } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const MyResignation = () => {
    const [resignation, setResignation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [reason, setReason] = useState("");
    const [requestedDate, setRequestedDate] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);

    useEffect(() => {
        fetchMyResignation();
    }, []);

    const fetchMyResignation = async () => {
        setLoading(true);
        try {
            const data = await resignationService.getMyResignation();
            if (data.success && data.resignations.length > 0) {
                // If there's any active one, show it. Otherwise show the latest.
                const active = data.resignations.find(r => ["Pending", "Approved"].includes(r.status));
                setResignation(active || data.resignations[0]);
                setShowNewForm(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch resignation data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason || !requestedDate) {
            toast.error("Please provide a reason and select a requested last working day.");
            return;
        }

        setSubmitting(true);
        try {
            const data = await resignationService.submitResignation({
                reason,
                requestedLastWorkingDay: requestedDate
            });
            if (data.success) {
                toast.success(data.message);
                setResignation(data.resignation);
                setShowNewForm(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit resignation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
        );
    }

    const showForm = !resignation || showNewForm;

    return (
        <div className="p-4 sm:p-6 min-h-full flex flex-col items-center max-w-4xl mx-auto w-full pb-20">
            
            {showForm ? (
                <div className="bg-white w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/20 p-4 rounded-full">
                                <LogOut size={48} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center">Submit Resignation</h2>
                        <p className="text-red-100 text-center mt-2 text-sm">
                            We are sorry to see you go. Please provide the details for your resignation request.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Requested Last Working Day</label>
                            <DatePicker
                                selected={requestedDate}
                                onChange={(date) => setRequestedDate(date)}
                                minDate={new Date()}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select your preferred last working day"
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-red-500 block px-4 py-3"
                                wrapperClassName="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Note: Your final last working day will be decided and set by the Admin/HR as per the company's notice period policy.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Resignation</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows="4"
                                placeholder="Please provide your reason for leaving..."
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-red-500 block px-4 py-3 resize-none"
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center gap-2"
                            >
                                <Send size={18} />
                                {submitting ? "Submitting..." : "Submit Resignation"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className={`relative p-8 text-white overflow-hidden ${
                        resignation.status === 'Approved' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                        resignation.status === 'Pending' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                        resignation.status === 'Rejected' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                        'bg-gradient-to-br from-gray-500 to-slate-600'
                    }`}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
                            <LogOut size={120} />
                        </div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight mb-1">Resignation Request</h2>
                                <p className="opacity-90 text-sm font-medium">Your request is currently {resignation.status.toLowerCase()}.</p>
                            </div>
                            <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-sm">
                                {resignation.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Requested Date */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all hover:shadow-lg">
                                <div className="flex items-center gap-3 mb-4 text-gray-600">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                        <CalendarClock size={22} />
                                    </div>
                                    <h3 className="font-semibold text-gray-700">Requested Last Day</h3>
                                </div>
                                <p className="text-2xl font-black text-gray-900 ml-1">
                                    {new Date(resignation.requestedLastWorkingDay).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            
                            {/* Approved Date */}
                            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
                                resignation.status === 'Approved' ? 'bg-emerald-50/50 border-emerald-100 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)]' : 
                                resignation.status === 'Rejected' ? 'bg-red-50/50 border-red-100 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.1)]' : 
                                'bg-gray-50/50 border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]'
                            }`}>
                                <div className={`flex items-center gap-3 mb-4 ${
                                    resignation.status === 'Approved' ? 'text-emerald-600' : 
                                    resignation.status === 'Rejected' ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                    <div className={`p-2.5 rounded-xl ${
                                        resignation.status === 'Approved' ? 'bg-emerald-100' : 
                                        resignation.status === 'Rejected' ? 'bg-red-100' : 'bg-gray-200'
                                    }`}>
                                        <CalendarClock size={22} />
                                    </div>
                                    <h3 className="font-semibold">Approved Last Day</h3>
                                </div>
                                <p className={`text-2xl font-black ml-1 ${
                                    resignation.status === 'Approved' ? 'text-emerald-900' : 
                                    resignation.status === 'Rejected' ? 'text-red-900' : 'text-gray-500'
                                }`}>
                                    {resignation.status === 'Rejected' ? 'Not Applicable' : 
                                     resignation.approvedLastWorkingDay 
                                        ? new Date(resignation.approvedLastWorkingDay).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                        : <span className="text-lg italic font-semibold">Pending Approval...</span>}
                                </p>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-700 mb-3">
                                <FileText size={18} />
                                <h3 className="font-bold text-sm uppercase tracking-wider">Your Reason</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed italic bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                "{resignation.reason}"
                            </p>
                        </div>

                        {/* Admin Remarks */}
                        {resignation.remarks && (
                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                <div className="flex items-center gap-2 text-blue-700 mb-3">
                                    <Info size={18} />
                                    <h3 className="font-bold text-sm uppercase tracking-wider">Admin Remarks</h3>
                                </div>
                                <p className="text-blue-900 leading-relaxed bg-white/60 p-4 rounded-xl border border-blue-50 shadow-sm">
                                    {resignation.remarks}
                                </p>
                            </div>
                        )}
                        
                        {resignation.clearanceStatus === "Completed" && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-semibold text-center shadow-sm">
                                Your exit clearance has been completed.
                            </div>
                        )}

                        {resignation.status === "Rejected" && (
                            <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-gray-500 text-sm font-medium">Your resignation was rejected. You can submit a new request if needed.</p>
                                <button
                                    onClick={() => setShowNewForm(true)}
                                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-2"
                                >
                                    <Send size={16} /> Submit New Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyResignation;
