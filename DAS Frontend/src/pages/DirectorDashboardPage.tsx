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
    TrendingUp
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

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await directorApi.getDashboardStats();
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch dashboard stats');
            }
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error);
            toast({
                title: "خطأ في تحميل إحصائيات لوحة التحكم",
                description: error.message || "حدث خطأ أثناء تحميل إحصائيات لوحة التحكم",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
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
                <Button onClick={fetchDashboardStats}>تحديث البيانات</Button>
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
                        {stats?.recent_activities?.slice(0, 5).map((activity: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{activity.title}</h4>
                                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(activity.timestamp).toLocaleDateString('ar-IQ')}
                                </div>
                            </div>
                        )) || (
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