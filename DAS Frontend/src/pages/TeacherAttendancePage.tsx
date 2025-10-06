import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    UserCheck,
    UserX,
    Clock,
    Calendar as CalendarIcon,
    Plus,
    Edit,
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    TrendingUp,
    Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Teacher {
    id: number;
    name: string;
    subject: string;
    phone: string;
    session_type: 'morning' | 'evening' | 'both';
    status: 'active' | 'inactive';
}

interface AttendanceRecord {
    id: number;
    teacher_id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    check_in_time?: string;
    check_out_time?: string;
    notes?: string;
    session_type: 'morning' | 'evening';
    extra_work_hours?: number;
    extra_work_description?: string;
    created_at: string;
}

interface ExtraWork {
    id: number;
    teacher_id: number;
    date: string;
    hours: number;
    description: string;
    type: 'supervision' | 'tutoring' | 'activities' | 'admin' | 'other';
    approved: boolean;
    approved_by?: string;
    rate_per_hour?: number;
    total_amount?: number;
    created_at: string;
}

const TeacherAttendancePage: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [extraWork, setExtraWork] = useState<ExtraWork[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState('daily');
    const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
    const [showExtraWorkDialog, setShowExtraWorkDialog] = useState(false);
    const [attendanceForm, setAttendanceForm] = useState<Partial<AttendanceRecord>>({});
    const [extraWorkForm, setExtraWorkForm] = useState<Partial<ExtraWork>>({});

    // Mock data
    const mockTeachers: Teacher[] = [
        { id: 1, name: 'أحمد محمد علي', subject: 'الرياضيات', phone: '07901234567', session_type: 'both', status: 'active' },
        { id: 2, name: 'فاطمة حسن', subject: 'اللغة العربية', phone: '07901234568', session_type: 'morning', status: 'active' },
        { id: 3, name: 'علي أحمد', subject: 'العلوم', phone: '07901234569', session_type: 'evening', status: 'active' },
        { id: 4, name: 'مريم محمود', subject: 'التاريخ', phone: '07901234570', session_type: 'both', status: 'active' }
    ];

    const mockAttendance: AttendanceRecord[] = [
        {
            id: 1,
            teacher_id: 1,
            date: format(new Date(), 'yyyy-MM-dd'),
            status: 'present',
            check_in_time: '08:00',
            check_out_time: '14:30',
            session_type: 'morning',
            extra_work_hours: 2,
            extra_work_description: 'إشراف على النشاط الصباحي',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            teacher_id: 2,
            date: format(new Date(), 'yyyy-MM-dd'),
            status: 'late',
            check_in_time: '08:15',
            check_out_time: '14:30',
            session_type: 'morning',
            notes: 'تأخير بسبب ظروف المرور',
            created_at: new Date().toISOString()
        }
    ];

    const mockExtraWork: ExtraWork[] = [
        {
            id: 1,
            teacher_id: 1,
            date: format(new Date(), 'yyyy-MM-dd'),
            hours: 2,
            description: 'إشراف على النشاط الصباحي',
            type: 'supervision',
            approved: true,
            approved_by: 'مدير المدرسة',
            rate_per_hour: 10000,
            total_amount: 20000,
            created_at: new Date().toISOString()
        }
    ];

    useEffect(() => {
        setTeachers(mockTeachers);
        setAttendanceRecords(mockAttendance);
        setExtraWork(mockExtraWork);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'late': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'excused': return <FileText className="h-4 w-4 text-blue-500" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'present': return 'حاضر';
            case 'absent': return 'غائب';
            case 'late': return 'متأخر';
            case 'excused': return 'إجازة';
            default: return 'غير محدد';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-800';
            case 'absent': return 'bg-red-100 text-red-800';
            case 'late': return 'bg-orange-100 text-orange-800';
            case 'excused': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const recordAttendance = () => {
        if (!attendanceForm.teacher_id || !attendanceForm.status) {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول المطلوبة",
                variant: "destructive"
            });
            return;
        }

        const newAttendance: AttendanceRecord = {
            id: Date.now(),
            date: format(selectedDate, 'yyyy-MM-dd'),
            created_at: new Date().toISOString(),
            ...attendanceForm as AttendanceRecord
        };

        setAttendanceRecords([...attendanceRecords, newAttendance]);
        setAttendanceForm({});
        setShowAttendanceDialog(false);

        toast({
            title: "تم تسجيل الحضور",
            description: "تم تسجيل حضور المدرس بنجاح"
        });
    };

    const getTodayAttendance = () => {
        const today = format(selectedDate, 'yyyy-MM-dd');
        return attendanceRecords.filter(record => record.date === today);
    };

    const getTeacherName = (teacherId: number) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher?.name || 'غير محدد';
    };

    const getAttendanceStats = () => {
        const today = format(selectedDate, 'yyyy-MM-dd');
        const todayRecords = attendanceRecords.filter(record => record.date === today);

        return {
            total: teachers.length,
            present: todayRecords.filter(r => r.status === 'present').length,
            absent: todayRecords.filter(r => r.status === 'absent').length,
            late: todayRecords.filter(r => r.status === 'late').length,
            excused: todayRecords.filter(r => r.status === 'excused').length
        };
    };

    const stats = getAttendanceStats();

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">حضور المدرسين</h1>
                    <p className="text-muted-foreground mt-2">تتبع حضور المدرسين والأعمال الإضافية</p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <CalendarIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {format(selectedDate, 'PPP', { locale: ar })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={() => setShowAttendanceDialog(true)}>
                        <UserCheck className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        تسجيل حضور
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي المدرسين</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">حاضر</p>
                                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">غائب</p>
                                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">متأخر</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجازة</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="daily">الحضور اليومي</TabsTrigger>
                    <TabsTrigger value="reports">التقارير</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {getTodayAttendance().map((record) => (
                            <Card key={record.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            {getStatusIcon(record.status)}
                                            <div>
                                                <h3 className="font-semibold">{getTeacherName(record.teacher_id)}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.session_type === 'morning' ? 'الجلسة الصباحية' : 'الجلسة المسائية'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <Badge className={cn('text-xs', getStatusColor(record.status))}>
                                                {getStatusLabel(record.status)}
                                            </Badge>
                                            {record.check_in_time && (
                                                <div className="text-sm text-muted-foreground">
                                                    دخول: {record.check_in_time}
                                                </div>
                                            )}
                                            {record.check_out_time && (
                                                <div className="text-sm text-muted-foreground">
                                                    خروج: {record.check_out_time}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {record.notes && (
                                        <p className="text-sm text-muted-foreground mt-2 pr-8 rtl:pl-8 rtl:pr-0">
                                            ملاحظة: {record.notes}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" />
                                    إحصائيات الحضور
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>نسبة الحضور:</span>
                                        <span className="font-semibold">
                                            {((stats.present / (stats.total || 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>نسبة الغياب:</span>
                                        <span className="font-semibold text-red-600">
                                            {((stats.absent / (stats.total || 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>نسبة التأخير:</span>
                                        <span className="font-semibold text-orange-600">
                                            {((stats.late / (stats.total || 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Attendance Dialog */}
            <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تسجيل حضور المدرس</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="teacher" className="text-right">المدرس</Label>
                            <Select
                                value={attendanceForm.teacher_id?.toString() || ""}
                                onValueChange={(value) => setAttendanceForm({
                                    ...attendanceForm,
                                    teacher_id: parseInt(value)
                                })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="اختر المدرس" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            {teacher.name} - {teacher.subject}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="session_type" className="text-right">الجلسة</Label>
                            <Select
                                value={attendanceForm.session_type || ""}
                                onValueChange={(value) => setAttendanceForm({
                                    ...attendanceForm,
                                    session_type: value as any
                                })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="اختر الجلسة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">صباحية</SelectItem>
                                    <SelectItem value="evening">مسائية</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">الحالة</Label>
                            <Select
                                value={attendanceForm.status || ""}
                                onValueChange={(value) => setAttendanceForm({
                                    ...attendanceForm,
                                    status: value as any
                                })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="اختر الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="present">حاضر</SelectItem>
                                    <SelectItem value="absent">غائب</SelectItem>
                                    <SelectItem value="late">متأخر</SelectItem>
                                    <SelectItem value="excused">إجازة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="check_in_time" className="text-right">وقت الدخول</Label>
                            <Input
                                id="check_in_time"
                                type="time"
                                value={attendanceForm.check_in_time || ''}
                                onChange={(e) => setAttendanceForm({
                                    ...attendanceForm,
                                    check_in_time: e.target.value
                                })}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">ملاحظات</Label>
                            <Textarea
                                id="notes"
                                value={attendanceForm.notes || ''}
                                onChange={(e) => setAttendanceForm({
                                    ...attendanceForm,
                                    notes: e.target.value
                                })}
                                className="col-span-3"
                                placeholder="أدخل ملاحظات إضافية..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={recordAttendance}>
                            تسجيل
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeacherAttendancePage;