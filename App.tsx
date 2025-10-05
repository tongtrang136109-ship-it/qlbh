import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ServiceManager from './components/ServiceManager';
import InventoryManager from './components/InventoryManager';
import CustomerManager from './components/CustomerManager';
import AiAssistant from './components/AiAssistant';
import SalesManager from './components/SalesManager';
import UserManager from './components/UserManager';
import RevenueReport from './components/RevenueReport';
import InventoryReport from './components/InventoryReport';
import type { Part, Customer, InventoryTransaction, WorkOrder, CartItem, User, StoreSettings, Supplier, PaymentSource, CashTransaction, Department } from './types';
import Header from './components/common/Header';
import Login from './components/Login';
import CreateGoodsReceipt from './components/CreateGoodsReceipt';
import CashflowManager from './components/CashflowManager';

// Mock data moved here for centralized state management
const mockWorkOrdersData: WorkOrder[] = [
    { 
        id: 'S001', 
        creationDate: '2024-07-30',
        customerName: 'Nguyễn Văn A', 
        customerPhone: '0901234567',
        vehicleModel: 'Honda Air Blade', 
        licensePlate: '59-A1 123.45',
        issueDescription: 'Bảo dưỡng định kỳ, thay nhớt',
        technicianName: 'Trần Văn An',
        status: 'Trả máy', 
        total: 580000,
        branchId: 'main',
        laborCost: 130000,
        processingType: 'Sửa trực tiếp',
        customerQuote: 580000,
        partsUsed: [
            { partId: 'P002', partName: 'Nhớt Motul 300V', sku: 'MOTUL-300V-1L', quantity: 1, price: 450000 }
        ],
        notes: 'Khách yêu cầu kiểm tra thêm hệ thống điện và sạc.'
    },
    { 
        id: 'S002', 
        creationDate: '2024-07-29',
        customerName: 'Trần Thị B', 
        customerPhone: '0987654321',
        vehicleModel: 'Yamaha Exciter',
        licensePlate: '72-B2 678.90',
        issueDescription: 'Phanh sau không ăn, có tiếng kêu',
        technicianName: 'Lê Minh Bảo',
        status: 'Đang sửa', 
        total: 120000,
        branchId: 'main',
        laborCost: 0,
        processingType: 'Sửa trực tiếp',
        customerQuote: 370000,
        partsUsed: [
             { partId: 'P004', partName: 'Má phanh Bendix', sku: 'BENDIX-MD27', quantity: 1, price: 120000 }
        ],
        notes: 'Cần thay má phanh gấp.'
    },
];

const mockPartsData: Part[] = [
    { id: 'P001', name: 'Bugi NGK Iridium', sku: 'NGK-CPR8EAIX-9', stock: { main: 10, q2: 5 }, price: 80000, sellingPrice: 110000, warrantyPeriod: '6 tháng' },
    { id: 'P002', name: 'Nhớt Motul 300V', sku: 'MOTUL-300V-1L', stock: { main: 5, q2: 3 }, price: 450000, sellingPrice: 520000 },
    { id: 'P003', name: 'Lốp Michelin City Grip 2', sku: 'MCH-CG2-909014', stock: { main: 4, q2: 0 }, price: 950000, sellingPrice: 1100000, warrantyPeriod: '12 tháng' },
    { id: 'P004', name: 'Má phanh Bendix', sku: 'BENDIX-MD27', stock: { main: 15, q2: 7 }, price: 120000, sellingPrice: 150000, warrantyPeriod: '3 tháng' },
    { id: 'P005', name: 'Dung dịch súc rửa động cơ', sku: 'LIQUIMOLY-2427', stock: { main: 20, q2: 10 }, price: 150000, sellingPrice: 180000, expiryDate: '2024-08-25' },
    { id: 'P006', name: 'Lọc gió K&N', sku: 'KN-YA-1208', stock: { main: 8, q2: 4 }, price: 750000, sellingPrice: 850000, expiryDate: '2026-01-01' },
];

const mockCustomersData: Customer[] = [
    { id: 'C001', name: 'Nguyễn Văn A', phone: '0901234567', vehicle: 'Honda Air Blade 2022', licensePlate: '59-A1 123.45', loyaltyPoints: 150 },
    { id: 'C002', name: 'Trần Thị B', phone: '0987654321', vehicle: 'Yamaha Exciter 155', licensePlate: '72-B2 678.90', loyaltyPoints: 320 },
    { id: 'C003', name: 'Lê Hoàng Long', phone: '0912345678', vehicle: 'Honda SH 150i', licensePlate: '29-C1 555.55', loyaltyPoints: 80 },
];

const mockTransactionsData: InventoryTransaction[] = [
    { id: 'T001', type: 'Nhập kho', partId: 'P002', partName: 'Nhớt Motul 300V', quantity: 10, date: '2024-07-29', notes: 'Nhập từ nhà cung cấp A', unitPrice: 450000, totalPrice: 4500000, branchId: 'main' },
    { id: 'T002', type: 'Xuất kho', partId: 'P001', partName: 'Bugi NGK Iridium', quantity: 2, date: '2024-07-28', notes: 'Sử dụng cho đơn WO002', unitPrice: 110000, totalPrice: 220000, branchId: 'main' },
    { id: 'T003', type: 'Xuất kho', partId: 'P004', partName: 'Má phanh Bendix', quantity: 1, date: '2024-07-28', notes: 'Bán lẻ cho khách vãng lai', unitPrice: 150000, totalPrice: 150000, branchId: 'main', saleId: 'SALE-123' },
    { id: 'T004', type: 'Nhập kho', partId: 'P003', partName: 'Lốp Michelin City Grip 2', quantity: 5, date: '2024-07-27', notes: 'Nhập từ nhà cung cấp B', unitPrice: 950000, totalPrice: 4750000, branchId: 'main' },
    { id: 'T005', type: 'Nhập kho', partId: 'P001', partName: 'Bugi NGK Iridium', quantity: 20, date: '2024-03-26', notes: 'Nhập hàng định kỳ', unitPrice: 80000, totalPrice: 1600000, branchId: 'q2' },
];

const mockUsersData: User[] = [
    { 
        id: 'U001', 
        name: 'Nguyễn Xuân Nhạn',
        loginPhone: 'chucuahang', // Kept for compatibility with old login
        password: 'password123', 
        departmentIds: ['dept_admin'], 
        status: 'active',
        email: 'xuan.nhan@example.com',
        creationDate: '2023-01-15'
    },
    { 
        id: 'U002', 
        name: 'Lê Minh Kỹ Thuật',
        loginPhone: 'kythuat01', 
        password: 'password123', 
        departmentIds: ['dept_tech'], 
        status: 'active',
        email: 'minh.kt@example.com',
        creationDate: '2023-02-20'
    },
    { 
        id: 'U003', 
        name: 'Trần Thị Bán Hàng',
        loginPhone: 'banhang01', 
        password: 'password123', 
        departmentIds: [], 
        status: 'active',
        email: 'thi.bh@example.com',
        creationDate: '2023-03-10'
    },
];

const mockDepartmentsData: Department[] = [
    {
        id: 'dept_tech',
        name: 'Kỹ thuật viên',
        description: 'Thợ sửa chữa',
        permissions: {
            service: { level: 'all', details: {} },
            inventory: { level: 'restricted', details: { view: true, add: false, edit: false, delete: false } },
            sales: { level: 'none', details: {} },
            userManager: false,
        }
    },
    {
        id: 'dept_admin',
        name: 'Quản trị',
        description: 'Có thể xem được tất cả hoạt động của cửa hàng',
        permissions: {
            service: { level: 'all', details: {} },
            inventory: { level: 'all', details: {} },
            sales: { level: 'all', details: {} },
            userManager: true,
        }
    }
];


const mockStoreSettingsData: StoreSettings = {
    name: "MotoCare Pro",
    address: "123 Đường ABC, Quận 1, TP. HCM",
    phone: "0987.654.321",
    bankName: "Vietcombank",
    bankAccountNumber: "1234567890",
    bankAccountHolder: "MOTO CARE PRO",
    branches: [
        { id: 'main', name: 'Chi nhánh Chính' },
        { id: 'q2', name: 'Chi nhánh Quận 2' },
    ]
};

const mockSuppliersData: Supplier[] = [
    { id: 'SUP001', name: 'Nguyễn Xuân Nhạn', phone: '0915449550' },
    { id: 'SUP002', name: 'Cty TNHH TM-DV Phương Thuỷ', phone: '0907855077' },
    { id: 'SUP003', name: 'Cty TM Song Đại Long', phone: '0287777369' },
    { id: 'SUP004', name: 'Kho sỉ Thập Nhất Phong', phone: '0988123456' },
];

const mockPaymentSourcesData: PaymentSource[] = [
    { id: 'cash', name: 'Tiền mặt', balance: 14373238, isDefault: true },
    { id: 'bank', name: 'Tài khoản ngân hàng', balance: 50000000 },
];

const mockCashTransactionsData: CashTransaction[] = [];


// Custom hook to manage state with localStorage
function useLocalStorageState<T>(key: string, defaultValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
    // If defaultValue is a function, call it to get the initial value
    return defaultValue instanceof Function ? defaultValue() : defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
}


const App: React.FC = () => {
  const [workOrders, setWorkOrders] = useLocalStorageState<WorkOrder[]>('motocare_workOrders', mockWorkOrdersData);
  const [parts, setParts] = useLocalStorageState<Part[]>('motocare_parts', mockPartsData);
  const [customers, setCustomers] = useLocalStorageState<Customer[]>('motocare_customers', mockCustomersData);
  const [transactions, setTransactions] = useLocalStorageState<InventoryTransaction[]>('motocare_transactions', mockTransactionsData);
  const [users, setUsers] = useLocalStorageState<User[]>('motocare_users', mockUsersData);
  const [departments, setDepartments] = useLocalStorageState<Department[]>('motocare_departments', mockDepartmentsData);
  const [storeSettings, setStoreSettings] = useLocalStorageState<StoreSettings>('motocare_storeSettings', mockStoreSettingsData);
  const [suppliers, setSuppliers] = useLocalStorageState<Supplier[]>('motocare_suppliers', mockSuppliersData);
  const [paymentSources, setPaymentSources] = useLocalStorageState<PaymentSource[]>('motocare_paymentSources', mockPaymentSourcesData);
  const [cashTransactions, setCashTransactions] = useLocalStorageState<CashTransaction[]>('motocare_cashTransactions', mockCashTransactionsData);

  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [isAuthenticated, setIsAuthenticated] = useLocalStorageState<boolean>('motocare_isAuthenticated', false);
  const [currentUserId, setCurrentUserId] = useLocalStorageState<string | null>('motocare_currentUserId', null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useLocalStorageState<string>('motocare_currentBranchId', 'main');

  const currentUser = users.find(u => u.id === currentUserId);
  
  // Ensure currentBranchId is valid
  useEffect(() => {
    if (!storeSettings.branches.some(b => b.id === currentBranchId)) {
        setCurrentBranchId(storeSettings.branches[0]?.id || 'main');
    }
  }, [currentBranchId, storeSettings.branches, setCurrentBranchId]);

  const handleLogin = (loginIdentifier: string, password: string): boolean => {
    const user = users.find(u => (u.loginPhone === loginIdentifier || u.name === loginIdentifier) && u.password === password && u.status === 'active');
    if (user) {
      setCurrentUserId(user.id);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserId(null);
  };

  const setCurrentUser = (user: User) => {
    if (user) {
        setCurrentUserId(user.id);
    }
  };
  
  // Effect to handle inconsistent state (e.g. authenticated but no user)
  useEffect(() => {
    if(isAuthenticated && !currentUser) {
        handleLogout();
    }
  }, [isAuthenticated, currentUser]);


  if (!isAuthenticated || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 font-sans print:hidden">
        <Sidebar 
          currentUser={currentUser} 
          users={users}
          departments={departments}
          setCurrentUser={setCurrentUser}
          storeSettings={storeSettings}
          setStoreSettings={setStoreSettings}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onLogout={handleLogout}
          currentBranchId={currentBranchId}
          setCurrentBranchId={setCurrentBranchId}
        />
        {/* Overlay for mobile */}
        {isSidebarOpen && (
             <div 
                onClick={() => setIsSidebarOpen(false)} 
                className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                aria-hidden="true"
            ></div>
        )}
        <div className="flex flex-col flex-1 w-full min-w-0">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard workOrders={workOrders} transactions={transactions} parts={parts} currentBranchId={currentBranchId} />} />
              <Route path="/services" element={<ServiceManager currentUser={currentUser} workOrders={workOrders} setWorkOrders={setWorkOrders} parts={parts} storeSettings={storeSettings} currentBranchId={currentBranchId} customers={customers} setCustomers={setCustomers} />} />
              <Route path="/sales" element={<SalesManager 
                currentUser={currentUser}
                workOrders={workOrders} 
                transactions={transactions} 
                parts={parts} 
                setParts={setParts} 
                setTransactions={setTransactions} 
                cartItems={cartItems}
                setCartItems={setCartItems}
                storeSettings={storeSettings}
                currentBranchId={currentBranchId}
                customers={customers}
                setCustomers={setCustomers}
              />} />
              <Route path="/inventory" element={<InventoryManager currentUser={currentUser} parts={parts} setParts={setParts} transactions={transactions} setTransactions={setTransactions} currentBranchId={currentBranchId} storeSettings={storeSettings} />} />
              <Route path="/inventory/goods-receipt/new" element={<CreateGoodsReceipt 
                  parts={parts}
                  setParts={setParts}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  suppliers={suppliers}
                  setSuppliers={setSuppliers}
                  storeSettings={storeSettings}
                  currentBranchId={currentBranchId}
              />} />
              <Route path="/customers" element={<CustomerManager customers={customers} setCustomers={setCustomers} />} />
              <Route path="/cashflow" element={<CashflowManager 
                cashTransactions={cashTransactions}
                setCashTransactions={setCashTransactions}
                paymentSources={paymentSources}
                setPaymentSources={setPaymentSources}
                customers={customers}
                setCustomers={setCustomers}
                suppliers={suppliers}
                setSuppliers={setSuppliers}
                currentBranchId={currentBranchId}
              />} />
              <Route path="/ai-assistant" element={<AiAssistant />} />
              <Route path="/users" element={<UserManager currentUser={currentUser} users={users} setUsers={setUsers} departments={departments} setDepartments={setDepartments} />} />
              <Route path="/reports/revenue" element={<RevenueReport workOrders={workOrders} transactions={transactions} parts={parts} currentBranchId={currentBranchId} />} />
              <Route path="/reports/inventory" element={<InventoryReport parts={parts} transactions={transactions} currentBranchId={currentBranchId} storeSettings={storeSettings} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;