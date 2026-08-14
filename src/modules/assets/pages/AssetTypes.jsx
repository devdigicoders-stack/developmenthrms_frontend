import React, { useState, useEffect } from 'react';
import { assetTypeService } from '../../../services/assetTypeService';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, ShieldCheck, HardDrive } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import DataTable from '../../../Components/DataTable';
import FormModal from '../../../Components/FormModal';
import ConfirmationModal from '../../../Components/ConfirmationModal';

const AssetTypes = () => {
    const { user } = useStore();
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [currentType, setCurrentType] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await assetTypeService.getAssetTypes();
            if (res.success) setTypes(res.assetTypes || []);
        } catch (error) {
            toast.error("Failed to load asset types");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (type) => {
        setCurrentType(type);
        setIsModalOpen(true);
    };

    const handleDelete = (type) => {
        setCurrentType(type);
        setIsConfirmOpen(true);
    };

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            if (currentType) {
                const res = await assetTypeService.updateAssetType(currentType._id, formData);
                if (res.success) {
                    toast.success("Asset type updated successfully");
                    fetchTypes();
                    setIsModalOpen(false);
                }
            } else {
                const res = await assetTypeService.createAssetType(formData);
                if (res.success) {
                    toast.success("Asset type created successfully");
                    fetchTypes();
                    setIsModalOpen(false);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        try {
            const res = await assetTypeService.deleteAssetType(currentType._id);
            if (res.success) {
                toast.success("Asset type deleted");
                fetchTypes();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete");
        } finally {
            setIsConfirmOpen(false);
        }
    };

    const columns = [
        {
            header: "Name",
            accessor: (row) => <span className="font-semibold text-gray-800">{row.name}</span>
        },
        {
            header: "Description",
            accessor: (row) => <span className="text-gray-600">{row.description || "N/A"}</span>
        },
        {
            header: "Actions",
            accessor: (row) => (
                <div className="flex gap-3">
                    <button onClick={() => handleEdit(row)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(row)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 bg-gray-50 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HardDrive size={24} className="text-blue-600" />
                        Asset Types
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage dynamic asset types for your organization.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                    <Plus size={18} /> Add Asset Type
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={types}
                    loading={loading}
                    emptyMessage="No asset types found. Create one!"
                />
            </div>

            <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentType ? "Edit Asset Type" : "Add Asset Type"}
                fields={[
                    { name: "name", label: "Asset Type Name (e.g. Laptop, Monitor)", type: "text" },
                    { name: "description", label: "Description (Optional)", type: "textarea" }
                ]}
                initialData={currentType || {}}
                onSubmit={handleSubmit}
                submitLoading={submitting}
            />

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Asset Type"
                message={`Are you sure you want to delete "${currentType?.name}"? If there are assets already assigned to this type, the deletion will be rejected by the server.`}
            />
        </div>
    );
};

export default AssetTypes;
