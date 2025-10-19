import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { IOSNavbar } from '@/components/ui/ios-navbar';
import { IOSTabBar } from '@/components/ui/ios-tabbar';
import { SegmentedControl } from '@/components/ui/segmented-control';

const AcademicYearsPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [iosActiveTab, setIosActiveTab] = useState("academic");
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
        <div className="min-h-screen bg-background">
            {/* iOS Navigation Bar */}
            <IOSNavbar 
                title="السنوات الدراسية" 
                largeTitle={true}
            />
            
            <div className="p-4 pb-24">
                {/* Current Year Status */}
                {currentYear && (
                    <Card className="rounded-3xl border-0 shadow-ios mb-6">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 space-x-reverse">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">السنة الدراسية النشطة</h3>
                                        <p className="text-xl font-bold text-primary">{currentYear.year_name}</p>
                                        <p className="text-sm text-muted-foreground">{currentYear.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 space-x-reverse">
                                    <div className="text-center">
                                        <p className="text-xl font-bold">
                                            {academicYears.filter(y => y.is_active).length}
                                        </p>
                                        <p className="text-xs text-muted-foreground">سنة نشطة</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold">{academicYears.length}</p>
                                        <p className="text-xs text-muted-foreground">إجمالي السنوات</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Segmented Control for Tabs */}
                <div className="mb-6">
                    <SegmentedControl
                        options={[
                            { value: "overview", label: "نظرة عامة" },
                            { value: "create", label: "إنشاء" },
                            { value: "search", label: "بحث" }
                        ]}
                        value={activeTab}
                        onValueChange={setActiveTab}
                    />
                </div>

                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="rounded-3xl border-0 shadow-ios">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                إجمالي السنوات
                                            </p>
                                            <p className="text-xl font-bold">{academicYears.length}</p>
                                        </div>
                                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-0 shadow-ios">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                السنوات النشطة
                                            </p>
                                            <p className="text-xl font-bold">
                                                {academicYears.filter(y => y.is_active).length}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Academic Years List */}
                        <Card className="rounded-3xl border-0 shadow-ios">
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg">السنوات الدراسية</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="space-y-0">
                                    {academicYears.map((year) => (
                                        <div 
                                            key={year.id} 
                                            className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                                        >
                                            <div>
                                                <h4 className="font-medium text-foreground">
                                                    {year.year_name}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {year.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                {year.is_active ? (
                                                    <Badge variant="default" className="rounded-full">
                                                        نشطة
                                                    </Badge>
                                                ) : (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="rounded-full"
                                                        onClick={() => handleActivateAcademicYear(year.id!)}
                                                    >
                                                        تفعيل
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "create" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5" />
                                سنة دراسية جديدة
                            </CardTitle>
                            <CardDescription>
                                أنشئ سنة دراسية جديدة للنظام
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AcademicYearForm onSubmit={handleCreateAcademicYear} />
                        </CardContent>
                    </Card>
                )}

                {activeTab === "search" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">البحث في السنوات</CardTitle>
                            <CardDescription>
                                ابحث في السنوات الدراسية الموجودة
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="البحث في السنوات الدراسية..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pr-10 rounded-2xl"
                                    />
                                </div>
                                <div className="text-center py-8 text-muted-foreground">
                                    البحث المتقدم - قريباً
                                </div>
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

export default AcademicYearsPage;