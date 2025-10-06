import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Calendar, Clock, DollarSign, Users, TrendingUp, FileText, Calculator, AlertCircle, CheckCircle } from 'lucide-react';

interface TeacherPayrollRecord {
    id: string;
    teacherId: string;
    teacherName: string;
    teacherNameAr: string;
    month: string;
    year: number;
    baseHours: number;
    actualHours: number;
    overtimeHours: number;
    baseSalary: number;
    overtimePay: number;
    bonuses: number;
    deductions: number;
    totalSalary: number;
    status: 'draft' | 'approved' | 'paid';
    attendanceRate: number;
    extraClasses: number;
    subjects: string[];
}

interface AttendanceRecord {
    id: string;
    teacherId: string;
    date: string;
    scheduledHours: number;
    actualHours: number;
    status: 'present' | 'absent' | 'late' | 'extra';
    notes: string;
    classesAttended: string[];
    overtimeReason?: string;
}

interface SalaryCalculation {
    baseRate: number;
    overtimeRate: number;
    bonusRate: number;
    deductionTypes: { name: string; amount: number }[];
}

const TeacherPayrollSystemPage: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState('attendance');
    const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

    // Mock data
    const [payrollRecords, setPayrollRecords] = useState<TeacherPayrollRecord[]>([
        {
            id: '1',
            teacherId: 't001',
            teacherName: 'Ahmed Al-Rashid',
            teacherNameAr: 'أحمد الراشد',
            month: 'January',
            year: 2024,
            baseHours: 120,
            actualHours: 118,
            overtimeHours: 8,
            baseSalary: 800000,
            overtimePay: 50000,
            bonuses: 100000,
            deductions: 25000,
            totalSalary: 925000,
            status: 'approved',
            attendanceRate: 98.3,
            extraClasses: 4,
            subjects: ['Mathematics', 'Physics']
        },
        {
            id: '2',
            teacherId: 't002',
            teacherName: 'Fatima Al-Zahra',
            teacherNameAr: 'فاطمة الزهراء',
            month: 'January',
            year: 2024,
            baseHours: 100,
            actualHours: 95,
            overtimeHours: 0,
            baseSalary: 650000,
            overtimePay: 0,
            bonuses: 50000,
            deductions: 0,
            totalSalary: 700000,
            status: 'draft',
            attendanceRate: 95.0,
            extraClasses: 0,
            subjects: ['Arabic', 'Islamic Studies']
        }
    ]);

    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
        {
            id: '1',
            teacherId: 't001',
            date: '2024-01-15',
            scheduledHours: 6,
            actualHours: 8,
            status: 'extra',
            notes: 'Extra tutoring session for Grade 12',
            classesAttended: ['Math-12A', 'Math-12B', 'Physics-11A', 'Extra-Tutoring'],
            overtimeReason: 'Student exam preparation'
        },
        {
            id: '2',
            teacherId: 't002',
            date: '2024-01-15',
            scheduledHours: 5,
            actualHours: 5,
            status: 'present',
            notes: 'Regular classes completed',
            classesAttended: ['Arabic-10A', 'Arabic-10B', 'Islamic-9A']
        }
    ]);

    const [salarySettings, setSalarySettings] = useState<SalaryCalculation>({
        baseRate: 7500, // IQD per hour
        overtimeRate: 10000, // IQD per hour
        bonusRate: 5000, // IQD per extra class
        deductionTypes: [
            { name: 'Late Arrival', amount: 15000 },
            { name: 'Absence Without Notice', amount: 25000 },
            { name: 'Social Security', amount: 50000 }
        ]
    });

    const teachers = [
        { id: 't001', name: 'Ahmed Al-Rashid', nameAr: 'أحمد الراشد' },
        { id: 't002', name: 'Fatima Al-Zahra', nameAr: 'فاطمة الزهراء' },
        { id: 't003', name: 'Omar Al-Faruq', nameAr: 'عمر الفاروق' }
    ];

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const calculateSalary = (baseHours: number, actualHours: number, overtimeHours: number) => {
        const basePay = Math.min(actualHours, baseHours) * salarySettings.baseRate;
        const overtimePay = overtimeHours * salarySettings.overtimeRate;
        return { basePay, overtimePay };
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Draft' },
            approved: { color: 'bg-blue-100 text-blue-800', text: 'Approved' },
            paid: { color: 'bg-green-100 text-green-800', text: 'Paid' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft;
        return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const generatePayrollReport = () => {
        // Logic to generate and export payroll report
        console.log('Generating payroll report for', months[selectedMonth], selectedYear);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">نظام الرواتب والحضور</h1>
                        <p className="text-gray-600 mt-2">إدارة رواتب المعلمين وتتبع الحضور والساعات الإضافية</p>
                    </div>
                    <div className="flex gap-3">
                        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month, index) => (
                                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={generatePayrollReport} className="bg-blue-600 hover:bg-blue-700">
                            <FileText className="w-4 h-4 mr-2" />
                            تقرير الرواتب
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(1625000)}</div>
                            <p className="text-xs text-muted-foreground">+5% من الشهر الماضي</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">معدل الحضور</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">96.7%</div>
                            <p className="text-xs text-muted-foreground">ممتاز</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">الساعات الإضافية</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground">ساعة هذا الشهر</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">المعلمون النشطون</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">15</div>
                            <p className="text-xs text-muted-foreground">من أصل 18 معلم</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="attendance">الحضور اليومي</TabsTrigger>
                        <TabsTrigger value="payroll">كشوف الرواتب</TabsTrigger>
                        <TabsTrigger value="overtime">الساعات الإضافية</TabsTrigger>
                        <TabsTrigger value="settings">إعدادات الراتب</TabsTrigger>
                    </TabsList>

                    <TabsContent value="attendance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>سجل الحضور اليومي</CardTitle>
                                <CardDescription>تتبع حضور المعلمين والساعات الفعلية مقابل المجدولة</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <Label htmlFor="teacher-select">اختر المعلم</Label>
                                            <Select value={selectedTeacher || ''} onValueChange={setSelectedTeacher}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="جميع المعلمين" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">جميع المعلمين</SelectItem>
                                                    {teachers.map(teacher => (
                                                        <SelectItem key={teacher.id} value={teacher.id}>
                                                            {teacher.nameAr} - {teacher.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor="date-input">التاريخ</Label>
                                            <Input type="date" id="date-input" />
                                        </div>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>المعلم</TableHead>
                                                <TableHead>التاريخ</TableHead>
                                                <TableHead>الساعات المجدولة</TableHead>
                                                <TableHead>الساعات الفعلية</TableHead>
                                                <TableHead>الحالة</TableHead>
                                                <TableHead>الحصص</TableHead>
                                                <TableHead>ملاحظات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attendanceRecords.map((record) => {
                                                const teacher = teachers.find(t => t.id === record.teacherId);
                                                return (
                                                    <TableRow key={record.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{teacher?.nameAr}</div>
                                                                <div className="text-sm text-gray-500">{teacher?.name}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{new Date(record.date).toLocaleDateString('ar')}</TableCell>
                                                        <TableCell>{record.scheduledHours}</TableCell>
                                                        <TableCell className={record.actualHours > record.scheduledHours ? 'text-blue-600 font-medium' : ''}>
                                                            {record.actualHours}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={
                                                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                                                    record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                                                        record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-blue-100 text-blue-800'
                                                            }>
                                                                {record.status === 'present' ? 'حاضر' :
                                                                    record.status === 'absent' ? 'غائب' :
                                                                        record.status === 'late' ? 'متأخر' : 'ساعات إضافية'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {record.classesAttended.join(', ')}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-48">
                                                            <div className="text-sm text-gray-600 truncate">{record.notes}</div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payroll" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>كشوف الرواتب الشهرية</CardTitle>
                                <CardDescription>إدارة وحساب رواتب المعلمين بناءً على الحضور والساعات الإضافية</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>المعلم</TableHead>
                                            <TableHead>الساعات الأساسية</TableHead>
                                            <TableHead>الساعات الفعلية</TableHead>
                                            <TableHead>الساعات الإضافية</TableHead>
                                            <TableHead>الراتب الأساسي</TableHead>
                                            <TableHead>العلاوات</TableHead>
                                            <TableHead>الخصومات</TableHead>
                                            <TableHead>الإجمالي</TableHead>
                                            <TableHead>الحالة</TableHead>
                                            <TableHead>الإجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payrollRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{record.teacherNameAr}</div>
                                                        <div className="text-sm text-gray-500">{record.teacherName}</div>
                                                        <div className="text-xs text-blue-600">
                                                            معدل الحضور: {record.attendanceRate}%
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{record.baseHours}</TableCell>
                                                <TableCell>{record.actualHours}</TableCell>
                                                <TableCell className="text-blue-600 font-medium">{record.overtimeHours}</TableCell>
                                                <TableCell>{formatCurrency(record.baseSalary)}</TableCell>
                                                <TableCell className="text-green-600">{formatCurrency(record.bonuses)}</TableCell>
                                                <TableCell className="text-red-600">{formatCurrency(record.deductions)}</TableCell>
                                                <TableCell className="font-bold">{formatCurrency(record.totalSalary)}</TableCell>
                                                <TableCell>{getStatusBadge(record.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline">
                                                            <Calculator className="w-3 h-3 mr-1" />
                                                            حساب
                                                        </Button>
                                                        {record.status === 'draft' && (
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                اعتماد
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="overtime" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>إدارة الساعات الإضافية</CardTitle>
                                <CardDescription>تتبع وإدارة الساعات الإضافية والحصص الإضافية للمعلمين</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">إجمالي الساعات الإضافية</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-blue-600">24</div>
                                                <p className="text-sm text-gray-600">هذا الشهر</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">قيمة الساعات الإضافية</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-green-600">{formatCurrency(240000)}</div>
                                                <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">المعلمون المشاركون</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-purple-600">8</div>
                                                <p className="text-sm text-gray-600">من أصل 15 معلم</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold mb-3">تفاصيل الساعات الإضافية بالمعلم</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>المعلم</TableHead>
                                                    <TableHead>الساعات الإضافية</TableHead>
                                                    <TableHead>السبب</TableHead>
                                                    <TableHead>معدل الساعة</TableHead>
                                                    <TableHead>المبلغ المستحق</TableHead>
                                                    <TableHead>التاريخ</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>أحمد الراشد</TableCell>
                                                    <TableCell>8</TableCell>
                                                    <TableCell>تحضير طلاب الصف الثاني عشر للامتحانات</TableCell>
                                                    <TableCell>{formatCurrency(salarySettings.overtimeRate)}</TableCell>
                                                    <TableCell className="font-medium text-green-600">{formatCurrency(80000)}</TableCell>
                                                    <TableCell>2024-01-15</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>فاطمة الزهراء</TableCell>
                                                    <TableCell>4</TableCell>
                                                    <TableCell>دروس تقوية للطلاب الضعاف</TableCell>
                                                    <TableCell>{formatCurrency(salarySettings.overtimeRate)}</TableCell>
                                                    <TableCell className="font-medium text-green-600">{formatCurrency(40000)}</TableCell>
                                                    <TableCell>2024-01-12</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>إعدادات حساب الراتب</CardTitle>
                                <CardDescription>تكوين معدلات الراتب والعلاوات والخصومات</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">معدلات الراتب</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor="base-rate">معدل الساعة الأساسي (دينار)</Label>
                                                <Input
                                                    id="base-rate"
                                                    type="number"
                                                    value={salarySettings.baseRate}
                                                    onChange={(e) => setSalarySettings({
                                                        ...salarySettings,
                                                        baseRate: parseInt(e.target.value)
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="overtime-rate">معدل الساعة الإضافية (دينار)</Label>
                                                <Input
                                                    id="overtime-rate"
                                                    type="number"
                                                    value={salarySettings.overtimeRate}
                                                    onChange={(e) => setSalarySettings({
                                                        ...salarySettings,
                                                        overtimeRate: parseInt(e.target.value)
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="bonus-rate">علاوة الحصة الإضافية (دينار)</Label>
                                                <Input
                                                    id="bonus-rate"
                                                    type="number"
                                                    value={salarySettings.bonusRate}
                                                    onChange={(e) => setSalarySettings({
                                                        ...salarySettings,
                                                        bonusRate: parseInt(e.target.value)
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold">أنواع الخصومات</h3>
                                        <div className="space-y-3">
                                            {salarySettings.deductionTypes.map((deduction, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        value={deduction.name}
                                                        placeholder="نوع الخصم"
                                                        onChange={(e) => {
                                                            const newDeductions = [...salarySettings.deductionTypes];
                                                            newDeductions[index].name = e.target.value;
                                                            setSalarySettings({ ...salarySettings, deductionTypes: newDeductions });
                                                        }}
                                                    />
                                                    <Input
                                                        type="number"
                                                        value={deduction.amount}
                                                        placeholder="المبلغ"
                                                        onChange={(e) => {
                                                            const newDeductions = [...salarySettings.deductionTypes];
                                                            newDeductions[index].amount = parseInt(e.target.value);
                                                            setSalarySettings({ ...salarySettings, deductionTypes: newDeductions });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSalarySettings({
                                                        ...salarySettings,
                                                        deductionTypes: [...salarySettings.deductionTypes, { name: '', amount: 0 }]
                                                    });
                                                }}
                                            >
                                                إضافة نوع خصم جديد
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        حفظ الإعدادات
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default TeacherPayrollSystemPage;