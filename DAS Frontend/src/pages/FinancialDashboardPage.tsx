import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
                return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
            case 'partial':
                return <Badge className="bg-yellow-100 text-yellow-800">جزئي</Badge>;
            case 'pending':
                return <Badge className="bg-red-100 text-red-800">معلق</Badge>;
            default:
                return <Badge variant="secondary">غير محدد</Badge>;
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
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">الإدارة المالية</h1>
                    <p className="text-muted-foreground">
                        متابعة الإيرادات والمصروفات والرسوم الدراسية
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="اختر الفترة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current_month">الشهر الحالي</SelectItem>
                            <SelectItem value="last_month">الشهر الماضي</SelectItem>
                            <SelectItem value="current_year">السنة الحالية</SelectItem>
                            <SelectItem value="last_year">السنة الماضية</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>
                        <Plus className="h-4 w-4 ml-2" />
                        معاملة جديدة
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                            12.5% من الشهر الماضي
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <TrendingDown className="h-3 w-3 ml-1 text-red-500" />
                            5.2% من الشهر الماضي
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">صافي الدخل</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.netIncome)}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.netIncome > 0 ? 'ربح' : 'خسارة'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">معدل التحصيل</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.collectionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.studentsWithDues} طالب متبقي عليهم
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>الإيرادات والمصروفات الشهرية</CardTitle>
                        <CardDescription>
                            مقارنة الإيرادات والمصروفات على مدار الأشهر
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <BarChartIcon className="h-12 w-12 mx-auto mb-2" />
                                <p>مخطط الإيرادات والمصروفات - سيتم إضافته لاحقاً</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>الطلاب المتأخرين في الدفع</CardTitle>
                        <CardDescription>
                            قائمة بالطلاب المتأخرين في سداد الرسوم
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {studentPayments.slice(0, 5).map((student) => (
                                <div key={student.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{student.student_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {student.grade} - {student.section}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-red-600">
                                            {formatCurrency(student.remaining_amount)}
                                        </p>
                                        {getPaymentStatusBadge(student.payment_status)}
                                    </div>
                                </div>
                            ))}
                            {studentPayments.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Receipt className="h-8 w-8 mx-auto mb-2" />
                                    <p>لا توجد بيانات عن تأخر في الدفع</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>آخر المعاملات المالية</CardTitle>
                            <CardDescription>
                                قائمة بأحدث الإيرادات والمصروفات
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث في المعاملات..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full md:w-64"
                                />
                            </div>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-full md:w-32">
                                    <SelectValue placeholder="النوع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">الكل</SelectItem>
                                    <SelectItem value="income">الإيرادات</SelectItem>
                                    <SelectItem value="expense">المصروفات</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Download className="h-4 w-4 ml-2" />
                                تصدير
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الوصف</TableHead>
                                <TableHead>التصنيف</TableHead>
                                <TableHead>المرجع</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-center">الإجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                                            {new Date(transaction.transaction_date).toLocaleDateString('ar-IQ')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{transaction.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{getCategoryName(transaction.category_id)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {transaction.reference_type && (
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 ml-2 text-muted-foreground" />
                                                {transaction.reference_type}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.transaction_type === 'income' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        <Receipt className="h-8 w-8 mx-auto mb-2" />
                                        <p>لا توجد معاملات مالية</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};