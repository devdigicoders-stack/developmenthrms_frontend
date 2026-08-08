import React, { useState, useEffect } from 'react';
import { resignationService } from '../../../services/resignationService';
import { toast } from 'react-toastify';
import { LogOut, Search, Filter, CheckCircle, XCircle, Clock, CheckSquare } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ManageResignations = () => {
    const [resignations, setResignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal state
    const [selectedResignation, setSelectedResignation] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(""); // "Approve", "Reject", "Clearance"
    
    // Form state for approval/rejection
    const [remarks, setRemarks] = useState("");
    const [approvedDate, setApprovedDate] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchResignations();
    }, []);

    const fetchResignations = async () => {
        setLoading(true);
        try {
            const data = await resignationService.getAllResignations();
            if (data.success) {
                setResignations(data.resignations);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch resignations');
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (resignation, action) => {
        setSelectedResignation(resignation);
        setActionType(action);
        setRemarks(resignation.remarks || "");
        setApprovedDate(resignation.requestedLastWorkingDay ? new Date(resignation.requestedLastWorkingDay) : new Date());
        setIsActionModalOpen(true);
    };

    const submitAction = async () => {
        setActionLoading(true);
        try {
            if (actionType === "Approve" || actionType === "Reject") {
                const status = actionType === "Approve" ? "Approved" : "Rejected";
                const payload = { status, remarks };
                if (status === "Approved") {
                    if (!approvedDate) {
                        toast.error("Please set the Approved Last Working Day");
                        setActionLoading(false);
                        return;
                    }
                    payload.approvedLastWorkingDay = approvedDate;
                }
                
                const res = await resignationService.updateResignationStatus(selectedResignation._id, payload);
                if (res.success) {
                    toast.success(res.message);
                    setResignations(prev => prev.map(r => r._id === res.resignation._id ? res.resignation : r));
                }
            } else if (actionType === "Clearance") {
                const res = await resignationService.processClearance(selectedResignation._id);
                if (res.success) {
                    toast.success(res.message);
                    fetchResignations(); // Refresh to get updated status
                }
            }
            setIsActionModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredData = resignations.filter(r => {
        const matchesSearch = (r.employeeId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               r.employeeId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === "All" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case "Approved": return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">Approved</span>;
            case "Pending": return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">Pending</span>;
            case "Rejected": return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Rejected</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">{status}</span>;
        }
    };

    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-3 rounded-xl text-red-600">
                            <LogOut size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Manage Resignations</h1>
                            <p className="text-sm text-gray-500">Approve, reject, and process employee exits</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                                <th className="py-4 px-6 font-semibold">Employee</th>
                                <th className="py-4 px-6 font-semibold">Department</th>
                                <th className="py-4 px-6 font-semibold">Req. Last Day</th>
                                <th className="py-4 px-6 font-semibold">App. Last Day</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold">Clearance</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-500">
                                        No resignations found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                                                    {item.employeeId?.profilePic?.url ? (
                                                        <img src={item.employeeId.profilePic.url} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{item.employeeId?.firstName?.[0]}{item.employeeId?.lastName?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.employeeId?.firstName} {item.employeeId?.lastName}</p>
                                                    <p className="text-xs text-gray-500">{item.employeeId?.employeeCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-900">{item.employeeId?.department?.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{item.employeeId?.designation?.name || 'N/A'}</p>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-900">
                                            {new Date(item.requestedLastWorkingDay).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium">
                                            {item.approvedLastWorkingDay ? new Date(item.approvedLastWorkingDay).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="py-4 px-6">
                                            {item.clearanceStatus === "Completed" ? (
                                                <span className="text-emerald-600 flex items-center gap-1 text-sm font-medium"><CheckCircle size={16}/> Cleared</span>
                                            ) : (
                                                <span className="text-gray-400 flex items-center gap-1 text-sm"><Clock size={16}/> Pending</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {item.status === "Pending" && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleActionClick(item, "Approve")}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Approve & Set Date"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleActionClick(item, "Reject")}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                {item.status === "Approved" && item.clearanceStatus === "Pending" && (
                                                    <button 
                                                        onClick={() => handleActionClick(item, "Clearance")}
                                                        className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                                                    >
                                                        <CheckSquare size={14} /> Process Exit
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal */}
            {isActionModalOpen && selectedResignation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className={`p-5 text-white ${
                            actionType === 'Approve' ? 'bg-emerald-600' : 
                            actionType === 'Reject' ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                            <h3 className="text-lg font-bold">
                                {actionType === 'Clearance' ? 'Process Exit Clearance' : `${actionType} Resignation`}
                            </h3>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">{selectedResignation.employeeId?.firstName} {selectedResignation.employeeId?.lastName}</p>
                                <p className="text-xs text-gray-500 mt-1">Reason: {selectedResignation.reason}</p>
                                <p className="text-xs text-gray-500 mt-1">Requested Date: {new Date(selectedResignation.requestedLastWorkingDay).toLocaleDateString()}</p>
                            </div>

                            {actionType === 'Approve' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Set Approved Last Working Day <span className="text-red-500">*</span></label>
                                    <DatePicker
                                        selected={approvedDate}
                                        onChange={(date) => setApprovedDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            )}

                            {(actionType === 'Approve' || actionType === 'Reject') && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks (Optional)</label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        rows="3"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                        placeholder="Add any notes for the employee..."
                                    ></textarea>
                                </div>
                            )}

                            {actionType === 'Clearance' && (
                                <div className="text-sm text-gray-600">
                                    <p>Are you sure you want to process the exit clearance for this employee?</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-red-600 font-medium">
                                        <li>Their account will be deactivated immediately.</li>
                                        <li>They will no longer be able to log in.</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button 
                                onClick={() => setIsActionModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitAction}
                                disabled={actionLoading}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2 ${
                                    actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                                    actionType === 'Reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {actionLoading ? "Processing..." : `Confirm ${actionType}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageResignations;
