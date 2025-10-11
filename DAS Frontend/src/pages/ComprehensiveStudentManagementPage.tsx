import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Student, StudentFinance, StudentPayment, StudentAcademic, TransportationType, GradeLevel, SessionType } from '@/types/school';
import { studentsApi } from '@/services/api';
import { StudentEditForm } from '@/components/students/StudentEditForm';
import { PaymentRecordingForm } from '@/components/students/PaymentRecordingForm';
import {
    User,
    CreditCard,
    GraduationCap,
    Camera,
    BarChart3,
    Plus,
    Search,
    Truck,
    FileText,
    Calculator,
    Loader2,
    Edit,
    Trash2,
    AlertTriangle,
    PlusCircle
} from 'lucide-react';

interface ComprehensiveStudentData {
    student: Student;
    finance: StudentFinance;
    payments: StudentPayment[];
    academics: StudentAcademic[];
    activities: any[];
}

export function ComprehensiveStudentManagementPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<ComprehensiveStudentData | null>(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
    const [studentToDeactivate, setStudentToDeactivate] = useState<Student | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    // Fetch students data from backend
    const { data: students = [], isLoading, isError, error } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const response = await studentsApi.getAll();
            if (response.success) {
                // For each student, fetch their financial and academic data
                const studentsWithDetails = await Promise.all(
                    response.data?.map(async (student) => {
                        try {
                            // Fetch finance data
                            const financeResponse = await studentsApi.getFinances(student.id);
                            const finance = financeResponse.success ? financeResponse.data : null;
                            
                            // Fetch payments data
                            const paymentsResponse = await studentsApi.getPayments(student.id);
                            const payments = paymentsResponse.success ? paymentsResponse.data : [];
                            
                            // Fetch academics data
                            const academicsResponse = await studentsApi.getAcademics(student.id);
                            const academics = academicsResponse.success ? academicsResponse.data : [];
                            
                            return {
                                student,
                                finance: finance || {
                                    id: 0,
                                    student_id: student.id,
                                    academic_year_id: student.academic_year_id,
                                    school_fee: 0,
                                    school_fee_discount: 0,
                                    bus_fee: 0,
                                    bus_fee_discount: 0,
                                    other_revenues: 0,
                                    total_amount: 0,
                                    total_paid: 0,
                                    partial_balance: 0,
                                    total_balance: 0,
                                    previous_years_balance: 0
                                },
                                payments: payments || [],
                                academics: academics || [],
                                activities: []
                            };
                        } catch (err) {
                            console.error(`Error fetching details for student ${student.id}:`, err);
                            return {
                                student,
                                finance: {
                                    id: 0,
                                    student_id: student.id,
                                    academic_year_id: student.academic_year_id,
                                    school_fee: 0,
                                    school_fee_discount: 0,
                                    bus_fee: 0,
                                    bus_fee_discount: 0,
                                    other_revenues: 0,
                                    total_amount: 0,
                                    total_paid: 0,
                                    partial_balance: 0,
                                    total_balance: 0,
                                    previous_years_balance: 0
                                },
                                payments: [],
                                academics: [],
                                activities: []
                            };
                        }
                    }) || []
                );
                return studentsWithDetails;
            }
            return [];
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Filter students based on search query
    const filteredStudents = students.filter(studentData => {
        if (!searchQuery) return true;
        const { student } = studentData;
        return (
            student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.father_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getTransportationLabel = (type: TransportationType) => {
        const labels = {
            'walking': 'مشي',
            'full_bus': 'باص كامل',
            'half_bus_to_school': 'نص باص (للمدرسة)',
            'half_bus_from_school': 'نص باص (من المدرسة)'
        };
        return labels[type];
    };

    const getGradeLevelLabel = (level: GradeLevel) => {
        const labels = {
            'primary': 'ابتدائي',
            'intermediate': 'إعدادي',
            'secondary': 'ثانوي'
        };
        return labels[level];
    };

    const getSessionTypeLabel = (type: SessionType) => {
        return type === 'morning' ? 'صباحي' : 'مسائي';
    };

    const handleEditStudent = (student: Student) => {
        setStudentToEdit(student);
        setIsEditDialogOpen(true);
    };

    const handleDeactivateStudent = (student: Student) => {
        setStudentToDeactivate(student);
        setIsDeactivateDialogOpen(true);
    };

    const confirmDeactivateStudent = async () => {
        if (!studentToDeactivate) return;
        
        try {
            const response = await studentsApi.deactivate(studentToDeactivate.id);
            
            if (response.success) {
                toast({
                    title: "نجاح",
                    description: "تم تعطيل الطالب بنجاح",
                    variant: "default"
                });
                
                // Refresh the student list
                queryClient.invalidateQueries({ queryKey: ['students'] });
                
                // Close dialog
                setIsDeactivateDialogOpen(false);
                setStudentToDeactivate(null);
            } else {
                throw new Error(response.message || 'فشل في تعطيل الطالب');
            }
        } catch (error) {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : 'حدث خطأ أثناء تعطيل الطالب',
                variant: "destructive"
            });
        }
    };

    const handleEditSuccess = () => {
        // Close edit dialog
        setIsEditDialogOpen(false);
        setStudentToEdit(null);
        
        // Refresh the student list
        queryClient.invalidateQueries({ queryKey: ['students'] });
        
        toast({
            title: "نجاح",
            description: "تم تحديث بيانات الطالب بنجاح",
            variant: "default"
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mr-2">جاري تحميل بيانات الطلاب...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500">حدث خطأ أثناء تحميل بيانات الطلاب</p>
                    <p className="text-sm text-muted-foreground mt-2">{error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">إدارة الطلاب الشاملة</h1>
                    <p className="text-muted-foreground mt-2">إدارة شاملة لجميع بيانات الطلاب</p>
                </div>
                <Button className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Plus className="h-5 w-5" />
                    <span>تسجيل طالب جديد</span>
                </Button>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            placeholder="البحث بالاسم أو اسم الأب..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rtl:pr-10 rtl:pl-3"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Students List */}
            <div className="flex-1 space-y-4">
                {filteredStudents.map((studentData) => {
                    const { student, finance } = studentData;
                    const hasFinancialDues = finance.partial_balance > 0;

                    return (
                        <Card key={student.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback>{student.full_name.split(' ')[0][0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                            <p className="text-sm text-muted-foreground">والد: {student.father_name}</p>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Badge variant="outline">
                                                    {getGradeLevelLabel(student.grade_level)} {student.grade_number}
                                                    {student.section && ` - ${student.section}`}
                                                </Badge>
                                                <Badge variant={student.session_type === 'morning' ? 'default' : 'secondary'}>
                                                    {getSessionTypeLabel(student.session_type)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <div className="flex space-x-2 rtl:space-x-reverse">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditStudent(student);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeactivateStudent(student);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                                                <Truck className="h-4 w-4" />
                                                <span>{getTransportationLabel(student.transportation_type)}</span>
                                            </div>
                                            {hasFinancialDues && (
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-red-600">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span>مستحق: {formatCurrency(finance.partial_balance)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedStudent.student.full_name}</DialogTitle>
                        </DialogHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="personal">شخصية</TabsTrigger>
                                <TabsTrigger value="financial">مالية</TabsTrigger>
                                <TabsTrigger value="academic">دراسية</TabsTrigger>
                                <TabsTrigger value="additional">إضافية</TabsTrigger>
                                <TabsTrigger value="analytics">احصائيات</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <User className="h-5 w-5" />
                                            <span>المعلومات الشخصية</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>اسم الطالب</Label>
                                                <p className="mt-1">{selectedStudent.student.full_name}</p>
                                            </div>
                                            <div>
                                                <Label>اسم الأب</Label>
                                                <p className="mt-1">{selectedStudent.student.father_name}</p>
                                            </div>
                                            <div>
                                                <Label>اسم الجد</Label>
                                                <p className="mt-1">{selectedStudent.student.grandfather_name}</p>
                                            </div>
                                            <div>
                                                <Label>اسم الأم</Label>
                                                <p className="mt-1">{selectedStudent.student.mother_name}</p>
                                            </div>
                                            <div>
                                                <Label>تاريخ الميلاد</Label>
                                                <p className="mt-1">{selectedStudent.student.birth_date}</p>
                                            </div>
                                            <div>
                                                <Label>مكان الولادة</Label>
                                                <p className="mt-1">{selectedStudent.student.birth_place}</p>
                                            </div>
                                            <div>
                                                <Label>الجنسية</Label>
                                                <p className="mt-1">{selectedStudent.student.nationality}</p>
                                            </div>
                                            <div>
                                                <Label>الديانة</Label>
                                                <p className="mt-1">{selectedStudent.student.religion}</p>
                                            </div>
                                            <div>
                                                <Label>الجنس</Label>
                                                <p className="mt-1">{selectedStudent.student.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                                            </div>
                                            <div>
                                                <Label>العنوان التفصيلي</Label>
                                                <p className="mt-1">{selectedStudent.student.detailed_address}</p>
                                            </div>
                                            <div>
                                                <Label>هاتف الأب</Label>
                                                <p className="mt-1">{selectedStudent.student.father_phone}</p>
                                            </div>
                                            <div>
                                                <Label>عمل الأب</Label>
                                                <p className="mt-1">{selectedStudent.student.father_occupation}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="financial">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <Calculator className="h-5 w-5" />
                                            <span>المعلومات المالية</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>القسط المدرسي</Label>
                                                <p className="mt-1 font-semibold">{formatCurrency(selectedStudent.finance.school_fee)}</p>
                                            </div>
                                            <div>
                                                <Label>خصم القسط المدرسي</Label>
                                                <p className="mt-1 font-semibold text-green-600">-{formatCurrency(selectedStudent.finance.school_fee_discount)}</p>
                                            </div>
                                            <div>
                                                <Label>رسوم النقل</Label>
                                                <p className="mt-1 font-semibold">{formatCurrency(selectedStudent.finance.bus_fee)}</p>
                                            </div>
                                            <div>
                                                <Label>خصم رسوم النقل</Label>
                                                <p className="mt-1 font-semibold text-green-600">-{formatCurrency(selectedStudent.finance.bus_fee_discount)}</p>
                                            </div>
                                            <div>
                                                <Label>إيرادات أخرى</Label>
                                                <p className="mt-1 font-semibold">{formatCurrency(selectedStudent.finance.other_revenues)}</p>
                                            </div>
                                            <div>
                                                <Label>المجموع الكلي</Label>
                                                <p className="mt-1 font-semibold">{formatCurrency(selectedStudent.finance.total_amount)}</p>
                                            </div>
                                            <div>
                                                <Label>المدفوع</Label>
                                                <p className="mt-1 font-semibold text-green-600">-{formatCurrency(selectedStudent.finance.total_paid)}</p>
                                            </div>
                                            <div>
                                                <Label>الرصيد المتبقي</Label>
                                                <p className="mt-1 font-semibold text-red-600">{formatCurrency(selectedStudent.finance.partial_balance)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-semibold">الدفعات المالية</h4>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setIsPaymentDialogOpen(true)}
                                                    className="flex items-center space-x-1 rtl:space-x-reverse"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    <span>تسجيل دفعة جديدة</span>
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {selectedStudent.payments.map(payment => (
                                                    <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                                                        <span>{payment.payment_date}</span>
                                                        <span className="font-semibold">{formatCurrency(payment.payment_amount)}</span>
                                                        <span className="text-sm text-muted-foreground">{payment.receipt_number}</span>
                                                    </div>
                                                ))}
                                                {selectedStudent.payments.length === 0 && (
                                                    <p className="text-muted-foreground text-center py-4">لا توجد دفعات مالية</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="academic">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <GraduationCap className="h-5 w-5" />
                                            <span>المعلومات الأكاديمية</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedStudent.academics.map((academic) => (
                                            <div key={academic.id} className="grid grid-cols-3 gap-4 mb-4 p-4 border rounded">
                                                <div>
                                                    <Label>emarks السبور</Label>
                                                    <p className="mt-1">{academic.board_grades}</p>
                                                </div>
                                                <div>
                                                    <Label>علامة التلاوة</Label>
                                                    <p className="mt-1">{academic.recitation_grades}</p>
                                                </div>
                                                <div>
                                                    <Label>امتحان أول</Label>
                                                    <p className="mt-1">{academic.first_exam_grades}</p>
                                                </div>
                                                <div>
                                                    <Label>امتحان نصفي</Label>
                                                    <p className="mt-1">{academic.midterm_grades}</p>
                                                </div>
                                                <div>
                                                    <Label>علامة السلوك</Label>
                                                    <p className="mt-1">{academic.behavior_grade}</p>
                                                </div>
                                                <div>
                                                    <Label>علامة الأنشطة</Label>
                                                    <p className="mt-1">{academic.activity_grade}</p>
                                                </div>
                                                <div>
                                                    <Label>أيام الغياب</Label>
                                                    <p className="mt-1">{academic.absence_days} أيام</p>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedStudent.academics.length === 0 && (
                                            <div className="text-center py-8">
                                                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">لا توجد معلومات أكاديمية</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="additional">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <Camera className="h-5 w-5" />
                                            <span>المعلومات الإضافية</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground">لا توجد معلومات إضافية</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="analytics">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <BarChart3 className="h-5 w-5" />
                                            <span>الإحصائيات</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {selectedStudent.academics.length > 0 
                                                        ? Math.round(selectedStudent.academics.reduce((sum, a) => 
                                                            sum + (a.board_grades + a.recitation_grades + a.first_exam_grades + 
                                                            a.midterm_grades + a.behavior_grade + a.activity_grade) / 6, 0) / 
                                                            selectedStudent.academics.length) + '%'
                                                        : '0%'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">المعدل العام</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {selectedStudent.academics.length > 0 
                                                        ? Math.round((1 - selectedStudent.academics.reduce((sum, a) => 
                                                            sum + a.absence_days, 0) / (selectedStudent.academics.length * 180)) * 100) + '%'
                                                        : '0%'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">نسبة الحضور</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {selectedStudent.finance.total_amount > 0 
                                                        ? Math.round((selectedStudent.finance.total_paid / selectedStudent.finance.total_amount) * 100) + '%'
                                                        : '0%'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">نسبة السداد</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            )}

            {/* Edit Student Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {studentToEdit && (
                        <StudentEditForm 
                            student={studentToEdit} 
                            onCancel={() => setIsEditDialogOpen(false)}
                            onSuccess={handleEditSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Deactivate Student Dialog */}
            <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد تعطيل الطالب</DialogTitle>
                    </DialogHeader>
                    {studentToDeactivate && (
                        <div className="py-4">
                            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                                <div>
                                    <p className="font-medium text-yellow-800">هل أنت متأكد من رغبتك في تعطيل الطالب؟</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        سيتم تعطيل الطالب: <span className="font-semibold">{studentToDeactivate.full_name}</span>
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                ملاحظة: تعطيل الطالب يعني أنه لن يظهر في القوائم الافتراضية، لكن بياناته ستحتفظ بها في النظام.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button variant="destructive" onClick={confirmDeactivateStudent}>
                            تأكيد التعطيل
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Recording Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    {selectedStudent && (
                        <PaymentRecordingForm 
                            studentId={selectedStudent.student.id}
                            academicYearId={selectedStudent.student.academic_year_id}
                            onSuccess={() => {
                                // Refresh student data
                                queryClient.invalidateQueries({ queryKey: ['students'] });
                                setIsPaymentDialogOpen(false);
                                toast({
                                    title: "نجاح",
                                    description: "تم تسجيل الدفعة المالية بنجاح",
                                    variant: "default"
                                });
                            }}
                            onCancel={() => setIsPaymentDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ComprehensiveStudentManagementPage;