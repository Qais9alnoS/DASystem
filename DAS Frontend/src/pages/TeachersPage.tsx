import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users, FileText, Filter, BookOpen } from 'lucide-react';
import { TeacherRegistrationForm, TeachersList } from '@/components/teachers';

const TeachersPage = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        إدارة المعلمين
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        تسجيل ومتابعة المعلمين في النظام
                    </p>
                </div>
                <Button
                    onClick={() => setActiveTab('register')}
                    className="gap-2 btn-premium"
                >
                    <Plus className="h-4 w-4" />
                    تسجيل معلم جديد
                </Button>
            </div>

            {/* Teacher Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    إجمالي المعلمين
                                </p>
                                <p className="text-2xl font-bold">87</p>
                                <p className="text-xs text-muted-foreground">
                                    معلم مسجل في النظام
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    المعلمين النشطين
                                </p>
                                <p className="text-2xl font-bold">82</p>
                                <p className="text-xs text-muted-foreground">
                                    معلم نشط حالياً
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                                <BookOpen className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    الفترة الصباحية
                                </p>
                                <p className="text-2xl font-bold">48</p>
                                <p className="text-xs text-muted-foreground">
                                    معلم في الفترة الصباحية
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                <span className="text-lg">☀️</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    الفترة المسائية
                                </p>
                                <p className="text-2xl font-bold">39</p>
                                <p className="text-xs text-muted-foreground">
                                    معلم في الفترة المسائية
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                                <span className="text-lg">🌙</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="list" className="gap-2">
                        <Users className="h-4 w-4" />
                        قائمة المعلمين
                    </TabsTrigger>
                    <TabsTrigger value="register" className="gap-2">
                        <Plus className="h-4 w-4" />
                        تسجيل جديد
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        التوزيعات
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
                                        placeholder="البحث في المعلمين..."
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

                    {/* Teachers List */}
                    <TeachersList searchQuery={searchQuery} />
                </TabsContent>

                <TabsContent value="register" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
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
                </TabsContent>

                <TabsContent value="assignments" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>توزيعات المعلمين</CardTitle>
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
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>تقارير المعلمين</CardTitle>
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
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TeachersPage;