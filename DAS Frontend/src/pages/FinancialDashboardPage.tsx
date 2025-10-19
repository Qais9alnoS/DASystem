import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { financeApi, studentsApi } from '@/services/api';
import { FinanceTransaction, FinanceCategory } from '@/types/school';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    CreditCard,
    Receipt,
    Calendar,
    FileText,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    AlertCircle,
    CheckCircle,
    BarChart3 as BarChartIcon,
    Loader2
} from 'lucide-react';
import { IOSNavbar } from '@/components/ui/ios-navbar';
import { IOSTabBar } from '@/components/ui/ios-tabbar';
import { SegmentedControl } from '@/components/ui/segmented-control';

interface FinanceStats {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    studentsWithDues: number;
    totalStudents: number;
    collectionRate: number;
    pendingPayments: number;
    monthlyRevenue: number[];
    monthlyExpenses: number[];
}

interface StudentPaymentSummary {
    id: number;
    student_name: string;
    grade: string;
    section: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    last_payment_date?: string;
    payment_status: 'paid' | 'partial' | 'pending';
}

export const FinancialDashboardPage: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('current_month');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [iosActiveTab, setIosActiveTab] = useState("finance");

    // Fetch financial dashboard data
    const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
        queryKey: ['financeDashboard', selectedPeriod],
        queryFn: async () => {
            // For now, we'll use a placeholder academic year ID
            // In a real implementation, this would come from context or state
            const academicYearId = 1;
            const response = await financeApi.getDashboard(academicYearId);
            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch transactions
    const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError } = useQuery({
        queryKey: ['financeTransactions', filterType],
        queryFn: async () => {
            const response = await financeApi.getTransactions({
                transaction_type: filterType === 'all' ? undefined : filterType
            });
            return response.success ? response.data : [];
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch student payments summary
    const { data: studentPayments = [], isLoading: studentsLoading, error: studentsError } = useQuery({
        queryKey: ['studentPayments'],
        queryFn: async () => {
            // This would need to be implemented in the API
            // For now, we'll return an empty array
            return [];
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch categories for transaction display
    const { data: categories = [] } = useQuery({
        queryKey: ['financeCategories'],
        queryFn: async () => {
            const response = await financeApi.getCategories();
            return response.success ? response.data : [];
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Mock stats data - in a real implementation, this would come from the dashboard API
    const stats: FinanceStats = {
        totalRevenue: dashboardData?.total_revenue || 2850000,
        totalExpenses: dashboardData?.total_expenses || 1650000,
        netIncome: dashboardData ? (dashboardData.total_revenue - dashboardData.total_expenses) : 1200000,
        studentsWithDues: dashboardData?.students_with_dues || 45,
        totalStudents: dashboardData?.total_students || 320,
        collectionRate: dashboardData?.collection_rate || 85.9,
        pendingPayments: dashboardData?.pending_payments || 15,
        monthlyRevenue: dashboardData?.monthly_revenue || [180000, 220000, 195000, 240000, 210000, 225000],
        monthlyExpenses: dashboardData?.monthly_expenses || [120000, 135000, 140000, 160000, 145000, 150000]
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 rounded-full">مكتمل</Badge>;
            case 'partial':
                return <Badge className="bg-yellow-100 text-yellow-800 rounded-full">جزئي</Badge>;
            case 'pending':
                return <Badge className="bg-red-100 text-red-800 rounded-full">معلق</Badge>;
            default:
                return <Badge variant="secondary" className="rounded-full">غير محدد</Badge>;
        }
    };

    const getCategoryName = (categoryId: number) => {
        const category = categories.find((cat: FinanceCategory) => cat.id === categoryId);
        return category ? category.category_name : 'غير محدد';
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.reference_type?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterType === 'all' || transaction.transaction_type === filterType;
        return matchesSearch && matchesFilter;
    });

    if (dashboardLoading || transactionsLoading || studentsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mr-2">جاري تحميل البيانات المالية...</span>
            </div>
        );
    }

    if (dashboardError || transactionsError || studentsError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500">حدث خطأ أثناء تحميل البيانات المالية</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {dashboardError?.message || transactionsError?.message || studentsError?.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* iOS Navigation Bar */}
            <IOSNavbar 
                title="الإدارة المالية" 
                largeTitle={true}
            />
            
            <div className="p-4 pb-24">
                {/* Segmented Control for Tabs */}
                <div className="mb-6">
                    <SegmentedControl
                        options={[
                            { value: "dashboard", label: "نظرة عامة" },
                            { value: "transactions", label: "المعاملات" },
                            { value: "students", label: "الطلاب" },
                            { value: "reports", label: "التقارير" }
                        ]}
                        value={activeTab}
                        onValueChange={setActiveTab}
                    />
                </div>

                {activeTab === "dashboard" && (
                    <div className="space-y-6">
                        {/* Financial Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="rounded-3xl border-0 shadow-ios">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">الإيرادات</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {formatCurrency(stats.totalRevenue)}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-full bg-green-100">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-0 shadow-ios">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">المصروفات</p>
                                            <p className="text-xl font-bold text-red-600">
                                                {formatCurrency(stats.totalExpenses)}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-full bg-red-100">
                                            <TrendingDown className="h-5 w-5 text-red-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-0 shadow-ios">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">الصافي</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {formatCurrency(stats.netIncome)}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-full bg-blue-100">
                                            <DollarSign className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-0 shadow-ios">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">معدل التحصيل</p>
                                            <p className="text-xl font-bold">{stats.collectionRate}%</p>
                                        </div>
                                        <div className="p-2 rounded-full bg-purple-100">
                                            <BarChartIcon className="h-5 w-5 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Transactions */}
                        <Card className="rounded-3xl border-0 shadow-ios">
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg">أحدث المعاملات</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>الوصف</TableHead>
                                            <TableHead>المبلغ</TableHead>
                                            <TableHead>النوع</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.slice(0, 5).map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {transaction.description}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                        {transaction.transaction_type === 'income' ? '+' : '-'}
                                                        {formatCurrency(Math.abs(transaction.amount))}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'} className="rounded-full">
                                                        {transaction.transaction_type === 'income' ? 'إيراد' : 'مصروف'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "transactions" && (
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <Card className="rounded-3xl border-0 shadow-ios">
                            <CardContent className="p-4">
                                <div className="flex flex-col space-y-3">
                                    <div className="relative">
                                        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="البحث في المعاملات..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pr-10 rounded-2xl"
                                        />
                                    </div>
                                    <div className="flex space-x-2 space-x-reverse">
                                        <Select value={filterType} onValueChange={setFilterType}>
                                            <SelectTrigger className="rounded-2xl">
                                                <SelectValue placeholder="نوع المعاملة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">الكل</SelectItem>
                                                <SelectItem value="income">الإيرادات</SelectItem>
                                                <SelectItem value="expense">المصروفات</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                            <SelectTrigger className="rounded-2xl">
                                                <SelectValue placeholder="الفترة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="current_month">الشهر الحالي</SelectItem>
                                                <SelectItem value="last_month">الشهر الماضي</SelectItem>
                                                <SelectItem value="current_year">السنة الحالية</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transactions Table */}
                        <Card className="rounded-3xl border-0 shadow-ios">
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg">جميع المعاملات</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>الوصف</TableHead>
                                            <TableHead>المبلغ</TableHead>
                                            <TableHead>التاريخ</TableHead>
                                            <TableHead>النوع</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {transaction.description}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                        {transaction.transaction_type === 'income' ? '+' : '-'}
                                                        {formatCurrency(Math.abs(transaction.amount))}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(transaction.transaction_date).toLocaleDateString('ar-IQ')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'} className="rounded-full">
                                                        {transaction.transaction_type === 'income' ? 'إيراد' : 'مصروف'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "students" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">مدفوعات الطلاب</CardTitle>
                            <CardDescription>
                                متابعة مدفوعات الطلاب ومستحقاتهم
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                متابعة مدفوعات الطلاب - قريباً
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "reports" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">التقارير المالية</CardTitle>
                            <CardDescription>
                                تقارير وإحصائيات مالية شاملة
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                التقارير المالية - قريباً
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* iOS Tab Bar */}
            <IOSTabBar activeTab={iosActiveTab} onTabChange={setIosActiveTab} />
        </div>
    );
};