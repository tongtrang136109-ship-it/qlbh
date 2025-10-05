import React, { useState, useMemo } from 'react';
import type { WorkOrder, InventoryTransaction, Part } from '../types';
import { ChartBarIcon, BanknotesIcon, ArchiveBoxIcon, ChartPieIcon, ArrowDownTrayIcon } from './common/Icons';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Sub-component for Grouped Bar Chart
const GroupedBarChart: React.FC<{ data: { label: string; revenue: number; cost: number; profit: number }[] }> = ({ data }) => {
    const maxValue = useMemo(() => {
        if (data.length === 0) return 0;
        const maxValues = data.map(d => Math.max(d.revenue, d.cost));
        return Math.max(...maxValues, 1); // Avoid division by zero
    }, [data]);

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-80 bg-slate-100 rounded-lg text-slate-500">Không có dữ liệu để hiển thị.</div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Tổng quan Doanh thu - Chi phí - Lợi nhuận</h3>
            <div className="flex justify-end space-x-4 mb-4 text-xs">
                <div className="flex items-center"><span className="w-3 h-3 bg-sky-500 mr-2 rounded-sm"></span>Doanh thu</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-amber-500 mr-2 rounded-sm"></span>Chi phí</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 mr-2 rounded-sm"></span>Lợi nhuận</div>
            </div>
            <div className="flex items-end h-80 space-x-2 border-b border-slate-200 pb-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                        <div className="absolute -top-14 hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10">
                            <div>Doanh thu: {formatCurrency(item.revenue)}</div>
                            <div>Chi phí: {formatCurrency(item.cost)}</div>
                            <div className="font-bold">Lợi nhuận: {formatCurrency(item.profit)}</div>
                        </div>
                        <div className="flex items-end h-full w-full justify-center space-x-[10%]">
                             <div className="w-full bg-sky-400 hover:bg-sky-500 transition-all duration-300 rounded-t" style={{ height: `${Math.max(0, (item.revenue / maxValue)) * 100}%` }} />
                             <div className="w-full bg-amber-400 hover:bg-amber-500 transition-all duration-300 rounded-t" style={{ height: `${Math.max(0, (item.cost / maxValue)) * 100}%` }} />
                             <div className="w-full bg-green-400 hover:bg-green-500 transition-all duration-300 rounded-t" style={{ height: `${Math.max(0, (item.profit / maxValue)) * 100}%` }} />
                        </div>
                        <span className="absolute -bottom-6 text-xs text-slate-500 whitespace-nowrap">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfitBarChart: React.FC<{ data: { label: string; profit: number }[] }> = ({ data }) => {
    const maxValue = useMemo(() => {
        if (data.length === 0) return 0;
        const maxProfit = Math.max(...data.map(d => d.profit));
        return Math.max(maxProfit, 1);
    }, [data]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Xu hướng lợi nhuận ròng</h3>
            <div className="flex items-end h-60 space-x-2 border-b border-slate-200 pb-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                        <div className="absolute -top-8 hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10">
                            {formatCurrency(item.profit)}
                        </div>
                        <div className="w-3/5 bg-green-400 hover:bg-green-500 transition-all duration-300 rounded-t" style={{ height: `${Math.max(0, (item.profit / maxValue)) * 100}%` }} />
                        <span className="absolute -bottom-6 text-xs text-slate-500">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryBreakdown: React.FC<{ data: { category: string; revenue: number; percentage: number }[] }> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center"><ChartPieIcon className="w-6 h-6 mr-3 text-violet-600"/>Doanh thu theo Danh mục</h3>
            <div className="space-y-3">
                {data.length > 0 ? data.map(item => (
                    <div key={item.category}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-800">{item.category}</span>
                            <span className="font-semibold text-slate-600">{formatCurrency(item.revenue)} ({item.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-violet-500 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 text-center py-4">Không có dữ liệu.</p>
                )}
            </div>
        </div>
    );
};


interface RevenueReportProps {
    workOrders: WorkOrder[];
    transactions: InventoryTransaction[];
    parts: Part[];
    currentBranchId: string;
}

const RevenueReport: React.FC<RevenueReportProps> = ({ workOrders, transactions, parts, currentBranchId }) => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
    
    // States for report data
    const [reportData, setReportData] = useState<{ label: string; revenue: number; cost: number; profit: number }[]>([]);
    const [productSalesDetails, setProductSalesDetails] = useState<{ partName: string; sku: string; quantity: number; revenue: number; }[]>([]);
    const [categoryRevenueDetails, setCategoryRevenueDetails] = useState<{ category: string; revenue: number; percentage: number; }[]>([]);
    const [productSortConfig, setProductSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const processedSales = useMemo(() => {
        const workOrderItems = workOrders
            .filter(wo => wo.status === 'Trả máy' && wo.branchId === currentBranchId && wo.partsUsed)
            .flatMap(wo => wo.partsUsed!.map(usedPart => {
                const partInfo = parts.find(p => p.id === usedPart.partId);
                return {
                    date: wo.creationDate,
                    revenue: usedPart.price * usedPart.quantity,
                    cost: (partInfo?.price || 0) * usedPart.quantity,
                    partId: usedPart.partId,
                    partName: usedPart.partName,
                    sku: usedPart.sku,
                    category: partInfo?.category || 'Chưa phân loại',
                    quantity: usedPart.quantity
                };
            }));

        const laborRevenue = workOrders
            .filter(wo => wo.status === 'Trả máy' && wo.branchId === currentBranchId && wo.laborCost > 0)
            .map(wo => ({
                date: wo.creationDate, revenue: wo.laborCost, cost: 0,
                partId: 'LABOR', partName: 'Tiền công sửa chữa', sku: 'DV-SC',
                category: 'Dịch vụ', quantity: 1
            }));

        const retailSaleItems = transactions
            .filter(tx => tx.type === 'Xuất kho' && tx.branchId === currentBranchId && tx.saleId)
            .map(tx => {
                const partInfo = parts.find(p => p.id === tx.partId);
                return {
                    date: tx.date, revenue: tx.totalPrice || 0,
                    cost: (partInfo?.price || 0) * tx.quantity,
                    partId: tx.partId, partName: tx.partName,
                    sku: partInfo?.sku || 'N/A', category: partInfo?.category || 'Chưa phân loại',
                    quantity: tx.quantity
                };
            });

        return [...workOrderItems, ...laborRevenue, ...retailSaleItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [workOrders, transactions, parts, currentBranchId]);

    const generateReport = () => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        const filteredSales = processedSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start && saleDate <= end;
        });

        // 1. Chart Data Aggregation
        const aggregated: { [key: string]: { revenue: number, cost: number } } = {};
        const getWeekNumber = (d: Date) => {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
            return { year: d.getUTCFullYear(), week: weekNo };
        };

        filteredSales.forEach(sale => {
            const saleDate = new Date(sale.date);
            let key = '';
            if (period === 'day') key = saleDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit'});
            else if (period === 'week') { const { year, week } = getWeekNumber(saleDate); key = `${year}-W${week.toString().padStart(2, '0')}`; }
            else if (period === 'month') key = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
            if (key) {
                if (!aggregated[key]) aggregated[key] = { revenue: 0, cost: 0 };
                aggregated[key].revenue += sale.revenue;
                aggregated[key].cost += sale.cost;
            }
        });
        setReportData(Object.keys(aggregated).sort().map(key => ({
            label: key, revenue: aggregated[key].revenue, cost: aggregated[key].cost,
            profit: aggregated[key].revenue - aggregated[key].cost,
        })));

        // 2. Product Sales Details
        const productSales: { [key: string]: { partName: string; sku: string; quantity: number; revenue: number; } } = {};
        filteredSales.filter(s => s.partId !== 'LABOR').forEach(sale => {
            if (!productSales[sale.partId]) productSales[sale.partId] = { partName: sale.partName, sku: sale.sku, quantity: 0, revenue: 0 };
            productSales[sale.partId].quantity += sale.quantity;
            productSales[sale.partId].revenue += sale.revenue;
        });
        setProductSalesDetails(Object.values(productSales).sort((a,b) => b.quantity - a.quantity));

        // 3. Category Revenue Details
        const categoryRevenues: { [key: string]: number } = {};
        let totalRevenueForCategories = 0;
        filteredSales.forEach(sale => {
            const category = sale.category || 'Chưa phân loại';
            categoryRevenues[category] = (categoryRevenues[category] || 0) + sale.revenue;
            totalRevenueForCategories += sale.revenue;
        });
        setCategoryRevenueDetails(totalRevenueForCategories > 0 ? Object.entries(categoryRevenues)
            .map(([category, revenue]) => ({ category, revenue, percentage: (revenue / totalRevenueForCategories) * 100 }))
            .sort((a,b) => b.revenue - a.revenue) : []);
    };

    const exportToCSV = (type: 'summary' | 'products') => {
        let headers: string[], rows: (string|number)[][], filename: string;

        if (type === 'summary' && reportData.length > 0) {
            headers = ['Thoi gian', 'Doanh thu (VND)', 'Chi phi (VND)', 'Loi nhuan (VND)'];
            rows = reportData.map(item => [item.label, item.revenue, item.cost, item.profit]);
            filename = 'bao_cao_doanh_thu.csv';
        } else if (type === 'products' && productSalesDetails.length > 0) {
            headers = ['Ten san pham', 'SKU', 'So luong ban', 'Doanh thu (VND)'];
            rows = sortedProductSales.map(item => [item.partName, item.sku, item.quantity, item.revenue]);
            filename = 'bao_cao_ban_hang_san_pham.csv';
        } else {
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const sortedProductSales = useMemo(() => {
        if (!productSortConfig) return productSalesDetails;
        return [...productSalesDetails].sort((a, b) => {
            const key = productSortConfig.key as keyof typeof a;
            if (a[key] < b[key]) return productSortConfig.direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return productSortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [productSalesDetails, productSortConfig]);

    const requestProductSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (productSortConfig && productSortConfig.key === key && productSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setProductSortConfig({ key, direction });
    };

    const totalRevenueInPeriod = useMemo(() => reportData.reduce((sum, item) => sum + item.revenue, 0), [reportData]);
    const totalCostInPeriod = useMemo(() => reportData.reduce((sum, item) => sum + item.cost, 0), [reportData]);
    const totalProfitInPeriod = useMemo(() => reportData.reduce((sum, item) => sum + item.profit, 0), [reportData]);

    return (
        <div className="space-y-8">
            <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-violet-600" />
                <h1 className="text-3xl font-bold text-slate-800 ml-3">Báo cáo Doanh thu</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div><label className="block text-sm font-medium text-slate-700">Từ ngày</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" /></div>
                    <div><label className="block text-sm font-medium text-slate-700">Đến ngày</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" /></div>
                    <div><label className="block text-sm font-medium text-slate-700">Xem theo</label><div className="mt-1 flex rounded-md shadow-sm"><button onClick={() => setPeriod('day')} className={`px-4 py-2 rounded-l-md border text-sm font-medium w-full ${period === 'day' ? 'bg-sky-600 text-white border-sky-600 z-10' : 'bg-white'}`}>Ngày</button><button onClick={() => setPeriod('week')} className={`px-4 py-2 border-t border-b -ml-px text-sm font-medium w-full ${period === 'week' ? 'bg-sky-600 text-white border-sky-600 z-10' : 'bg-white'}`}>Tuần</button><button onClick={() => setPeriod('month')} className={`px-4 py-2 rounded-r-md border -ml-px text-sm font-medium w-full ${period === 'month' ? 'bg-sky-600 text-white border-sky-600 z-10' : 'bg-white'}`}>Tháng</button></div></div>
                    <button onClick={generateReport} className="w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700">Xem báo cáo</button>
                    <button onClick={() => exportToCSV('summary')} disabled={reportData.length === 0} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center gap-2"><ArrowDownTrayIcon className="w-5 h-5"/> Tóm tắt</button>
                </div>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center border"><div className="p-4 rounded-full bg-sky-500"><BanknotesIcon className="w-7 h-7 text-white" /></div><div className="ml-4"><p className="text-sm text-slate-500">Tổng doanh thu</p><p className="text-2xl font-bold">{formatCurrency(totalRevenueInPeriod)}</p></div></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center border"><div className="p-4 rounded-full bg-amber-500"><ArchiveBoxIcon className="w-7 h-7 text-white" /></div><div className="ml-4"><p className="text-sm text-slate-500">Tổng chi phí</p><p className="text-2xl font-bold">{formatCurrency(totalCostInPeriod)}</p></div></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center border"><div className="p-4 rounded-full bg-green-500"><ChartBarIcon className="w-7 h-7 text-white" /></div><div className="ml-4"><p className="text-sm text-slate-500">Lợi nhuận ròng</p><p className="text-2xl font-bold">{formatCurrency(totalProfitInPeriod)}</p></div></div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <GroupedBarChart data={reportData} />
                    <ProfitBarChart data={reportData} />
                </div>

                <CategoryBreakdown data={categoryRevenueDetails} />

                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-slate-700">Chi tiết Bán hàng theo Sản phẩm</h3>
                        <button onClick={() => exportToCSV('products')} disabled={productSalesDetails.length === 0} className="bg-green-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-300 flex items-center gap-2 text-sm"><ArrowDownTrayIcon className="w-5 h-5"/> Xuất CSV</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-slate-50 z-10"><tr className="border-b">
                                <th className="p-4 font-semibold text-slate-600"><div onClick={() => requestProductSort('partName')} className="cursor-pointer">Sản phẩm</div></th>
                                <th className="p-4 font-semibold text-slate-600"><div onClick={() => requestProductSort('sku')} className="cursor-pointer">SKU</div></th>
                                <th className="p-4 font-semibold text-slate-600 text-right"><div onClick={() => requestProductSort('quantity')} className="cursor-pointer">Số lượng bán</div></th>
                                <th className="p-4 font-semibold text-slate-600 text-right"><div onClick={() => requestProductSort('revenue')} className="cursor-pointer">Doanh thu</div></th>
                            </tr></thead>
                            <tbody>
                                {sortedProductSales.length > 0 ? sortedProductSales.map(item => (
                                    <tr key={item.partName} className="border-b hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-800">{item.partName}</td>
                                        <td className="p-4 text-slate-600">{item.sku}</td>
                                        <td className="p-4 text-slate-800 text-right font-semibold">{item.quantity}</td>
                                        <td className="p-4 text-sky-600 text-right font-bold">{formatCurrency(item.revenue)}</td>
                                    </tr>
                                )) : <tr><td colSpan={4} className="text-center p-4 text-slate-500">Chưa có sản phẩm nào được bán trong kỳ này.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueReport;