import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Part, CartItem, InventoryTransaction, User, StoreSettings, WorkOrder, Customer } from '../types';
import { ShoppingCartIcon, TrashIcon, PrinterIcon, DocumentTextIcon, ChevronDownIcon, ArchiveBoxIcon, XMarkIcon, PencilSquareIcon, PlusIcon, MinusIcon, ClockIcon } from './common/Icons';

const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
};

// --- New Customer Modal ---
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
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Thêm Khách hàng mới</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="new-customer-name" className="block text-sm font-medium text-slate-700">Tên khách hàng (*)</label>
                                <input id="new-customer-name" type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" required autoFocus />
                            </div>
                            <div>
                                <label htmlFor="new-customer-phone" className="block text-sm font-medium text-slate-700">Số điện thoại (*)</label>
                                <input id="new-customer-phone" type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" required />
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

// --- Receipt Modal ---
const ReceiptModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    settings: StoreSettings;
    branchId: string;
}> = ({ isOpen, onClose, cart, subtotal, discount, total, settings, branchId }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        const printContents = document.getElementById('receipt-content')?.innerHTML;
        const originalContents = document.body.innerHTML;
        if (printContents) {
             const printStyles = `
                <style>
                    body { 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-family: sans-serif;
                    }
                </style>
            `;
            document.body.innerHTML = printStyles + printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // To re-attach React components
        }
    };
    
    const branchName = settings.branches.find(b => b.id === branchId)?.name || '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 print:hidden">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <div id="receipt-content" className="p-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-black">{settings.name}</h2>
                        <p className="text-sm text-black">{branchName}</p>
                        <p className="text-sm text-black">{settings.address}</p>
                        <p className="text-sm text-black">ĐT: {settings.phone}</p>
                    </div>
                    <div className="my-4 border-t border-dashed border-black"></div>
                    <h3 className="text-lg font-semibold text-center text-black">HÓA ĐƠN BÁN LẺ</h3>
                    <p className="text-xs text-center mb-2 text-black">Ngày: {new Date().toLocaleString('vi-VN')}</p>
                    <table className="w-full text-sm text-black">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="text-left py-1">Sản phẩm</th>
                                <th className="text-center py-1">SL</th>
                                <th className="text-right py-1">Đ.Giá</th>
                                <th className="text-right py-1">T.Tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => {
                                const itemTotal = item.sellingPrice * item.quantity;
                                return(
                                <tr key={item.partId}>
                                    <td className="py-1">{item.partName}</td>
                                    <td className="text-center py-1">{item.quantity}</td>
                                    <td className="text-right py-1">{item.sellingPrice.toLocaleString()}</td>
                                    <td className="text-right py-1">{itemTotal.toLocaleString()}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     <div className="my-4 border-t border-dashed border-black"></div>
                     <div className="text-right text-black space-y-1">
                        <div className="flex justify-between">
                            <span>Tạm tính:</span>
                            <span>{subtotal.toLocaleString()} ₫</span>
                        </div>
                         {discount > 0 && (
                            <div className="flex justify-between">
                                <span>Giảm giá:</span>
                                <span>-{discount.toLocaleString()} ₫</span>
                            </div>
                         )}
                         <div className="flex justify-between font-bold text-base">
                            <span>Tổng cộng:</span>
                            <span>{total.toLocaleString()} ₫</span>
                         </div>
                     </div>
                     <div className="text-center mt-4 text-sm text-black">
                        <p>Cảm ơn quý khách!</p>
                     </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">Đóng</button>
                    <button onClick={handlePrint} className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700">
                        <PrinterIcon className="w-5 h-5 mr-2" /> In hóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
};


interface SalesManagerProps {
    currentUser: User;
    workOrders: WorkOrder[];
    transactions: InventoryTransaction[];
    parts: Part[];
    setParts: React.Dispatch<React.SetStateAction<Part[]>>;
    setTransactions: React.Dispatch<React.SetStateAction<InventoryTransaction[]>>;
    cartItems: CartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
    storeSettings: StoreSettings;
    currentBranchId: string;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

interface Sale {
    id: string;
    date: string;
    total: number;
    items: {
        partName: string;
        quantity: number;
        totalPrice: number;
    }[];
    totalDiscount: number;
    customerName?: string;
    userName?: string;
    notes?: string;
}

const SalesManager: React.FC<SalesManagerProps> = ({ currentUser, parts, setParts, transactions, setTransactions, cartItems, setCartItems, storeSettings, currentBranchId, customers, setCustomers }) => {
    // Component State
    const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'history'>('products');
    const [searchTerm, setSearchTerm] = useState('');
    const [isReceiptVisible, setIsReceiptVisible] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<{cart: CartItem[], total: number, subtotal: number, discount: number} | null>(null);
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
    
    // Checkout form state
    const [orderDiscount, setOrderDiscount] = useState(0);
    const [amountPaid, setAmountPaid] = useState(0);
    const [useCurrentTime, setUseCurrentTime] = useState(true);
    const [customSaleTime, setCustomSaleTime] = useState(new Date().toISOString().slice(0, 16));
    const [showSaleNote, setShowSaleNote] = useState(false);
    const [saleNote, setSaleNote] = useState('');
    const [printReceipt, setPrintReceipt] = useState(false);

    // Customer selection state
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
    const customerInputRef = useRef<HTMLDivElement>(null);

    // --- Memos & Calculations ---

    const filteredParts = useMemo(() =>
        parts.filter(part =>
            (part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (part.stock[currentBranchId] || 0) > 0
        ), [parts, searchTerm, currentBranchId]);

    const cartSubtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0), [cartItems]);
    const cartItemsDiscount = useMemo(() => cartItems.reduce((sum, item) => sum + (item.discount || 0), 0), [cartItems]);
    const cartTotal = useMemo(() => cartSubtotal - cartItemsDiscount - orderDiscount, [cartSubtotal, cartItemsDiscount, orderDiscount]);
    const totalCartItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        return customers.filter(c => 
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
            c.phone.includes(customerSearch)
        );
    }, [customers, customerSearch]);


    // --- Event Handlers ---
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
                setIsCustomerListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomerId(customer.id);
        setCustomerSearch(customer.name);
        setIsCustomerListOpen(false);
    };

    const handleSaveNewCustomer = (newCustomer: Customer) => {
        setCustomers(prev => [newCustomer, ...prev]);
        handleSelectCustomer(newCustomer);
        setIsNewCustomerModalOpen(false);
    };


    const handleOpenAddModal = (part: Part) => {
        setSelectedPart(part);
        setIsAddModalOpen(true);
    };

    const handleConfirmAddToCart = (item: { partId: string; quantity: number; sellingPrice: number; discount: number }) => {
        const part = parts.find(p => p.id === item.partId);
        if (!part) return;
        
        const stockInBranch = part.stock[currentBranchId] || 0;

        setCartItems(prev => {
            const existingItem = prev.find(i => i.partId === item.partId);
            if (existingItem) {
                return prev.map(i => i.partId === item.partId
                    ? { ...i, quantity: Math.min(i.quantity + item.quantity, stockInBranch), discount: (i.discount || 0) + item.discount }
                    : i
                );
            }
            return [...prev, {
                partId: part.id,
                partName: part.name,
                sku: part.sku,
                quantity: Math.min(item.quantity, stockInBranch),
                sellingPrice: item.sellingPrice,
                stock: stockInBranch,
                discount: item.discount,
                warrantyPeriod: part.warrantyPeriod
            }];
        });
        setIsAddModalOpen(false);
        setSelectedPart(null);
    };
    
    const updateCartQuantity = (partId: string, quantity: number) => {
        setCartItems(prev => prev.map(item => item.partId === partId ? { ...item, quantity: Math.max(0, quantity) } : item).filter(item => item.quantity > 0));
    };

    const updateCartItemDiscount = (partId: string, discount: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.partId === partId) {
                const maxDiscount = item.sellingPrice * item.quantity;
                const newDiscount = Math.max(0, Math.min(discount, maxDiscount));
                return { ...item, discount: newDiscount };
            }
            return item;
        }));
    };
    
    const resetCheckoutForm = () => {
        setOrderDiscount(0);
        setAmountPaid(0);
        setUseCurrentTime(true);
        setShowSaleNote(false);
        setSaleNote('');
        setPrintReceipt(false);
        setCustomerSearch('');
        setSelectedCustomerId(null);
        setEditingSaleId(null);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        
        const saleId = `SALE-${Date.now()}`;
        const newTransactions: InventoryTransaction[] = [];
        let updatedParts = [...parts];

        const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
        
        const totalDiscount = cartItemsDiscount + orderDiscount;
        const finalCartForReceipt = [...cartItems];

        cartItems.forEach(item => {
            const itemSubtotal = item.sellingPrice * item.quantity;
            
            // Prorate order discount
            const itemProratedOrderDiscount = cartSubtotal > 0 ? (itemSubtotal / cartSubtotal) * orderDiscount : 0;
            const totalItemDiscount = (item.discount || 0) + itemProratedOrderDiscount;

            const newTransaction: InventoryTransaction = {
                id: `T-${Date.now()}-${item.partId}`,
                type: 'Xuất kho',
                partId: item.partId,
                partName: item.partName,
                quantity: item.quantity,
                date: useCurrentTime ? new Date().toISOString().split('T')[0] : customSaleTime.split('T')[0],
                notes: saleNote || 'Bán lẻ tại quầy',
                unitPrice: item.sellingPrice,
                totalPrice: itemSubtotal - totalItemDiscount,
                branchId: currentBranchId,
                saleId: saleId,
                discount: totalItemDiscount,
                customerId: selectedCustomerId || undefined,
                customerName: selectedCustomer?.name || customerSearch || 'Khách vãng lai',
                userId: currentUser.id,
// Fix: Changed currentUser.username to currentUser.name as 'username' does not exist on the User type.
                userName: currentUser.name,
            };
            newTransactions.push(newTransaction);
            
            updatedParts = updatedParts.map(p => {
                if (p.id === item.partId) {
                    const newStock = { ...p.stock };
                    newStock[currentBranchId] = (newStock[currentBranchId] || 0) - item.quantity;
                    return { ...p, stock: newStock };
                }
                return p;
            });
        });
        
        setTransactions(prev => [...newTransactions, ...prev]);
        setParts(updatedParts);
        
        setLastTransaction({ cart: finalCartForReceipt, subtotal: cartSubtotal, total: cartTotal, discount: totalDiscount });
        setCartItems([]);
        
        if (printReceipt) {
            setIsReceiptVisible(true);
        }
        resetCheckoutForm();
        setActiveTab('products');
    };

    const handleDeleteSale = (saleId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa lịch sử bán hàng này không? Hành động này sẽ hoàn tác giao dịch và cập nhật lại tồn kho.')) {
            return;
        }
    
        const transactionsToDelete = transactions.filter(tx => tx.saleId === saleId);
        if (transactionsToDelete.length === 0) return;
    
        // Revert stock changes, respecting the original branch of each transaction
        setParts(prevParts => {
            // Create a map to hold stock changes: { partId: { branchId: quantityToAdd } }
            const stockChanges = new Map<string, Map<string, number>>();
    
            transactionsToDelete.forEach(tx => {
                if (!stockChanges.has(tx.partId)) {
                    stockChanges.set(tx.partId, new Map<string, number>());
                }
                const branchChanges = stockChanges.get(tx.partId)!;
                branchChanges.set(tx.branchId, (branchChanges.get(tx.branchId) || 0) + tx.quantity);
            });
    
            return prevParts.map(part => {
                if (stockChanges.has(part.id)) {
                    const changesForPart = stockChanges.get(part.id)!;
                    const newStock = { ...part.stock };
                    
                    changesForPart.forEach((quantityToAdd, branchId) => {
                        newStock[branchId] = (newStock[branchId] || 0) + quantityToAdd;
                    });
    
                    return { ...part, stock: newStock };
                }
                return part;
            });
        });
    
        // Remove transactions from history
        setTransactions(prevTransactions => prevTransactions.filter(tx => tx.saleId !== saleId));
    };

    const handleEditSale = (saleId: string) => {
        const saleTransactions = transactions.filter(tx => tx.saleId === saleId);
        if (saleTransactions.length === 0) return;

        const cartItemsToEdit: CartItem[] = saleTransactions.map(tx => {
            const part = parts.find(p => p.id === tx.partId);
            const stockInBranch = part ? (part.stock[currentBranchId] || 0) : 0;
            return {
                partId: tx.partId,
                partName: tx.partName,
                sku: part?.sku || '',
                quantity: tx.quantity,
                sellingPrice: tx.unitPrice!,
                stock: stockInBranch + tx.quantity, // Add back current quantity to show total available
                discount: tx.discount || 0,
                warrantyPeriod: part?.warrantyPeriod
            };
        });

        const firstTransaction = saleTransactions[0];
        const totalItemDiscounts = saleTransactions.reduce((acc, tx) => acc + (tx.discount || 0), 0);
        const totalSalePrice = saleTransactions.reduce((acc, tx) => acc + (tx.totalPrice || 0), 0);
        const subtotal = saleTransactions.reduce((acc, tx) => acc + ((tx.unitPrice || 0) * tx.quantity), 0);
        const orderDiscountFromTxs = subtotal - totalSalePrice - totalItemDiscounts;

        setCartItems(cartItemsToEdit);
        setOrderDiscount(orderDiscountFromTxs > 0 ? orderDiscountFromTxs : 0);
        
        // Restore customer
        if (firstTransaction.customerId) {
            setSelectedCustomerId(firstTransaction.customerId);
            setCustomerSearch(firstTransaction.customerName || '');
        } else {
            setCustomerSearch(firstTransaction.customerName || 'Khách vãng lai');
            setSelectedCustomerId(null);
        }

        setSaleNote(firstTransaction.notes || '');
        setShowSaleNote(!!firstTransaction.notes);
        
        setUseCurrentTime(false);
        setCustomSaleTime(new Date(firstTransaction.date).toISOString().slice(0,16));


        setEditingSaleId(saleId);
        setActiveTab('cart');
    };
    
    const handleUpdateSale = () => {
        if (!editingSaleId) return;

        // 1. Find transactions to revert and prepare new ones
        const transactionsToRevert = transactions.filter(tx => tx.saleId === editingSaleId);
        const remainingTransactions = transactions.filter(tx => tx.saleId !== editingSaleId);
        
        const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
        
        const newTransactionsFromCart: InventoryTransaction[] = cartItems.map(item => {
            const itemSubtotal = item.sellingPrice * item.quantity;
            const itemProratedOrderDiscount = cartSubtotal > 0 ? (itemSubtotal / cartSubtotal) * orderDiscount : 0;
            const totalItemDiscount = (item.discount || 0) + itemProratedOrderDiscount;
            return {
                id: `T-${Date.now()}-${item.partId}`, type: 'Xuất kho', partId: item.partId,
                partName: item.partName, quantity: item.quantity,
                date: useCurrentTime ? new Date().toISOString().split('T')[0] : customSaleTime.split('T')[0],
                notes: saleNote || 'Bán lẻ tại quầy (đã chỉnh sửa)', unitPrice: item.sellingPrice,
                totalPrice: itemSubtotal - totalItemDiscount, branchId: currentBranchId,
                saleId: editingSaleId, discount: totalItemDiscount,
                customerId: selectedCustomerId || undefined,
                customerName: selectedCustomer?.name || customerSearch || 'Khách vãng lai',
                userId: currentUser.id,
// Fix: Changed currentUser.username to currentUser.name as 'username' does not exist on the User type.
                userName: currentUser.name,
            };
        });
        
        // 2. Calculate net stock changes
        const stockChanges = new Map<string, number>();
        transactionsToRevert.forEach(tx => stockChanges.set(tx.partId, (stockChanges.get(tx.partId) || 0) + tx.quantity));
        newTransactionsFromCart.forEach(tx => stockChanges.set(tx.partId, (stockChanges.get(tx.partId) || 0) - tx.quantity));

        // 3. Apply state updates
        setParts(prevParts => 
            prevParts.map(part => {
                if (stockChanges.has(part.id)) {
                    const newStock = { ...part.stock };
                    newStock[currentBranchId] = (newStock[currentBranchId] || 0) + stockChanges.get(part.id)!;
                    return { ...part, stock: newStock };
                }
                return part;
            })
        );
        
        setTransactions([...remainingTransactions, ...newTransactionsFromCart]);

        // 4. Clean up
        setCartItems([]);
        resetCheckoutForm();
        setActiveTab('history');
    };

    const handleCancelEdit = () => {
        setEditingSaleId(null);
        setCartItems([]);
        resetCheckoutForm();
        setActiveTab('history');
    };

    // --- History Logic ---
    const salesHistory = useMemo((): Sale[] => {
        const salesBySaleId: Record<string, Sale> = {};

        transactions
            .filter(tx => tx.saleId && tx.branchId === currentBranchId)
            .forEach(tx => {
                if (!tx.saleId) return;

                if (!salesBySaleId[tx.saleId]) {
                    salesBySaleId[tx.saleId] = {
                        id: tx.saleId,
                        date: tx.date,
                        total: 0,
                        items: [],
                        totalDiscount: 0,
                        customerName: tx.customerName || 'Khách vãng lai',
                        userName: tx.userName,
                        notes: tx.notes,
                    };
                }
                
                salesBySaleId[tx.saleId].items.push({
                    partName: tx.partName,
                    quantity: tx.quantity,
                    totalPrice: tx.totalPrice || 0,
                });
                salesBySaleId[tx.saleId].total += tx.totalPrice || 0;
                salesBySaleId[tx.saleId].totalDiscount += tx.discount || 0;
            });

        return Object.values(salesBySaleId).sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateB !== dateA) return dateB - dateA;
            // if dates are the same, sort by saleId descending (latest first)
            return b.id.localeCompare(a.id);
        });
    }, [transactions, currentBranchId]);


    // --- Render ---
    return (
        <div className="space-y-6">
            <NewCustomerModal
                isOpen={isNewCustomerModalOpen}
                onClose={() => setIsNewCustomerModalOpen(false)}
                onSave={handleSaveNewCustomer}
                initialName={customerSearch}
            />
            {isReceiptVisible && lastTransaction && (
                <ReceiptModal 
                    isOpen={isReceiptVisible}
                    onClose={() => setIsReceiptVisible(false)}
                    cart={lastTransaction.cart}
                    subtotal={lastTransaction.subtotal}
                    discount={lastTransaction.discount}
                    total={lastTransaction.total}
                    settings={storeSettings}
                    branchId={currentBranchId}
                />
            )}
            {isAddModalOpen && selectedPart && (
                <AddToCartModal 
                    part={selectedPart} 
                    onClose={() => setIsAddModalOpen(false)}
                    onConfirm={handleConfirmAddToCart}
                />
            )}
            
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 sm:space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('products')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        <ArchiveBoxIcon className="w-5 h-5 mr-2"/> Sản phẩm
                    </button>
                    <button onClick={() => setActiveTab('cart')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cart' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        <ShoppingCartIcon className="w-5 h-5 mr-2"/> Giỏ hàng
                        {totalCartItems > 0 && (
                            <span className="ml-2 bg-sky-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {totalCartItems}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                       <DocumentTextIcon className="w-5 h-5 mr-2"/> Lịch sử
                    </button>
                </nav>
            </div>
            
            {activeTab === 'products' && (
                <div className="relative">
                    <input type="text" placeholder="Tìm theo tên sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg mb-4 text-slate-900 focus:ring-sky-500 focus:border-sky-500"/>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                       {filteredParts.map(part => (
                           <ProductCard key={part.id} part={part} onSelect={() => handleOpenAddModal(part)} currentBranchId={currentBranchId} />
                       ))}
                    </div>
                    {totalCartItems > 0 && <FloatingCartButton count={totalCartItems} total={cartTotal} onClick={() => setActiveTab('cart')} />}
                </div>
            )}
            {activeTab === 'cart' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 max-w-4xl mx-auto">
                    <div className="space-y-4">
                         <div ref={customerInputRef}>
                            <label className="block text-sm font-medium text-slate-700">Khách hàng</label>
                            <div className="relative mt-1">
                                <div className="flex">
                                    <input 
                                        type="text" 
                                        placeholder="Tìm hoặc thêm khách hàng (SĐT hoặc tên)" 
                                        value={customerSearch} 
                                        onChange={e => {
                                            setCustomerSearch(e.target.value);
                                            setIsCustomerListOpen(true);
                                            setSelectedCustomerId(null);
                                        }}
                                        onFocus={() => setIsCustomerListOpen(true)}
                                        className="w-full p-2 border border-slate-300 rounded-l-md"
                                    />
                                    <button type="button" onClick={() => setIsNewCustomerModalOpen(true)} className="p-2 border-t border-b border-r rounded-r-md h-[42px] bg-slate-50 hover:bg-slate-100" title="Thêm khách hàng mới">
                                        <PlusIcon />
                                    </button>
                                </div>
                                {isCustomerListOpen && (
                                    <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
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
                         <h3 className="text-lg font-semibold text-slate-800 pt-2">Giỏ hàng xuất bán</h3>
                          {cartItems.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">Giỏ hàng trống.</p>
                        ) : (
                            <div className="space-y-3">
                                {cartItems.map(item => (
                                    <div key={item.partId} className="bg-slate-50 p-3 rounded-lg border">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-slate-800">{item.partName}</p>
                                                <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                                            </div>
                                            <button onClick={() => updateCartQuantity(item.partId, 0)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateCartQuantity(item.partId, item.quantity - 1)} className="p-1 border rounded-md"><MinusIcon className="w-4 h-4" /></button>
                                                <input type="number" value={item.quantity} onChange={e => updateCartQuantity(item.partId, parseInt(e.target.value))} className="w-12 text-center border-slate-300 rounded" />
                                                <button onClick={() => updateCartQuantity(item.partId, item.quantity + 1)} className="p-1 border rounded-md"><PlusIcon className="w-4 h-4" /></button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">{formatCurrency(item.sellingPrice)}</p>
                                                <p className="font-semibold text-slate-900">{formatCurrency(item.sellingPrice * item.quantity)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                         
                         <div className="border-t pt-4 space-y-2">
                             <div className="flex justify-between items-center"><span className="text-slate-600">Tổng tiền hàng</span> <span className="font-medium">{formatCurrency(cartSubtotal)}</span></div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">Giảm giá</span> 
                                <input type="number" value={orderDiscount || ''} onChange={e => setOrderDiscount(Number(e.target.value))} placeholder="0" className="w-28 p-1 border rounded-md text-right"/>
                             </div>
                              <div className="flex justify-between items-center font-bold text-xl"><span >Khách phải trả</span> <span>{formatCurrency(cartTotal)}</span></div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">Khách thanh toán</span> 
                                <input type="number" value={amountPaid || ''} onChange={e => setAmountPaid(Number(e.target.value))} placeholder="0" className="w-28 p-1 border rounded-md text-right"/>
                             </div>
                             <div className="flex flex-wrap gap-2 pt-2">
                               {[cartTotal, 200000, 500000, 1000000].map(val => (
                                   <button key={val} onClick={() => setAmountPaid(val)} className="border rounded-full px-3 py-1 text-sm hover:bg-slate-100">{formatCurrency(val)}</button>
                               ))}
                             </div>
                         </div>

                          <div className="border-t pt-4 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Thời gian bán hàng</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <label className="flex items-center"><input type="radio" name="saleTime" checked={useCurrentTime} onChange={() => setUseCurrentTime(true)} className="mr-1"/> Thời gian hiện tại</label>
                                    <label className="flex items-center"><input type="radio" name="saleTime" checked={!useCurrentTime} onChange={() => setUseCurrentTime(false)} className="mr-1"/> Tùy chỉnh</label>
                                </div>
                                {!useCurrentTime && <input type="datetime-local" value={customSaleTime} onChange={e => setCustomSaleTime(e.target.value)} className="mt-2 p-2 border rounded-md w-full sm:w-auto"/>}
                            </div>
                            <div>
                                <label className="flex items-center"><input type="checkbox" checked={showSaleNote} onChange={e => setShowSaleNote(e.target.checked)} className="mr-2"/> Ghi chú riêng cho đơn hàng</label>
                                {showSaleNote && <textarea value={saleNote} onChange={e => setSaleNote(e.target.value)} className="mt-2 p-2 border rounded-md w-full" rows={2}></textarea>}
                            </div>
                             <label className="flex items-center"><input type="checkbox" checked={printReceipt} onChange={e => setPrintReceipt(e.target.checked)} className="mr-2"/> Đồng thời in hoá đơn</label>
                          </div>
                          
                          <div className="flex gap-4 pt-4">
                                {editingSaleId ? (
                                    <>
                                        <button onClick={handleCancelEdit} className="w-full bg-slate-100 border border-slate-300 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-200">HỦY</button>
                                        <button onClick={handleUpdateSale} className="w-full bg-sky-600 text-white font-bold py-3 rounded-lg hover:bg-sky-700 disabled:bg-sky-300">CẬP NHẬT</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="w-full bg-slate-100 border border-slate-300 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-200">LƯU NHÁP</button>
                                        <button onClick={handleCheckout} disabled={cartItems.length === 0} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 disabled:bg-orange-300">XUẤT BÁN</button>
                                    </>
                                )}
                          </div>
                    </div>
                </div>
            )}
             {activeTab === 'history' && (
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4 flex items-center text-slate-800"><DocumentTextIcon className="w-6 h-6 mr-2"/> Lịch sử bán lẻ</h2>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                       {salesHistory.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">Chưa có giao dịch bán lẻ nào.</p>
                       ) : (
                        salesHistory.map(sale => (
                            <div key={sale.id} className="rounded-lg border border-slate-200 overflow-hidden">
                                <div className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100/70">
                                    <div 
                                        className="flex-grow flex items-center cursor-pointer" 
                                        onClick={() => setExpandedSaleId(prev => prev === sale.id ? null : sale.id)}
                                    >
                                        <div className="flex-grow text-left">
                                            <p className="font-semibold text-sky-700">{sale.id}</p>
                                            <p className="font-semibold text-slate-800">{sale.customerName}</p>
                                            <p className="text-sm text-slate-600">{new Date(sale.date).toLocaleString('vi-VN')}</p>
                                        </div>
                                        <div className="text-right pr-4 flex-shrink-0">
                                            {sale.totalDiscount > 0 && (
                                                <p className="text-sm text-slate-500 line-through">
                                                    {(sale.total + sale.totalDiscount).toLocaleString('vi-VN')} ₫
                                                </p>
                                            )}
                                            <p className="font-bold text-slate-800 text-lg">
                                                {sale.total.toLocaleString('vi-VN')} ₫
                                            </p>
                                        </div>
                                        <ChevronDownIcon className={`w-5 h-5 transition-transform text-slate-500 ${expandedSaleId === sale.id ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="flex items-center gap-2 pl-4 ml-4 border-l border-slate-300">
                                        <button onClick={() => handleEditSale(sale.id)} className="p-2 text-sky-600 hover:text-sky-800" title="Chỉnh sửa">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteSale(sale.id)} className="p-2 text-red-500 hover:text-red-700" title="Xóa">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                {expandedSaleId === sale.id && (
                                    <div className="p-4 border-t border-slate-200 bg-white">
                                        <div className="mb-3 text-sm space-y-1">
                                            <p><span className="font-semibold text-slate-600">Nhân viên:</span> {sale.userName}</p>
                                            {sale.notes && sale.notes !== 'Bán lẻ tại quầy' && <p><span className="font-semibold text-slate-600">Ghi chú:</span> {sale.notes}</p>}
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left font-semibold text-slate-600 pb-2">Sản phẩm</th>
                                                    <th className="text-center font-semibold text-slate-600 pb-2">SL</th>
                                                    <th className="text-right font-semibold text-slate-600 pb-2">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sale.items.map((item, index) => (
                                                    <tr key={index} className="border-b last:border-none">
                                                        <td className="py-2">{item.partName}</td>
                                                        <td className="py-2 text-center">{item.quantity}</td>
                                                        <td className="py-2 text-right">{item.totalPrice.toLocaleString('vi-VN')} ₫</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="mt-2 text-right text-sm space-y-1">
                                            <p>Tạm tính: <span className="font-medium">{(sale.total + sale.totalDiscount).toLocaleString('vi-VN')} ₫</span></p>
                                            {sale.totalDiscount > 0 && <p className="text-red-600">Giảm giá: <span className="font-medium">-{sale.totalDiscount.toLocaleString('vi-VN')} ₫</span></p>}
                                            <p className="font-bold">Tổng cộng: {sale.total.toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                       )}
                    </div>
                </div>
             )}
        </div>
    );
};

// --- Sub-components ---

const ProductCard: React.FC<{ part: Part; onSelect: () => void; currentBranchId: string }> = ({ part, onSelect, currentBranchId }) => (
    <div onClick={onSelect} className="border rounded-lg p-3 flex flex-col cursor-pointer hover:shadow-md hover:border-sky-500 transition-all bg-white">
        <div className="relative w-full h-24 bg-slate-100 rounded-md flex items-center justify-center mb-2">
            <ArchiveBoxIcon className="w-10 h-10 text-slate-400" />
        </div>
        <p className="font-semibold text-sm text-slate-800 flex-grow leading-tight">{part.name}</p>
        <p className="text-xs text-slate-500 mt-1">SKU: {part.sku}</p>
        <div className="flex justify-between items-center mt-2">
            <p className="font-bold text-sky-600">{formatCurrency(part.sellingPrice)}</p>
            <p className="text-sm text-slate-600">Kho: {part.stock[currentBranchId] || 0}</p>
        </div>
    </div>
);

const FloatingCartButton: React.FC<{ count: number; total: number; onClick: () => void; }> = ({ count, total, onClick }) => (
    <div className="fixed bottom-6 right-6 z-20">
        <button onClick={onClick} className="bg-orange-500 text-white font-bold rounded-lg shadow-lg flex items-center py-3 px-5 hover:bg-orange-600 transition-transform hover:scale-105">
            <ShoppingCartIcon className="w-6 h-6" />
            <span className="bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-3">{count}</span>
            <span className="ml-3 text-lg">{formatCurrency(total)}</span>
            <span className="ml-3">Tiếp tục</span>
        </button>
    </div>
);

const AddToCartModal: React.FC<{ part: Part; onClose: () => void; onConfirm: (item: { partId: string; quantity: number; sellingPrice: number; discount: number }) => void }> = ({ part, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(part.sellingPrice);
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleConfirm = (closeAfter: boolean) => {
        const discount = (part.sellingPrice * quantity) - (price * quantity);
        onConfirm({ partId: part.id, quantity, sellingPrice: part.sellingPrice, discount });
        if (closeAfter) {
            onClose();
        } else {
            setQuantity(1);
            setPrice(part.sellingPrice);
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsEditingPrice(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">{part.name}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500" /></button>
                </div>
                <div className="p-4 space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm">
                        <p><strong>SKU:</strong> {part.sku}</p>
                        <p><strong>Giá bán lẻ:</strong> {formatCurrency(part.sellingPrice)}</p>
                        <p><strong>Có thể bán:</strong> {part.stock[part.id] || 5} (Mock)</p>
                    </div>
                    <div className="flex items-center justify-between">
                         <label className="font-medium text-slate-700">Số lượng:</label>
                        <div className="flex items-center gap-2">
                           <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 border rounded-md"><MinusIcon className="w-5 h-5"/></button>
                           <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-16 text-center border-slate-300 rounded" />
                           <button onClick={() => setQuantity(q => q + 1)} className="p-1 border rounded-md"><PlusIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                    {part.warrantyPeriod && <p className="flex items-center text-sm text-slate-600"><ClockIcon className="w-4 h-4 mr-1 text-green-600" /> Bảo hành: {part.warrantyPeriod}</p>}
                    <div className="flex justify-between items-center relative">
                        <span className="font-medium text-slate-700">Giá bán:</span>
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-lg text-slate-900">{formatCurrency(price * quantity)}</span>
                            <button onClick={() => setIsEditingPrice(true)} className="p-1 text-sky-600"><PencilSquareIcon className="w-5 h-5"/></button>
                        </div>
                        {isEditingPrice && <PriceDiscountPopover basePrice={part.sellingPrice} currentPrice={price} onApply={setPrice} onClose={() => setIsEditingPrice(false)} ref={popoverRef} />}
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 flex gap-4">
                    <button onClick={() => handleConfirm(true)} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600">Thêm vào giỏ hàng</button>
                    <button onClick={() => handleConfirm(false)} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">Thêm và tiếp tục</button>
                </div>
            </div>
        </div>
    );
};

const PriceDiscountPopover = React.forwardRef<HTMLDivElement, { basePrice: number; currentPrice: number; onApply: (newPrice: number) => void; onClose: () => void }>(({ basePrice, currentPrice, onApply, onClose }, ref) => {
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<'VND' | '%'>('%');

    useEffect(() => {
        // Calculate initial discount based on current price override
        const initialDiscount = basePrice - currentPrice;
        if (initialDiscount > 0) {
            setDiscountValue(initialDiscount);
            setDiscountType('VND');
        }
    }, [basePrice, currentPrice]);

    const handleApplyDiscount = () => {
        let newPrice = basePrice;
        if (discountType === 'VND') {
            newPrice = basePrice - discountValue;
        } else {
            newPrice = basePrice * (1 - discountValue / 100);
        }
        onApply(Math.max(0, newPrice));
        onClose();
    };

    return (
        <div ref={ref} className="absolute right-0 top-full mt-2 w-64 bg-white border rounded-lg shadow-xl z-20 p-4 space-y-3">
            <div>
                <label className="text-sm font-medium">Đơn giá:</label>
                <input type="text" value={formatCurrency(basePrice)} disabled className="w-full p-2 bg-slate-100 border rounded-md mt-1" />
            </div>
             <div>
                <label className="text-sm font-medium">Giảm giá:</label>
                <div className="flex items-center mt-1">
                    <input type="number" value={discountValue || ''} onChange={e => setDiscountValue(Number(e.target.value))} className="w-full p-2 border rounded-l-md" />
                    <button onClick={() => setDiscountType('VND')} className={`p-2 border-t border-b ${discountType === 'VND' ? 'bg-sky-600 text-white' : ''}`}>VND</button>
                    <button onClick={() => setDiscountType('%')} className={`p-2 border rounded-r-md ${discountType === '%' ? 'bg-sky-600 text-white' : ''}`}>%</button>
                </div>
            </div>
            <button onClick={handleApplyDiscount} className="w-full bg-sky-600 text-white font-semibold py-2 rounded-md">Áp dụng</button>
        </div>
    );
});


export default SalesManager;