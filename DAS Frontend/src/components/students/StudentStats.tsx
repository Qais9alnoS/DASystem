import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    GraduationCap,
    Users,
    TrendingUp,
    Calendar,
    Bus,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';

interface StatCard {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const StudentStats = () => {
    const stats: StatCard[] = [
        {
            title: 'إجمالي الطلاب',
            value: '1,247',
            description: 'طلاب مسجلين في النظام',
            icon: GraduationCap,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            trend: { value: 12, isPositive: true }
        },
        {
            title: 'الطلاب النشطين',
            value: '1,198',
            description: 'طلاب نشطين حالياً',
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            trend: { value: 8, isPositive: true }
        },
        {
            title: 'طلاب النقل',
            value: '892',
            description: 'يستخدمون النقل المدرسي',
            icon: Bus,
            color: 'text-secondary',
            bgColor: 'bg-secondary/10',
            trend: { value: 5, isPositive: true }
        },
        {
            title: 'الرعاية الخاصة',
            value: '23',
            description: 'طلاب يحتاجون رعاية خاصة',
            icon: AlertTriangle,
            color: 'text-accent',
            bgColor: 'bg-accent/10',
            trend: { value: 2, isPositive: false }
        }
    ];

    const sessionStats = [
        {
            session: 'الفترة الصباحية',
            count: 742,
            percentage: 59.5,
            color: 'bg-blue-500'
        },
        {
            session: 'الفترة المسائية',
            count: 505,
            percentage: 40.5,
            color: 'bg-purple-500'
        }
    ];

    const gradeDistribution = [
        { grade: 'الابتدائي', count: 523, percentage: 41.9, color: 'bg-primary' },
        { grade: 'الإعدادي', count: 412, percentage: 33.0, color: 'bg-secondary' },
        { grade: 'الثانوي', count: 312, percentage: 25.1, color: 'bg-accent' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Main Stats */}
            {stats.map((stat, index) => (
                <Card key={index} className="relative overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                                {stat.trend && (
                                    <div className="flex items-center space-x-1 space-x-reverse">
                                        <TrendingUp
                                            className={`h-3 w-3 ${stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        />
                                        <span
                                            className={`text-xs font-medium ${stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {stat.trend.isPositive ? '+' : '-'}{stat.trend.value}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            من الشهر الماضي
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Session Distribution */}
            <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        توزيع الفترات الدراسية
                    </CardTitle>
                    <CardDescription>
                        عدد الطلاب في كل فترة دراسية
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sessionStats.map((session, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{session.session}</span>
                                <span className="text-sm text-muted-foreground">
                                    {session.count} طالب ({session.percentage}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`${session.color} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${session.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        توزيع المراحل الدراسية
                    </CardTitle>
                    <CardDescription>
                        عدد الطلاب في كل مرحلة دراسية
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {gradeDistribution.map((grade, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{grade.grade}</span>
                                <span className="text-sm text-muted-foreground">
                                    {grade.count} طالب ({grade.percentage}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`${grade.color} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${grade.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        النشاط الأخير
                    </CardTitle>
                    <CardDescription>
                        آخر العمليات على بيانات الطلاب
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="p-2 bg-green-500 rounded-full">
                                    <Users className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">تم تسجيل 15 طالب جديد</p>
                                    <p className="text-xs text-muted-foreground">اليوم - 2:30 م</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="p-2 bg-blue-500 rounded-full">
                                    <GraduationCap className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">تحديث بيانات 8 طلاب</p>
                                    <p className="text-xs text-muted-foreground">أمس - 4:15 م</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="p-2 bg-yellow-500 rounded-full">
                                    <Bus className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">تحديث بيانات النقل لـ 23 طالب</p>
                                    <p className="text-xs text-muted-foreground">أمس - 1:20 م</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};