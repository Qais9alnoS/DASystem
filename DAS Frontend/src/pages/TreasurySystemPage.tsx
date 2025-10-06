import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { financeApi } from '@/services/realApi';
import { FinanceCategory, FinanceTransaction } from '@/types/school';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
    Edit,
    Trash2,
    DollarSign,
    Receipt,
    PieChart,
    Calendar,
    FileText,
    Users,
    Bus,
    BookOpen,
    Gift,
    Settings,
    Loader2
} from 'lucide-react';

interface TreasuryStats {
    total_income: number;
    total_expenses: number;
    net_balance: number;
    monthly_income: number;
    monthly_expenses: number;
    top_categories: Array<{
        name: string;
        amount: number;
        type: 'income' | 'expense';
    }>;
}

export function TreasurySystemPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<FinanceCategory[]>([]);
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<FinanceCategory | null>(null);
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [showTransactionDialog, setShowTransactionDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Form states
    const [categoryForm, setCategoryForm] = useState({
        category_name: '',
        category_type: 'income' as 'income' | 'expense',
        description: ''
    });

    const [transactionForm, setTransactionForm] = useState({
        category_id: 0,
        transaction_type: 'income' as 'income' | 'expense',
        amount: 0,
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        receipt_number: ''
    });

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch categories
                const categoriesResponse = await financeApi.getCategories();
                if (categoriesResponse.success && categoriesResponse.data) {
                    setCategories(categoriesResponse.data);
                }

                // Fetch transactions
                const transactionsResponse = await financeApi.getTransactions();
                if (transactionsResponse.success && transactionsResponse.data) {
                    setTransactions(transactionsResponse.data);
                }

                // For treasury stats, we'll use mock data for now since the API doesn't seem to have a specific endpoint
                // In a real implementation, this would come from a dashboard API endpoint
                const mockStats: TreasuryStats = {
                    total_income: 61550000,
                    total_expenses: 37800000,
                    net_balance: 23750000,
                    monthly_income: 8500000,
                    monthly_expenses: 5200000,
                    top_categories: [
                        { name: 'رسوم الطلاب', amount: 50250000, type: 'income' },
                        { name: 'رواتب المعلمين', amount: 22500000, type: 'expense' },
                        { name: 'رسوم النقل', amount: 9000000, type: 'income' }
                    ]
                };
                setTreasuryStats(mockStats);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "خطأ",
                    description: "فشل في تحميل البيانات المالية",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getCategoryIcon = (categoryName: string) => {
        if (categoryName.includes('رسوم الطلاب') || categoryName.includes('طلاب')) return <Users className="h-5 w-5" />;
        if (categoryName.includes('نقل') || categoryName.includes('باص')) return <Bus className="h-5 w-5" />;
        if (categoryName.includes('أنشطة')) return <BookOpen className="h-5 w-5" />;
        if (categoryName.includes('رواتب') || categoryName.includes('معلمين')) return <Users className="h-5 w-5" />;
        if (categoryName.includes('مكافآت') || categoryName.includes('مساعدات')) return <Gift className="h-5 w-5" />;
        return <FileText className="h-5 w-5" />;
    };

    const addCategory = async () => {
        if (!categoryForm.category_name.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال اسم الفئة",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await financeApi.createCategory({
                category_name: categoryForm.category_name,
                category_type: categoryForm.category_type,
                is_default: false,
                is_active: true,
                description: categoryForm.description
            });

            if (response.success && response.data) {
                setCategories([...categories, response.data]);
                setCategoryForm({ category_name: '', category_type: 'income', description: '' });
                setShowCategoryDialog(false);

                toast({
                    title: "نجاح",
                    description: `تم إنشاء الفئة ${response.data.category_name} بنجاح`,
                });
            } else {
                throw new Error(response.message || 'فشل في إنشاء الفئة');
            }
        } catch (error) {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الفئة',
                variant: "destructive"
            });
        }
    };

    const addTransaction = async () => {
        if (!transactionForm.category_id || !transactionForm.amount) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال جميع البيانات المطلوبة",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await financeApi.createTransaction({
                academic_year_id: 1, // This should be dynamically set
                category_id: transactionForm.category_id,
                transaction_type: transactionForm.transaction_type,
                amount: transactionForm.amount,
                transaction_date: transactionForm.transaction_date,
                description: transactionForm.description,
                receipt_number: transactionForm.receipt_number,
                created_by: 1 // This should be the current user ID
            });

            if (response.success && response.data) {
                setTransactions([...transactions, response.data]);
                setTransactionForm({
                    category_id: 0,
                    transaction_type: 'income',
                    amount: 0,
                    description: '',
                    transaction_date: new Date().toISOString().split('T')[0],
                    receipt_number: ''
                });
                setShowTransactionDialog(false);

                toast({
                    title: "نجاح",
                    description: `تم تسجيل المعاملة المالية بنجاح`,
                });
            } else {
                throw new Error(response.message || 'فشل في تسجيل المعاملة');
            }
        } catch (error) {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل المعاملة',
                variant: "destructive"
            });
        }
    };

    const toggleCategoryStatus = async (id: number) => {
        try {
            const category = categories.find(cat => cat.id === id);
            if (!category) return;

            const response = await financeApi.updateCategory(id, {
                is_active: !category.is_active
            });

            if (response.success && response.data) {
                setCategories(categories.map(cat =>
                    cat.id === id ? response.data! : cat
                ));
                toast({
                    title: "نجاح",
                    description: `تم ${category.is_active ? 'تعطيل' : 'تنشيط'} الفئة بنجاح`,
                });
            } else {
                throw new Error(response.message || 'فشل في تحديث الفئة');
            }
        } catch (error) {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الفئة',
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">نظام الخزينة</h1>
                    <p className="text-muted-foreground mt-2">إدارة الفئات المالية والمعاملات المالية</p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button onClick={() => setShowTransactionDialog(true)} className="flex items-center">
                        <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        معاملة جديدة
                    </Button>
                    <Button variant="outline" onClick={() => setShowCategoryDialog(true)} className="flex items-center">
                        <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        فئة جديدة
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="categories">الفئات المالية</TabsTrigger>
                    <TabsTrigger value="transactions">المعاملات</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {treasuryStats && (
                        <>
                            {/* Financial Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {formatCurrency(treasuryStats.total_income)}
                                                </p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-green-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {formatCurrency(treasuryStats.total_expenses)}
                                                </p>
                                            </div>
                                            <TrendingDown className="h-8 w-8 text-red-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">الرصيد الصافي</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {formatCurrency(treasuryStats.net_balance)}
                                                </p>
                                            </div>
                                            <Wallet className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">هذا الشهر</p>
                                                <p className="text-lg font-bold text-green-600">
                                                    +{formatCurrency(treasuryStats.monthly_income - treasuryStats.monthly_expenses)}
                                                </p>
                                            </div>
                                            <Calendar className="h-8 w-8 text-amber-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Top Categories */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <PieChart className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                                        أهم الفئات المالية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {treasuryStats.top_categories.map((category, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                                    <div className={cn(
                                                        "w-3 h-3 rounded-full",
                                                        category.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                                                    )} />
                                                    <span className="font-medium">{category.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    <span className={cn(
                                                        "font-bold",
                                                        category.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                    )}>
                                                        {formatCurrency(category.amount)}
                                                    </span>
                                                    <Badge variant={category.type === 'income' ? 'default' : 'destructive'}>
                                                        {category.type === 'income' ? 'إيراد' : 'مصروف'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Income Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-green-600">
                                    <TrendingUp className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                                    فئات الإيرادات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {categories.filter(cat => cat.category_type === 'income').map((category) => (
                                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                            {getCategoryIcon(category.category_name)}
                                            <div>
                                                <h3 className="font-medium">{category.category_name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {/* We don't have transaction count in the API response, so we'll show a placeholder */}
                                                    0 معاملة - {formatCurrency(category.is_active ? 0 : 0)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            {category.is_default && <Badge variant="outline">افتراضي</Badge>}
                                            <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                {category.is_active ? 'نشط' : 'معطل'}
                                            </Badge>
                                            {!category.is_default && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => category.id && toggleCategoryStatus(category.id)}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Expense Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-red-600">
                                    <TrendingDown className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                                    فئات المصروفات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {categories.filter(cat => cat.category_type === 'expense').map((category) => (
                                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                            {getCategoryIcon(category.category_name)}
                                            <div>
                                                <h3 className="font-medium">{category.category_name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {/* We don't have transaction count in the API response, so we'll show a placeholder */}
                                                    0 معاملة - {formatCurrency(category.is_active ? 0 : 0)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            {category.is_default && <Badge variant="outline">افتراضي</Badge>}
                                            <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                {category.is_active ? 'نشط' : 'معطل'}
                                            </Badge>
                                            {!category.is_default && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => category.id && toggleCategoryStatus(category.id)}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>المعاملات المالية الأخيرة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transactions.length > 0 ? (
                                <div className="space-y-4">
                                    {transactions.slice(0, 10).map((transaction) => {
                                        const category = categories.find(cat => cat.id === transaction.category_id);
                                        return (
                                            <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <h3 className="font-medium">{transaction.description || 'معاملة مالية'}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(transaction.transaction_date).toLocaleDateString('ar-IQ')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    <span className={cn(
                                                        "font-bold",
                                                        transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                                                    )}>
                                                        {transaction.transaction_type === 'income' ? '+' : '-'}
                                                        {formatCurrency(transaction.amount)}
                                                    </span>
                                                    {category && (
                                                        <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'}>
                                                            {category.category_name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">لا توجد معاملات بعد</h3>
                                    <p className="text-muted-foreground mb-4">ابدأ بإضافة معاملات مالية لمتابعة الحسابات</p>
                                    <Button onClick={() => setShowTransactionDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                        إضافة معاملة
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Category Dialog */}
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة فئة مالية جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="categoryName">اسم الفئة</Label>
                            <Input
                                id="categoryName"
                                value={categoryForm.category_name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, category_name: e.target.value })}
                                placeholder="مثال: رسوم إضافية"
                            />
                        </div>
                        <div>
                            <Label htmlFor="categoryType">نوع الفئة</Label>
                            <Select
                                value={categoryForm.category_type}
                                onValueChange={(value: 'income' | 'expense') =>
                                    setCategoryForm({ ...categoryForm, category_type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">إيراد</SelectItem>
                                    <SelectItem value="expense">مصروف</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="categoryDescription">الوصف (اختياري)</Label>
                            <Input
                                id="categoryDescription"
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                placeholder="وصف موجز للفئة"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={addCategory}>
                            إضافة الفئة
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Transaction Dialog */}
            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة معاملة مالية جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="transactionCategory">الفئة</Label>
                            <Select
                                value={transactionForm.category_id.toString()}
                                onValueChange={(value) =>
                                    setTransactionForm({ ...transactionForm, category_id: parseInt(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الفئة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.filter(cat => cat.is_active).map((category) => (
                                        <SelectItem key={category.id} value={category.id!.toString()}>
                                            {category.category_name} ({category.category_type === 'income' ? 'إيراد' : 'مصروف'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="transactionAmount">المبلغ</Label>
                                <Input
                                    id="transactionAmount"
                                    type="number"
                                    value={transactionForm.amount || ''}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="transactionDate">التاريخ</Label>
                                <Input
                                    id="transactionDate"
                                    type="date"
                                    value={transactionForm.transaction_date}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="transactionDescription">الوصف</Label>
                            <Input
                                id="transactionDescription"
                                value={transactionForm.description}
                                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                                placeholder="وصف المعاملة"
                            />
                        </div>
                        <div>
                            <Label htmlFor="receiptNumber">رقم الإيصال (اختياري)</Label>
                            <Input
                                id="receiptNumber"
                                value={transactionForm.receipt_number}
                                onChange={(e) => setTransactionForm({ ...transactionForm, receipt_number: e.target.value })}
                                placeholder="رقم الإيصال"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={addTransaction}>
                            إضافة المعاملة
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default TreasurySystemPage;