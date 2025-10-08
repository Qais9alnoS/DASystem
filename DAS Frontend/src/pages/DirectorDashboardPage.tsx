import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { directorApi } from '@/services/api';
import {
    Users,
    GraduationCap,
    DollarSign,
    BookOpen,
    Calendar,
    Award,
    Building,
    TrendingUp,
    RefreshCw
} from 'lucide-react';

interface DashboardStats {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_subjects: number;
    monthly_revenue: number;
    active_activities: number;
    recent_activities: any[];
    total_rewards: number;
    total_assistance: number;
}

export function DirectorDashboardPage() {
    const { toast } = useToast();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await directorApi.getDashboardStats();
            if (response.success && response.data) {
                // Ensure the data matches our DashboardStats interface
                const dashboardData: DashboardStats = {
                    total_students: response.data.total_students ?? 0,
                    total_teachers: response.data.total_teachers ?? 0,
                    total_classes: response.data.total_classes ?? 0,
                    total_subjects: response.data.total_subjects ?? 0,
                    monthly_revenue: response.data.monthly_revenue ?? 0,
                    active_activities: response.data.active_activities ?? 0,
                    recent_activities: Array.isArray(response.data.recent_activities) ? response.data.recent_activities : [],
                    total_rewards: response.data.total_rewards ?? 0,
                    total_assistance: response.data.total_assistance ?? 0
                };
                setStats(dashboardData);
            } else {
                // Handle case where response is not successful but no error was thrown
                setStats({
                    total_students: 0,
                    total_teachers: 0,
                    total_classes: 0,
                    total_subjects: 0,
                    monthly_revenue: 0,
                    active_activities: 0,
                    recent_activities: [],
                    total_rewards: 0,
                    total_assistance: 0
                });
                toast({
                    title: "تنبيه",
                    description: "لا توجد بيانات إحصائية متوفرة حالياً",
                    variant: "default"
                });
            }
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error);
            // Set default values in case of error
            setStats({
                total_students: 0,
                total_teachers: 0,
                total_classes: 0,
                total_subjects: 0,
                monthly_revenue: 0,
                active_activities: 0,
                recent_activities: [],
                total_rewards: 0,
                total_assistance: 0
            });
            toast({
                title: "خطأ في تحميل إحصائيات لوحة التحكم",
                description: error.message || "حدث خطأ أثناء تحميل إحصائيات لوحة التحكم",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchDashboardStats();
            toast({
                title: "نجاح",
                description: "تم تحديث البيانات بنجاح",
                variant: "default"
            });
        } catch (error) {
            toast({
                title: "خطأ في التحديث",
                description: "فشل في تحديث البيانات",
                variant: "destructive"
            });
        } finally {
            setRefreshing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        // Format as ليرة without using IQD currency code
        return `${new Intl.NumberFormat('ar-IQ', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)} ليرة`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
                    <p className="text-muted-foreground mt-2">نظرة شاملة على أداء المدرسة</p>
                </div>
                <Button onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? (
                        <>
                            <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                            جاري التحديث...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 ml-2" />
                            تحديث البيانات
                        </>
                    )}
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي الطلاب</p>
                                <p className="text-2xl font-bold">
                                    {stats?.total_students?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-md">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي المعلمين</p>
                                <p className="text-2xl font-bold">
                                    {stats?.total_teachers?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="p-3 bg-secondary/10 rounded-md">
                                <Users className="h-6 w-6 text-secondary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">الإيرادات الشهرية</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats?.monthly_revenue || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-md">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">الأنشطة النشطة</p>
                                <p className="text-2xl font-bold">
                                    {stats?.active_activities?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-md">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي الصفوف</p>
                                <p className="text-2xl font-bold">
                                    {stats?.total_classes?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-md">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي المواد</p>
                                <p className="text-2xl font-bold">
                                    {stats?.total_subjects?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-md">
                                <BookOpen className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي المكافآت</p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {formatCurrency(stats?.total_rewards || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-md">
                                <Award className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activities */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 ml-2" />
                        آخر الأنشطة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                            stats.recent_activities.slice(0, 5).map((activity: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                                    <div className="flex items-center space-x-3 space-x-reverse">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{activity.title || 'نشاط غير مسمى'}</h4>
                                            <p className="text-sm text-muted-foreground">{activity.description || 'لا يوجد وصف'}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('ar-IQ') : 'غير محدد'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                لا توجد أنشطة حديثة
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DirectorDashboardPage;