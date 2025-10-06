

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CashTransaction, PaymentSource, Customer, Supplier, Contact, ContactType } from '../types';
import { BuildingLibraryIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, PlusIcon, XMarkIcon, Cog6ToothIcon, PencilSquareIcon } from './common/Icons';

const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- MODALS ---
const ContactModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Omit<Contact, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState<ContactType>('Khách hàng');
    
    useEffect(() => {
        if (isOpen) {
            setName('');
            setPhone('');
            setType('Khách hàng');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!name) return;
        onSave({ name, phone, type: [type] });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Thêm liên hệ</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-300" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên (*)</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" autoFocus />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Điện thoại</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phân loại</label>
                         <div className="flex flex-wrap gap-4 mt-2 text-slate-700 dark:text-slate-300">
                            {(['Khách hàng', 'Nhà cung cấp', 'Đối tác sửa chữa', 'Đối tác tài chính'] as ContactType[]).map(t => (
                                <label key={t} className="flex items-center">
                                    <input type="radio" name="contactType" value={t} checked={type === t} onChange={() => setType(t)} className="mr-2"/>
                                    {t}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={handleSave} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">Lưu</button>
                </div>
            </div>
        </div>
    );
};

const TransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<CashTransaction, 'id' | 'branchId'>) => void;
    type: 'income' | 'expense';
    contacts: { id: string, name: string, phone?: string }[];
    paymentSources: PaymentSource[];
    onAddNewContact: () => void;
    onConfigureSources: () => void;
}> = ({ isOpen, onClose, onSave, type, contacts, paymentSources, onAddNewContact, onConfigureSources }) => {
    const [contactSearch, setContactSearch] = useState('');
    const [selectedContact, setSelectedContact] = useState<{id: string, name: string} | null>(null);
    const [isContactListOpen, setIsContactListOpen] = useState(false);
    const [amount, setAmount] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [useCurrentTime, setUseCurrentTime] = useState(true);
    const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0, 16));
    const [selectedPaymentSourceId, setSelectedPaymentSourceId] = useState('');

    useEffect(() => {
        if(isOpen) {
            // Reset form
            setContactSearch('');
            setSelectedContact(null);
            setIsContactListOpen(false);
            setAmount('');
            setNotes('');
            setUseCurrentTime(true);
            const defaultSource = paymentSources.find(p => p.isDefault) || paymentSources[0];
            setSelectedPaymentSourceId(defaultSource?.id || '');
        }
    }, [isOpen, paymentSources]);

    const handleSave = () => {
        if (!selectedContact || !amount || !selectedPaymentSourceId) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }
        onSave({
            type,
            contact: selectedContact,
            amount: Number(amount),
            notes,
            paymentSourceId: selectedPaymentSourceId,
            date: useCurrentTime ? new Date().toISOString() : new Date(customDate).toISOString(),
        });
    };

    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(contactSearch.toLowerCase()) || (c.phone && c.phone.includes(contactSearch)));
    
    if (!isOpen) return null;
    
    const title = type === 'income' ? 'Tạo phiếu thu (Tôi nhận tiền)' : 'Tạo phiếu chi (Tôi đưa tiền)';
    const contactLabel = type === 'income' ? 'Tôi nhận tiền của ai?' : 'Tôi đưa tiền cho ai?';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xl max-h-[95vh] flex flex-col">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-300" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{contactLabel} <span className="text-red-500">*</span></label>
                        <div className="flex items-center mt-1">
                            <input type="text" placeholder="Nhập từ khoá cần tìm" value={contactSearch}
                                onChange={e => { setContactSearch(e.target.value); setSelectedContact(null); setIsContactListOpen(true); }}
                                onFocus={() => setIsContactListOpen(true)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-l-md dark:bg-slate-700 dark:text-white"
                            />
                            <button onClick={onAddNewContact} className="p-2 border-t border-b border-r rounded-r-md h-[42px] bg-slate-50 dark:bg-slate-600 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500"><PlusIcon /></button>
                        </div>
                        {isContactListOpen && (
                             <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                {filteredContacts.map(c => (
                                    <div key={c.id} onClick={() => { setSelectedContact(c); setContactSearch(c.name); setIsContactListOpen(false); }}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                                        {c.name} {c.phone && <span className="text-slate-500 dark:text-slate-400">- {c.phone}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                        {selectedContact && <div className="mt-2 p-2 bg-sky-50 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-700 rounded-md text-sky-800 dark:text-sky-300 font-semibold">{selectedContact.name}</div>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số tiền thanh toán</label>
                        <input type="number" placeholder="0" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nội dung ghi chú</label>
                        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"></textarea>
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hình thức thanh toán</label>
                            <button onClick={onConfigureSources} className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center"><Cog6ToothIcon className="w-4 h-4 mr-1"/> Thiết lập nguồn tiền</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                           {paymentSources.map(ps => (
                               <button key={ps.id} onClick={() => setSelectedPaymentSourceId(ps.id)} className={`p-3 border rounded-lg text-left ${selectedPaymentSourceId === ps.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50 ring-2 ring-sky-300' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'}`}>
                                   <p className="font-semibold text-slate-800 dark:text-slate-200">{ps.name}</p>
                                   <p className="text-sm text-slate-600 dark:text-slate-400">{formatCurrency(ps.balance)}</p>
                               </button>
                           ))}
                        </div>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                        <label className="block text-sm font-medium">Thời gian thanh toán</label>
                        <div className="flex gap-4 mt-2">
                           <label className="flex items-center"><input type="radio" checked={useCurrentTime} onChange={() => setUseCurrentTime(true)} className="mr-1"/> Thời gian hiện tại</label>
                           <label className="flex items-center"><input type="radio" checked={!useCurrentTime} onChange={() => setUseCurrentTime(false)} className="mr-1"/> Tùy chỉnh</label>
                        </div>
                        {!useCurrentTime && <input type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)} className="mt-2 p-2 border dark:border-slate-600 rounded-md w-full sm:w-auto dark:bg-slate-700 dark:text-white"/>}
                        {useCurrentTime && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 p-2 border dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 inline-block">{new Date().toLocaleString('vi-VN')}</p>}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={handleSave} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">LƯU</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface CashflowManagerProps {
    cashTransactions: CashTransaction[];
    setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
    paymentSources: PaymentSource[];
    setPaymentSources: React.Dispatch<React.SetStateAction<PaymentSource[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    suppliers: Supplier[];
    setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
    currentBranchId: string;
}

const CashflowManager: React.FC<CashflowManagerProps> = ({ cashTransactions, setCashTransactions, paymentSources, setPaymentSources, customers, suppliers, setCustomers, setSuppliers, currentBranchId }) => {
    const [modalState, setModalState] = useState<{ type: 'income' | 'expense' | null, isOpen: boolean }>({ type: null, isOpen: false });
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isSourceConfigOpen, setIsSourceConfigOpen] = useState(false); // Placeholder for future modal

    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);
    
    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);


    const combinedContacts = useMemo(() => {
        const allContacts: { id: string, name: string, phone?: string }[] = [];
        customers.forEach(c => allContacts.push({ id: c.id, name: c.name, phone: c.phone }));
        suppliers.forEach(s => allContacts.push({ id: s.id, name: s.name, phone: s.phone }));
        return allContacts;
    }, [customers, suppliers]);

    const handleOpenModal = (type: 'income' | 'expense') => {
        setModalState({ type, isOpen: true });
    };

    const handleCloseModal = () => {
        setModalState({ type: null, isOpen: false });
    };
    
    const handleSaveContact = (contact: Omit<Contact, 'id'>) => {
        if(contact.type.includes('Nhà cung cấp')) {
            const newSupplier: Supplier = { id: `SUP${Date.now()}`, ...contact, phone: contact.phone || '' };
            setSuppliers(prev => [newSupplier, ...prev]);
        } else {
            const newCustomer: Customer = { id: `C${Date.now()}`, vehicle: '', licensePlate: '', loyaltyPoints: 0, ...contact, phone: contact.phone || '' };
            setCustomers(prev => [newCustomer, ...prev]);
        }
    };
    
    const handleSaveTransaction = (transactionData: Omit<CashTransaction, 'id' | 'branchId'>) => {
        const newTransaction: CashTransaction = {
            ...transactionData,
            id: `CT-${Date.now()}`,
            branchId: currentBranchId,
        };

        setCashTransactions(prev => [newTransaction, ...prev]);

        setPaymentSources(prevSources => prevSources.map(ps => {
            if (ps.id === newTransaction.paymentSourceId) {
                const newBalance = newTransaction.type === 'income'
                    ? ps.balance + newTransaction.amount
                    : ps.balance - newTransaction.amount;
                return { ...ps, balance: newBalance };
            }
            return ps;
        }));

        handleCloseModal();
    };
    
    // --- Filtering Logic ---
    const handleSetDateRange = (start: Date, end: Date) => {
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleTodayClick = () => { const today = new Date(); handleSetDateRange(today, today); };
    const handleThisWeekClick = () => {
        const today = new Date();
        const firstDay = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
        const start = new Date(today.setDate(firstDay));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        handleSetDateRange(start, end);
    };
    const handleThisMonthClick = () => { const today = new Date(); handleSetDateRange(new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)); };
    const handleThisYearClick = () => { const today = new Date(); handleSetDateRange(new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31)); };


    const filteredTransactions = useMemo(() => {
        if (!startDate || !endDate) {
          return [...cashTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        return cashTransactions
          .filter(tx => {
              const txDate = new Date(tx.date);
              return txDate >= start && txDate <= end;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [cashTransactions, startDate, endDate]);

    const summary = useMemo(() => {
        return filteredTransactions.reduce((acc, tx) => {
            if (tx.type === 'income') acc.totalIncome += tx.amount;
            else acc.totalExpense += tx.amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [filteredTransactions]);


  return (
    <div className="space-y-6">
        {modalState.isOpen && modalState.type && (
            <TransactionModal 
                isOpen={true}
                onClose={handleCloseModal}
                onSave={handleSaveTransaction}
                type={modalState.type}
                contacts={combinedContacts}
                paymentSources={paymentSources}
                onAddNewContact={() => setIsContactModalOpen(true)}
                onConfigureSources={() => alert('Chức năng đang phát triển')}
            />
        )}
        <ContactModal 
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            onSave={handleSaveContact}
        />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý Thu Chi</h1>
            <div className="flex items-center gap-3">
                 <button onClick={() => handleOpenModal('expense')} className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-red-700">
                    <ArrowDownCircleIcon className="w-6 h-6" /> Tôi đã đưa
                </button>
                <button onClick={() => handleOpenModal('income')} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-700">
                    <ArrowUpCircleIcon className="w-6 h-6" /> Tôi đã nhận
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-center border dark:border-slate-700"><div className="p-4 rounded-full bg-green-100 dark:bg-green-900/50"><ArrowUpCircleIcon className="w-7 h-7 text-green-600 dark:text-green-400" /></div><div className="ml-4"><p className="text-sm text-slate-500 dark:text-slate-400">Tổng thu trong kỳ</p><p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.totalIncome)}</p></div></div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-center border dark:border-slate-700"><div className="p-4 rounded-full bg-red-100 dark:bg-red-900/50"><ArrowDownCircleIcon className="w-7 h-7 text-red-600 dark:text-red-400" /></div><div className="ml-4"><p className="text-sm text-slate-500 dark:text-slate-400">Tổng chi trong kỳ</p><p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalExpense)}</p></div></div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Từ ngày</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm dark:bg-slate-700 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đến ngày</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm dark:bg-slate-700 dark:text-white" />
                </div>
                <div className="lg:col-span-3 flex flex-wrap items-end gap-2">
                    <button onClick={handleTodayClick} className="px-3 py-2 border dark:border-slate-600 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600">Hôm nay</button>
                    <button onClick={handleThisWeekClick} className="px-3 py-2 border dark:border-slate-600 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600">Tuần này</button>
                    <button onClick={handleThisMonthClick} className="px-3 py-2 border dark:border-slate-600 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600">Tháng này</button>
                    <button onClick={handleThisYearClick} className="px-3 py-2 border dark:border-slate-600 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600">Năm nay</button>
                    <button onClick={() => {setStartDate(''); setEndDate('');}} className="px-3 py-2 border dark:border-slate-600 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-red-600 dark:text-red-400">Bỏ lọc</button>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Thời gian</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Đối tác</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Nội dung</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Đã thu</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Đã chi</th>
                        <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Nguồn tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.length > 0 ? filteredTransactions.map(tx => {
                        const source = paymentSources.find(ps => ps.id === tx.paymentSourceId);
                        return (
                        <tr key={tx.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                            <td className="p-3 text-slate-700 dark:text-slate-300">{new Date(tx.date).toLocaleString('vi-VN')}</td>
                            <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{tx.contact.name}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{tx.notes}</td>
                            <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">{tx.type === 'income' ? formatCurrency(tx.amount) : ''}</td>
                            <td className="p-3 text-right font-semibold text-red-600 dark:text-red-400">{tx.type === 'expense' ? formatCurrency(tx.amount) : ''}</td>
                            <td className="p-3 text-slate-700 dark:text-slate-300">{source?.name || 'N/A'}</td>
                        </tr>
                    )}) : (
                         <tr>
                            <td colSpan={6} className="text-center p-16 text-slate-500 dark:text-slate-400">
                                Không có giao dịch nào trong khoảng thời gian đã chọn.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default CashflowManager;