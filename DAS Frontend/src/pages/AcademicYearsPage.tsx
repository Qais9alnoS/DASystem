import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    AlertTriangle
} from 'lucide-react';
import { AcademicYearForm } from '@/components/academic/AcademicYearForm';

const AcademicYearsPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data for academic years
    const academicYears = [
        {
            id: 1,
            year_name: '2024-2025',
            description: 'السنة الدراسية الحالية',
            is_active: true,
            students_count: 1247,
            teachers_count: 87,
            created_at: '2024-08-15'
        },
        {
            id: 2,
            year_name: '2023-2024',
            description: 'السنة الدراسية السابقة',
            is_active: false,
            students_count: 1156,
            teachers_count: 82,
            created_at: '2023-08-20'
        },
        {
            id: 3,
            year_name: '2025-2026',
            description: 'السنة الدراسية القادمة - قيد التحضير',
            is_active: false,
            students_count: 0,
            teachers_count: 0,
            created_at: '2025-06-01'
        }
    ];

    const currentYear = academicYears.find(year => year.is_active);

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
                                    <p className="text-2xl font-bold">{currentYear.students_count.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">طالب</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{currentYear.teachers_count}</p>
                                    <p className="text-sm text-muted-foreground">معلم</p>
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
                                <p className="text-2xl font-bold">1</p>
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
                                <p className="text-2xl font-bold">1</p>
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
                                <p className="text-2xl font-bold">1</p>
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
                        {academicYears.map((year) => (
                            <Card key={year.id} className={year.is_active ? 'border-primary/20' : ''}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 space-x-reverse">
                                            <div className={`p-3 rounded-full ${year.is_active
                                                    ? 'bg-primary/10'
                                                    : year.students_count > 0
                                                        ? 'bg-gray-100 dark:bg-gray-800'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/20'
                                                }`}>
                                                {year.is_active ? (
                                                    <CheckCircle className="h-6 w-6 text-primary" />
                                                ) : year.students_count > 0 ? (
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
                                                <p className="text-sm text-muted-foreground">{year.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    تم الإنشاء: {new Date(year.created_at).toLocaleDateString('ar-EG')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6 space-x-reverse">
                                            <div className="text-center">
                                                <p className="text-lg font-bold">{year.students_count.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">طالب</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold">{year.teachers_count}</p>
                                                <p className="text-xs text-muted-foreground">معلم</p>
                                            </div>
                                            <div className="flex space-x-2 space-x-reverse">
                                                <Button variant="outline" size="sm">
                                                    تعديل
                                                </Button>
                                                {!year.is_active && (
                                                    <Button variant="outline" size="sm">
                                                        تفعيل
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
                            <AcademicYearForm />
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