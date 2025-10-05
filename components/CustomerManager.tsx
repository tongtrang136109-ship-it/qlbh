
import React, { useState } from 'react';
import type { Customer } from '../types';
import { PlusIcon, PencilSquareIcon } from './common/Icons';

const CustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Customer) => void;
    customer: Customer | null;
}> = ({ isOpen, onClose, onSave, customer }) => {
    const [formData, setFormData] = useState<Omit<Customer, 'id'>>(() => 
        customer ? { ...customer } : { name: '', phone: '', vehicle: '', licensePlate: '', loyaltyPoints: 0 }
    );
    
    React.useEffect(() => {
        setFormData(customer ? { ...customer } : { name: '', phone: '', vehicle: '', licensePlate: '', loyaltyPoints: 0 });
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCustomer: Customer = {
            id: customer?.id || `C${String(Math.floor(Math.random() * 900) + 100)}`,
            ...formData,
        };
        onSave(finalCustomer);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">{customer ? 'Chỉnh sửa Khách hàng' : 'Thêm Khách hàng mới'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="customer-name" className="block text-sm font-medium text-slate-700">Tên khách hàng</label>
                                <input id="customer-name" type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" required />
                            </div>
                            <div>
                                <label htmlFor="customer-phone" className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                                <input id="customer-phone" type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="customer-vehicle" className="block text-sm font-medium text-slate-700">Dòng xe</label>
                                    <input id="customer-vehicle" type="text" name="vehicle" value={formData.vehicle} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                </div>
                                <div>
                                    <label htmlFor="customer-licensePlate" className="block text-sm font-medium text-slate-700">Biển số xe</label>
                                    <input id="customer-licensePlate" type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="customer-loyaltyPoints" className="block text-sm font-medium text-slate-700">Điểm tích lũy</label>
                                <input id="customer-loyaltyPoints" type="number" name="loyaltyPoints" value={formData.loyaltyPoints} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CustomerManagerProps {
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, setCustomers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const handleOpenModal = (customer: Customer | null = null) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSaveCustomer = (customer: Customer) => {
        if (selectedCustomer) {
            setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
        } else {
            setCustomers(prev => [customer, ...prev]);
        }
        handleCloseModal();
    };

    return (
        <div className="space-y-6">
            <CustomerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveCustomer}
                customer={selectedCustomer}
            />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Quản lý Khách hàng</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
                    <PlusIcon />
                    <span className="ml-2 hidden sm:inline">Thêm Khách hàng</span>
                    <span className="ml-2 sm:hidden">Mới</span>
                </button>
            </div>
            
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {customers.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-slate-800">{c.name}</p>
                                <p className="text-sm text-slate-500">{c.phone}</p>
                            </div>
                            <button onClick={() => handleOpenModal(c)} className="text-sky-600 hover:text-sky-800 p-1">
                                <PencilSquareIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="mt-2 text-sm">
                            <p className="text-slate-700">{c.vehicle} - {c.licensePlate}</p>
                            <p className="text-slate-700">Điểm: <span className="font-bold text-green-600">{c.loyaltyPoints}</span></p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="border-b border-slate-200">
                        <tr className="bg-slate-50">
                            <th className="p-4 font-semibold text-slate-600">Tên Khách hàng</th>
                            <th className="p-4 font-semibold text-slate-600">Số điện thoại</th>
                            <th className="p-4 font-semibold text-slate-600">Xe</th>
                            <th className="p-4 font-semibold text-slate-600">Biển số</th>
                            <th className="p-4 font-semibold text-slate-600">Điểm</th>
                            <th className="p-4 font-semibold text-slate-600">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-4 font-semibold text-slate-900">{c.name}</td>
                                <td className="p-4 text-slate-700">{c.phone}</td>
                                <td className="p-4 text-slate-700">{c.vehicle}</td>
                                <td className="p-4 text-slate-700">{c.licensePlate}</td>
                                <td className="p-4 text-green-600 font-bold">{c.loyaltyPoints}</td>
                                <td className="p-4">
                                    <button onClick={() => handleOpenModal(c)} className="text-sky-600 hover:text-sky-800">
                                        <PencilSquareIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerManager;
