import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Part, InventoryTransaction, User, StoreSettings } from '../types';
import { PlusIcon, PencilSquareIcon, ArchiveBoxIcon, DocumentTextIcon, MinusIcon, TrashIcon, EllipsisVerticalIcon, ExclamationTriangleIcon, Cog6ToothIcon, ArrowsRightLeftIcon, BanknotesIcon, ChevronDownIcon, CloudArrowUpIcon } from './common/Icons';

// Helper to format currency
const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- Dữ liệu mẫu phụ tùng Honda Việt Nam (ĐÃ MỞ RỘNG TOÀN DIỆN VÀ THÊM GIÁ) ---
const hondaPartsData: (Omit<Part, 'id' | 'stock'> & { model: string[] })[] = [
    // === Phụ tùng Tiêu hao & Bảo dưỡng ===
    { name: 'Nhớt Honda chính hãng (0.8L, MA SL 10W30)', sku: 'MA-SL-10W30-0.8', price: 85000, sellingPrice: 105000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Wave Alpha', 'Wave RSX', 'Future 125', 'Future Neo', 'Future X', 'Dream'] },
    { name: 'Nhớt Honda chính hãng (1L, MA SL 10W30)', sku: 'MA-SL-10W30-1.0', price: 100000, sellingPrice: 125000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Winner/Winner X'] },
    { name: 'Nhớt hộp số (120ml)', sku: 'GEAR-OIL-120ML', price: 30000, sellingPrice: 40000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Air Blade 125/150', 'Lead/SH Mode', 'Vision 2021+', 'SH', 'Vario', 'Click', 'PCX'] },
    { name: 'Nước làm mát Honda chính hãng (1L)', sku: '08CLAG010S0', price: 80000, sellingPrice: 100000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Air Blade 125/150', 'Winner/Winner X', 'Lead/SH Mode', 'SH', 'Vario', 'PCX'] },
    { name: 'Ắc quy GS GTZ5S-E (Wave, Future)', sku: '31500-KWW-A01', price: 250000, sellingPrice: 310000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Wave Alpha', 'Wave RSX', 'Future 125', 'Future Neo', 'Future X'] },
    { name: 'Ắc quy GS GTZ6V (Xe ga)', sku: '31500-KZR-602', price: 320000, sellingPrice: 380000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Air Blade 125/150', 'Lead/SH Mode', 'Vision 2021+', 'SH', 'Vario', 'Click', 'PCX'] },
    { name: 'Bugi NGK CPR6EA-9 (Wave RSX, Future 125)', sku: '31916-KRM-841', price: 45000, sellingPrice: 65000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Wave RSX', 'Future 125', 'Future Neo', 'Future X'] },
    { name: 'Bugi NGK MR8K-9 (Air Blade 125/150)', sku: '31926-K12-V01', price: 90000, sellingPrice: 120000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Air Blade 125/150'] },
    { name: 'Bugi NGK LMAR8L-9 (SH 125/150)', sku: '31908-K59-A71', price: 110000, sellingPrice: 150000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['SH'] },
    { name: 'Bugi NGK CPR8EA-9 (Winner/Winner X)', sku: '31917-K56-N01', price: 55000, sellingPrice: 75000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Winner/Winner X'] },
    { name: 'Bình ắc quy Vision', sku: '31500-K44-D01', price: 420000, sellingPrice: 499936, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Vision 2021+'] },

    // === Phụ tùng Lọc gió & Bôi trơn ===
    { name: 'Lọc gió (Wave Alpha 110, RSX 110)', sku: '17210-KWW-640', price: 60000, sellingPrice: 80000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Wave Alpha', 'Wave RSX'] },
    { name: 'Lọc gió (Future 125, Future X, Neo)', sku: '17210-KTL-740', price: 75000, sellingPrice: 95000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Future 125', 'Future Neo', 'Future X'] },
    { name: 'Lọc gió (Air Blade 125/150)', sku: '17210-K12-900', price: 120000, sellingPrice: 150000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Air Blade 125/150'] },
    { name: 'Lọc gió (Winner/Winner X)', sku: '17210-K56-N00', price: 90000, sellingPrice: 115000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Winner/Winner X'] },
    { name: 'Lọc gió (Lead 125/SH Mode)', sku: '17210-K1N-V00', price: 130000, sellingPrice: 165000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Lead/SH Mode'] },
    { name: 'Lọc gió (Vision 2021+)', sku: '17210-K2C-V00', price: 110000, sellingPrice: 140000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Vision 2021+'] },
    { name: 'Lọc gió (SH 125/150i)', sku: '17210-K59-A70', price: 180000, sellingPrice: 220000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['SH'] },
    { name: 'Lọc gió (Vario/Click/PCX)', sku: '17210-K59-A70', price: 140000, sellingPrice: 180000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Vario', 'Click', 'PCX'] },
    { name: 'Lọc nhớt (Lưới lọc) (Wave, Future)', sku: '15421-KSP-910', price: 25000, sellingPrice: 35000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Wave Alpha', 'Wave RSX', 'Future 125', 'Future Neo', 'Future X'] },
    { name: 'Lọc nhớt (Lưới lọc) (Xe ga)', sku: '15421-KPL-900', price: 30000, sellingPrice: 45000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Air Blade 125/150', 'Lead/SH Mode', 'Vision 2021+', 'SH'] },
    { name: 'Lọc nhớt (Lõi lọc giấy) (Winner/Winner X)', sku: '15412-KSP-910', price: 45000, sellingPrice: 60000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Winner/Winner X'] },

    // === Phụ tùng Hệ thống truyền động (NSD, Dây curoa, Bi nồi) ===
    { name: 'Nhông sên dĩa (Wave RSX, Future 125)', sku: '06406-KTL-750', price: 290000, sellingPrice: 360000, category: 'Phụ tùng Hệ thống truyền động', model: ['Wave RSX', 'Future 125'] },
    { name: 'Nhông sên dĩa (Winner/Winner X)', sku: '06406-K56-V01', price: 450000, sellingPrice: 550000, category: 'Phụ tùng Hệ thống truyền động', model: ['Winner/Winner X'] },
    { name: 'Nhông sên dĩa (Wave Alpha 110)', sku: '06406-KWW-640', price: 250000, sellingPrice: 310000, category: 'Phụ tùng Hệ thống truyền động', model: ['Wave Alpha'] },
    { name: 'Dây curoa (Air Blade 125)', sku: '23100-KZR-601', price: 380000, sellingPrice: 450000, category: 'Phụ tùng Hệ thống truyền động', model: ['Air Blade 125/150'] },
    { name: 'Dây curoa (Air Blade 150)', sku: '23100-K0S-V01', price: 420000, sellingPrice: 500000, category: 'Phụ tùng Hệ thống truyền động', model: ['Air Blade 125/150'] },
    { name: 'Dây curoa (Lead 125/SH Mode)', sku: '23100-K1N-V01', price: 400000, sellingPrice: 480000, category: 'Phụ tùng Hệ thống truyền động', model: ['Lead/SH Mode'] },
    { name: 'Dây curoa (Vision 110)', sku: '23100-K44-V01', price: 350000, sellingPrice: 420000, category: 'Phụ tùng Hệ thống truyền động', model: ['Vision 2021+'] },
    { name: 'Dây curoa (SH 125/150i)', sku: '23100-K59-A71', price: 550000, sellingPrice: 650000, category: 'Phụ tùng Hệ thống truyền động', model: ['SH'] },
    { name: 'Dây curoa Bando (Vario/Click/AB)', sku: '23100-K35-V01', price: 350000, sellingPrice: 425000, category: 'Phụ tùng Hệ thống truyền động', model: ['Vario', 'Click', 'Air Blade 125/150'] },
    { name: 'Bộ bi nồi (Air Blade 125)', sku: '22123-KZR-600', price: 150000, sellingPrice: 190000, category: 'Phụ tùng Hệ thống truyền động', model: ['Air Blade 125/150'] },
    { name: 'Bộ bi nồi (Lead 125/SH Mode)', sku: '22123-K1N-V00', price: 160000, sellingPrice: 200000, category: 'Phụ tùng Hệ thống truyền động', model: ['Lead/SH Mode'] },
    { name: 'Bộ bi nồi (Vision 110)', sku: '22123-K44-V00', price: 140000, sellingPrice: 180000, category: 'Phụ tùng Hệ thống truyền động', model: ['Vision 2021+'] },
    { name: 'Bộ bi nồi (SH 125/150i)', sku: '22123-K59-A70', price: 220000, sellingPrice: 280000, category: 'Phụ tùng Hệ thống truyền động', model: ['SH'] },
    { name: 'Bố 3 càng (AB 125, Vision)', sku: '22535-K12-900', price: 350000, sellingPrice: 420000, category: 'Phụ tùng Hệ thống truyền động', model: ['Air Blade 125/150', 'Vision 2021+'] },
    { name: 'Bố 3 càng (Lead 125, SH Mode)', sku: '22535-K1N-V00', price: 380000, sellingPrice: 450000, category: 'Phụ tùng Hệ thống truyền động', model: ['Lead/SH Mode'] },
    { name: 'Nắp hộp xích trên Future', sku: '40510-KFL-890ZA', price: 170000, sellingPrice: 212258, category: 'Phụ tùng Hệ thống truyền động', model: ['Future 125', 'Future Neo', 'Future X'] },
    { name: 'Chén bi (Vario/Click/AB)', sku: '22110-K35-V00', price: 95000, sellingPrice: 120432, category: 'Phụ tùng Hệ thống truyền động', model: ['Vario', 'Click', 'Air Blade 125/150'] },
    { name: 'Cánh quạt (Vario/Click/AB)', sku: '22102-K35-V00', price: 85000, sellingPrice: 104272, category: 'Phụ tùng Hệ thống truyền động', model: ['Vario', 'Click', 'Air Blade 125/150'] },

    // === Phụ tùng Hệ thống phanh (Heo dầu, Má phanh, Đĩa phanh) ===
    { name: 'Má phanh đĩa trước (Wave RSX, Future)', sku: '06455-KWB-601', price: 80000, sellingPrice: 110000, category: 'Phụ tùng Hệ thống phanh', model: ['Wave RSX', 'Future 125', 'Future Neo', 'Future X'] },
    { name: 'Má phanh đĩa trước (Air Blade, Lead)', sku: '06455-KVG-V01', price: 90000, sellingPrice: 125000, category: 'Phụ tùng Hệ thống phanh', model: ['Air Blade 125/150', 'Lead/SH Mode'] },
    { name: 'Má phanh đĩa trước (Winner/SH)', sku: '06455-K56-N01', price: 120000, sellingPrice: 160000, category: 'Phụ tùng Hệ thống phanh', model: ['Winner/Winner X', 'SH'] },
    { name: 'Má phanh đĩa trước (Vision CBS)', sku: '06455-K81-N21', price: 85000, sellingPrice: 115000, category: 'Phụ tùng Hệ thống phanh', model: ['Vision 2021+'] },
    { name: 'Bố thắng đĩa trước (Vario/Click/SH/SH Mode/PCX)', sku: '06455-K59-A71', price: 210000, sellingPrice: 260344, category: 'Phụ tùng Hệ thống phanh', model: ['Vario', 'Click', 'SH', 'SH Mode', 'PCX'] },
    { name: 'Má phanh đĩa sau (Winner/Winner X, SH)', sku: '06435-K56-N01', price: 110000, sellingPrice: 150000, category: 'Phụ tùng Hệ thống phanh', model: ['Winner/Winner X', 'SH'] },
    { name: 'Má phanh sau (đùm) (Wave, Future, Vision)', sku: '06430-KFM-900', price: 70000, sellingPrice: 95000, category: 'Phụ tùng Hệ thống phanh', model: ['Wave Alpha', 'Wave RSX', 'Future 125', 'Vision 2021+'] },
    { name: 'Bố thắng đùm sau (Vario/Click)', sku: '43151-K59-A71', price: 140000, sellingPrice: 171940, category: 'Phụ tùng Hệ thống phanh', model: ['Vario', 'Click'] },
    { name: 'Đĩa phanh trước (Wave RSX, Future 125)', sku: '45251-KTL-750', price: 300000, sellingPrice: 380000, category: 'Phụ tùng Hệ thống phanh', model: ['Wave RSX', 'Future 125'] },
    { name: 'Đĩa phanh trước (Winner/Winner X)', sku: '45251-K56-N01', price: 550000, sellingPrice: 650000, category: 'Phụ tùng Hệ thống phanh', model: ['Winner/Winner X'] },
    { name: 'Đĩa phanh trước (Air Blade)', sku: '45251-KVG-901', price: 400000, sellingPrice: 480000, category: 'Phụ tùng Hệ thống phanh', model: ['Air Blade 125/150'] },
    { name: 'Đĩa phanh trước (Vario/Click)', sku: '45251-K59-A71', price: 380000, sellingPrice: 460000, category: 'Phụ tùng Hệ thống phanh', model: ['Vario', 'Click', 'PCX'] },
    { name: 'Cụm ngàm phanh trước bên trái Vario', sku: '45150-K2S-N01', price: 1450000, sellingPrice: 1879696, category: 'Phụ tùng Hệ thống phanh', model: ['Vario', 'Click'] },

    // === Phụ tùng Động cơ & Đầu bò ===
    { name: 'Gioăng đầu xylanh Future', sku: '12251-KFL-851', price: 25000, sellingPrice: 31912, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Future 125', 'Future Neo', 'Future X'] },
    { name: 'Nắp máy trái Future', sku: '11341-KYZ-900', price: 250000, sellingPrice: 309991, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Future 125'] },
    { name: 'Piston + bạc (Wave Alpha 110)', sku: '13101-KWW-740', price: 220000, sellingPrice: 280000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Wave Alpha'] },
    { name: 'Piston + bạc (Winner/Winner X)', sku: '13101-K56-N00', price: 350000, sellingPrice: 420000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Winner/Winner X'] },
    { name: 'Xupap hút (Wave, Future)', sku: '14711-KWW-740', price: 90000, sellingPrice: 120000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Xupap xả (Wave, Future)', sku: '14721-KWW-740', price: 80000, sellingPrice: 110000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Cây cam (Wave Alpha 110)', sku: '14100-KWW-640', price: 300000, sellingPrice: 380000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Wave Alpha'] },
    { name: 'Cây cam (Air Blade 125)', sku: '14100-KZR-600', price: 450000, sellingPrice: 550000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Air Blade 125/150'] },
    { name: 'Két nước Vario/Click', sku: '19010-K59-A11', price: 550000, sellingPrice: 680000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Vario', 'Click'] },

    // === Phụ tùng Hệ thống điện (IC, Sạc, Mobin, Khóa) ===
    { name: 'Cụm khóa điện Vision', sku: '35100-K2C-V01', price: 680000, sellingPrice: 844876, category: 'Phụ tùng Hệ thống điện', model: ['Vision 2021+'] },
    { name: 'Cụm khóa Smartkey SH 125/150i', sku: '35111-K0R-V00', price: 900000, sellingPrice: 1100000, category: 'Phụ tùng Hệ thống điện', model: ['SH'] },
    { name: 'IC/ECM (Wave RSX Fi)', sku: '38770-K03-H11', price: 700000, sellingPrice: 850000, category: 'Phụ tùng Hệ thống điện', model: ['Wave RSX'] },
    { name: 'IC/ECM (Air Blade 125)', sku: '38770-KZR-601', price: 1200000, sellingPrice: 1500000, category: 'Phụ tùng Hệ thống điện', model: ['Air Blade 125/150'] },
    { name: 'IC/ECM (Winner X)', sku: '38770-K56-V02', price: 1100000, sellingPrice: 1350000, category: 'Phụ tùng Hệ thống điện', model: ['Winner/Winner X'] },
    { name: 'Sạc (Wave, Future)', sku: '31600-KWW-641', price: 150000, sellingPrice: 200000, category: 'Phụ tùng Hệ thống điện', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Sạc (Air Blade 125, SH)', sku: '31600-KZR-601', price: 400000, sellingPrice: 500000, category: 'Phụ tùng Hệ thống điện', model: ['Air Blade 125/150', 'SH'] },
    { name: 'Mobin sườn (Wave, Future)', sku: '30510-KWW-641', price: 180000, sellingPrice: 230000, category: 'Phụ tùng Hệ thống điện', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Cảm biến nhiệt độ ECT (Xe ga)', sku: '37870-KZR-601', price: 130000, sellingPrice: 170000, category: 'Phụ tùng Hệ thống điện', model: ['Air Blade 125/150', 'Lead/SH Mode', 'Vision 2021+', 'SH'] },
    { name: 'Dây điện chính Vision', sku: '32100-K2C-D01', price: 2100000, sellingPrice: 2606984, category: 'Phụ tùng Hệ thống điện', model: ['Vision 2021+'] },
    { name: 'Cụm đèn pha LED Air Blade 125/150', sku: '33110-K1F-V11', price: 1500000, sellingPrice: 1750000, category: 'Phụ tùng Hệ thống điện', model: ['Air Blade 125/150'] },
    { name: 'Cùm công tắc trái Winner X (ABS)', sku: '35200-K56-V51', price: 380000, sellingPrice: 450000, category: 'Phụ tùng Hệ thống điện', model: ['Winner/Winner X'] },
    { name: 'Cụm đèn hậu Vario/Click', sku: '33701-K59-A71', price: 600000, sellingPrice: 757949, category: 'Phụ tùng Hệ thống điện', model: ['Vario', 'Click'] },

    // === Phụ tùng Dàn nhựa & Khung sườn ===
    { name: 'Tem sản phẩm Vision', sku: '87501-K2C-V91', price: 8000, sellingPrice: 11231, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp xi nhan trước Vision (Đỏ)', sku: 'NEXAC-K44-WKC03', price: 130000, sellingPrice: 169539, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp xi nhan trước Vision (Chrome)', sku: 'NEXAC-K44-WKC02', price: 130000, sellingPrice: 169539, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp ống xả Vision (Carbon)', sku: 'NEXAC-K44-MFC04', price: 200000, sellingPrice: 251167, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp đèn pha Vision (Đỏ)', sku: 'NEXAC-K44-HLC03', price: 120000, sellingPrice: 150702, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp thân trước Vision (Chrome)', sku: 'NEXAC-K44-FRC02', price: 380000, sellingPrice: 470938, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Thảm lót chân Vision (Carbon)', sku: 'NEXAC-K44-FLP04', price: 480000, sellingPrice: 596522, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp bầu lọc gió Vision (Carbon)', sku: 'NEXAC-K44-ESP04', price: 200000, sellingPrice: 251167, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp chân bùn sau Vision (Đỏ mờ)', sku: 'UNIAC-K44-RFC06', price: 60000, sellingPrice: 74827, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp két tản nhiệt Vision (Carbon)', sku: 'UNIAC-K44-RDC04', price: 75000, sellingPrice: 92095, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp pô Vision (Đỏ mờ)', sku: 'UNIAC-K44-MFC06', price: 130000, sellingPrice: 161165, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Dàn áo Air Blade 150 (Đen mờ)', sku: '83500-K1F-V10ZA', price: 4200000, sellingPrice: 4800000, category: 'Dàn nhựa & Khung sườn', model: ['Air Blade 125/150'] },
    { name: 'Mặt nạ trước Vario/Click (Đỏ)', sku: '64301-K59-A70ZC', price: 250000, sellingPrice: 310000, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp sườn sau SH Mode (Trắng)', sku: '83600-K1N-V00ZC', price: 450000, sellingPrice: 550000, category: 'Dàn nhựa & Khung sườn', model: ['Lead/SH Mode'] },
    { name: 'Yên xe Wave Alpha', sku: '77200-KWW-640', price: 280000, sellingPrice: 350000, category: 'Dàn nhựa & Khung sườn', model: ['Wave Alpha'] },
    { name: 'Gác chân sau Future 125', sku: '50715-K73-T60', price: 180000, sellingPrice: 220000, category: 'Dàn nhựa & Khung sườn', model: ['Future 125'] },
    { name: 'Bộ mỏ bùn Vario', sku: '57110-K2S-N12', price: 2600000, sellingPrice: 3285289, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Tem PGM-FI Future', sku: '86646-K73-VE0ZC', price: 14000, sellingPrice: 18235, category: 'Dàn nhựa & Khung sườn', model: ['Future 125', 'Future Neo', 'Future X'] },
    { name: 'Gù tay lái phải (Vario/Click/AB/PCX/SH/Winner)', sku: '53166-K46-N20', price: 40000, sellingPrice: 50229, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click', 'Air Blade 125/150', 'PCX', 'SH', 'Winner/Winner X'] },
    { name: 'Gù tay lái trái (Vario/Click/AB/PCX/SH/Winner)', sku: '53165-K46-N20', price: 40000, sellingPrice: 50229, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click', 'Air Blade 125/150', 'PCX', 'SH', 'Winner/Winner X'] },
    { name: 'Móc treo đồ (Vario/Click)', sku: '81250-K59-A70', price: 35000, sellingPrice: 42973, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Nẹp sườn trái (Vario/Click)', sku: '64308-K59-A70', price: 20000, sellingPrice: 25117, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Nẹp sườn phải (Vario/Click)', sku: '64309-K59-A70', price: 20000, sellingPrice: 25117, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp pô (Vario/Click)', sku: '18318-K59-A70', price: 145000, sellingPrice: 181254, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp đồng hồ trước (Vario/Click)', sku: '81131-K59-A70', price: 80000, sellingPrice: 101906, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp sườn trái (Vario/Click)', sku: '83750-K59-A70ZA', price: 210000, sellingPrice: 260344, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp sườn phải (Vario/Click)', sku: '83650-K59-A70ZA', price: 210000, sellingPrice: 260344, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Yếm trái (Vario/Click)', sku: '64340-K59-A70ZB', price: 140000, sellingPrice: 171940, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Yếm phải (Vario/Click)', sku: '64335-K59-A70ZB', price: 140000, sellingPrice: 171940, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Dè trước (Vario/Click)', sku: '61100-K59-A70ZB', price: 250000, sellingPrice: 310078, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },

    // === Bánh xe & Lốp ===
    { name: 'Lốp trước IRC (Wave, Future)', sku: '44711-KWW-641', price: 250000, sellingPrice: 320000, category: 'Bánh xe & Lốp', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Lốp sau IRC (Wave, Future)', sku: '42711-KWW-641', price: 300000, sellingPrice: 380000, category: 'Bánh xe & Lốp', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Lốp trước IRC (Air Blade, Vision)', sku: '44711-KVG-901', price: 350000, sellingPrice: 430000, category: 'Bánh xe & Lốp', model: ['Air Blade 125/150', 'Vision 2021+'] },
    { name: 'Lốp sau IRC (Air Blade, Vision)', sku: '42711-KVG-901', price: 400000, sellingPrice: 480000, category: 'Bánh xe & Lốp', model: ['Air Blade 125/150', 'Vision 2021+'] },
    { name: 'Lốp trước IRC (Winner/Winner X)', sku: '44711-K56-N01', price: 450000, sellingPrice: 550000, category: 'Bánh xe & Lốp', model: ['Winner/Winner X'] },
    { name: 'Mâm (vành) trước Winner X', sku: '44650-K56-V50', price: 1300000, sellingPrice: 1550000, category: 'Bánh xe & Lốp', model: ['Winner/Winner X'] },
    { name: 'Mâm (vành) sau SH 150i ABS', sku: '42650-K0R-V00', price: 2200000, sellingPrice: 2600000, category: 'Bánh xe & Lốp', model: ['SH'] },

    // === Linh kiện nhỏ & Bu lông, Ốc vít ===
    { name: 'Vít 5x12', sku: '938910501207', price: 3000, sellingPrice: 4628, category: 'Linh kiện nhỏ', model: ['Future 125', 'Wave Alpha', 'Vision 2021+', 'Dream'] },
    { name: 'Bu lông 6x20', sku: '90118KY1000', price: 5000, sellingPrice: 7739, category: 'Linh kiện nhỏ', model: ['Future 125', 'Wave Alpha', 'Dream'] },
    { name: 'Vít có đệm 5-10', sku: '93891-050-1007', price: 3500, sellingPrice: 4628, category: 'Linh kiện nhỏ', model: ['Vision 2021+'] },
    { name: 'Vít 4x20', sku: '93891-040-2007', price: 3000, sellingPrice: 4628, category: 'Linh kiện nhỏ', model: ['Future 125', 'Wave Alpha', 'Dream'] },
];


// --- Modals ---
const PartModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (part: Part) => void;
    part: Part | null;
    parts: Part[];
    allCategories: string[];
    onAddCategory: (categoryName: string) => void;
    currentBranchId: string;
}> = ({ isOpen, onClose, onSave, part, parts, allCategories, onAddCategory, currentBranchId }) => {
    const [formData, setFormData] = useState<Omit<Part, 'id'>>(() =>
        part ? { ...part } : { name: '', sku: '', stock: {}, price: 0, sellingPrice: 0, category: '' }
    );
    const [userModifiedSku, setUserModifiedSku] = useState(false);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (part) { // Editing existing part or creating from reference
                setFormData({ ...part });
                // If part has a real ID, it's an edit. If ID is falsy (''), it's from reference.
                // In both cases, the SKU is considered user-defined.
                setUserModifiedSku(true); 
            } else { // Adding brand new part from scratch
                setFormData({ name: '', sku: '', stock: {}, price: 0, sellingPrice: 0, category: '' });
                setUserModifiedSku(false);
            }
             setIsAddingNewCategory(false);
             setNewCategoryName('');
        }
    }, [part, isOpen]);

    const generateSkuFromName = (name: string): string => {
        if (!name || name.trim() === '') return '';

        const cleanedName = name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .trim()
            .toUpperCase();

        const words = cleanedName.split(/\s+/).filter(Boolean);
        if (words.length === 0) return '';
        
        const initials = words.slice(0, 3).map(word => word[0]).join('');
        const randomPart = Math.floor(1000 + Math.random() * 9000);

        return `${initials}-${randomPart}`;
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
    
        if (name === 'sku') {
            setUserModifiedSku(true);
        }
    
        const isNumber = type === 'number';
        const processedValue = isNumber ? parseFloat(value) || 0 : value;
    
        if (name === 'name' && !userModifiedSku) {
            const generatedSku = generateSkuFromName(value as string);
            setFormData(prev => ({
                ...prev,
                name: value as string,
                sku: generatedSku
            }));
        } else if (name === 'quantity') {
            setFormData(prev => ({
                ...prev,
                stock: {
                    ...prev.stock,
                    [currentBranchId]: processedValue as number,
                }
            }));
        } else if (name === 'price') {
            const purchasePrice = processedValue as number;
            setFormData(prev => ({
                ...prev,
                price: purchasePrice,
                sellingPrice: Math.round((purchasePrice * 1.3) / 1000) * 1000 // Suggest selling price with ~30% margin
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: processedValue
            }));
        }
    };
    
    const handleAddNewCategory = () => {
        const trimmedCategory = newCategoryName.trim();
        if (trimmedCategory && !allCategories.includes(trimmedCategory)) {
            onAddCategory(trimmedCategory);
            setFormData(prev => ({...prev, category: trimmedCategory}));
        }
        setNewCategoryName('');
        setIsAddingNewCategory(false);
    };

    const buildPartData = (): Part => {
        let finalSku = formData.sku;
        if (!finalSku && formData.name) {
            finalSku = generateSkuFromName(formData.name);
        }
        return {
            id: part?.id || `P${String(Math.floor(Math.random() * 9000) + 1000)}`,
            ...formData,
            sku: finalSku,
        };
    };

    const handleJustSave = () => {
        const finalPart = buildPartData();
        onSave(finalPart);
    };

    const handleSaveAndClose = () => {
        const finalPart = buildPartData();
        onSave(finalPart);
        onClose();
    };

    if (!isOpen) return null;
    
    const currentStock = formData.stock?.[currentBranchId] ?? 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{part?.id ? 'Chỉnh sửa Phụ tùng' : 'Thêm Phụ tùng mới'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="part-name" className="block text-sm font-medium text-gray-700">Tên phụ tùng</label>
                                <input id="part-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Bugi NGK Iridium" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                            </div>
                            <div>
                                <label htmlFor="part-sku" className="block text-sm font-medium text-gray-700">SKU</label>
                                <input id="part-sku" type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Tự động tạo hoặc nhập thủ công" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Danh mục sản phẩm</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <select
                                        name="category"
                                        value={formData.category || ''}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {allCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => setIsAddingNewCategory(!isAddingNewCategory)} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex-shrink-0">
                                        <PlusIcon className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>
                                {isAddingNewCategory && (
                                    <div className="mt-2 flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            placeholder="Tên danh mục mới..."
                                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                            autoFocus
                                        />
                                        <button type="button" onClick={handleAddNewCategory} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Lưu</button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="part-quantity" className="block text-sm font-medium text-gray-700">Số lượng tồn kho (Chi nhánh hiện tại)</label>
                                <input id="part-quantity" type="number" name="quantity" value={currentStock} onChange={handleChange} placeholder="0" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="part-price" className="block text-sm font-medium text-gray-700">Giá nhập</label>
                                    <input id="part-price" type="number" name="price" value={formData.price} onChange={handleChange} placeholder="80000" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                                </div>
                                <div>
                                    <label htmlFor="part-sellingPrice" className="block text-sm font-medium text-gray-700">Giá bán</label>
                                    <input id="part-sellingPrice" type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} placeholder="110000" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
                            Hủy bỏ
                        </button>
                        {part?.id ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleJustSave}
                                    className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700"
                                >
                                    Lưu thay đổi
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAndClose}
                                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
                                >
                                    Lưu & Đóng
                                </button>
                            </>
                        ) : (
                             <button
                                type="button"
                                onClick={handleSaveAndClose}
                                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
                            >
                                Lưu Phụ tùng
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

// Fix: Add TransactionModal for handling stock import/export
const TransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<InventoryTransaction, 'id'|'date'|'totalPrice'>) => void;
    parts: Part[];
    type: 'Nhập kho' | 'Xuất kho';
    currentBranchId: string;
}> = ({ isOpen, onClose, onSave, parts, type, currentBranchId }) => {
    const [partId, setPartId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [unitPrice, setUnitPrice] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (isOpen) {
            setPartId('');
            setQuantity(1);
            setNotes('');
            setUnitPrice(undefined);
        }
    }, [isOpen]);
    
    const selectedPart = parts.find(p => p.id === partId);
    const maxQuantity = type === 'Xuất kho' ? selectedPart?.stock[currentBranchId] || 0 : Infinity;

    const handleSubmit = () => {
        if (!partId || quantity <= 0 || (type === 'Xuất kho' && quantity > maxQuantity)) return;
        
        const part = parts.find(p => p.id === partId);
        if (!part) return;

        onSave({
            partId,
            partName: part.name,
            quantity,
            notes,
            unitPrice,
            type,
            branchId: currentBranchId,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{type === 'Nhập kho' ? 'Tạo Phiếu Nhập Kho' : 'Tạo Phiếu Xuất Kho'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phụ tùng</label>
                            <select value={partId} onChange={e => {
                                setPartId(e.target.value);
                                const selected = parts.find(p => p.id === e.target.value);
                                if (type === 'Nhập kho' && selected) {
                                    setUnitPrice(selected.price);
                                }
                            }} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                                <option value="">-- Chọn phụ tùng --</option>
                                {parts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Tồn: {p.stock[currentBranchId] || 0}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" max={type === 'Xuất kho' ? maxQuantity : undefined} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            {type === 'Xuất kho' && <p className="text-xs text-gray-500 mt-1">Tồn kho hiện tại: {maxQuantity}</p>}
                        </div>
                        {type === 'Nhập kho' && (
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Đơn giá nhập</label>
                                <input type="number" value={unitPrice ?? ''} onChange={e => setUnitPrice(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Nhập hàng từ nhà cung cấp A" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"/>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Hủy</button>
                    <button type="button" onClick={handleSubmit} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">Lưu</button>
                </div>
            </div>
        </div>
    )
}

// Fix: Add HistoryModal to view transaction history for a part
const HistoryModal: React.FC<{
    part: Part | null;
    transactions: InventoryTransaction[];
    onClose: () => void;
    storeSettings: StoreSettings;
}> = ({ part, transactions, onClose, storeSettings }) => {
    const partTransactions = useMemo(() => {
        if (!part) return [];
        return transactions.filter(t => t.partId === part.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [part, transactions]);

    if (!part) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Lịch sử giao dịch: {part.name}</h2>
                </div>
                <div className="p-6 overflow-y-auto">
                    {partTransactions.length === 0 ? (
                        <p className="text-gray-500">Không có giao dịch nào cho phụ tùng này.</p>
                    ) : (
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr>
                                <th className="p-2 font-semibold">Ngày</th>
                                <th className="p-2 font-semibold">Loại</th>
                                <th className="p-2 font-semibold">Số lượng</th>
                                <th className="p-2 font-semibold">Chi nhánh</th>
                                <th className="p-2 font-semibold">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partTransactions.map(tx => (
                                <tr key={tx.id} className="border-b">
                                    <td className="p-2">{tx.date}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tx.type === 'Nhập kho' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="p-2 font-medium">{tx.quantity}</td>
                                    <td className="p-2">{storeSettings.branches.find(b => b.id === tx.branchId)?.name || tx.branchId}</td>
                                    <td className="p-2 text-sm text-gray-600">{tx.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                </div>
                 <div className="bg-gray-50 px-6 py-3 mt-auto">
                    <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    )
}

const TransferStockModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transfer: { partId: string; fromBranchId: string; toBranchId: string; quantity: number; notes: string }) => void;
    parts: Part[];
    branches: { id: string; name: string }[];
    currentBranchId: string;
}> = ({ isOpen, onClose, onSave, parts, branches, currentBranchId }) => {
    const [partId, setPartId] = useState('');
    const [fromBranchId, setFromBranchId] = useState(currentBranchId);
    const [toBranchId, setToBranchId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setPartId('');
            setFromBranchId(currentBranchId);
            setToBranchId('');
            setQuantity(1);
            setNotes('');
        }
    }, [isOpen, currentBranchId]);

    const selectedPart = parts.find(p => p.id === partId);
    const maxQuantity = selectedPart?.stock[fromBranchId] || 0;
    const isFormInvalid = !partId || !fromBranchId || !toBranchId || fromBranchId === toBranchId || quantity <= 0 || quantity > maxQuantity;

    const handleSubmit = () => {
        if (isFormInvalid) return;
        onSave({ partId, fromBranchId, toBranchId, quantity, notes });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                 <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Tạo Phiếu Chuyển Kho</h2>
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Phụ tùng</label>
                            <select value={partId} onChange={e => setPartId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                                <option value="">-- Chọn phụ tùng --</option>
                                {parts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Từ chi nhánh</label>
                                <select value={fromBranchId} onChange={e => setFromBranchId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Đến chi nhánh</label>
                                <select value={toBranchId} onChange={e => setToBranchId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" disabled={!fromBranchId}>
                                    <option value="">-- Chọn --</option>
                                    {branches.filter(b => b.id !== fromBranchId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Số lượng chuyển</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" max={maxQuantity} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            <p className="text-xs text-gray-500 mt-1">Tồn kho tại chi nhánh nguồn: {maxQuantity}</p>
                            {quantity > maxQuantity && <p className="text-red-500 text-xs mt-1">Số lượng vượt quá tồn kho!</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Điều chuyển hàng cuối tháng" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"/>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Hủy</button>
                    <button type="button" onClick={handleSubmit} disabled={isFormInvalid} className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed">
                        Tạo phiếu
                    </button>
                </div>
            </div>
        </div>
    )
}

const CategorySettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    onAdd: (name: string) => void;
    onEdit: (oldName: string, newName: string) => void;
    onDelete: (name: string) => void;
}> = ({ isOpen, onClose, categories, onAdd, onEdit, onDelete }) => {
    const [editingCategories, setEditingCategories] = useState<string[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEditingCategories([...categories]);
            setNewCategoryName('');
        }
    }, [isOpen, categories]);

    const handleNameChange = (index: number, newName: string) => {
        const updated = [...editingCategories];
        updated[index] = newName;
        setEditingCategories(updated);
    };

    const handleSaveChanges = () => {
        // Find renamed categories
        for (let i = 0; i < categories.length; i++) {
            if (categories[i] !== editingCategories[i]) {
                onEdit(categories[i], editingCategories[i]);
            }
        }
        onClose();
    };
    
    const handleAddNewCategory = () => {
        const trimmedName = newCategoryName.trim();
        if (trimmedName && !editingCategories.includes(trimmedName)) {
            onAdd(trimmedName);
            setEditingCategories(prev => [...prev, trimmedName]);
            setNewCategoryName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Cài đặt Danh mục sản phẩm</h2>
                </div>
                <div className="p-6 overflow-y-auto space-y-3">
                    {editingCategories.map((cat, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={cat} 
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                            <button onClick={() => onDelete(cat)} className="p-2 text-red-500 hover:bg-red-100 rounded-md">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Thêm danh mục mới</label>
                     <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Tên danh mục mới"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                         <button onClick={handleAddNewCategory} className="flex items-center bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-700">
                             <PlusIcon className="w-4 h-4 mr-1"/> Thêm
                         </button>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 mt-auto">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Hủy</button>
                    <button type="button" onClick={handleSaveChanges} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Cập nhật</button>
                </div>
            </div>
        </div>
    );
};

interface InventoryManagerProps {
    currentUser: User;
    parts: Part[];
    setParts: React.Dispatch<React.SetStateAction<Part[]>>;
    transactions: InventoryTransaction[];
    setTransactions: React.Dispatch<React.SetStateAction<InventoryTransaction[]>>;
    currentBranchId: string;
    storeSettings: StoreSettings;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ currentUser, parts, setParts, transactions, setTransactions, currentBranchId, storeSettings }) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'category' | 'lookup' | 'history'>('inventory');
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isCategorySettingsOpen, setIsCategorySettingsOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [historyModalPart, setHistoryModalPart] = useState<Part | null>(null);
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [inventorySearchTerm, setInventorySearchTerm] = useState('');
    const [inventoryStatusFilter, setInventoryStatusFilter] = useState('all');
    const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [allCategories, setAllCategories] = useState<string[]>([]);
    
    // State for the new lookup tab
    const [selectedModel, setSelectedModel] = useState('Tất cả');
    const [lookupCurrentPage, setLookupCurrentPage] = useState(1);
    const LOOKUP_ITEMS_PER_PAGE = 20;

    const motorcycleModels = useMemo(() => {
        const models = new Set<string>();
        hondaPartsData.forEach(p => p.model.forEach(m => models.add(m)));
        return ['Tất cả', ...Array.from(models).sort()];
    }, []);

    useEffect(() => {
        const derivedCategories = Array.from(new Set(parts.map(p => p.category).filter((c): c is string => !!c)));
        setAllCategories(prevCategories => {
            // This ensures that categories manually added but not yet used are preserved
            const combined = new Set([...derivedCategories, ...prevCategories]);
            return Array.from(combined).sort();
        });
    }, [parts]);
    
    const inventorySummary = useMemo(() => {
        const summary = { totalQuantity: 0, totalValue: 0 };
        parts.forEach(part => {
            const stockInBranch = part.stock[currentBranchId] || 0;
            summary.totalQuantity += stockInBranch;
            summary.totalValue += stockInBranch * part.price;
        });
        return summary;
    }, [parts, currentBranchId]);
    
    const handleOpenPartModal = (part: Part | null = null) => {
        setSelectedPart(part);
        setIsPartModalOpen(true);
        setOpenMenuId(null);
    };

    const handleClosePartModal = () => {
        setIsPartModalOpen(false);
        setSelectedPart(null);
    };

    const handleSavePart = (partData: Part) => {
        const isEditing = parts.some(p => p.id === partData.id);
        if (isEditing) {
            setParts(prev => prev.map(p => (p.id === partData.id ? partData : p)));
        } else {
            setParts(prev => [partData, ...prev]);
        }
    };
    
    const handleDeletePart = (partId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phụ tùng này? Hành động này không thể hoàn tác.')) {
            setParts(prev => prev.filter(p => p.id !== partId));
        }
        setOpenMenuId(null);
    };

    const handleAddCategory = (newCategory: string) => {
       const trimmedName = newCategory.trim();
       if (trimmedName && !allCategories.includes(trimmedName)) {
           setAllCategories(prev => [...prev, trimmedName].sort());
       }
    };

    const handleEditCategory = (oldName: string, newName: string) => {
        const trimmedNewName = newName.trim();
        if (!trimmedNewName || oldName === trimmedNewName) return;

        if (allCategories.some(c => c.toLowerCase() === trimmedNewName.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase())) {
            alert(`Danh mục "${trimmedNewName}" đã tồn tại.`);
            return;
        }
        
        setParts(prev => prev.map(p => p.category === oldName ? { ...p, category: trimmedNewName } : p));
        setAllCategories(prev => {
            const newCategories = new Set(prev.filter(c => c !== oldName));
            newCategories.add(trimmedNewName);
            return Array.from(newCategories).sort();
        });
    };
    
    const handleDeleteCategory = (name: string) => {
         if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không? Các sản phẩm thuộc danh mục này sẽ được gán là "Chưa phân loại".`)) {
            setParts(prev => prev.map(p => p.category === name ? { ...p, category: '' } : p));
            setAllCategories(prev => prev.filter(c => c !== name));
        }
    };

    const handleSaveTransaction = (transaction: Omit<InventoryTransaction, 'id'|'date'|'totalPrice'>) => {
        const part = parts.find(p => p.id === transaction.partId);
        if (!part) return;

        const newTransaction: InventoryTransaction = {
            ...transaction,
            id: `T-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            unitPrice: transaction.type === 'Nhập kho' ? transaction.unitPrice : part.sellingPrice,
            totalPrice: (transaction.type === 'Nhập kho' ? transaction.unitPrice ?? part.price : part.sellingPrice) * transaction.quantity,
        };

        setTransactions(prev => [newTransaction, ...prev]);

        setParts(prevParts => prevParts.map(p => {
            if (p.id === transaction.partId) {
                const newStock = { ...p.stock };
                const currentStock = newStock[currentBranchId] || 0;
                newStock[currentBranchId] = transaction.type === 'Nhập kho'
                    ? currentStock + transaction.quantity
                    : currentStock - transaction.quantity;
                return { ...p, stock: newStock };
            }
            return p;
        }));

        setIsExportModalOpen(false);
    };

    const handleSaveTransfer = (transfer: { partId: string; fromBranchId: string; toBranchId: string; quantity: number; notes: string }) => {
        const { partId, fromBranchId, toBranchId, quantity, notes } = transfer;
        const part = parts.find(p => p.id === partId);
        if (!part) return;

        const transferId = `TR-${Date.now()}`;
        const fromBranchName = storeSettings.branches.find(b => b.id === fromBranchId)?.name;
        const toBranchName = storeSettings.branches.find(b => b.id === toBranchId)?.name;

        const exportTransaction: InventoryTransaction = {
            id: `T-EX-${Date.now()}`, type: 'Xuất kho', partId, partName: part.name, quantity,
            date: new Date().toISOString().split('T')[0], notes: `Chuyển đến ${toBranchName}. ${notes}`,
            branchId: fromBranchId, transferId, unitPrice: part.price, totalPrice: part.price * quantity,
        };

        const importTransaction: InventoryTransaction = {
            id: `T-IM-${Date.now()}`, type: 'Nhập kho', partId, partName: part.name, quantity,
            date: new Date().toISOString().split('T')[0], notes: `Nhận từ ${fromBranchName}. ${notes}`,
            branchId: toBranchId, transferId, unitPrice: part.price, totalPrice: part.price * quantity,
        };

        setTransactions(prev => [exportTransaction, importTransaction, ...prev]);
        setParts(prevParts => prevParts.map(p => {
            if (p.id === partId) {
                const newStock = { ...p.stock };
                newStock[fromBranchId] = (newStock[fromBranchId] || 0) - quantity;
                newStock[toBranchId] = (newStock[toBranchId] || 0) + quantity;
                return { ...p, stock: newStock };
            }
            return p;
        }));
        setIsTransferModalOpen(false);
    };
    
    const handleAddFromReference = (refPart: Omit<Part, 'id' | 'stock'>) => {
        const existingPart = parts.find(p => p.sku.toLowerCase() === refPart.sku.toLowerCase());
        if (existingPart) {
            handleOpenPartModal(existingPart);
        } else {
            const newPartTemplate: Part = {
                id: '', // Falsy value, onSave will create a new ID
                name: refPart.name,
                sku: refPart.sku,
                category: refPart.category,
                price: refPart.price, // Use price from reference
                sellingPrice: refPart.sellingPrice, // Use selling price from reference
                stock: {},
            };
            handleOpenPartModal(newPartTemplate);
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx =>
                tx.partName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                tx.id.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                tx.notes.toLowerCase().includes(historySearchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, historySearchTerm]);

    const filteredPartsForCategoryTab = useMemo(() => {
        return parts.filter(part => {
            const searchMatch = categorySearchTerm === '' ||
                part.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                part.sku.toLowerCase().includes(categorySearchTerm.toLowerCase());
            const categoryMatch = selectedCategoryFilter === 'all' || part.category === selectedCategoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [parts, categorySearchTerm, selectedCategoryFilter]);
    
    const filteredInventoryParts = useMemo(() => {
        const lastTransactionDateMap = new Map<string, string>();
        transactions.forEach(tx => {
            const existingDate = lastTransactionDateMap.get(tx.partId);
            if (!existingDate || new Date(tx.date) > new Date(existingDate)) {
                lastTransactionDateMap.set(tx.partId, tx.date);
            }
        });

        return parts.filter(part => {
            const stock = part.stock[currentBranchId] || 0;

            const searchMatch = !inventorySearchTerm ||
                part.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                part.sku.toLowerCase().includes(inventorySearchTerm.toLowerCase());

            const categoryMatch = inventoryCategoryFilter === 'all' || part.category === inventoryCategoryFilter;

            let statusMatch = false;
            switch (inventoryStatusFilter) {
                case 'all':
                    statusMatch = true;
                    break;
                case 'in-stock':
                    statusMatch = stock > 0;
                    break;
                case 'out-of-stock':
                    statusMatch = stock === 0;
                    break;
                case 'low-stock':
                    statusMatch = stock > 0 && stock < 5;
                    break;
                case 'slow-moving':
                    const lastTxDate = lastTransactionDateMap.get(part.id);
                    if (stock > 0 && lastTxDate) {
                        const daysSinceLastTx = (new Date().getTime() - new Date(lastTxDate).getTime()) / (1000 * 3600 * 24);
                        statusMatch = daysSinceLastTx > 60;
                    } else {
                        statusMatch = false; 
                    }
                    break;
                default:
                    statusMatch = true;
            }

            return searchMatch && categoryMatch && statusMatch;
        });
    }, [parts, transactions, inventorySearchTerm, inventoryCategoryFilter, inventoryStatusFilter, currentBranchId]);
    
    // --- Lookup Tab Logic ---
    const filteredReferenceParts = useMemo(() => {
        if (selectedModel === 'Tất cả') return hondaPartsData;
        return hondaPartsData.filter(p => p.model.includes(selectedModel));
    }, [selectedModel]);

    const paginatedReferenceParts = useMemo(() => {
        const startIndex = (lookupCurrentPage - 1) * LOOKUP_ITEMS_PER_PAGE;
        return filteredReferenceParts.slice(startIndex, startIndex + LOOKUP_ITEMS_PER_PAGE);
    }, [filteredReferenceParts, lookupCurrentPage]);
    
    const totalLookupPages = Math.ceil(filteredReferenceParts.length / LOOKUP_ITEMS_PER_PAGE);

    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId && !(event.target as HTMLElement).closest('.menu-container')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    // --- CSV Upload Logic ---
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                parseCSVAndImport(text);
            }
        };
        reader.readAsText(file, 'UTF-8');
        event.target.value = ''; // Reset file input to allow re-uploading the same file
    };
    
    const parseCSVAndImport = (csvText: string) => {
        try {
            const lines = csvText.trim().split('\n');
            const headerRow = lines[0];

            if (!headerRow.toLowerCase().includes('danh mục sản phẩm') || !headerRow.toLowerCase().includes('đơn giá nhập')) {
                 alert('Tệp không đúng định dạng. Cột tiêu đề phải chứa "Danh mục sản phẩm" và "Đơn giá nhập".');
                 return;
            }

            const rows = lines.slice(1);

            let addedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;
            
            let updatedPartsList = [...parts];
            const newTransactions: InventoryTransaction[] = [];

            rows.forEach((rowStr, index) => {
                // Basic CSV parser to handle comma-separated values, stripping quotes
                const row = rowStr.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                
                if (row.length < 6) {
                    skippedCount++;
                    return;
                }
                
                const name = row[1]?.trim();
                const priceStr = row[2]?.trim();
                const sellingPriceStr = row[3]?.trim();
                const stockStr = row[5]?.trim();

                if (!name || !priceStr || !sellingPriceStr || stockStr === undefined) {
                    skippedCount++;
                    return;
                }

                const price = parseFloat(priceStr.replace(/\./g, ''));
                const sellingPrice = parseFloat(sellingPriceStr.replace(/\./g, ''));
                const stock = parseInt(stockStr, 10) || 0;

                if (isNaN(price) || isNaN(sellingPrice)) {
                     skippedCount++;
                     return;
                }

                const existingPartIndex = updatedPartsList.findIndex(p => p.name === name);
                
                let partIdForTransaction: string;

                if (existingPartIndex > -1) { // Part exists, update it
                    const existingPart = updatedPartsList[existingPartIndex];
                    const updatedPart = {
                        ...existingPart,
                        price,
                        sellingPrice,
                        stock: {
                            ...existingPart.stock,
                            [currentBranchId]: (existingPart.stock[currentBranchId] || 0) + stock,
                        }
                    };
                    updatedPartsList[existingPartIndex] = updatedPart;
                    partIdForTransaction = existingPart.id;
                    updatedCount++;
                } else { // New part
                    const newPartId = `P${Date.now()}-${index}`;
                    partIdForTransaction = newPartId;
                    const firstWord = name.split(' ')[0] || `SKU${index}`;
                    const sku = updatedPartsList.some(p => p.sku === firstWord) ? `${firstWord}-${Date.now()}` : firstWord;

                    const newPart: Part = {
                        id: newPartId, name, sku, price, sellingPrice,
                        stock: { [currentBranchId]: stock },
                        category: 'Chưa phân loại'
                    };
                    updatedPartsList.push(newPart);
                    addedCount++;
                }

                if (stock > 0) {
                     newTransactions.push({
                        id: `T-IMP-${Date.now()}-${index}`, type: 'Nhập kho', partId: partIdForTransaction,
                        partName: name, quantity: stock, date: new Date().toISOString().split('T')[0],
                        notes: 'Nhập kho từ tệp CSV', unitPrice: price, totalPrice: price * stock,
                        branchId: currentBranchId,
                    });
                }
            });

            // Batch update state
            setParts(updatedPartsList);
            
            if (newTransactions.length > 0) {
                 setTransactions(prev => [...newTransactions, ...prev]);
            }
            
            let message = `Nhập tệp thành công! ${addedCount} sản phẩm mới, ${updatedCount} sản phẩm được cập nhật.`;
            if (skippedCount > 0) {
                message += ` Đã bỏ qua ${skippedCount} dòng do lỗi dữ liệu.`
            }
            alert(message);
        } catch (error) {
            console.error("Lỗi khi xử lý tệp CSV:", error);
            alert("Đã xảy ra lỗi khi xử lý tệp. Vui lòng kiểm tra định dạng và thử lại.");
        }
    };

    return (
        <div>
            <PartModal isOpen={isPartModalOpen} onClose={handleClosePartModal} onSave={handleSavePart} part={selectedPart} parts={parts} allCategories={allCategories} onAddCategory={handleAddCategory} currentBranchId={currentBranchId} />
            <TransactionModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onSave={handleSaveTransaction} parts={parts} type="Xuất kho" currentBranchId={currentBranchId} />
            <HistoryModal part={historyModalPart} onClose={() => setHistoryModalPart(null)} transactions={transactions} storeSettings={storeSettings} />
            <TransferStockModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} onSave={handleSaveTransfer} parts={parts} branches={storeSettings.branches} currentBranchId={currentBranchId} />
            <CategorySettingsModal isOpen={isCategorySettingsOpen} onClose={() => setIsCategorySettingsOpen(false)} categories={allCategories} onAdd={handleAddCategory} onEdit={handleEditCategory} onDelete={handleDeleteCategory} />
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('inventory')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventory' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <ArchiveBoxIcon className="w-5 h-5 mr-2" /> Tồn kho
                    </button>
                     <button onClick={() => setActiveTab('category')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'category' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <ArchiveBoxIcon className="w-5 h-5 mr-2" /> Danh mục sản phẩm
                    </button>
                     <button onClick={() => setActiveTab('lookup')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'lookup' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <DocumentTextIcon className="w-5 h-5 mr-2" /> Tra cứu Phụ tùng
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <DocumentTextIcon className="w-5 h-5 mr-2" /> Lịch sử
                    </button>
                </nav>
            </div>
            
            {activeTab === 'inventory' && (
                <div>
                     <div className="flex flex-col sm:flex-row justify-end sm:items-center mb-6 gap-4">
                         <div className="flex flex-wrap gap-2">
                            <Link to="/inventory/goods-receipt/new" className="flex items-center bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700">
                                <PlusIcon /> <span className="ml-2 hidden sm:inline">Tạo phiếu nhập</span>
                            </Link>
                            <button onClick={() => setIsExportModalOpen(true)} className="flex items-center bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600">
                                <MinusIcon /> <span className="ml-2 hidden sm:inline">Xuất Kho</span>
                            </button>
                             <button onClick={() => setIsTransferModalOpen(true)} className="flex items-center bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-orange-600">
                                <ArrowsRightLeftIcon className="w-5 h-5" /> <span className="ml-2 hidden sm:inline">Chuyển kho</span>
                            </button>
                            <button onClick={() => handleOpenPartModal()} className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                                <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm Mới</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc SKU..."
                            value={inventorySearchTerm}
                            onChange={e => setInventorySearchTerm(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                        />
                         <select
                            value={inventoryStatusFilter}
                            onChange={e => setInventoryStatusFilter(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 bg-white"
                        >
                            <option value="all">Tất cả</option>
                            <option value="in-stock">Còn hàng</option>
                            <option value="out-of-stock">Hết hàng</option>
                            <option value="low-stock">Dưới định mức tồn</option>
                            <option value="slow-moving">Tồn kho quá 60 ngày</option>
                        </select>
                        <select
                            value={inventoryCategoryFilter}
                            onChange={e => setInventoryCategoryFilter(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 bg-white"
                        >
                            <option value="all">Tất cả danh mục</option>
                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-lg shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-blue-500 text-white"><ArchiveBoxIcon className="w-6 h-6" /></div>
                            <div className="ml-4"><p className="text-sm text-gray-500 font-medium">Tổng SL tồn</p><p className="text-2xl font-bold text-gray-800">{inventorySummary.totalQuantity.toLocaleString('vi-VN')}</p></div>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-md flex items-center">
                            <div className="p-3 rounded-full bg-green-500 text-white"><BanknotesIcon className="w-6 h-6" /></div>
                            <div className="ml-4"><p className="text-sm text-gray-500 font-medium">Giá trị tồn</p><p className="text-2xl font-bold text-gray-800">{formatCurrency(inventorySummary.totalValue)}</p></div>
                        </div>
                    </div>
                    
                    {filteredInventoryParts.length > 0 ? (
                        <>
                            <div className="lg:hidden space-y-4">
                                {filteredInventoryParts.map(p => {
                                    const stockInBranch = p.stock?.[currentBranchId] ?? 0;
                                    const totalStock = Object.values(p.stock || {}).reduce((a: number, b: number) => a + b, 0);
                                    return (
                                        <div key={p.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                    <p className="font-bold text-gray-800 flex items-center">{p.name} {stockInBranch > 0 && stockInBranch < 5 && <ExclamationTriangleIcon className="w-5 h-5 text-red-500 ml-2" />}</p>
                                                    <p className="text-xs text-gray-500">{p.sku}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleOpenPartModal(p)} className="text-blue-600 p-1"><PencilSquareIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeletePart(p.id)} className="text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center text-sm">
                                            <div className="text-center">
                                                <p className="text-gray-500">Tồn kho</p>
                                                <p className={`font-bold text-lg ${stockInBranch < 5 ? 'text-red-600' : 'text-blue-600'}`}>{stockInBranch}</p>
                                                <p className="text-xs text-gray-400">Tổng: {totalStock}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-right">Giá nhập</p>
                                                <p className="font-semibold text-gray-800 text-right">{formatCurrency(p.price)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-right">Giá bán</p>
                                                <p className="font-bold text-gray-900 text-right">{formatCurrency(p.sellingPrice)}</p>
                                            </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="hidden lg:block bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                                <table className="w-full text-left min-w-max">
                                    <thead><tr className="bg-gray-50 border-b"><th className="p-3 font-semibold text-gray-700">Tên Phụ tùng</th><th className="p-3 font-semibold text-gray-700">SKU</th><th className="p-3 font-semibold text-gray-700">Tồn kho (hiện tại)</th><th className="p-3 font-semibold text-gray-700">Tổng tồn kho</th><th className="p-3 font-semibold text-gray-700">Giá nhập</th><th className="p-3 font-semibold text-gray-700">Giá bán</th><th className="p-3 font-semibold text-gray-700">Hành động</th></tr></thead>
                                    <tbody>
                                        {filteredInventoryParts.map(p => {
                                            const stockInBranch = p.stock?.[currentBranchId] ?? 0;
                                            const totalStock = Object.values(p.stock || {}).reduce((a: number, b: number) => a + b, 0);
                                            return (
                                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-semibold text-gray-900"><div className="flex items-center space-x-2"><span>{p.name}</span>{stockInBranch > 0 && stockInBranch < 5 && (<ExclamationTriangleIcon className="w-5 h-5 text-red-500" title={`Tồn kho thấp: ${stockInBranch}`} />)}</div></td>
                                                <td className="p-3 text-gray-600">{p.sku}</td>
                                                <td className={`p-3 font-medium ${stockInBranch < 5 ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{stockInBranch}</td>
                                                <td className="p-3 text-gray-700 font-medium">{totalStock}</td>
                                                <td className="p-3 text-gray-800">{formatCurrency(p.price)}</td>
                                                <td className="p-3 text-gray-800 font-semibold">{formatCurrency(p.sellingPrice)}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center space-x-4">
                                                        <button onClick={() => handleOpenPartModal(p)} className="text-blue-600 hover:text-blue-800" title="Chỉnh sửa"><PencilSquareIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => setHistoryModalPart(p)} className="text-gray-600 hover:text-gray-800" title="Xem lịch sử"><DocumentTextIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => handleDeletePart(p.id)} className="text-red-600 hover:text-red-800" title="Xóa"><TrashIcon className="w-5 h-5"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200/60 text-center text-slate-500">
                            <p className="font-semibold">Không tìm thấy phụ tùng nào</p>
                            <p className="text-sm">Thử thay đổi từ khóa tìm kiếm của bạn.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'category' && (
                <div>
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Danh mục sản phẩm</h1>
                         <div className="flex items-center gap-2">
                             <button onClick={() => setIsCategorySettingsOpen(true)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"><Cog6ToothIcon className="w-6 h-6 text-gray-700"/></button>
                             <button
                                onClick={handleUploadClick}
                                className="flex items-center bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700"
                                title="Tải lên tệp CSV (Tên,Mã SP,Danh mục,Giá nhập,Giá bán,Tồn kho)"
                            >
                                <CloudArrowUpIcon className="w-5 h-5" /> <span className="ml-2 hidden sm:inline">Tải lên</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".csv"
                            />
                            <button onClick={() => handleOpenPartModal()} className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                                <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm Phụ tùng</span>
                            </button>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input type="text" placeholder="Tìm theo tên, SKU..." value={categorySearchTerm} onChange={e => setCategorySearchTerm(e.target.value)} className="md:col-span-2 w-full p-3 border rounded-lg text-gray-900"/>
                        <select value={selectedCategoryFilter} onChange={e => setSelectedCategoryFilter(e.target.value)} className="w-full p-3 border rounded-lg text-gray-900 bg-white">
                            <option value="all">Tất cả danh mục</option>
                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPartsForCategoryTab.map(part => {
                            const stockInBranch = part.stock[currentBranchId] || 0;
                            return (
                                <div key={part.id} className="bg-white p-4 rounded-lg shadow-md border flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                <ArchiveBoxIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{part.name}</p>
                                                <p className="text-xs text-gray-500">{part.sku}</p>
                                                <p className="text-xs text-blue-600 font-medium mt-1">{part.category || 'Chưa phân loại'}</p>
                                            </div>
                                        </div>
                                         <div className="relative menu-container">
                                            <button onClick={() => setOpenMenuId(openMenuId === part.id ? null : part.id)} className="p-1 text-gray-500 hover:text-gray-800"><EllipsisVerticalIcon className="w-5 h-5" /></button>
                                             {openMenuId === part.id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenPartModal(part); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Chỉnh sửa</a>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleDeletePart(part.id); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Xóa</a>
                                                </div>
                                             )}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t space-y-2 flex-grow">
                                        <div className="flex justify-between text-sm"><span className="text-gray-500">Giá nhập:</span> <span className="font-medium text-gray-800">{formatCurrency(part.price)}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-gray-500">Giá bán:</span> <span className="font-semibold text-green-600">{formatCurrency(part.sellingPrice)}</span></div>
                                    </div>
                                    <div className="mt-2 text-right">
                                        {stockInBranch > 0 && stockInBranch < 5 && (
                                            <div className="inline-flex items-center text-xs text-red-600 font-semibold bg-red-100 px-2 py-1 rounded-full">
                                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                                Tồn kho thấp: {stockInBranch}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     {filteredPartsForCategoryTab.length === 0 && <div className="text-center py-12 text-gray-500">Không tìm thấy sản phẩm nào.</div>}
                </div>
            )}
            
            {activeTab === 'lookup' && (
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
                     <h2 className="text-2xl font-bold text-slate-800 mb-4">Tra cứu phụ tùng Honda Việt Nam</h2>
                     <div className="mb-4">
                         <label htmlFor="model-select" className="block text-sm font-medium text-slate-700 mb-1">Chọn dòng xe:</label>
                         <select 
                            id="model-select"
                            value={selectedModel}
                            onChange={e => { setSelectedModel(e.target.value); setLookupCurrentPage(1); }}
                            className="w-full md:w-1/3 p-2 border border-slate-300 rounded-md bg-white focus:ring-sky-500 focus:border-sky-500"
                        >
                             {motorcycleModels.map(model => (
                                 <option key={model} value={model}>{model}</option>
                             ))}
                         </select>
                     </div>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left">
                             <thead className="bg-slate-100">
                                 <tr>
                                     <th className="p-3 font-semibold text-slate-600">Tên Phụ tùng</th>
                                     <th className="p-3 font-semibold text-slate-600">Mã (SKU)</th>
                                     <th className="p-3 font-semibold text-slate-600 text-right">Giá tham khảo</th>
                                     <th className="p-3 font-semibold text-slate-600 text-right">Hành động</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {paginatedReferenceParts.map((refPart, index) => (
                                     <tr key={`${refPart.sku}-${index}`} className="border-b hover:bg-slate-50">
                                         <td className="p-3 text-slate-800 font-medium">{refPart.name}</td>
                                         <td className="p-3 text-slate-600 font-mono text-sm">{refPart.sku}</td>
                                         <td className="p-3 text-slate-800 font-semibold text-right">{formatCurrency(refPart.sellingPrice)}</td>
                                         <td className="p-3 text-right">
                                             <button 
                                                 onClick={() => handleAddFromReference(refPart)} 
                                                 className="px-3 py-1 bg-sky-100 text-sky-700 text-sm font-semibold rounded-md hover:bg-sky-200" 
                                             >
                                                 Thêm
                                             </button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                         {paginatedReferenceParts.length === 0 && <p className="text-center text-slate-500 py-8">Không có phụ tùng cho dòng xe này.</p>}
                     </div>
                     {totalLookupPages > 1 && (
                        <div className="mt-4 flex justify-center items-center space-x-2">
                            <button onClick={() => setLookupCurrentPage(p => Math.max(1, p - 1))} disabled={lookupCurrentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">&laquo;</button>
                            <span className="text-sm">Trang {lookupCurrentPage} / {totalLookupPages}</span>
                            <button onClick={() => setLookupCurrentPage(p => Math.min(totalLookupPages, p + 1))} disabled={lookupCurrentPage === totalLookupPages} className="px-3 py-1 border rounded-md disabled:opacity-50">&raquo;</button>
                        </div>
                     )}
                 </div>
            )}

             {activeTab === 'history' && (
                <div>
                     <h1 className="text-3xl font-bold text-gray-800 mb-6">Lịch sử Xuất/Nhập kho</h1>
                     <input type="text" placeholder="Tìm kiếm theo tên phụ tùng, mã giao dịch, ghi chú..." value={historySearchTerm} onChange={e => setHistorySearchTerm(e.target.value)} className="w-full p-3 border rounded-lg mb-6 text-gray-900"/>
                     <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                        <table className="w-full text-left min-w-max">
                            <thead><tr className="bg-gray-50 border-b"><th className="p-3 font-semibold text-gray-700">Ngày</th><th className="p-3 font-semibold text-gray-700">Loại</th><th className="p-3 font-semibold text-gray-700">Phụ tùng</th><th className="p-3 font-semibold text-gray-700">Số lượng</th><th className="p-3 font-semibold text-gray-700">Đơn giá</th><th className="p-3 font-semibold text-gray-700">Tổng tiền</th><th className="p-3 font-semibold text-gray-700">Chi nhánh</th><th className="p-3 font-semibold text-gray-700">Ghi chú</th></tr></thead>
                            <tbody>
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 text-gray-700">{tx.date}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${tx.type === 'Nhập kho' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{tx.type}</span></td>
                                        <td className="p-3 font-medium text-gray-900">{tx.partName}</td>
                                        <td className="p-3 text-gray-800">{tx.quantity}</td>
                                        <td className="p-3 text-gray-800">{formatCurrency(tx.unitPrice || 0)}</td>
                                        <td className="p-3 text-gray-900 font-semibold">{formatCurrency(tx.totalPrice || 0)}</td>
                                        <td className="p-3 text-gray-700">{storeSettings.branches.find(b => b.id === tx.branchId)?.name || tx.branchId}</td>
                                        <td className="p-3 text-sm text-gray-600">{tx.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTransactions.length === 0 && <p className="text-center py-8 text-gray-500">Không tìm thấy giao dịch nào.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;