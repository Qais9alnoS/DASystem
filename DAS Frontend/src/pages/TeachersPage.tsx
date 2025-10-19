import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users, FileText, Filter, BookOpen, Loader2 } from 'lucide-react';
import { TeacherRegistrationForm, TeachersList } from '@/components/teachers';
import { teachersApi } from '@/services/api';
import { Teacher } from '@/types/school';
import { IOSNavbar } from '@/components/ui/ios-navbar';
import { IOSTabBar } from '@/components/ui/ios-tabbar';
import { SegmentedControl } from '@/components/ui/segmented-control';

const TeachersPage = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [iosActiveTab, setIosActiveTab] = useState("teachers");
    const { toast } = useToast();

    // Fetch teachers statistics
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoading(true);
                const response = await teachersApi.getAll();
                
                if (response.success && response.data) {
                    setTeachers(response.data);
                }
            } catch (error) {
                toast({
                    title: "خطأ",
                    description: "فشل في تحميل بيانات المعلمين",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, [toast]);

    // Calculate statistics from real data
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.is_active).length;
    const busUsers = teachers.filter(t => t.transportation_type && t.transportation_type !== 'walking').length;
    const walkingUsers = teachers.filter(t => t.transportation_type === 'walking').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* iOS Navigation Bar */}
            <IOSNavbar 
                title="إدارة المعلمين" 
                largeTitle={true}
            />
            
            <div className="p-4 pb-24">
                {/* Teacher Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        إجمالي المعلمين
                                    </p>
                                    <p className="text-xl font-bold">{totalTeachers}</p>
                                </div>
                                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        المعلمين النشطين
                                    </p>
                                    <p className="text-xl font-bold">{activeTeachers}</p>
                                </div>
                                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                                    <BookOpen className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        مستخدمو النقل
                                    </p>
                                    <p className="text-xl font-bold">{busUsers}</p>
                                </div>
                                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                    <span className="text-base">🚌</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        المشي
                                    </p>
                                    <p className="text-xl font-bold">{walkingUsers}</p>
                                </div>
                                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                                    <span className="text-base">🚶</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Segmented Control for Tabs */}
                <div className="mb-6">
                    <SegmentedControl
                        options={[
                            { value: "list", label: "المعلمين" },
                            { value: "register", label: "تسجيل" },
                            { value: "assignments", label: "توزيعات" },
                            { value: "reports", label: "تقارير" }
                        ]}
                        value={activeTab}
                        onValueChange={setActiveTab}
                    />
                </div>

                {activeTab === "list" && (
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <Card className="rounded-3xl border-0 shadow-ios">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className="flex-1 relative">
                                        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="البحث في المعلمين..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10 rounded-2xl"
                                        />
                                    </div>
                                    <Button variant="outline" className="gap-2 rounded-full">
                                        <Filter className="h-4 w-4" />
                                        تصفية
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Teachers List */}
                        <TeachersList searchQuery={searchQuery} />
                    </div>
                )}

                {activeTab === "register" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5" />
                                تسجيل معلم جديد
                            </CardTitle>
                            <CardDescription>
                                أدخل بيانات المعلم الشخصية والمهنية
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeacherRegistrationForm />
                        </CardContent>
                    </Card>
                )}

                {activeTab === "assignments" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">توزيعات المعلمين</CardTitle>
                            <CardDescription>
                                توزيع المعلمين على المواد والصفوف
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                توزيعات المعلمين - قريباً
                                <br />
                                <small className="text-xs">سيتم تطوير هذا القسم في المرحلة التالية</small>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "reports" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">تقارير المعلمين</CardTitle>
                            <CardDescription>
                                تقارير وإحصائيات شاملة عن المعلمين
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                تقارير المعلمين - قريباً
                                <br />
                                <small className="text-xs">سيتم تطوير هذا القسم في المرحلة التالية</small>
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

export default TeachersPage;