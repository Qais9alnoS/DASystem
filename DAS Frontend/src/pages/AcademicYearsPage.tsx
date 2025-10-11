import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
    Search,
    Plus,
    Calendar,
    BookOpen,
    Users,
    GraduationCap,
    Settings,
    Archive,
    CheckCircle,
    Clock,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { AcademicYearForm } from '@/components/academic/AcademicYearForm';
import { academicYearsApi } from '@/services/api';
import { AcademicYear } from '@/types/school';

const AcademicYearsPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch academic years from backend
    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                setLoading(true);
                const response = await academicYearsApi.getAll();
                if (response.success && response.data) {
                    setAcademicYears(response.data);
                } else {
                    throw new Error(response.message || 'Failed to fetch academic years');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching academic years');
                toast({
                    title: "خطأ",
                    description: "فشل في تحميل السنوات الدراسية",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAcademicYears();
    }, []);

    const currentYear = academicYears.find(year => year.is_active);

    const handleCreateAcademicYear = async (data: any) => {
        try {
            const response = await academicYearsApi.create(data);
            if (response.success && response.data) {
                // Add the new academic year to the list
                setAcademicYears(prev => [...prev, response.data!]);
                setActiveTab('overview');
                toast({
                    title: "نجاح",
                    description: "تم إنشاء السنة الدراسية بنجاح"
                });
            } else {
                throw new Error(response.message || 'Failed to create academic year');
            }
        } catch (err) {
            toast({
                title: "خطأ",
                description: err instanceof Error ? err.message : 'فشل في إنشاء السنة الدراسية',
                variant: "destructive"
            });
        }
    };

    const handleActivateAcademicYear = async (yearId: number) => {
        try {
            const response = await academicYearsApi.update(yearId, { is_active: true });
            if (response.success && response.data) {
                // Update the academic years list
                setAcademicYears(prev => 
                    prev.map(year => ({
                        ...year,
                        is_active: year.id === yearId ? true : false
                    }))
                );
                toast({
                    title: "نجاح",
                    description: "تم تفعيل السنة الدراسية بنجاح"
                });
            } else {
                throw new Error(response.message || 'Failed to activate academic year');
            }
        } catch (err) {
            toast({
                title: "خطأ",
                description: err instanceof Error ? err.message : 'فشل في تفعيل السنة الدراسية',
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                    <h3 className="text-lg font-medium mb-2">خطأ في تحميل البيانات</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        إدارة السنوات الدراسية
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        إدارة السنوات الدراسية ونقل البيانات
                    </p>
                </div>
                <Button
                    onClick={() => setActiveTab('create')}
                    className="gap-2 btn-premium"
                >
                    <Plus className="h-4 w-4" />
                    سنة دراسية جديدة
                </Button>
            </div>

            {/* Current Year Status */}
            {currentYear && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">السنة الدراسية النشطة</h3>
                                    <p className="text-2xl font-bold text-primary">{currentYear.year_name}</p>
                                    <p className="text-sm text-muted-foreground">{currentYear.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 space-x-reverse">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">
                                        {academicYears.filter(y => y.is_active).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">سنة نشطة</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{academicYears.length}</p>
                                    <p className="text-sm text-muted-foreground">إجمالي السنوات</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    إجمالي السنوات
                                </p>
                                <p className="text-2xl font-bold">{academicYears.length}</p>
                                <p className="text-xs text-muted-foreground">
                                    سنة دراسية مسجلة
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    السنة النشطة
                                </p>
                                <p className="text-2xl font-bold">
                                    {academicYears.filter(y => y.is_active).length}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    قيد التشغيل حالياً
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    في التحضير
                                </p>
                                <p className="text-2xl font-bold">
                                    {academicYears.filter(y => !y.is_active).length}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    سنة قادمة
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    مؤرشفة
                                </p>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-xs text-muted-foreground">
                                    سنة سابقة
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-900/20">
                                <Archive className="h-6 w-6 text-gray-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        نظرة عامة
                    </TabsTrigger>
                    <TabsTrigger value="create" className="gap-2">
                        <Plus className="h-4 w-4" />
                        إنشاء جديد
                    </TabsTrigger>
                    <TabsTrigger value="migration" className="gap-2">
                        <Users className="h-4 w-4" />
                        نقل البيانات
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        الإعدادات
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Search and Filters */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="البحث في السنوات الدراسية..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Years List */}
                    <div className="space-y-4">
                        {academicYears
                            .filter(year => 
                                searchQuery === '' || 
                                year.year_name.includes(searchQuery) || 
                                (year.description && year.description.includes(searchQuery))
                            )
                            .map((year) => (
                                <Card key={year.id} className={year.is_active ? 'border-primary/20' : ''}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <div className={`p-3 rounded-full ${year.is_active
                                                        ? 'bg-primary/10'
                                                        : academicYears.filter(y => y.is_active).length > 0
                                                            ? 'bg-gray-100 dark:bg-gray-800'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/20'
                                                    }`}>
                                                    {year.is_active ? (
                                                        <CheckCircle className="h-6 w-6 text-primary" />
                                                    ) : academicYears.filter(y => y.is_active).length > 0 ? (
                                                        <Archive className="h-6 w-6 text-gray-600" />
                                                    ) : (
                                                        <Clock className="h-6 w-6 text-yellow-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2 space-x-reverse">
                                                        <h3 className="text-lg font-semibold">{year.year_name}</h3>
                                                        {year.is_active && (
                                                            <Badge className="bg-primary">نشطة</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{year.description || 'لا يوجد وصف'}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        تم الإنشاء: {year.created_at ? new Date(year.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6 space-x-reverse">
                                                <div className="text-center">
                                                    <p className="text-lg font-bold">-</p>
                                                    <p className="text-xs text-muted-foreground">طالب</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold">-</p>
                                                    <p className="text-xs text-muted-foreground">معلم</p>
                                                </div>
                                                <div className="flex space-x-2 space-x-reverse">
                                                    <Button variant="outline" size="sm">
                                                        تعديل
                                                    </Button>
                                                    {!year.is_active && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleActivateAcademicYear(year.id!)}
                                                        >
                                                            تفعيل
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        
                        {academicYears.filter(year => 
                            searchQuery === '' || 
                            year.year_name.includes(searchQuery) || 
                            (year.description && year.description.includes(searchQuery))
                        ).length === 0 && (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-medium mb-2">لا توجد سنوات دراسية</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'لم يتم إنشاء أي سنوات دراسية بعد'}
                                    </p>
                                    <Button 
                                        className="mt-4 gap-2" 
                                        onClick={() => setActiveTab('create')}
                                    >
                                        <Plus className="h-4 w-4" />
                                        إنشاء سنة دراسية
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                إنشاء سنة دراسية جديدة
                            </CardTitle>
                            <CardDescription>
                                أضف سنة دراسية جديدة لإدارة الطلاب والمعلمين
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AcademicYearForm 
                                onSubmit={handleCreateAcademicYear}
                                onCancel={() => setActiveTab('overview')}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="migration" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                نقل البيانات بين السنوات الدراسية
                            </CardTitle>
                            <CardDescription>
                                نقل الطلاب والمعلمين من سنة دراسية إلى أخرى
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">نقل البيانات - قريباً</h3>
                                <p className="text-sm">
                                    ستتوفر أدوات نقل البيانات التلقائي بين السنوات الدراسية قريباً
                                </p>
                                <div className="mt-6 space-y-2">
                                    <p className="text-xs text-muted-foreground">الميزات القادمة:</p>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        <li>• نقل تلقائي للطلاب مع ترقية الصفوف</li>
                                        <li>• نقل بيانات المعلمين والتوزيعات</li>
                                        <li>• معاينة التغييرات قبل التطبيق</li>
                                        <li>• تراجع عن عمليات النقل</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                إعدادات السنوات الدراسية
                            </CardTitle>
                            <CardDescription>
                                إعدادات عامة لإدارة السنوات الدراسية
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">الإعدادات - قريباً</h3>
                                <p className="text-sm">
                                    ستتوفر إعدادات متقدمة لإدارة السنوات الدراسية قريباً
                                </p>
                                <div className="mt-6 space-y-2">
                                    <p className="text-xs text-muted-foreground">الإعدادات القادمة:</p>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        <li>• تحديد فترات الفصول الدراسية</li>
                                        <li>• إعدادات الأرشفة التلقائية</li>
                                        <li>• قوالب السنوات الدراسية</li>
                                        <li>• إعدادات النسخ الاحتياطي</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AcademicYearsPage;