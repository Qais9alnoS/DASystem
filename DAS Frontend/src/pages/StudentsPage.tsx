import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, GraduationCap, Users, FileText, Filter } from 'lucide-react';
import { StudentRegistrationForm, StudentsList, StudentStats } from '@/components/students';

const StudentsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        إدارة الطلاب
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        تسجيل ومتابعة الطلاب في النظام
                    </p>
                </div>
                <Button
                    onClick={() => setActiveTab('register')}
                    className="gap-2 btn-premium"
                >
                    <Plus className="h-4 w-4" />
                    تسجيل طالب جديد
                </Button>
            </div>

            {/* Stats Overview */}
            <StudentStats />

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="list" className="gap-2">
                        <Users className="h-4 w-4" />
                        قائمة الطلاب
                    </TabsTrigger>
                    <TabsTrigger value="register" className="gap-2">
                        <Plus className="h-4 w-4" />
                        تسجيل جديد
                    </TabsTrigger>
                    <TabsTrigger value="search" className="gap-2">
                        <Search className="h-4 w-4" />
                        البحث المتقدم
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="gap-2">
                        <FileText className="h-4 w-4" />
                        التقارير
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-6">
                    {/* Search and Filters */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="البحث في الطلاب..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    تصفية
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Students List */}
                    <StudentsList searchQuery={searchQuery} />
                </TabsContent>

                <TabsContent value="register" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
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
                </TabsContent>

                <TabsContent value="search" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>البحث المتقدم</CardTitle>
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
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>تقارير الطلاب</CardTitle>
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
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentsPage;