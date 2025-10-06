import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Calendar, DollarSign, Mail, Users, Phone, Eye, TrendingUp } from 'lucide-react';

interface ParentPortalAccess {
    id: string;
    studentId: string;
    parentName: string;
    parentNameAr: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    isActive: boolean;
    lastLogin?: Date;
}

interface Communication {
    id: string;
    studentId: string;
    type: 'notification' | 'message' | 'alert' | 'reminder';
    title: string;
    titleAr: string;
    content: string;
    sentDate: Date;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
}

const ParentCommunicationPortalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const students = [
        {
            id: 's001',
            name: 'Sara Ahmed',
            nameAr: 'سارة أحمد',
            parentName: 'Ahmed Al-Mahmoud',
            parentPhone: '+964750123456',
            parentEmail: 'ahmed.mahmoud@email.com',
            grade: '10',
            section: 'A'
        }
    ];

    const [parentAccounts] = useState<ParentPortalAccess[]>([
        {
            id: 'p001',
            studentId: 's001',
            parentName: 'Ahmed Al-Mahmoud',
            parentNameAr: 'أحمد المحمود',
            username: 'ahmed_mahmoud',
            password: 'temp123456',
            email: 'ahmed.mahmoud@email.com',
            phone: '+964750123456',
            isActive: true,
            lastLogin: new Date('2024-01-15')
        }
    ]);

    const [communications] = useState<Communication[]>([
        {
            id: 'c001',
            studentId: 's001',
            type: 'alert',
            title: 'Mid-term Exam Results',
            titleAr: 'نتائج امتحانات منتصف الفصل',
            content: 'Your daughter Sara has achieved excellent results in Mathematics (95%) and Physics (92%).',
            sentDate: new Date('2024-01-14'),
            isRead: true,
            priority: 'high'
        }
    ]);

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        };
        const text = { low: 'منخفضة', medium: 'متوسطة', high: 'عالية' };
        return <Badge className={colors[priority as keyof typeof colors]}>{text[priority as keyof typeof text]}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            notification: 'bg-blue-100 text-blue-800',
            message: 'bg-green-100 text-green-800',
            alert: 'bg-orange-100 text-orange-800',
            reminder: 'bg-purple-100 text-purple-800'
        };
        const text = { notification: 'إشعار', message: 'رسالة', alert: 'تنبيه', reminder: 'تذكير' };
        return <Badge className={colors[type as keyof typeof colors]}>{text[type as keyof typeof text]}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">بوابة التواصل مع أولياء الأمور</h1>
                        <p className="text-gray-600 mt-2">إدارة حسابات أولياء الأمور ومتابعة أداء الطلاب</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Mail className="w-4 h-4 mr-2" />
                        إرسال إشعار جماعي
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">حسابات أولياء الأمور</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{parentAccounts.length}</div>
                            <p className="text-xs text-muted-foreground">
                                نشط: {parentAccounts.filter(p => p.isActive).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">الرسائل المرسلة</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{communications.length}</div>
                            <p className="text-xs text-muted-foreground">
                                غير مقروءة: {communications.filter(c => !c.isRead).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">معدل الاستجابة</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">87%</div>
                            <p className="text-xs text-muted-foreground">+5% من الشهر الماضي</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">متوسط وقت الاستجابة</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2.4</div>
                            <p className="text-xs text-muted-foreground">ساعة</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
                        <TabsTrigger value="accounts">حسابات أولياء الأمور</TabsTrigger>
                        <TabsTrigger value="communications">الرسائل والإشعارات</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>آخر الرسائل المرسلة</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {communications.map(comm => {
                                            const student = students.find(s => s.id === comm.studentId);
                                            return (
                                                <div key={comm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{comm.titleAr}</div>
                                                        <div className="text-sm text-gray-600">
                                                            إلى: {student?.nameAr} - {student?.parentName}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {comm.sentDate.toLocaleDateString('ar')}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {getTypeBadge(comm.type)}
                                                        {getPriorityBadge(comm.priority)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>نشاط أولياء الأمور</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {parentAccounts.map(parent => {
                                            const student = students.find(s => s.id === parent.studentId);
                                            return (
                                                <div key={parent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{parent.parentNameAr}</div>
                                                        <div className="text-sm text-gray-600">
                                                            طالب: {student?.nameAr}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            آخر دخول: {parent.lastLogin ? parent.lastLogin.toLocaleDateString('ar') : 'لم يدخل بعد'}
                                                        </div>
                                                    </div>
                                                    <Badge className={parent.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                        {parent.isActive ? 'نشط' : 'غير نشط'}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="accounts" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>حسابات أولياء الأمور</CardTitle>
                                <CardDescription>إدارة وصول أولياء الأمور لبوابة متابعة أبنائهم</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ولي الأمر</TableHead>
                                            <TableHead>الطالب</TableHead>
                                            <TableHead>اسم المستخدم</TableHead>
                                            <TableHead>الهاتف</TableHead>
                                            <TableHead>البريد الإلكتروني</TableHead>
                                            <TableHead>الحالة</TableHead>
                                            <TableHead>الإجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parentAccounts.map(account => {
                                            const student = students.find(s => s.id === account.studentId);
                                            return (
                                                <TableRow key={account.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{account.parentNameAr}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{student?.nameAr}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {student?.grade}{student?.section}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                            {account.username}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span className="text-sm">{account.phone}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            <span className="text-sm">{account.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                            {account.isActive ? 'نشط' : 'غير نشط'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            عرض
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="communications" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>الرسائل والإشعارات</CardTitle>
                                        <CardDescription>تتبع التواصل مع أولياء الأمور</CardDescription>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                <Mail className="w-4 h-4 mr-2" />
                                                إرسال رسالة جديدة
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>إرسال رسالة جديدة</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>اختر الطالب</Label>
                                                    <Select>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="اختر الطالب" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {students.map(student => (
                                                                <SelectItem key={student.id} value={student.id}>
                                                                    {student.nameAr} - {student.parentName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>العنوان</Label>
                                                    <Input placeholder="عنوان الرسالة" />
                                                </div>
                                                <div>
                                                    <Label>المحتوى</Label>
                                                    <Textarea placeholder="محتوى الرسالة" rows={4} />
                                                </div>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    إرسال الرسالة
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>التاريخ</TableHead>
                                            <TableHead>النوع</TableHead>
                                            <TableHead>العنوان</TableHead>
                                            <TableHead>الطالب</TableHead>
                                            <TableHead>الأولوية</TableHead>
                                            <TableHead>الحالة</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {communications.map(comm => {
                                            const student = students.find(s => s.id === comm.studentId);
                                            return (
                                                <TableRow key={comm.id}>
                                                    <TableCell>
                                                        {comm.sentDate.toLocaleDateString('ar')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getTypeBadge(comm.type)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{comm.titleAr}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{student?.nameAr}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getPriorityBadge(comm.priority)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={comm.isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                            {comm.isRead ? 'مقروءة' : 'غير مقروءة'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ParentCommunicationPortalPage;