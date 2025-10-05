import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { User, Department, Permissions, PermissionLevel, ModulePermission } from '../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, ShieldCheckIcon, TableCellsIcon, XMarkIcon, EllipsisVerticalIcon, ArrowUturnLeftIcon, CheckCircleIcon } from './common/Icons';

// --- NEW PASSWORD MODAL ---
const ChangePasswordModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (password: string) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        setError('');
        if (!newPassword || newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        onSave(newPassword);
    };
    
    useEffect(() => {
        if (isOpen) {
            setNewPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[80] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-bold text-slate-800">Đổi mật khẩu</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Mật khẩu mới</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full p-2 border rounded-md" autoFocus />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div className="bg-slate-50 px-6 py-3 flex justify-end space-x-3 border-t">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">Hủy</button>
                    <button onClick={handleSave} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700">Lưu</button>
                </div>
            </div>
        </div>
    );
};


// --- CONFIG ---
const ALL_COLUMNS = [
    { key: 'stt', name: 'STT' },
    { key: 'name', name: 'Tên' },
    { key: 'loginPhone', name: 'ĐT Đăng nhập' },
    { key: 'email', name: 'Email' },
    { key: 'address', name: 'Địa chỉ' },
    { key: 'departments', name: 'Phòng / Ban' },
    { key: 'status', name: 'Trạng thái' },
    { key: 'creationDate', name: 'Ngày tạo' },
];

const DEFAULT_VISIBLE_COLUMNS = ['stt', 'name', 'loginPhone', 'email', 'status', 'departments'];

const PERMISSION_CONFIG: { [key: string]: { name: string; type: 'detailed' | 'toggle'; options?: { [key: string]: string } } } = {
    dashboard: { name: 'Trang chủ', type: 'detailed', options: { viewReports: 'Xem báo cáo', viewWarnings: 'Xem cảnh báo' } },
    service: { name: 'Sửa chữa - Bảo hành', type: 'detailed', options: { view: 'Xem danh sách', add: 'Thêm mới', edit: 'Chỉnh sửa', delete: 'Xóa', print: 'In biên nhận' } },
    sales: { name: 'Bán hàng', type: 'detailed', options: { create: 'Tạo đơn', viewHistory: 'Xem lịch sử', edit: 'Sửa đơn', delete: 'Xóa đơn' } },
    inventory: { name: 'Quản lý kho', type: 'detailed', options: { view: 'Xem tồn kho', add: 'Thêm sản phẩm', edit: 'Sửa sản phẩm', delete: 'Xóa', createReceipt: 'Nhập kho', createDispatch: 'Xuất kho', transfer: 'Chuyển kho' } },
    customers: { name: 'Khách hàng', type: 'detailed', options: { view: 'Xem', add: 'Thêm', edit: 'Sửa', delete: 'Xóa' } },
    cashflow: { name: 'Sổ quỹ', type: 'toggle' },
    activityLog: { name: 'Nhật ký thao tác', type: 'toggle' },
    userManager: { name: 'Quản lý nhân viên', type: 'toggle' },
    reports: { name: 'Báo cáo', type: 'detailed', options: { revenue: 'Báo cáo doanh thu', inventory: 'Báo cáo tồn kho' } },
};

// --- MODALS & SUB-COMPONENTS ---

const ColumnSelectorModal: React.FC<{
    visibleColumns: string[];
    onApply: (newColumns: string[]) => void;
    onClose: () => void;
}> = ({ visibleColumns, onApply, onClose }) => {
    const [selection, setSelection] = useState<string[]>(visibleColumns);

    const handleToggle = (key: string) => {
        setSelection(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Chọn dữ liệu hiển thị</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500" /></button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    {ALL_COLUMNS.map(col => (
                        <label key={col.key} className="flex items-center space-x-3">
                            <input type="checkbox" checked={selection.includes(col.key)} onChange={() => handleToggle(col.key)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                            <span className="text-slate-700">{col.name}</span>
                        </label>
                    ))}
                </div>
                <div className="bg-slate-50 px-6 py-3 flex justify-between items-center border-t">
                    <div>
                        <button onClick={() => setSelection(DEFAULT_VISIBLE_COLUMNS)} className="text-sm text-sky-600 hover:underline">Đặt mặc định</button>
                        <button onClick={() => setSelection([])} className="text-sm text-red-600 hover:underline ml-4">Xoá tuỳ chọn</button>
                    </div>
                    <button onClick={() => onApply(selection)} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">Áp dụng</button>
                </div>
            </div>
        </div>
    );
};

const PermissionRow: React.FC<{
    moduleKey: string;
    config: { name: string; type: 'detailed' | 'toggle'; options?: { [key: string]: string } };
    value: ModulePermission | boolean;
    onChange: (newValue: ModulePermission | boolean) => void;
}> = ({ moduleKey, config, value, onChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLevelChange = (level: PermissionLevel) => {
        if (config.type === 'detailed') {
            const currentDetails = typeof value === 'object' ? value.details : {};
            onChange({ level, details: currentDetails });
        }
    };

    const handleDetailChange = (detailKey: string, checked: boolean) => {
        if (typeof value === 'object') {
            const newDetails = { ...(value.details || {}), [detailKey]: checked };
            onChange({ ...value, details: newDetails });
        }
    };

    if (config.type === 'toggle') {
        return (
            <div className="flex justify-between items-center p-3 border rounded-md bg-white">
                <span className="font-medium text-slate-700">{config.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
            </div>
        );
    }
    
    const level = (typeof value === 'object' ? value.level : 'none');

    return (
        <div className="border rounded-md bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center p-3 gap-2">
                <div className="md:col-span-1 font-medium text-slate-700">{config.name}</div>
                <div className="md:col-span-3 grid grid-cols-3 gap-2">
                    {(['all', 'restricted', 'none'] as PermissionLevel[]).map(l => (
                        <label key={l} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-slate-100">
                            <input type="radio" name={moduleKey} value={l} checked={level === l} onChange={() => handleLevelChange(l)} className="text-sky-600 focus:ring-sky-500" />
                            <span className="capitalize">{l === 'all' ? 'Tất cả' : l === 'restricted' ? 'Hạn chế' : 'Không'}</span>
                        </label>
                    ))}
                </div>
            </div>
            {level === 'restricted' && (
                <div className="p-3 border-t bg-slate-50">
                    <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-sky-600 hover:underline mb-2">
                        Xem chi tiết {Object.keys(config.options || {}).length} hạng mục
                    </button>
                    {isExpanded && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                            {Object.entries(config.options || {}).map(([key, label]) => (
                                <label key={key} className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" checked={!!(typeof value === 'object' && value.details?.[key])} onChange={(e) => handleDetailChange(key, e.target.checked)} className="rounded text-sky-600 focus:ring-sky-500" />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PermissionsModal: React.FC<{
    department: Partial<Department> | null;
    onClose: () => void;
    onSave: (department: Department) => void;
}> = ({ department, onClose, onSave }) => {
    const [data, setData] = useState<Partial<Department>>({});

    useEffect(() => {
        const initialPermissions = Object.keys(PERMISSION_CONFIG).reduce((acc, key) => {
            const config = PERMISSION_CONFIG[key];
            acc[key] = config.type === 'toggle' ? false : { level: 'none', details: {} };
            return acc;
        }, {} as Permissions);

        const initialData: Partial<Department> = department 
            ? { ...department, permissions: { ...initialPermissions, ...(department.permissions || {}) } }
            : { name: '', description: '', permissions: initialPermissions };
        setData(initialData);
    }, [department]);
    
    const handlePermissionChange = (moduleKey: string, newValue: ModulePermission | boolean) => {
        setData(prev => ({ ...prev, permissions: { ...(prev.permissions || {}), [moduleKey]: newValue } }));
    };

    const handleSave = () => {
        if (!data.name) {
            alert('Vui lòng nhập tên phòng ban.');
            return;
        }
        const finalData: Department = {
            id: data.id || `dept_${Date.now()}`,
            name: data.name,
            description: data.description || '',
            permissions: data.permissions || {},
        };
        onSave(finalData);
    };

    if (!department) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
            <div className="bg-slate-100 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="p-4 border-b bg-white rounded-t-lg flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{department.id ? 'Chỉnh sửa thông tin' : 'Thêm phòng ban'}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500" /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên (*)</label>
                            <input type="text" value={data.name || ''} onChange={e => setData(d => ({...d, name: e.target.value}))} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Mô tả</label>
                            <input type="text" value={data.description || ''} onChange={e => setData(d => ({...d, description: e.target.value}))} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-800 text-lg">Phân quyền</h4>
                        {Object.entries(PERMISSION_CONFIG).map(([key, config]) => (
                             <PermissionRow 
                                key={key}
                                moduleKey={key}
                                config={config}
                                value={data.permissions?.[key] ?? (config.type === 'toggle' ? false : { level: 'none' })}
                                onChange={(newValue) => handlePermissionChange(key, newValue)}
                            />
                        ))}
                    </div>
                </div>
                <div className="bg-white px-6 py-3 flex justify-end space-x-3 border-t rounded-b-lg">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">Hủy</button>
                    <button onClick={handleSave} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">Lưu và đóng</button>
                </div>
            </div>
        </div>
    );
};

const DepartmentsListModal: React.FC<{
    departments: Department[];
    onClose: () => void;
    onSave: (department: Department) => void;
    onDelete: (departmentId: string) => void;
}> = ({ departments, onClose, onSave, onDelete }) => {
    const [editingDepartment, setEditingDepartment] = useState<Partial<Department> | null>(null);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
            {editingDepartment && (
                <PermissionsModal 
                    department={editingDepartment} 
                    onClose={() => setEditingDepartment(null)} 
                    onSave={(dept) => { onSave(dept); setEditingDepartment(null); }}
                />
            )}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Danh sách phòng ban</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500" /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-3">
                    {departments.map(dept => (
                        <div key={dept.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-slate-50">
                            <div>
                                <p className="font-semibold text-slate-800">{dept.name}</p>
                                <p className="text-sm text-slate-600">{dept.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setEditingDepartment(dept)} className="p-2 text-sky-600 hover:text-sky-800"><PencilSquareIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(dept.id)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t flex justify-end">
                    <button onClick={() => setEditingDepartment({})} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 flex items-center gap-2"><PlusIcon/> Thêm mới</button>
                </div>
            </div>
        </div>
    )
};

const UserModal: React.FC<{
    user: User | null;
    onClose: () => void;
    onSave: (user: User) => void;
    departments: Department[];
    users: User[];
}> = ({ user, onClose, onSave, departments, users }) => {
    const [step, setStep] = useState(1);
    const [loginPhone, setLoginPhone] = useState('');
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);


    useEffect(() => {
        if (user) {
            setFormData(user);
            setLoginPhone(user.loginPhone);
            setStep(2);
        } else {
            setFormData({ status: 'active', departmentIds: [] });
            setLoginPhone('');
            setStep(1);
        }
        setIsChangePasswordOpen(false);
    }, [user]);

    const handleNextStep = () => {
        if (!loginPhone.trim()) {
            alert('Vui lòng nhập số điện thoại đăng nhập.');
            return;
        }
        if (!user && users.some(u => u.loginPhone === loginPhone.trim())) {
            alert('Số điện thoại này đã được sử dụng.');
            return;
        }
        setFormData(prev => ({...prev, loginPhone: loginPhone.trim()}));
        setStep(2);
    };
    
    const handleSave = (andAddAnother: boolean = false) => {
        if (!formData.name) {
            alert('Vui lòng nhập tên nhân viên.');
            return;
        }

        if (!formData.loginPhone || !formData.loginPhone.trim()) {
            alert('Vui lòng nhập số điện thoại đăng nhập.');
            return;
        }
    
        // Check for uniqueness, excluding the current user being edited
        if (users.some(u => u.loginPhone === formData.loginPhone?.trim() && u.id !== formData.id)) {
            alert('Số điện thoại này đã được sử dụng bởi một nhân viên khác.');
            return;
        }
        
        const finalData: User = {
            id: formData.id || `U${Date.now()}`,
            name: formData.name,
            loginPhone: formData.loginPhone!,
            password: formData.password || 'password123', // Default password for new users
            status: formData.status || 'active',
            departmentIds: formData.departmentIds || [],
            creationDate: formData.creationDate || new Date().toISOString().split('T')[0],
            ...formData
        };

        onSave(finalData);

        if (andAddAnother) {
            setFormData({ status: 'active', departmentIds: [] });
            setLoginPhone('');
            setStep(1);
        } else {
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
            {isChangePasswordOpen && (
                <ChangePasswordModal
                    isOpen={isChangePasswordOpen}
                    onClose={() => setIsChangePasswordOpen(false)}
                    onSave={(newPassword) => {
                        setFormData(d => ({ ...d, password: newPassword }));
                        setIsChangePasswordOpen(false);
                    }}
                />
            )}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b bg-orange-500 rounded-t-lg text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">{user ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</h3>
                    <button onClick={onClose} className="text-white opacity-70 hover:opacity-100"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                
                {/* Stepper */}
                <div className="flex p-4 border-b">
                    <div className="flex items-center">
                        <CheckCircleIcon className={`w-6 h-6 ${step >= 1 ? 'text-sky-600' : 'text-slate-400'}`}/>
                        <span className={`ml-2 font-semibold ${step >= 1 ? 'text-sky-600' : 'text-slate-500'}`}>Điện thoại đăng nhập</span>
                    </div>
                    <div className="flex-1 border-t-2 mx-4 mt-3 border-dashed"></div>
                     <div className="flex items-center">
                        <CheckCircleIcon className={`w-6 h-6 ${step === 2 ? 'text-sky-600' : 'text-slate-400'}`}/>
                        <span className={`ml-2 font-semibold ${step === 2 ? 'text-sky-600' : 'text-slate-500'}`}>Thêm thành viên</span>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <label className="text-lg font-semibold mb-4">Số điện thoại đăng nhập</label>
                            <input 
                                type="text" 
                                value={loginPhone} 
                                onChange={e => setLoginPhone(e.target.value)} 
                                className="w-full max-w-sm p-3 text-center border-2 rounded-lg text-lg focus:ring-sky-500 focus:border-sky-500" 
                                placeholder="Nhập số điện thoại..."
                                autoFocus
                            />
                             <button onClick={handleNextStep} className="mt-6 bg-orange-500 text-white font-bold py-2 px-8 rounded-lg hover:bg-orange-600">Tiếp tục</button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Số điện thoại đăng nhập (*)</label>
                                <input type="text" value={formData.loginPhone || ''} onChange={e => setFormData(d => ({...d, loginPhone: e.target.value}))} className="mt-1 w-full p-2 border rounded-md bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Tên (*)</label>
                                <input type="text" value={formData.name || ''} onChange={e => setFormData(d => ({...d, name: e.target.value}))} className="mt-1 w-full p-2 border rounded-md" autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
                                <div className="flex gap-4 mt-2">
                                    <label><input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={() => setFormData(d => ({...d, status: 'active'}))} className="mr-1"/> Hoạt động</label>
                                    <label><input type="radio" name="status" value="inactive" checked={formData.status === 'inactive'} onChange={() => setFormData(d => ({...d, status: 'inactive'}))} className="mr-1"/> Bị khoá</label>
                                </div>
                            </div>
                            {user && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                                    <button type="button" onClick={() => setIsChangePasswordOpen(true)} className="mt-1 text-sm text-sky-600 hover:underline font-medium">
                                        Đặt lại mật khẩu
                                    </button>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Phòng ban</label>
                                <div className="mt-2 space-y-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                                    {departments.map(dept => (
                                        <label key={dept.id} className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.departmentIds?.includes(dept.id)}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    setFormData(d => ({ ...d, departmentIds: checked ? [...(d.departmentIds || []), dept.id] : (d.departmentIds || []).filter(id => id !== dept.id) }));
                                                }}
                                                className="mr-2 rounded"
                                            />
                                            {dept.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {step === 2 && (
                    <div className="bg-slate-50 px-6 py-3 border-t flex justify-between items-center">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900"><ArrowUturnLeftIcon className="w-5 h-5"/> Quay lại</button>
                        <div className="flex gap-3">
                            <button onClick={() => handleSave(false)} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">Lưu</button>
                            {!user && <button onClick={() => handleSave(true)} className="bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-700">Lưu và thêm tiếp</button>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
interface UserManagerProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser, users, setUsers, departments, setDepartments }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
        const saved = localStorage.getItem('motocare_user_cols');
        return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
    });
    const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isDepartmentsModalOpen, setIsDepartmentsModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('motocare_user_cols', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const filteredUsers = useMemo(() =>
        users.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.loginPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [users, searchTerm]
    );

    const handleSaveUser = (user: User) => {
        setUsers(prev => {
            const exists = prev.some(u => u.id === user.id);
            return exists ? prev.map(u => u.id === user.id ? user : u) : [user, ...prev];
        });
    };
    
    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    const handleSaveDepartment = (dept: Department) => {
        setDepartments(prev => {
            const exists = prev.some(d => d.id === dept.id);
            return exists ? prev.map(d => d.id === dept.id ? dept : d) : [dept, ...prev];
        });
    };
    
    const handleDeleteDepartment = (deptId: string) => {
         if (window.confirm('Bạn có chắc chắn muốn xóa phòng ban này? Các nhân viên thuộc phòng ban này sẽ bị gỡ ra.')) {
            setDepartments(prev => prev.filter(d => d.id !== deptId));
            setUsers(prev => prev.map(u => ({ ...u, departmentIds: u.departmentIds.filter(id => id !== deptId) })));
        }
    };
    
    return (
        <div className="space-y-6">
            {isColumnSelectorOpen && <ColumnSelectorModal visibleColumns={visibleColumns} onApply={setVisibleColumns} onClose={() => setIsColumnSelectorOpen(false)} />}
            {isUserModalOpen && <UserModal user={editingUser} onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }} onSave={handleSaveUser} departments={departments} users={users} />}
            {isDepartmentsModalOpen && <DepartmentsListModal departments={departments} onClose={() => setIsDepartmentsModalOpen(false)} onSave={handleSaveDepartment} onDelete={handleDeleteDepartment} />}
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <input type="text" placeholder="Tìm kiếm nhân viên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-72 p-2 border rounded-md"/>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700"><PlusIcon/> Thêm mới</button>
                    <button onClick={() => setIsDepartmentsModalOpen(true)} className="flex items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-700"><ShieldCheckIcon/> Phân quyền</button>
                    <button onClick={() => setIsColumnSelectorOpen(true)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200" title="Chọn cột hiển thị"><TableCellsIcon className="w-6 h-6"/></button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-x-auto">
                 <table className="w-full text-left min-w-max">
                    <thead className="border-b bg-slate-50">
                        <tr>
                            {visibleColumns.map(key => {
                                const col = ALL_COLUMNS.find(c => c.key === key);
                                return <th key={key} className="p-3 font-semibold text-slate-600">{col?.name}</th>
                            })}
                            <th className="p-3 font-semibold text-slate-600"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={user.id} className="border-b hover:bg-slate-50">
                                {visibleColumns.map(key => (
                                    <td key={key} className="p-3 text-slate-800">
                                        {(() => {
                                            switch (key) {
                                                case 'stt': return index + 1;
                                                case 'name': return <span className="font-semibold">{user.name}</span>;
                                                case 'status': return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status === 'active' ? 'Hoạt động' : 'Bị khoá'}</span>;
                                                case 'departments': return user.departmentIds.map(id => departments.find(d => d.id === id)?.name).join(', ');
                                                default: return user[key as keyof User] as string || '';
                                            }
                                        })()}
                                    </td>
                                ))}
                                <td className="p-3">
                                     <div className="flex items-center gap-2">
                                        <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} className="p-1 text-sky-600 hover:text-sky-800"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                  {filteredUsers.length === 0 && <div className="text-center p-8 text-slate-500">Không tìm thấy nhân viên nào.</div>}
            </div>
        </div>
    );
};

export default UserManager;