import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, GraduationCap, Users, FileText, Filter } from 'lucide-react';
import { StudentRegistrationForm, StudentsList, StudentStats } from '@/components/students';
import { IOSNavbar } from '@/components/ui/ios-navbar';
import { IOSTabBar } from '@/components/ui/ios-tabbar';
import { SegmentedControl } from '@/components/ui/segmented-control';

const StudentsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [iosActiveTab, setIosActiveTab] = useState("students");

    return (
        <div className="min-h-screen bg-background">
            {/* iOS Navigation Bar */}
            <IOSNavbar 
                title="إدارة الطلاب" 
                largeTitle={true}
            />
            
            <div className="p-4 pb-24">
                {/* Stats Overview */}
                <StudentStats />

                {/* Segmented Control for Tabs */}
                <div className="mb-6">
                    <SegmentedControl
                        options={[
                            { value: "list", label: "الطلاب" },
                            { value: "register", label: "تسجيل" },
                            { value: "search", label: "بحث" },
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
                                            placeholder="البحث في الطلاب..."
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

                        {/* Students List */}
                        <StudentsList searchQuery={searchQuery} />
                    </div>
                )}

                {activeTab === "register" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <GraduationCap className="h-5 w-5" />
                                تسجيل طالب جديد
                            </CardTitle>
                            <CardDescription>
                                أدخل بيانات الطالب الشخصية والأكاديمية
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StudentRegistrationForm />
                        </CardContent>
                    </Card>
                )}

                {activeTab === "search" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">البحث المتقدم</CardTitle>
                            <CardDescription>
                                ابحث في الطلاب باستخدام معايير متقدمة
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                البحث المتقدم - قريباً
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "reports" && (
                    <Card className="rounded-3xl border-0 shadow-ios">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">تقارير الطلاب</CardTitle>
                            <CardDescription>
                                تقارير وإحصائيات شاملة عن الطلاب
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                تقارير الطلاب - قريباً
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

export default StudentsPage;