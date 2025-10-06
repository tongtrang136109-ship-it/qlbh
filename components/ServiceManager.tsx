
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { WorkOrder, Part, User, StoreSettings, WorkOrderPart, Customer } from '../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, PrinterIcon, XMarkIcon } from './common/Icons';

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const NewCustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Customer) => void;
    initialName?: string;
}> = ({ isOpen, onClose, onSave, initialName = '' }) => {
    const [formData, setFormData] = useState<Omit<Customer, 'id' | 'loyaltyPoints'>>({ name: initialName, phone: '', vehicle: '', licensePlate: '' });
    
    React.useEffect(() => {
        if(isOpen) {
            setFormData({ name: initialName, phone: '', vehicle: '', licensePlate: '' });
        }
    }, [isOpen, initialName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCustomer: Customer = {
            id: `C${Date.now()}`,
            ...formData,
            loyaltyPoints: 0,
        };
        onSave(finalCustomer);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Thêm Khách hàng mới</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="new-customer-name" className="block text-sm font-medium text-slate-700">Tên khách hàng (*)</label>
                                <input id="new-customer-name" type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" required autoFocus />
                            </div>
                            <div>
                                <label htmlFor="new-customer-phone" className="block text-sm font-medium text-slate-700">Số điện thoại (*)</label>
                                <input id="new-customer-phone" type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="new-customer-vehicle" className="block text-sm font-medium text-slate-700">Dòng xe</label>
                                    <input id="new-customer-vehicle" type="text" name="vehicle" value={formData.vehicle} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                </div>
                                <div>
                                    <label htmlFor="new-customer-licensePlate" className="block text-sm font-medium text-slate-700">Biển số xe</label>
                                    <input id="new-customer-licensePlate" type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                </div>
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

// --- WorkOrder Modal for Processing/Editing ---
const WorkOrderModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (workOrder: WorkOrder) => void;
    workOrder: WorkOrder | null;
    parts: Part[];
    currentBranchId: string;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}> = ({ isOpen, onClose, onSave, workOrder, parts, currentBranchId, customers, setCustomers }) => {
    const [formData, setFormData] = useState<Omit<WorkOrder, 'id' | 'creationDate' | 'total'>>(() => {
        const defaults = {
            customerName: '', customerPhone: '', vehicleModel: '', licensePlate: '', issueDescription: '',
            technicianName: '', status: 'Tiếp nhận' as const, laborCost: 0, partsUsed: [], notes: '',
            branchId: currentBranchId,
            discount: 0,
        };
        return workOrder ? { ...workOrder } : defaults;
    });
    
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
    const customerInputRef = useRef<HTMLDivElement>(null);

    const getStatusColorClass = (status: WorkOrder['status']) => {
        switch (status) {
            case 'Tiếp nhận': return 'bg-slate-200 text-slate-800 border-slate-300';
            case 'Đang sửa': return 'bg-sky-100 text-sky-800 border-sky-300';
            case 'Đã sửa xong': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Trả máy': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    useEffect(() => {
        const defaults = {
            customerName: '', customerPhone: '', vehicleModel: '', licensePlate: '', issueDescription: '',
            technicianName: '', status: 'Tiếp nhận' as const, laborCost: 0, partsUsed: [], notes: '',
            branchId: currentBranchId,
            discount: 0,
        };
        setFormData(workOrder ? { ...workOrder } : defaults);
        setCustomerSearch(workOrder ? workOrder.customerName : '');
    }, [workOrder, currentBranchId]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
                setIsCustomerListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        return customers.filter(c => 
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
            c.phone.includes(customerSearch)
        );
    }, [customers, customerSearch]);
    
    const handleSelectCustomer = (customer: Customer) => {
        setFormData(prev => ({
            ...prev,
            customerName: customer.name,
            customerPhone: customer.phone,
            vehicleModel: customer.vehicle,
            licensePlate: customer.licensePlate
        }));
        setCustomerSearch(customer.name);
        setIsCustomerListOpen(false);
    };

    const handleSaveNewCustomer = (newCustomer: Customer) => {
        setCustomers(prev => [newCustomer, ...prev]);
        handleSelectCustomer(newCustomer);
        setIsNewCustomerModalOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'laborCost' || name === 'discount' ? parseFloat(value) || 0 : value }));
    };

    const handleAddPart = (part: Part) => {
        if (!part) return;
        setFormData(prev => {
            const existingPart = prev.partsUsed?.find(p => p.partId === part.id);
            if (existingPart) {
                return {
                    ...prev,
                    partsUsed: prev.partsUsed?.map(p => p.partId === part.id ? { ...p, quantity: p.quantity + 1 } : p)
                };
            }
            const newPart: WorkOrderPart = {
                partId: part.id,
                partName: part.name,
                sku: part.sku,
                quantity: 1,
                price: part.sellingPrice, // Charge customer the selling price
            };
            return { ...prev, partsUsed: [...(prev.partsUsed || []), newPart] };
        });
    };

    const handleRemovePart = (partId: string) => {
        setFormData(prev => ({ ...prev, partsUsed: prev.partsUsed?.filter(p => p.partId !== partId) }));
    };
    
    const handlePartQuantityChange = (partId: string, newQuantity: number) => {
         setFormData(prev => ({
            ...prev,
            partsUsed: prev.partsUsed?.map(p => p.partId === partId ? { ...p, quantity: newQuantity } : p).filter(p => p.quantity > 0)
        }));
    }

    const totalPartsCost = useMemo(() =>
        formData.partsUsed?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0,
        [formData.partsUsed]
    );

    const total = (formData.laborCost || 0) + totalPartsCost - (formData.discount || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalWorkOrder: WorkOrder = {
            id: workOrder?.id || `S${String(Math.floor(Math.random() * 900) + 100)}`,
            creationDate: workOrder?.creationDate || new Date().toISOString().split('T')[0],
            ...formData,
            branchId: formData.branchId || currentBranchId,
            total,
        };
        onSave(finalWorkOrder);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <NewCustomerModal 
                isOpen={isNewCustomerModalOpen}
                onClose={() => setIsNewCustomerModalOpen(false)}
                onSave={handleSaveNewCustomer}
                initialName={customerSearch}
            />
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">{workOrder ? `Xử lý Phiếu Sửa chữa #${workOrder.id}` : 'Tạo Phiếu Sửa chữa mới'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer & Vehicle Info */}
                            <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                                <h3 className="font-semibold text-lg text-slate-700">Thông tin Khách hàng & Xe</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div ref={customerInputRef} className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">Khách hàng <span className="text-red-500">*</span></label>
                                        <div className="relative mt-1">
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    placeholder="Tìm hoặc thêm khách hàng..."
                                                    value={customerSearch}
                                                    onChange={e => {
                                                        setCustomerSearch(e.target.value);
                                                        setIsCustomerListOpen(true);
                                                        setFormData(prev => ({ ...prev, customerName: e.target.value, customerPhone: '', vehicleModel: '', licensePlate: '' }));
                                                    }}
                                                    onFocus={() => setIsCustomerListOpen(true)}
                                                    className="w-full p-2 border border-slate-300 rounded-l-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                                    required
                                                />
                                                <button type="button" onClick={() => setIsNewCustomerModalOpen(true)} className="p-2 border-t border-b border-r rounded-r-md h-[42px] bg-slate-100 hover:bg-slate-200" title="Thêm khách hàng mới">
                                                    <PlusIcon />
                                                </button>
                                            </div>
                                            {isCustomerListOpen && (
                                                <div className="absolute z-20 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                                                    {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                                        <div key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-slate-100 cursor-pointer text-sm">
                                                            <p className="font-semibold">{c.name}</p>
                                                            <p className="text-slate-500">{c.phone}</p>
                                                        </div>
                                                    )) : (
                                                        <div className="p-2 text-sm text-slate-500">Không tìm thấy khách hàng.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="wo-vehicleModel" className="block text-sm font-medium text-slate-700">Dòng xe</label>
                                        <input id="wo-vehicleModel" type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Honda Air Blade" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" required />
                                    </div>
                                    <div>
                                        <label htmlFor="wo-licensePlate" className="block text-sm font-medium text-slate-700">Biển số xe</label>
                                        <input id="wo-licensePlate" type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="59-A1 123.45" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="wo-issueDescription" className="block text-sm font-medium text-slate-700">Mô tả sự cố</label>
                                    <textarea id="wo-issueDescription" name="issueDescription" value={formData.issueDescription} onChange={handleChange} placeholder="Bảo dưỡng định kỳ, thay nhớt..." rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" required />
                                </div>
                            </div>
                            {/* Service Info */}
                            <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                                <h3 className="font-semibold text-lg text-slate-700">Thông tin Dịch vụ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="wo-status" className="block text-sm font-medium text-slate-700">Trạng thái</label>
                                        <select
                                            id="wo-status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-semibold transition-colors ${getStatusColorClass(formData.status)}`}
                                        >
                                            <option value="Tiếp nhận">Tiếp nhận</option>
                                            <option value="Đang sửa">Đang sửa</option>
                                            <option value="Đã sửa xong">Đã sửa xong</option>
                                            <option value="Trả máy">Trả máy</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="wo-technicianName" className="block text-sm font-medium text-slate-700">Kỹ thuật viên</label>
                                        <input id="wo-technicianName" type="text" name="technicianName" value={formData.technicianName} onChange={handleChange} placeholder="Trần Văn An" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="wo-laborCost" className="block text-sm font-medium text-slate-700">Phí dịch vụ (công thợ)</label>
                                    <input id="wo-laborCost" type="number" name="laborCost" value={formData.laborCost || ''} onChange={handleChange} placeholder="100000" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                </div>
                                <div>
                                    <label htmlFor="wo-notes" className="block text-sm font-medium text-slate-700">Ghi chú nội bộ</label>
                                    <textarea id="wo-notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="VD: Khách yêu cầu kiểm tra thêm hệ thống điện" rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                </div>
                            </div>
                        </div>
                        {/* Parts Used */}
                        <div className="mt-6 p-4 border border-slate-200 rounded-lg">
                             <h3 className="font-semibold text-lg text-slate-700 mb-4">Phụ tùng sử dụng</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <select onChange={(e) => handleAddPart(parts.find(p => p.id === e.target.value) as Part)} className="p-2 border border-slate-300 rounded w-full text-slate-900 bg-white focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                                        <option value="">-- Chọn phụ tùng để thêm --</option>
                                        {parts.filter(p => (p.stock[currentBranchId] || 0) > 0).map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Tồn kho: {p.stock[currentBranchId]}</option>)}
                                    </select>
                                </div>
                             </div>
                             <div className="max-h-48 overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100"><tr><th className="p-2 font-semibold text-slate-700">Tên</th><th className="p-2 font-semibold text-slate-700">SL</th><th className="p-2 font-semibold text-slate-700">Đơn giá</th><th className="p-2 font-semibold text-slate-700">Thành tiền</th><th className="p-2"></th></tr></thead>
                                    <tbody>
                                        {formData.partsUsed?.map(p => (
                                            <tr key={p.partId} className="border-b border-slate-200">
                                                <td className="p-2 font-medium text-slate-800">{p.partName}</td>
                                                <td className="p-2"><input type="number" value={p.quantity} onChange={(e) => handlePartQuantityChange(p.partId, parseInt(e.target.value))} min="1" className="w-16 p-1 border border-slate-300 rounded text-slate-900 bg-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"/></td>
                                                <td className="p-2 text-slate-700">{formatCurrency(p.price)}</td>
                                                <td className="p-2 text-slate-900 font-semibold">{formatCurrency(p.price * p.quantity)}</td>
                                                <td className="p-2 text-right"><button type="button" onClick={() => handleRemovePart(p.partId)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 text-right space-y-1">
                                <p className="text-slate-700">Phí dịch vụ: <span className="font-semibold text-slate-900">{formatCurrency(formData.laborCost || 0)}</span></p>
                                <p className="text-slate-700">Tiền phụ tùng: <span className="font-semibold text-slate-900">{formatCurrency(totalPartsCost)}</span></p>
                                <div className="flex justify-end items-center gap-4">
                                    <label htmlFor="wo-discount" className="text-slate-700 font-medium">Giảm giá:</label>
                                    <input 
                                        id="wo-discount" 
                                        type="number" 
                                        name="discount" 
                                        value={formData.discount || ''} 
                                        onChange={handleChange} 
                                        placeholder="0" 
                                        className="w-32 px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 text-right" 
                                    />
                                </div>
                                <p className="text-xl font-bold text-slate-900">Tổng cộng: <span className="text-sky-600">{formatCurrency(total)}</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700">Lưu Phiếu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PrintInvoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    workOrder: WorkOrder | null;
    settings: StoreSettings;
}> = ({ isOpen, onClose, workOrder, settings }) => {
    if (!isOpen || !workOrder) return null;

    const handlePrint = () => {
        const printContents = document.getElementById('invoice-print-area')?.innerHTML;
        const originalContents = document.body.innerHTML;
        if (printContents) {
            const printStyles = `
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');
                    body { 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        color: #1e293b; /* slate-800 */
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px 12px; border: 1px solid #e2e8f0; /* slate-200 */ text-align: left; }
                    th { background-color: #f8fafc !important; /* slate-50 */ }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: 700; }
                    .text-lg { font-size: 1.125rem; }
                    .mt-4 { margin-top: 1rem; }
                    .mb-4 { margin-bottom: 1rem; }
                </style>
            `;
            document.body.innerHTML = printStyles + printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); 
        }
    };
    
    const partsTotal = workOrder.partsUsed?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0;
    const branchName = settings.branches.find(b => b.id === workOrder.branchId)?.name || 'N/A';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 print:hidden">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all my-8 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center">HÓA ĐƠN DỊCH VỤ</h2>
                </div>
                <div className="p-6 overflow-y-auto" id="invoice-print-area">
                    <div className="text-center mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{settings.name}</h3>
                        <p className="text-slate-700">{branchName} - {settings.address}</p>
                        <p className="text-slate-700">ĐT: {settings.phone}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-200 py-4">
                        <div>
                            <p><span className="font-semibold text-slate-800">Mã Phiếu:</span> {workOrder.id}</p>
                            <p><span className="font-semibold text-slate-800">Ngày tạo:</span> {workOrder.creationDate}</p>
                            <p><span className="font-semibold text-slate-800">Kỹ thuật viên:</span> {workOrder.technicianName}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold text-slate-800">Khách hàng:</span> {workOrder.customerName}</p>
                            <p><span className="font-semibold text-slate-800">Điện thoại:</span> {workOrder.customerPhone}</p>
                            <p><span className="font-semibold text-slate-800">Xe:</span> {workOrder.vehicleModel} ({workOrder.licensePlate})</p>
                        </div>
                    </div>
                     <p className="mt-4"><span className="font-semibold text-slate-800">Yêu cầu của khách:</span> {workOrder.issueDescription}</p>
                     
                    <div className="mt-6">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-2 font-semibold text-slate-700">#</th>
                                    <th className="p-2 font-semibold text-slate-700">Mô tả</th>
                                    <th className="p-2 font-semibold text-slate-700 text-right">SL</th>
                                    <th className="p-2 font-semibold text-slate-700 text-right">Đơn giá</th>
                                    <th className="p-2 font-semibold text-slate-700 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(workOrder.partsUsed || []).map((part, index) => (
                                    <tr key={part.partId} className="border-b border-slate-200">
                                        <td className="p-2 text-slate-700">{index + 1}</td>
                                        <td className="p-2 text-slate-900 font-medium">{part.partName} <span className="text-slate-600">({part.sku})</span></td>
                                        <td className="p-2 text-slate-900 text-right">{part.quantity}</td>
                                        <td className="p-2 text-slate-900 text-right">{formatCurrency(part.price)}</td>
                                        <td className="p-2 text-slate-900 text-right">{formatCurrency(part.price * part.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-slate-800">
                                <span>Tiền phụ tùng:</span>
                                <span>{formatCurrency(partsTotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-800">
                                <span>Tiền công:</span>
                                <span>{formatCurrency(workOrder.laborCost || 0)}</span>
                            </div>
                            {(workOrder.discount || 0) > 0 && (
                                <div className="flex justify-between text-slate-800">
                                    <span>Giảm giá:</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(workOrder.discount!)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-slate-300 pt-2">
                                <span>TỔNG CỘNG:</span>
                                <span>{formatCurrency(workOrder.total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center mt-8 text-sm text-slate-700">
                        <p>Cảm ơn quý khách đã sử dụng dịch vụ của {settings.name}!</p>
                        <p>Thông tin thanh toán: {settings.bankName} - {settings.bankAccountNumber} - {settings.bankAccountHolder}</p>
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">Đóng</button>
                    <button onClick={handlePrint} className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700">
                        <PrinterIcon className="w-5 h-5 mr-2"/> In hóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main ServiceManager Component ---
interface ServiceManagerProps {
    currentUser: User;
    workOrders: WorkOrder[];
    setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
    parts: Part[];
    storeSettings: StoreSettings;
    currentBranchId: string;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ currentUser, workOrders, setWorkOrders, parts, storeSettings, currentBranchId, customers, setCustomers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceWorkOrder, setInvoiceWorkOrder] = useState<WorkOrder | null>(null);
    
    const handleOpenModal = (workOrder: WorkOrder | null = null) => {
        setSelectedWorkOrder(workOrder);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorkOrder(null);
    };

    const handleOpenInvoiceModal = (workOrder: WorkOrder) => {
        setInvoiceWorkOrder(workOrder);
        setIsInvoiceModalOpen(true);
    };

    const handleCloseInvoiceModal = () => {
        setIsInvoiceModalOpen(false);
        setInvoiceWorkOrder(null);
    };

    const handleSaveWorkOrder = (workOrder: WorkOrder) => {
        if (selectedWorkOrder) {
            setWorkOrders(prev => prev.map(wo => wo.id === workOrder.id ? workOrder : wo));
        } else {
            setWorkOrders(prev => [workOrder, ...prev]);
        }
        handleCloseModal();
    };

    const handleDeleteWorkOrder = (workOrderId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phiếu sửa chữa này không? Hành động này không thể hoàn tác.')) {
            setWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
        }
    };
    
    const getStatusChip = (status: WorkOrder['status']) => {
        switch (status) {
            case 'Tiếp nhận': return 'bg-slate-200 text-slate-800';
            case 'Đang sửa': return 'bg-sky-100 text-sky-800';
            case 'Đã sửa xong': return 'bg-amber-100 text-amber-800';
            case 'Trả máy': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };
    
    const filteredWorkOrders = useMemo(() => {
        const branchWorkOrders = workOrders.filter(wo => wo.branchId === currentBranchId);
        if (statusFilter === 'all') return branchWorkOrders;
        return branchWorkOrders.filter(wo => wo.status === statusFilter);
    }, [workOrders, statusFilter, currentBranchId]);

    return (
        <div className="space-y-6">
            <WorkOrderModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveWorkOrder}
                workOrder={selectedWorkOrder}
                parts={parts}
                currentBranchId={currentBranchId}
                customers={customers}
                setCustomers={setCustomers}
            />
            <PrintInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={handleCloseInvoiceModal}
                workOrder={invoiceWorkOrder}
                settings={storeSettings}
            />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Quản lý Dịch vụ</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
                    <PlusIcon />
                    <span className="ml-2 hidden sm:inline">Thêm Phiếu</span>
                    <span className="ml-2 sm:hidden">Mới</span>
                </button>
            </div>
            
            <div className="border-b border-slate-200 overflow-x-auto">
                <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                    <button onClick={() => setStatusFilter('all')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'all' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Tất cả</button>
                    <button onClick={() => setStatusFilter('Tiếp nhận')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'Tiếp nhận' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Tiếp nhận</button>
                    <button onClick={() => setStatusFilter('Đang sửa')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'Đang sửa' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Đang sửa</button>
                    <button onClick={() => setStatusFilter('Đã sửa xong')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'Đã sửa xong' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Đã sửa xong</button>
                     <button onClick={() => setStatusFilter('Trả máy')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'Trả máy' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Trả máy</button>
                </nav>
            </div>
            
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {filteredWorkOrders.map(wo => (
                    <div key={wo.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-sky-600">{wo.id}</p>
                                <p className="text-lg font-semibold text-slate-900">{wo.customerName}</p>
                                <p className="text-sm text-slate-600">{wo.customerPhone}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(wo.status)}`}>
                                {wo.status}
                            </span>
                        </div>
                        <div className="mt-3 border-t border-slate-200 pt-3">
                            <p className="text-sm text-slate-800"><span className="font-medium">Xe:</span> {wo.vehicleModel} ({wo.licensePlate})</p>
                            <p className="text-sm text-slate-800"><span className="font-medium">Ngày:</span> {wo.creationDate}</p>
                            <p className="text-base font-bold text-slate-900 mt-2 text-right">
                                {formatCurrency(wo.total)}
                            </p>
                        </div>
                        <div className="mt-3 border-t border-slate-200 pt-3 flex items-center justify-end space-x-3">
                            <button onClick={() => handleOpenInvoiceModal(wo)} className="text-green-600 hover:text-green-800 flex items-center text-sm">
                                <PrinterIcon className="w-5 h-5 mr-1"/>
                                <span>In</span>
                            </button>
                            <button onClick={() => handleDeleteWorkOrder(wo.id)} className="text-red-600 hover:text-red-800 flex items-center text-sm">
                                <TrashIcon className="w-5 h-5 mr-1"/>
                                <span>Xóa</span>
                            </button>
                            <button onClick={() => handleOpenModal(wo)} className="text-sky-600 hover:text-sky-800 flex items-center text-sm font-semibold">
                                <PencilSquareIcon className="w-5 h-5 mr-1"/>
                                <span>Xử lý</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="border-b border-slate-200">
                        <tr className="bg-slate-50">
                            <th className="p-4 font-semibold text-slate-600">Mã Phiếu</th>
                            <th className="p-4 font-semibold text-slate-600">Khách hàng</th>
                            <th className="p-4 font-semibold text-slate-600">Xe</th>
                            <th className="p-4 font-semibold text-slate-600">Ngày tạo</th>
                            <th className="p-4 font-semibold text-slate-600">Trạng thái</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Tổng chi phí</th>
                            <th className="p-4 font-semibold text-slate-600">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorkOrders.map(wo => (
                            <tr key={wo.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-4 font-semibold text-sky-600">{wo.id}</td>
                                <td className="p-4 text-slate-900">{wo.customerName}<br/><span className="text-xs text-slate-600">{wo.customerPhone}</span></td>
                                <td className="p-4 text-slate-800">{wo.vehicleModel}<br/><span className="text-xs text-slate-600">{wo.licensePlate}</span></td>
                                <td className="p-4 text-slate-700">{wo.creationDate}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(wo.status)}`}>
                                        {wo.status}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-900 font-bold text-right">{formatCurrency(wo.total)}</td>
                                <td className="p-4">
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => handleOpenModal(wo)} className="text-sky-600 hover:text-sky-800 flex items-center">
                                            <PencilSquareIcon className="w-5 h-5"/>
                                            <span className="ml-1">Xử lý</span>
                                        </button>
                                        <button onClick={() => handleOpenInvoiceModal(wo)} className="text-green-600 hover:text-green-800 flex items-center">
                                            <PrinterIcon className="w-5 h-5"/>
                                            <span className="ml-1">In</span>
                                        </button>
                                        <button onClick={() => handleDeleteWorkOrder(wo.id)} className="text-red-600 hover:text-red-800 flex items-center">
                                            <TrashIcon className="w-5 h-5"/>
                                            <span className="ml-1">Xóa</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {(filteredWorkOrders.length === 0) && <p className="text-center text-slate-500 py-8">Không có phiếu sửa chữa nào.</p>}
            </div>
             {(filteredWorkOrders.length === 0) && <p className="lg:hidden text-center text-slate-500 py-8">Không có phiếu sửa chữa nào.</p>}
        </div>
    );
};

export default ServiceManager;