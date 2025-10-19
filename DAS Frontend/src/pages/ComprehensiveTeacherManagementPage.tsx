import React, { useState, useEffect } from 'react';
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
import {
    Teacher,
    TeacherAssignment,
    TeacherAttendance,
    TransportationType,
    SessionType,
    Subject,
    Class
} from '@/types/school';
import { teachersApi } from '@/services/api';
import { TeacherEditForm } from '@/components/teachers/TeacherEditForm';
import {
    User,
    GraduationCap,
    Calendar,
    Clock,
    BookOpen,
    Users,
    MapPin,
    Phone,
    Plus,
    Search,
    Edit,
    Eye,
    Calculator,
    BarChart3,
    Truck,
    FileText,
    Award,
    Trash2,
    AlertTriangle
} from 'lucide-react';

interface ComprehensiveTeacherData {
    teacher: Teacher;
    assignments: TeacherAssignment[];
    attendance: TeacherAttendance[];
    subjects: Subject[];
    classes: Class[];
}

export function ComprehensiveTeacherManagementPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [teachers, setTeachers] = useState<ComprehensiveTeacherData[]>([]);
    const [filteredTeachers, setFilteredTeachers] = useState<ComprehensiveTeacherData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState<ComprehensiveTeacherData | null>(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [filters, setFilters] = useState({
        gender: 'all',
        sessionType: '',
        subject: '',
        isActive: 'all'
    });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
    const [teacherToDeactivate, setTeacherToDeactivate] = useState<Teacher | null>(null);

    // Mock data for testing - based on Arabic specifications
    const mockTeachers: ComprehensiveTeacherData[] = [
        {
            teacher: {
                id: 1,
                academic_year_id: 2025,
                full_name: 'أحمد حسن محمود',
                gender: 'male',
                birth_date: '1985-03-15',
                phone: '07701234567',
                nationality: 'عراقي',
                detailed_address: 'حي الكرادة، شارع الربيع، بيت رقم 25',
                transportation_type: 'walking',
                classes_taught: [1, 2],
                sections_taught: ['A', 'B'],
                subjects_taught: [1, 2], // Math, Physics
                free_time_slots: JSON.stringify([
                    { day: 'monday', periods: [1, 2] },
                    { day: 'wednesday', periods: [3, 4] }
                ]),
                qualifications: 'بكالوريوس رياضيات - جامعة بغداد، ماجستير في التعليم',
                experience: '10 سنوات في التدريس، 5 سنوات في مدارس خاصة',
                notes: 'مدرس متميز في الرياضيات',
                is_active: true,
                created_at: '2024-09-01'
            },
            assignments: [
                {
                    id: 1,
                    teacher_id: 1,
                    class_id: 1,
                    subject_id: 1,
                    section: 'A'
                },
                {
                    id: 2,
                    teacher_id: 1,
                    class_id: 2,
                    subject_id: 2,
                    section: 'B'
                }
            ],
            attendance: [
                {
                    id: 1,
                    teacher_id: 1,
                    attendance_date: '2024-09-20',
                    classes_attended: 6,
                    extra_classes: 2,
                    session_type: 'morning',
                    total_hours_worked: 8,
                    hourly_rate: 25000,
                    calculated_salary: 200000
                }
            ],
            subjects: [
                { id: 1, class_id: 1, subject_name: 'الرياضيات', weekly_hours: 6 },
                { id: 2, class_id: 2, subject_name: 'الفيزياء', weekly_hours: 4 }
            ],
            classes: [
                { id: 1, academic_year_id: 2025, session_type: 'morning', grade_level: 'intermediate', grade_number: 1, section_count: 2 },
                { id: 2, academic_year_id: 2025, session_type: 'morning', grade_level: 'intermediate', grade_number: 2, section_count: 1 }
            ]
        }
    ];

    useEffect(() => {
        setTeachers(mockTeachers);
        setFilteredTeachers(mockTeachers);
    }, []);

    // Search and filter functionality
    useEffect(() => {
        let filtered = teachers;

        if (searchQuery) {
            filtered = filtered.filter(teacherData =>
                teacherData.teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacherData.subjects.some(subject => subject.subject_name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (filters.gender && filters.gender !== 'all') {
            filtered = filtered.filter(t => t.teacher.gender === filters.gender);
        }
        if (filters.isActive && filters.isActive !== 'all') {
            filtered = filtered.filter(t => t.teacher.is_active.toString() === filters.isActive);
        }

        setFilteredTeachers(filtered);
    }, [searchQuery, filters, teachers]);

    const getTransportationLabel = (type?: TransportationType) => {
        if (!type) return 'غير محدد';
        const labels = {
            'walking': 'مشي',
            'full_bus': 'باص كامل',
            'half_bus_to_school': 'نص باص (للمدرسة)',
            'half_bus_from_school': 'نص باص (من المدرسة)'
        };
        return labels[type];
    };

    const getGenderLabel = (gender: 'male' | 'female') => {
        return gender === 'male' ? 'ذكر' : 'أنثى';
    };

    const calculateAge = (birthDate: string) => {
        return new Date().getFullYear() - new Date(birthDate).getFullYear();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setTeacherToEdit(teacher);
        setIsEditDialogOpen(true);
    };

    const handleDeactivateTeacher = (teacher: Teacher) => {
        setTeacherToDeactivate(teacher);
        setIsDeactivateDialogOpen(true);
    };

    const confirmDeactivateTeacher = async () => {
        if (!teacherToDeactivate) return;
        
        try {
            const response = await teachersApi.delete(teacherToDeactivate.id);
            
            if (response.success) {
                toast({
                    title: "نجاح",
                    description: "تم تعطيل المعلم بنجاح",
                    variant: "default"
                });
                
                // Refresh the teacher list
                // In a real implementation, you would refetch from the API
                const updatedTeachers = teachers.map(t => 
                    t.teacher.id === teacherToDeactivate.id 
                        ? { ...t, teacher: { ...t.teacher, is_active: false } } 
                        : t
                );
                setTeachers(updatedTeachers);
                setFilteredTeachers(updatedTeachers);
                
                // Close dialog
                setIsDeactivateDialogOpen(false);
                setTeacherToDeactivate(null);
            } else {
                throw new Error(response.message || 'فشل في تعطيل المعلم');
            }
        } catch (error) {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : 'حدث خطأ أثناء تعطيل المعلم',
                variant: "destructive"
            });
        }
    };

    const handleEditSuccess = (updatedTeacher: Teacher) => {
        // Close edit dialog
        setIsEditDialogOpen(false);
        setTeacherToEdit(null);
        
        // Update the teacher in the list
        const updatedTeachers = teachers.map(t => 
            t.teacher.id === updatedTeacher.id 
                ? { ...t, teacher: updatedTeacher } 
                : t
        );
        setTeachers(updatedTeachers);
        setFilteredTeachers(updatedTeachers);
        
        // If this was the selected teacher, update that too
        if (selectedTeacher && selectedTeacher.teacher.id === updatedTeacher.id) {
            setSelectedTeacher({ ...selectedTeacher, teacher: updatedTeacher });
        }
        
        toast({
            title: "نجاح",
            description: "تم تحديث بيانات المعلم بنجاح",
            variant: "default"
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">إدارة الأساتذة الشاملة</h1>
                    <p className="text-muted-foreground mt-2">
                        إدارة شاملة لجميع بيانات الأساتذة - المعلومات الشخصية والمهنية والحضور
                    </p>
                </div>
                <Button className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Plus className="h-5 w-5" />
                    <span>إضافة أستاذ جديد</span>
                </Button>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <Input
                                    placeholder="البحث بالاسم أو المادة..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 rtl:pr-10 rtl:pl-3"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <Select value={filters.gender} onValueChange={(value) => setFilters({ ...filters, gender: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="الجنس" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">الكل</SelectItem>
                                    <SelectItem value="male">ذكر</SelectItem>
                                    <SelectItem value="female">أنثى</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.isActive} onValueChange={(value) => setFilters({ ...filters, isActive: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">الكل</SelectItem>
                                    <SelectItem value="true">نشط</SelectItem>
                                    <SelectItem value="false">غير نشط</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Teachers List */}
            <div className="flex-1 space-y-4">
                {filteredTeachers.map((teacherData) => {
                    const { teacher, subjects, assignments } = teacherData;

                    return (
                        <Card key={teacher.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback>{teacher.full_name.split(' ')[0][0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">{teacher.full_name}</h3>
                                            <p className="text-sm text-muted-foreground">{getGenderLabel(teacher.gender)} • {teacher.birth_date && `${calculateAge(teacher.birth_date)} سنة`}</p>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                {subjects.slice(0, 2).map((subject) => (
                                                    <Badge key={subject.id} variant="outline">
                                                        {subject.subject_name}
                                                    </Badge>
                                                ))}
                                                {subjects.length > 2 && (
                                                    <Badge variant="outline">
                                                        +{subjects.length - 2} أخرى
                                                    </Badge>
                                                )}
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
                                                    handleEditTeacher(teacher);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeactivateTeacher(teacher);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{subjects.length} مادة</span>
                                            </div>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                                                <Users className="h-4 w-4" />
                                                <span>{assignments.length} صف</span>
                                            </div>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                                                <Truck className="h-4 w-4" />
                                                <span>{getTransportationLabel(teacher.transportation_type)}</span>
                                            </div>
                                            <Badge variant={teacher.is_active ? "default" : "secondary"}>
                                                {teacher.is_active ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {filteredTeachers.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-muted-foreground">لا توجد نتائج للبحث الحالي</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Teacher Details Modal */}
            {selectedTeacher && (
                <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{selectedTeacher.teacher.full_name.split(' ')[0][0]}</AvatarFallback>
                                </Avatar>
                                <span>{selectedTeacher.teacher.full_name}</span>
                                <Badge variant={selectedTeacher.teacher.is_active ? "default" : "secondary"}>
                                    {selectedTeacher.teacher.is_active ? 'نشط' : 'غير نشط'}
                                </Badge>
                            </DialogTitle>
                        </DialogHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="personal">شخصية</TabsTrigger>
                                <TabsTrigger value="professional">مهنية</TabsTrigger>
                                <TabsTrigger value="assignments">التكليفات</TabsTrigger>
                                <TabsTrigger value="attendance">الحضور</TabsTrigger>
                                <TabsTrigger value="analytics">إحصائيات</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <User className="h-5 w-5" />
                                                <span>المعلومات الشخصية</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>الاسم</Label>
                                                    <p className="mt-1">{selectedTeacher.teacher.full_name}</p>
                                                </div>
                                                <div>
                                                    <Label>الجنس</Label>
                                                    <p className="mt-1">{getGenderLabel(selectedTeacher.teacher.gender)}</p>
                                                </div>
                                                <div>
                                                    <Label>تاريخ الميلاد</Label>
                                                    <p className="mt-1">{selectedTeacher.teacher.birth_date || 'غير محدد'}</p>
                                                </div>
                                                <div>
                                                    <Label>العمر</Label>
                                                    <p className="mt-1">{selectedTeacher.teacher.birth_date ? `${calculateAge(selectedTeacher.teacher.birth_date)} سنة` : 'غير محدد'}</p>
                                                </div>
                                                <div>
                                                    <Label>الجنسية</Label>
                                                    <p className="mt-1">{selectedTeacher.teacher.nationality || 'غير محدد'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Phone className="h-5 w-5" />
                                                <span>معلومات التواصل</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label>رقم الهاتف</Label>
                                                <p className="mt-1">{selectedTeacher.teacher.phone || 'غير متوفر'}</p>
                                            </div>
                                            <div>
                                                <Label>العنوان التفصيلي</Label>
                                                <p className="mt-1">{selectedTeacher.teacher.detailed_address || 'غير محدد'}</p>
                                            </div>
                                            <div>
                                                <Label>وسيلة النقل</Label>
                                                <p className="mt-1">{getTransportationLabel(selectedTeacher.teacher.transportation_type)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="professional">
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Award className="h-5 w-5" />
                                                <span>المؤهلات والخبرة</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label>الشهادات</Label>
                                                <p className="mt-1">{selectedTeacher.teacher.qualifications || 'غير محدد'}</p>
                                            </div>
                                            <div>
                                                <Label>الخبرات</Label>
                                                <p className="mt-1">{selectedTeacher.teacher.experience || 'غير محدد'}</p>
                                            </div>
                                            {selectedTeacher.teacher.notes && (
                                                <div>
                                                    <Label>ملاحظات</Label>
                                                    <p className="mt-1">{selectedTeacher.teacher.notes}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="assignments">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <BookOpen className="h-5 w-5" />
                                            <span>المواد والصفوف المُكلف بها</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {selectedTeacher.assignments.map((assignment, index) => {
                                                const subject = selectedTeacher.subjects.find(s => s.id === assignment.subject_id);
                                                const classInfo = selectedTeacher.classes.find(c => c.id === assignment.class_id);

                                                return (
                                                    <div key={assignment.id} className="border rounded-lg p-4">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <Label>المادة</Label>
                                                                <p className="mt-1 font-semibold">{subject?.subject_name}</p>
                                                            </div>
                                                            <div>
                                                                <Label>الصف</Label>
                                                                <p className="mt-1">{classInfo?.grade_level} {classInfo?.grade_number}</p>
                                                            </div>
                                                            <div>
                                                                <Label>الشعبة</Label>
                                                                <p className="mt-1">{assignment.section || 'غير محدد'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {selectedTeacher.assignments.length === 0 && (
                                                <p className="text-center text-muted-foreground py-8">لا توجد تكليفات</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="attendance">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <Calendar className="h-5 w-5" />
                                            <span>سجل الحضور والعمل الإضافي</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {selectedTeacher.attendance.map((record) => (
                                                <div key={record.id} className="border rounded-lg p-4">
                                                    <div className="grid grid-cols-4 gap-4">
                                                        <div>
                                                            <Label>التاريخ</Label>
                                                            <p className="mt-1">{record.attendance_date}</p>
                                                        </div>
                                                        <div>
                                                            <Label>الحصص المحضورة</Label>
                                                            <p className="mt-1">{record.classes_attended}</p>
                                                        </div>
                                                        <div>
                                                            <Label>الحصص الإضافية</Label>
                                                            <p className="mt-1">{record.extra_classes}</p>
                                                        </div>
                                                        <div>
                                                            <Label>الراتب المحسوب</Label>
                                                            <p className="mt-1 font-semibold text-green-600">
                                                                {record.calculated_salary ? formatCurrency(record.calculated_salary) : 'غير محسوب'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedTeacher.attendance.length === 0 && (
                                                <p className="text-center text-muted-foreground py-8">لا يوجد سجل حضور</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="analytics">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    <BookOpen className="h-5 w-5" />
                                                    <span>العبء التدريسي</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-blue-600">{selectedTeacher.subjects.length}</p>
                                                    <p className="text-sm text-muted-foreground">مواد</p>
                                                </div>
                                                <div className="text-center mt-2">
                                                    <p className="text-2xl font-bold text-green-600">{selectedTeacher.assignments.length}</p>
                                                    <p className="text-sm text-muted-foreground">صفوف</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    <Calendar className="h-5 w-5" />
                                                    <span>الحضور</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-orange-600">
                                                        {selectedTeacher.attendance.reduce((sum, record) => sum + record.classes_attended, 0)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">حصص محضورة</p>
                                                </div>
                                                <div className="text-center mt-2">
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        {selectedTeacher.attendance.reduce((sum, record) => sum + record.extra_classes, 0)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">حصص إضافية</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    <Calculator className="h-5 w-5" />
                                                    <span>الراتب المحسوب</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {formatCurrency(
                                                            selectedTeacher.attendance.reduce((sum, record) => sum + (record.calculated_salary || 0), 0)
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">إجمالي الراتب</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            )}

            {/* Edit Teacher Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {teacherToEdit && (
                        <TeacherEditForm 
                            teacher={teacherToEdit} 
                            onSuccess={handleEditSuccess}
                            onCancel={() => setIsEditDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Deactivate Teacher Dialog */}
            <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد تعطيل المعلم</DialogTitle>
                    </DialogHeader>
                    {teacherToDeactivate && (
                        <div className="py-4">
                            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                                <div>
                                    <p className="font-medium text-yellow-800">هل أنت متأكد من رغبتك في تعطيل المعلم؟</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        سيتم تعطيل المعلم: <span className="font-semibold">{teacherToDeactivate.full_name}</span>
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                ملاحظة: تعطيل المعلم يعني أنه لن يظهر في القوائم الافتراضية، لكن بياناته ستحتفظ بها في النظام.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button variant="destructive" onClick={confirmDeactivateTeacher}>
                            تأكيد التعطيل
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ComprehensiveTeacherManagementPage;