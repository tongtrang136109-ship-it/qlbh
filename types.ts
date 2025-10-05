// Fix: Replaced incorrect file content with all necessary type definitions for the application.

export interface User {
  id: string;
  name: string;
  loginPhone: string;
  password: string; // Note: In a real app, this should be a hash
  email?: string;
  status: 'active' | 'inactive';
  departmentIds: string[];
  creationDate: string;
  address?: string;
}

export type PermissionLevel = 'all' | 'restricted' | 'none';

export interface ModulePermission {
    level: PermissionLevel;
    details?: { [key: string]: boolean };
}

export interface Permissions {
    [moduleKey: string]: ModulePermission | boolean; // boolean for simple toggles
}

export interface Department {
    id: string;
    name: string;
    description: string;
    permissions: Permissions;
}


export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    branches: { id: string; name: string }[];
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  stock: { [branchId: string]: number };
  price: number; // Purchase price
  sellingPrice: number;
  category?: string;
  description?: string;
  warrantyPeriod?: string;
  expiryDate?: string;
}

export interface WorkOrderPart {
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  price: number; // Selling price at the time of service
}

export interface WorkOrder {
  id: string;
  creationDate: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  licensePlate: string;
  issueDescription: string;
  technicianName: string;
  status: 'Tiếp nhận' | 'Đang sửa' | 'Đã sửa xong' | 'Trả máy';
  total: number;
  branchId: string;
  laborCost: number;
  partsUsed?: WorkOrderPart[];
  notes?: string;
  processingType?: string;
  customerQuote?: number;
  discount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  loyaltyPoints: number;
}

export interface InventoryTransaction {
    id: string;
    type: 'Nhập kho' | 'Xuất kho';
    partId: string;
    partName: string;
    quantity: number;
    date: string;
    notes: string;
    unitPrice?: number;
    totalPrice: number;
    branchId: string;
    saleId?: string;
    transferId?: string;
    discount?: number;
    customerId?: string;
    customerName?: string;
    userId?: string;
    userName?: string;
}

export interface CartItem {
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  stock: number; // Available stock at time of adding to cart
  discount?: number;
  warrantyPeriod?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
}

export interface PaymentSource {
    id: string;
    name: string;
    balance: number;
    isDefault?: boolean;
}

export interface CashTransaction {
    id: string;
    type: 'income' | 'expense';
    date: string;
    amount: number;
    contact: {
        id: string;
        name: string;
    };
    notes: string;
    paymentSourceId: string;
    branchId: string;
}

export interface ReceiptItem {
    partId: string;
    partName: string;
    sku: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    warrantyPeriod?: string;
}

export type ContactType = 'Khách hàng' | 'Nhà cung cấp' | 'Đối tác sửa chữa' | 'Đối tác tài chính';

export interface Contact {
    id: string;
    name: string;
    phone?: string;
    type: ContactType[];
}