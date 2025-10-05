import React, { useState, useId } from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, WrenchScrewdriverIcon, ArchiveBoxIcon, UsersIcon, SparklesIcon, ShoppingCartIcon, UserGroupIcon, Cog6ToothIcon, ChartBarIcon, DocumentChartBarIcon, XMarkIcon, ArrowRightEndOnRectangleIcon, PlusIcon, TrashIcon, BuildingLibraryIcon } from './common/Icons';
import type { User, StoreSettings, Department } from '../types';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  const activeClass = 'bg-sky-600 text-white';
  const inactiveClass = 'text-slate-300 hover:bg-sky-800 hover:text-white';

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`
      }
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </NavLink>
  );
};

const StoreSettingsModal: React.FC<{
    settings: StoreSettings;
    onSave: (newSettings: StoreSettings) => void;
    onClose: () => void;
}> = ({ settings, onSave, onClose }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const formId = useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleBranchChange = (index: number, value: string) => {
        const newBranches = [...localSettings.branches];
        newBranches[index].name = value;
        setLocalSettings(prev => ({...prev, branches: newBranches}));
    }

    const handleAddBranch = () => {
        const newBranch = { id: `branch_${Date.now()}`, name: 'Chi nhánh mới' };
        setLocalSettings(prev => ({...prev, branches: [...prev.branches, newBranch]}));
    }

    const handleRemoveBranch = (index: number) => {
        if (localSettings.branches.length <= 1) {
            alert('Phải có ít nhất một chi nhánh.');
            return;
        }
        const newBranches = localSettings.branches.filter((_, i) => i !== index);
        setLocalSettings(prev => ({...prev, branches: newBranches}));
    }

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
                 <div className="p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">Cài đặt Cửa hàng</h2>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 w-full">Thông tin chung</legend>
                        <div>
                            <label htmlFor={`${formId}-name`} className="block text-sm font-medium text-slate-700">Tên cửa hàng</label>
                            <input id={`${formId}-name`} type="text" name="name" value={localSettings.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                        </div>
                         <div>
                            <label htmlFor={`${formId}-address`} className="block text-sm font-medium text-slate-700">Địa chỉ</label>
                            <input id={`${formId}-address`} type="text" name="address" value={localSettings.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                        </div>
                        <div>
                            <label htmlFor={`${formId}-phone`} className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                            <input id={`${formId}-phone`} type="text" name="phone" value={localSettings.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                        </div>
                    </fieldset>
                    
                    <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 w-full">Thông tin thanh toán</legend>
                        <div>
                            <label htmlFor={`${formId}-bankName`} className="block text-sm font-medium text-slate-700">Ngân hàng</label>
                            <input id={`${formId}-bankName`} type="text" name="bankName" value={localSettings.bankName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                        </div>
                         <div>
                            <label htmlFor={`${formId}-bankAccountNumber`} className="block text-sm font-medium text-slate-700">Số tài khoản</label>
                            <input id={`${formId}-bankAccountNumber`} type="text" name="bankAccountNumber" value={localSettings.bankAccountNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                        </div>
                        <div>
                            <label htmlFor={`${formId}-bankAccountHolder`} className="block text-sm font-medium text-slate-700">Chủ tài khoản</label>
                            <input id={`${formId}-bankAccountHolder`} type="text" name="bankAccountHolder" value={localSettings.bankAccountHolder} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                        </div>
                    </fieldset>

                    <fieldset className="space-y-3">
                         <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 w-full">Quản lý Chi nhánh</legend>
                            {localSettings.branches.map((branch, index) => (
                                <div key={branch.id} className="flex items-center space-x-2">
                                    <input type="text" value={branch.name} onChange={(e) => handleBranchChange(index, e.target.value)} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900" />
                                    <button type="button" onClick={() => handleRemoveBranch(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                         <button type="button" onClick={handleAddBranch} className="flex items-center text-sm text-sky-600 font-medium hover:text-sky-800">
                            <PlusIcon className="w-4 h-4 mr-1"/> Thêm chi nhánh
                         </button>
                    </fieldset>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 mt-auto border-t border-slate-200">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
                        Hủy
                    </button>
                    <button type="button" onClick={handleSave} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
                        Lưu Cài đặt
                    </button>
                </div>
            </div>
        </div>
    );
};

interface SidebarProps {
    currentUser: User;
    users: User[];
    departments: Department[];
    setCurrentUser: (user: User) => void;
    storeSettings: StoreSettings;
    setStoreSettings: (settings: StoreSettings) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => void;
    currentBranchId: string;
    setCurrentBranchId: (branchId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, users, departments, setCurrentUser, storeSettings, setStoreSettings, isOpen, setIsOpen, onLogout, currentBranchId, setCurrentBranchId }) => {
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUser = users.find(u => u.id === event.target.value);
        if (selectedUser) {
            setCurrentUser(selectedUser);
        }
    };
    
    const handleBranchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentBranchId(event.target.value);
    };
    
    // Create a pseudo-role for compatibility with the existing nav structure
    const pseudoRole = useId();
    const userDepartments = currentUser.departmentIds.map(id => departments.find(d => d.id === id)).filter((d): d is Department => !!d);
    const isAdmin = userDepartments.some(d => d.name === 'Quản trị');
    const isTechnician = userDepartments.some(d => d.name === 'Kỹ thuật viên');

    const getPseudoRole = (): 'Admin' | 'Kỹ thuật viên' | 'Nhân viên Bán hàng' => {
        if (isAdmin) return 'Admin';
        if (isTechnician) return 'Kỹ thuật viên';
        return 'Nhân viên Bán hàng';
    }

    const navLinks = {
        all: [
            { to: "/dashboard", icon: <DashboardIcon />, label: "Bảng điều khiển" }
        ],
        Admin: [
            { to: "/services", icon: <WrenchScrewdriverIcon />, label: "Quản lý Dịch vụ" },
            { to: "/sales", icon: <ShoppingCartIcon />, label: "Bán hàng" },
            { to: "/inventory", icon: <ArchiveBoxIcon />, label: "Quản lý Kho" },
            { to: "/customers", icon: <UsersIcon />, label: "Khách hàng" },
            { to: "/cashflow", icon: <BuildingLibraryIcon />, label: "Quản lý Thu Chi" },
            { to: "/reports/revenue", icon: <ChartBarIcon className="h-6 w-6" />, label: "Báo cáo Doanh thu" },
            { to: "/reports/inventory", icon: <DocumentChartBarIcon className="h-6 w-6" />, label: "Báo cáo Tồn kho" },
            { to: "/users", icon: <UserGroupIcon className="h-6 w-6" />, label: "Nhân viên" },
            { to: "/ai-assistant", icon: <SparklesIcon />, label: "Trợ lý AI" },
        ],
        'Kỹ thuật viên': [
            { to: "/services", icon: <WrenchScrewdriverIcon />, label: "Quản lý Dịch vụ" },
            { to: "/inventory", icon: <ArchiveBoxIcon />, label: "Quản lý Kho" },
            { to: "/ai-assistant", icon: <SparklesIcon />, label: "Trợ lý AI" },
        ],
        'Nhân viên Bán hàng': [
            { to: "/sales", icon: <ShoppingCartIcon />, label: "Bán hàng" },
            { to: "/inventory", icon: <ArchiveBoxIcon />, label: "Quản lý Kho" },
            { to: "/customers", icon: <UsersIcon />, label: "Khách hàng" },
        ]
    };

    const allowedLinks = [
        ...navLinks.all,
        ...(navLinks[getPseudoRole()] || [])
    ];

  return (
    <aside className={`flex flex-col w-64 bg-slate-800 text-white h-full fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {isSettingsModalOpen && (
          <StoreSettingsModal 
            settings={storeSettings}
            onSave={setStoreSettings}
            onClose={() => setIsSettingsModalOpen(false)}
          />
      )}
      <div className="flex items-center justify-between h-16 border-b border-slate-700 px-4">
        <button
          onClick={() => isAdmin && setIsSettingsModalOpen(true)}
          disabled={!isAdmin}
          className={`flex items-center w-full text-left overflow-hidden p-2 rounded-md ${isAdmin ? 'hover:bg-slate-700 cursor-pointer' : 'cursor-default'}`}
        >
          <WrenchScrewdriverIcon className="w-8 h-8 text-sky-400 flex-shrink-0"/>
          <h1 className="text-xl font-bold ml-2 truncate" title={storeSettings.name}>{storeSettings.name}</h1>
          {isAdmin && <Cog6ToothIcon className="w-5 h-5 ml-auto text-slate-400 flex-shrink-0" />}
        </button>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-2 -mr-2">
            <XMarkIcon className="w-6 h-6"/>
        </button>
      </div>

       <div className="px-4 py-4 border-b border-slate-700">
            <label htmlFor="branch-switcher" className="block text-sm font-medium text-slate-400 mb-2">
                Chi nhánh làm việc:
            </label>
            <select 
                id="branch-switcher"
                value={currentBranchId}
                onChange={handleBranchChange}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
                {storeSettings.branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                    </option>
                ))}
            </select>
        </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {allowedLinks.map(link => (
            <NavItem key={link.to} to={link.to} icon={link.icon} label={link.label} onClick={() => setIsOpen(false)}/>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="px-2 py-2 border-t border-slate-700">
            <button
                onClick={onLogout}
                className="flex items-center w-full px-4 py-3 my-1 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
                >
                <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
                <span className="ml-4 font-medium">Đăng xuất</span>
            </button>
        </div>

        <div className="px-4 py-4 border-t border-slate-700">
            <label htmlFor="user-switcher" className="block text-sm font-medium text-slate-400 mb-2">
                Chuyển đổi tài khoản:
            </label>
            <select 
                id="user-switcher"
                value={currentUser.id}
                onChange={handleUserChange}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name} ({userDepartments.find(d => user.departmentIds.includes(d.id))?.name || 'Chưa phân quyền'})
                    </option>
                ))}
            </select>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;