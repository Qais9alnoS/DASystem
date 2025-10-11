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
import { useToast } from '@/components/ui/use-toast';
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
    Users,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { teachersApi, academicYearsApi } from '@/services/api';
import { Teacher, TeacherAttendance } from '@/types/school';

interface AttendanceRecord extends TeacherAttendance {
    teacher_name?: string;
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
    const { toast } = useToast();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [extraWork, setExtraWork] = useState<ExtraWork[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState('daily');
    const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
    const [showExtraWorkDialog, setShowExtraWorkDialog] = useState(false);
    const [attendanceForm, setAttendanceForm] = useState<Partial<AttendanceRecord>>({});
    const [extraWorkForm, setExtraWorkForm] = useState<Partial<ExtraWork>>({});
    const [loading, setLoading] = useState(true);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch academic years
                const yearsResponse = await academicYearsApi.getAll();
                if (yearsResponse.success && yearsResponse.data) {
                    setAcademicYears(yearsResponse.data);
                    // Set default to the first active academic year
                    const activeYear = yearsResponse.data.find((year: any) => year.is_active) || yearsResponse.data[0];
                    if (activeYear) {
                        setSelectedAcademicYear(activeYear.id || null);
                    }
                }

                // Fetch teachers
                const teachersResponse = await teachersApi.getAll({ academic_year_id: selectedAcademicYear || undefined });
                if (teachersResponse.success && teachersResponse.data) {
                    setTeachers(teachersResponse.data);
                }

                // Fetch attendance records for the selected date
                await fetchAttendanceRecords();
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "خطأ",
                    description: "فشل في تحميل البيانات",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedAcademicYear]);

    const fetchAttendanceRecords = async () => {
        if (!selectedAcademicYear) return;
        
        try {
            // For now, we'll fetch attendance for all teachers for the selected month
            // In a real implementation, you might want to filter by date
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            
            // We'll need to fetch attendance for each teacher individually
            const allAttendance: AttendanceRecord[] = [];
            
            for (const teacher of teachers) {
                try {
                    const response = await teachersApi.getAttendance(teacher.id!, month, year);
                    if (response.success && response.data) {
                        // Add teacher name to each attendance record
                        const recordsWithNames = response.data.map(record => ({
                            ...record,
                            teacher_name: teacher.full_name
                        }));
                        allAttendance.push(...recordsWithNames);
                    }
                } catch (error) {
                    console.error(`Error fetching attendance for teacher ${teacher.id}:`, error);
                }
            }
            
            setAttendanceRecords(allAttendance);
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            toast({
                title: "خطأ",
                description: "فشل في تحميل سجل الحضور",
                variant: "destructive"
            });
        }
    };

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

    const recordAttendance = async () => {
        if (!attendanceForm.teacher_id || !attendanceForm.status) {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول المطلوبة",
                variant: "destructive"
            });
            return;
        }

        try {
            // Prepare attendance data
            const attendanceData = {
                attendance_date: format(selectedDate, 'yyyy-MM-dd'),
                session_type: attendanceForm.session_type || 'morning',
                status: attendanceForm.status || 'absent',
                classes_attended: attendanceForm.classes_attended || 0,
                extra_classes: attendanceForm.extra_classes || 0,
                total_hours_worked: attendanceForm.total_hours_worked || 0,
                notes: attendanceForm.notes || '',
            };

            const response = await teachersApi.recordAttendance(
                attendanceForm.teacher_id!,
                attendanceData
            );

            if (response.success && response.data) {
                // Add the new attendance record to the state
                const teacher = teachers.find(t => t.id === attendanceForm.teacher_id);
                const newAttendance: AttendanceRecord = {
                    ...response.data,
                    teacher_name: teacher?.full_name
                };
                
                setAttendanceRecords([...attendanceRecords, newAttendance]);
                setAttendanceForm({});
                setShowAttendanceDialog(false);

                toast({
                    title: "تم تسجيل الحضور",
                    description: "تم تسجيل حضور المدرس بنجاح"
                });
            } else {
                throw new Error(response.message || 'فشل في تسجيل الحضور');
            }
        } catch (error) {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل الحضور",
                variant: "destructive"
            });
        }
    };

    const getTodayAttendance = () => {
        const today = format(selectedDate, 'yyyy-MM-dd');
        return attendanceRecords.filter(record => record.attendance_date === today);
    };

    const getTeacherName = (teacherId: number) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher?.full_name || 'غير محدد';
    };

    const getAttendanceStats = () => {
        const today = format(selectedDate, 'yyyy-MM-dd');
        const todayRecords = attendanceRecords.filter(record => record.attendance_date === today);

        return {
            total: teachers.length,
            present: todayRecords.filter(r => r.status === 'present').length,
            absent: todayRecords.filter(r => r.status === 'absent').length,
            late: todayRecords.filter(r => r.status === 'late').length,
            excused: todayRecords.filter(r => r.status === 'excused').length
        };
    };

    const stats = getAttendanceStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">حضور المدرسين</h1>
                    <p className="text-muted-foreground mt-2">تتبع حضور المدرسين والأعمال الإضافية</p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <Select 
                        value={selectedAcademicYear?.toString() || ''} 
                        onValueChange={(value) => setSelectedAcademicYear(parseInt(value))}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="اختر السنة الدراسية" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map(year => (
                                <SelectItem key={year.id} value={year.id?.toString() || ''}>
                                    {year.year_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                                            {getStatusIcon(record.status || 'absent')}
                                            <div>
                                                <h3 className="font-semibold">{record.teacher_name || getTeacherName(record.teacher_id)}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.session_type === 'morning' ? 'الجلسة الصباحية' : 'الجلسة المسائية'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <Badge className={cn('text-xs', getStatusColor(record.status || 'absent'))}>
                                                {getStatusLabel(record.status || 'absent')}
                                            </Badge>
                                            <div className="text-sm text-muted-foreground">
                                                حضور: {record.classes_attended || 0} حصص
                                            </div>
                                            {record.extra_classes && record.extra_classes > 0 && (
                                                <div className="text-sm text-muted-foreground">
                                                    إضافي: {record.extra_classes} حصص
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
                                            {stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0.0'}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>نسبة الغياب:</span>
                                        <span className="font-semibold text-red-600">
                                            {stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : '0.0'}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>نسبة التأخير:</span>
                                        <span className="font-semibold text-orange-600">
                                            {stats.total > 0 ? ((stats.late / stats.total) * 100).toFixed(1) : '0.0'}%
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
                                        <SelectItem key={teacher.id} value={teacher.id!.toString()}>
                                            {teacher.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="session_type" className="text-right">الجلسة</Label>
                            <Select
                                value={attendanceForm.session_type || "morning"}
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
                                value={attendanceForm.status || "absent"}
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
                            <Label htmlFor="classes_attended" className="text-right">عدد الحصص</Label>
                            <Input
                                id="classes_attended"
                                type="number"
                                value={attendanceForm.classes_attended || ''}
                                onChange={(e) => setAttendanceForm({
                                    ...attendanceForm,
                                    classes_attended: parseInt(e.target.value) || 0
                                })}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="extra_classes" className="text-right">الحصص الإضافية</Label>
                            <Input
                                id="extra_classes"
                                type="number"
                                value={attendanceForm.extra_classes || ''}
                                onChange={(e) => setAttendanceForm({
                                    ...attendanceForm,
                                    extra_classes: parseInt(e.target.value) || 0
                                })}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="total_hours_worked" className="text-right">إجمالي الساعات</Label>
                            <Input
                                id="total_hours_worked"
                                type="number"
                                step="0.5"
                                value={attendanceForm.total_hours_worked || ''}
                                onChange={(e) => setAttendanceForm({
                                    ...attendanceForm,
                                    total_hours_worked: parseFloat(e.target.value) || 0
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