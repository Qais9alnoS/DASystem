import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { activitiesApi, academicYearsApi } from '@/services/api';
import { Activity, AcademicYear, ActivityRegistration, ActivityAttendance, ActivitySchedule } from '@/types/school';
import { ActivityParticipantsManager } from '@/components/activities';
import { 
  Trophy, Calendar, Users, Plus, Edit, Eye, DollarSign, Search, Loader2, Save, X, UserPlus,
  CalendarClock, CheckCircle, Clock, UserCheck, BookOpen, MapPin, User
} from 'lucide-react';

export const ActivitiesManagementPage: React.FC = () => {
    const { toast } = useToast();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    
    // New states for registration, attendance, and scheduling
    const [registrations, setRegistrations] = useState<ActivityRegistration[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<ActivityAttendance[]>([]);
    const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
    const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
    const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    
    // Form state for new activity
    const [newActivity, setNewActivity] = useState({
        name: '',
        description: '',
        activity_type: 'academic' as 'academic' | 'sports' | 'cultural' | 'social' | 'trip',
        session_type: 'morning' as 'morning' | 'evening' | 'both',
        target_grades: [] as string[],
        max_participants: undefined as number | undefined,
        cost_per_student: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
        registration_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        location: '',
        instructor_name: '',
        requirements: '',
        is_active: true,
        academic_year_id: 1
    });

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch academic years
                const yearsResponse = await academicYearsApi.getAll();
                if (yearsResponse.success && yearsResponse.data) {
                    setAcademicYears(yearsResponse.data);
                    // Set default to the first active academic year
                    const activeYear = yearsResponse.data.find(year => year.is_active) || yearsResponse.data[0];
                    if (activeYear) {
                        setSelectedAcademicYear(activeYear.id || null);
                        setNewActivity(prev => ({ ...prev, academic_year_id: activeYear.id || 1 }));
                    }
                }

                // Fetch activities
                await fetchActivities();
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
    }, []);

    // Fetch activities when academic year changes
    useEffect(() => {
        if (selectedAcademicYear) {
            fetchActivities();
        }
    }, [selectedAcademicYear]);

    const fetchActivities = async () => {
        if (!selectedAcademicYear) return;
        
        try {
            const response = await activitiesApi.getAll({ academic_year_id: selectedAcademicYear });
            if (response.success && response.data) {
                setActivities(response.data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast({
                title: "خطأ",
                description: "فشل في تحميل الأنشطة",
                variant: "destructive"
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'academic':
                return <Badge className="bg-blue-100 text-blue-800">أكاديمي</Badge>;
            case 'sports':
                return <Badge className="bg-green-100 text-green-800">رياضي</Badge>;
            case 'cultural':
                return <Badge className="bg-purple-100 text-purple-800">ثقافي</Badge>;
            case 'social':
                return <Badge className="bg-orange-100 text-orange-800">اجتماعي</Badge>;
            case 'trip':
                return <Badge className="bg-teal-100 text-teal-800">رحلة</Badge>;
            default:
                return <Badge variant="secondary">غير محدد</Badge>;
        }
    };

    const getSessionBadge = (session: string) => {
        switch (session) {
            case 'morning':
                return <Badge variant="outline" className="text-orange-600">صباحي</Badge>;
            case 'evening':
                return <Badge variant="outline" className="text-purple-600">مسائي</Badge>;
            case 'both':
                return <Badge variant="outline" className="text-blue-600">كلاهما</Badge>;
            default:
                return <Badge variant="secondary">غير محدد</Badge>;
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? 
            <Badge className="bg-green-100 text-green-800">نشط</Badge> :
            <Badge className="bg-red-100 text-red-800">غير نشط</Badge>;
    };

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || activity.activity_type === typeFilter;
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && activity.is_active) ||
            (statusFilter === 'inactive' && !activity.is_active);
        return matchesSearch && matchesType && matchesStatus;
    });

    const getActivityStats = () => {
        const total = activities.length;
        const active = activities.filter(a => a.is_active).length;
        const totalParticipants = activities.reduce((sum, a) => sum + (a.current_participants || 0), 0);
        const totalCost = activities.reduce((sum, a) => sum + (a.cost_per_student * (a.current_participants || 0)), 0);
        return { total, active, totalParticipants, totalCost };
    };

    const stats = getActivityStats();

    const handleAddActivity = async () => {
        if (!newActivity.name.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال اسم النشاط",
                variant: "destructive"
            });
            return;
        }

        try {
            // Prepare activity data for submission
            const activityData: any = {
                academic_year_id: selectedAcademicYear || newActivity.academic_year_id,
                name: newActivity.name,
                description: newActivity.description,
                activity_type: newActivity.activity_type,
                session_type: newActivity.session_type,
                target_grades: newActivity.target_grades.length > 0 ? newActivity.target_grades : [],
                cost_per_student: newActivity.cost_per_student,
                start_date: newActivity.start_date,
                end_date: newActivity.end_date,
                registration_deadline: newActivity.registration_deadline,
                location: newActivity.location,
                instructor_name: newActivity.instructor_name,
                requirements: newActivity.requirements,
                is_active: newActivity.is_active
            };

            // Add optional fields only if they have values
            if (newActivity.max_participants !== undefined) {
                activityData.max_participants = newActivity.max_participants;
            }

            const response = await activitiesApi.create(activityData);
            
            if (response.success && response.data) {
                setActivities([...activities, response.data]);
                toast({
                    title: "نجاح",
                    description: "تم إضافة النشاط بنجاح",
                    variant: "default"
                });
                
                // Reset form
                setNewActivity({
                    name: '',
                    description: '',
                    activity_type: 'academic',
                    session_type: 'morning',
                    target_grades: [],
                    max_participants: undefined,
                    cost_per_student: 0,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    registration_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    location: '',
                    instructor_name: '',
                    requirements: '',
                    is_active: true,
                    academic_year_id: selectedAcademicYear || 1
                });
                setIsAddDialogOpen(false);
            } else {
                throw new Error(response.message || 'فشل في إضافة النشاط');
            }
        } catch (error) {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة النشاط',
                variant: "destructive"
            });
        }
    };

    const handleEditActivity = (activity: Activity) => {
        setEditingActivity(activity);
        setIsEditDialogOpen(true);
    };

    const handleUpdateActivity = async () => {
        if (!editingActivity) return;

        if (!editingActivity.name.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال اسم النشاط",
                variant: "destructive"
            });
            return;
        }

        try {
            if (!editingActivity.id) {
                throw new Error('معرف النشاط مفقود');
            }

            const response = await activitiesApi.update(editingActivity.id, {
                name: editingActivity.name,
                description: editingActivity.description,
                activity_type: editingActivity.activity_type,
                session_type: editingActivity.session_type,
                target_grades: editingActivity.target_grades,
                max_participants: editingActivity.max_participants,
                cost_per_student: editingActivity.cost_per_student,
                start_date: editingActivity.start_date,
                end_date: editingActivity.end_date,
                registration_deadline: editingActivity.registration_deadline,
                location: editingActivity.location,
                instructor_name: editingActivity.instructor_name,
                requirements: editingActivity.requirements,
                is_active: editingActivity.is_active
            });

            if (response.success && response.data) {
                setActivities(activities.map(activity => 
                    activity.id === editingActivity.id ? response.data! : activity
                ));
                toast({
                    title: "نجاح",
                    description: "تم تحديث النشاط بنجاح",
                    variant: "default"
                });
                setIsEditDialogOpen(false);
                setEditingActivity(null);
            } else {
                throw new Error(response.message || 'فشل في تحديث النشاط');
            }
        } catch (error) {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث النشاط',
                variant: "destructive"
            });
        }
    };

    const handleManageParticipants = (activityId: number) => {
        setSelectedActivityId(activityId);
        setIsParticipantsDialogOpen(true);
    };

    const handleManageRegistrations = async (activityId: number) => {
        setSelectedActivityId(activityId);
        try {
            const response = await activitiesApi.getRegistrations(activityId);
            if (response.success && response.data) {
                setRegistrations(response.data);
            }
            setIsRegistrationDialogOpen(true);
        } catch (error) {
            toast({
                title: "خطأ",
                description: "فشل في تحميل تسجيلات النشاط",
                variant: "destructive"
            });
        }
    };

    const handleManageAttendance = async (activityId: number) => {
        setSelectedActivityId(activityId);
        try {
            const response = await activitiesApi.getAttendance(activityId);
            if (response.success && response.data) {
                setAttendanceRecords(response.data);
            }
            setIsAttendanceDialogOpen(true);
        } catch (error) {
            toast({
                title: "خطأ",
                description: "فشل في تحميل سجل الحضور",
                variant: "destructive"
            });
        }
    };

    const handleManageSchedule = async (activityId: number) => {
        setSelectedActivityId(activityId);
        try {
            const response = await activitiesApi.getSchedule(activityId);
            if (response.success && response.data) {
                setSchedules(response.data);
            }
            setIsScheduleDialogOpen(true);
        } catch (error) {
            toast({
                title: "خطأ",
                description: "فشل في تحميل جدول النشاط",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">إدارة الأنشطة</h1>
                    <p className="text-muted-foreground">
                        تنظيم ومتابعة الأنشطة المدرسية ومشاركة الطلاب
                    </p>
                </div>
                <div className="flex gap-2">
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
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                إضافة نشاط جديد
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md" dir="rtl">
                            <DialogHeader>
                                <DialogTitle>إضافة نشاط جديد</DialogTitle>
                                <DialogDescription>إضافة نشاط مدرسي جديد</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                <Input 
                                    placeholder="اسم النشاط" 
                                    value={newActivity.name}
                                    onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                                />
                                <Textarea
                                    placeholder="الوصف"
                                    value={newActivity.description || ''}
                                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                                />
                                <Select 
                                    value={newActivity.activity_type}
                                    onValueChange={(value: 'academic' | 'sports' | 'cultural' | 'social' | 'trip') => 
                                        setNewActivity({...newActivity, activity_type: value})
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر نوع النشاط" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="academic">أكاديمي</SelectItem>
                                        <SelectItem value="sports">رياضي</SelectItem>
                                        <SelectItem value="cultural">ثقافي</SelectItem>
                                        <SelectItem value="social">اجتماعي</SelectItem>
                                        <SelectItem value="trip">رحلة</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select 
                                    value={newActivity.session_type}
                                    onValueChange={(value: 'morning' | 'evening' | 'both') => 
                                        setNewActivity({...newActivity, session_type: value})
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الجلسة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="morning">صباحي</SelectItem>
                                        <SelectItem value="evening">مسائي</SelectItem>
                                        <SelectItem value="both">كلاهما</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input 
                                    type="number" 
                                    placeholder="التكلفة لكل طالب"
                                    value={newActivity.cost_per_student || ''}
                                    onChange={(e) => setNewActivity({...newActivity, cost_per_student: parseFloat(e.target.value) || 0})}
                                />
                                <Input 
                                    type="number" 
                                    placeholder="أقصى عدد مشاركين (اختياري)"
                                    value={newActivity.max_participants || ''}
                                    onChange={(e) => setNewActivity({...newActivity, max_participants: parseInt(e.target.value) || undefined})}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input 
                                        type="date" 
                                        value={newActivity.start_date}
                                        onChange={(e) => setNewActivity({...newActivity, start_date: e.target.value})}
                                    />
                                    <Input 
                                        type="date" 
                                        value={newActivity.end_date}
                                        onChange={(e) => setNewActivity({...newActivity, end_date: e.target.value})}
                                    />
                                </div>
                                <Input 
                                    type="date" 
                                    value={newActivity.registration_deadline}
                                    onChange={(e) => setNewActivity({...newActivity, registration_deadline: e.target.value})}
                                />
                                <Input 
                                    placeholder="المكان (اختياري)"
                                    value={newActivity.location || ''}
                                    onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                                />
                                <Input 
                                    placeholder="اسم المدرب (اختياري)"
                                    value={newActivity.instructor_name || ''}
                                    onChange={(e) => setNewActivity({...newActivity, instructor_name: e.target.value})}
                                />
                                <Textarea
                                    placeholder="المتطلبات (اختياري)"
                                    value={newActivity.requirements || ''}
                                    onChange={(e) => setNewActivity({...newActivity, requirements: e.target.value})}
                                />
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={newActivity.is_active}
                                        onChange={(e) => setNewActivity({...newActivity, is_active: e.target.checked})}
                                        className="rounded"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        النشاط نشط
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAddActivity}>إضافة</Button>
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي الأنشطة</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Trophy className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">الأنشطة النشطة</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي المشاركين</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalParticipants}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي التكاليف</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalCost)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث في الأنشطة..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10"
                                />
                            </div>
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="نوع النشاط" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الأنواع</SelectItem>
                                <SelectItem value="academic">أكاديمي</SelectItem>
                                <SelectItem value="sports">رياضي</SelectItem>
                                <SelectItem value="cultural">ثقافي</SelectItem>
                                <SelectItem value="social">اجتماعي</SelectItem>
                                <SelectItem value="trip">رحلة</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الحالات</SelectItem>
                                <SelectItem value="active">نشط</SelectItem>
                                <SelectItem value="inactive">غير نشط</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map((activity) => (
                    <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg leading-tight">{activity.name}</CardTitle>
                                {getStatusBadge(activity.is_active)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(activity.start_date).toLocaleDateString('ar-IQ')}
                                {getTypeBadge(activity.activity_type)}
                                {getSessionBadge(activity.session_type)}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                                <div>
                                    <span className="font-medium">المشاركون:</span>
                                    <div className="text-blue-600 font-bold">{activity.current_participants || 0}</div>
                                </div>
                                <div>
                                    <span className="font-medium">التكلفة:</span>
                                    <div className="text-red-600 font-bold">{formatCurrency(activity.cost_per_student)}</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleManageParticipants(activity.id!)}
                                >
                                    <UserPlus className="h-4 w-4 ml-1" />
                                    مشاركون
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleManageRegistrations(activity.id!)}
                                >
                                    <BookOpen className="h-4 w-4 ml-1" />
                                    تسجيل
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleManageAttendance(activity.id!)}
                                >
                                    <UserCheck className="h-4 w-4 ml-1" />
                                    حضور
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleManageSchedule(activity.id!)}
                                >
                                    <CalendarClock className="h-4 w-4 ml-1" />
                                    جدول
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleEditActivity(activity)}
                                >
                                    <Edit className="h-4 w-4 ml-1" />
                                    تعديل
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Activity Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) setEditingActivity(null);
            }}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل النشاط</DialogTitle>
                        <DialogDescription>تعديل تفاصيل النشاط</DialogDescription>
                    </DialogHeader>
                    {editingActivity && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <Input 
                                placeholder="اسم النشاط" 
                                value={editingActivity.name}
                                onChange={(e) => setEditingActivity({...editingActivity, name: e.target.value})}
                            />
                            <Textarea
                                placeholder="الوصف"
                                value={editingActivity.description || ''}
                                onChange={(e) => setEditingActivity({...editingActivity, description: e.target.value})}
                            />
                            <Select 
                                value={editingActivity.activity_type}
                                onValueChange={(value: 'academic' | 'sports' | 'cultural' | 'social' | 'trip') => 
                                    setEditingActivity({...editingActivity, activity_type: value})
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر نوع النشاط" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="academic">أكاديمي</SelectItem>
                                    <SelectItem value="sports">رياضي</SelectItem>
                                    <SelectItem value="cultural">ثقافي</SelectItem>
                                    <SelectItem value="social">اجتماعي</SelectItem>
                                    <SelectItem value="trip">رحلة</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select 
                                value={editingActivity.session_type}
                                onValueChange={(value: 'morning' | 'evening' | 'both') => 
                                    setEditingActivity({...editingActivity, session_type: value})
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الجلسة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">صباحي</SelectItem>
                                    <SelectItem value="evening">مسائي</SelectItem>
                                    <SelectItem value="both">كلاهما</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input 
                                type="number" 
                                placeholder="التكلفة لكل طالب"
                                value={editingActivity.cost_per_student || ''}
                                onChange={(e) => setEditingActivity({...editingActivity, cost_per_student: parseFloat(e.target.value) || 0})}
                            />
                            <Input 
                                type="number" 
                                placeholder="أقصى عدد مشاركين (اختياري)"
                                value={editingActivity.max_participants || ''}
                                onChange={(e) => setEditingActivity({...editingActivity, max_participants: parseInt(e.target.value) || undefined})}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input 
                                    type="date" 
                                    value={editingActivity.start_date}
                                    onChange={(e) => setEditingActivity({...editingActivity, start_date: e.target.value})}
                                />
                                <Input 
                                    type="date" 
                                    value={editingActivity.end_date}
                                    onChange={(e) => setEditingActivity({...editingActivity, end_date: e.target.value})}
                                />
                            </div>
                            <Input 
                                type="date" 
                                value={editingActivity.registration_deadline || ''}
                                onChange={(e) => setEditingActivity({...editingActivity, registration_deadline: e.target.value})}
                            />
                            <Input 
                                placeholder="المكان (اختياري)"
                                value={editingActivity.location || ''}
                                onChange={(e) => setEditingActivity({...editingActivity, location: e.target.value})}
                            />
                            <Input 
                                placeholder="اسم المدرب (اختياري)"
                                value={editingActivity.instructor_name || ''}
                                onChange={(e) => setEditingActivity({...editingActivity, instructor_name: e.target.value})}
                            />
                            <Textarea
                                placeholder="المتطلبات (اختياري)"
                                value={editingActivity.requirements || ''}
                                onChange={(e) => setEditingActivity({...editingActivity, requirements: e.target.value})}
                            />
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit_is_active"
                                    checked={editingActivity.is_active}
                                    onChange={(e) => setEditingActivity({...editingActivity, is_active: e.target.checked})}
                                    className="rounded"
                                />
                                <label htmlFor="edit_is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    النشاط نشط
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleUpdateActivity} className="flex items-center">
                                    <Save className="h-4 w-4 ml-1" />
                                    حفظ
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setEditingActivity(null);
                                    }}
                                    className="flex items-center"
                                >
                                    <X className="h-4 w-4 ml-1" />
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Participants Management Dialog */}
            <Dialog open={isParticipantsDialogOpen} onOpenChange={(open) => {
                setIsParticipantsDialogOpen(open);
                if (!open) setSelectedActivityId(null);
            }}>
                <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>إدارة مشاركي النشاط</DialogTitle>
                        <DialogDescription>إضافة وإدارة المشاركين في النشاط</DialogDescription>
                    </DialogHeader>
                    {selectedActivityId && (
                        <ActivityParticipantsManager 
                            activityId={selectedActivityId} 
                            onClose={() => {
                                setIsParticipantsDialogOpen(false);
                                setSelectedActivityId(null);
                            }} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Registration Management Dialog */}
            <Dialog open={isRegistrationDialogOpen} onOpenChange={(open) => {
                setIsRegistrationDialogOpen(open);
                if (!open) {
                    setSelectedActivityId(null);
                    setRegistrations([]);
                }
            }}>
                <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>إدارة تسجيلات النشاط</DialogTitle>
                        <DialogDescription>عرض وإدارة تسجيلات الطلاب في النشاط</DialogDescription>
                    </DialogHeader>
                    {selectedActivityId && (
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">إحصائيات التسجيل</h3>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold">{registrations.length}</p>
                                        <p className="text-sm text-muted-foreground">إجمالي التسجيلات</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {registrations.filter(r => r.payment_status === 'paid').length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">مدفوع</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {registrations.filter(r => r.payment_status === 'pending').length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">معلق</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">قائمة التسجيلات</h3>
                                {registrations.length > 0 ? (
                                    <div className="space-y-3">
                                        {registrations.map((registration) => (
                                            <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{registration.student_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        تاريخ التسجيل: {new Date(registration.registration_date).toLocaleDateString('ar-IQ')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={registration.payment_status === 'paid' ? 'default' : 'secondary'}>
                                                        {registration.payment_status === 'paid' ? 'مدفوع' : 
                                                         registration.payment_status === 'pending' ? 'معلق' : 'ملغى'}
                                                    </Badge>
                                                    <span className="font-medium">{formatCurrency(registration.payment_amount)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <BookOpen className="h-12 w-12 mx-auto mb-4" />
                                        <p>لا توجد تسجيلات للنشاط</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end">
                                <Button onClick={() => setIsRegistrationDialogOpen(false)}>
                                    إغلاق
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Attendance Management Dialog */}
            <Dialog open={isAttendanceDialogOpen} onOpenChange={(open) => {
                setIsAttendanceDialogOpen(open);
                if (!open) {
                    setSelectedActivityId(null);
                    setAttendanceRecords([]);
                }
            }}>
                <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>إدارة حضور النشاط</DialogTitle>
                        <DialogDescription>تسجيل ومتابعة حضور الطلاب في النشاط</DialogDescription>
                    </DialogHeader>
                    {selectedActivityId && (
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">إحصائيات الحضور</h3>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold">{attendanceRecords.length}</p>
                                        <p className="text-sm text-muted-foreground">إجمالي الجلسات</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {attendanceRecords.filter(a => a.status === 'present').length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">حاضر</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-600">
                                            {attendanceRecords.filter(a => a.status === 'absent').length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">غائب</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">سجل الحضور</h3>
                                {attendanceRecords.length > 0 ? (
                                    <div className="space-y-3">
                                        {attendanceRecords.map((attendance) => (
                                            <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{attendance.student_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        تاريخ الحضور: {new Date(attendance.attendance_date).toLocaleDateString('ar-IQ')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={attendance.status === 'present' ? 'default' : 'destructive'}>
                                                        {attendance.status === 'present' ? 'حاضر' : 
                                                         attendance.status === 'absent' ? 'غائب' : 'معذور'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <UserCheck className="h-12 w-12 mx-auto mb-4" />
                                        <p>لا توجد سجلات حضور للنشاط</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end">
                                <Button onClick={() => setIsAttendanceDialogOpen(false)}>
                                    إغلاق
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Schedule Management Dialog */}
            <Dialog open={isScheduleDialogOpen} onOpenChange={(open) => {
                setIsScheduleDialogOpen(open);
                if (!open) {
                    setSelectedActivityId(null);
                    setSchedules([]);
                }
            }}>
                <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>إدارة جدول النشاط</DialogTitle>
                        <DialogDescription>عرض وإدارة جدول أوقات النشاط</DialogDescription>
                    </DialogHeader>
                    {selectedActivityId && (
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">جدول النشاط</h3>
                                {schedules.length > 0 ? (
                                    <div className="space-y-3">
                                        {schedules.map((schedule) => (
                                            <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{schedule.day_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {schedule.start_time} - {schedule.end_time}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{schedule.location}</p>
                                                    <p className="text-sm text-muted-foreground">{schedule.instructor_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CalendarClock className="h-12 w-12 mx-auto mb-4" />
                                        <p>لا توجد جداول للنشاط</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end">
                                <Button onClick={() => setIsScheduleDialogOpen(false)}>
                                    إغلاق
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ActivitiesManagementPage;