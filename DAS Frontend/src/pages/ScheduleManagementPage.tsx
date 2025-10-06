import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import {
    Calendar,
    Clock,
    Users,
    Settings,
    Play,
    Download,
    Eye,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    RotateCcw,
    FileText,
    Filter,
    Loader2
} from 'lucide-react';
import { schedulesApi } from '@/services/api';
import { Schedule, ScheduleConstraint } from '@/types/school';

interface ScheduleInfo {
    id: number;
    class_name: string;
    section: string;
    session_type: 'morning' | 'evening';
    status: 'generated' | 'partial' | 'failed' | 'pending';
    completion_rate: number;
    conflicts: number;
    last_generated: string;
    total_periods: number;
    assigned_periods: number;
}

interface ScheduleConflict {
    id: number;
    type: 'teacher_conflict' | 'room_conflict' | 'constraint_violation';
    description: string;
    affected_classes: string[];
    severity: 'high' | 'medium' | 'low';
    suggested_solution: string;
}

export const ScheduleManagementPage: React.FC = () => {
    const [schedules, setSchedules] = useState<ScheduleInfo[]>([]);
    const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
    const [constraints, setConstraints] = useState<ScheduleConstraint[]>([]);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [selectedSession, setSelectedSession] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [academicYearId, setAcademicYearId] = useState<number>(1); // Default to 1, should be dynamic

    // Fetch schedules, conflicts, and constraints when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch schedules
                const schedulesResponse = await schedulesApi.getAll({ academic_year_id: academicYearId });
                // Transform API response to match our UI structure
                const transformedSchedules: ScheduleInfo[] = (schedulesResponse.data || []).map((schedule: any) => ({
                    id: schedule.id,
                    class_name: `الصف ${schedule.class_id}`, // This should be mapped properly
                    section: schedule.section || 'أ',
                    session_type: schedule.session_type,
                    status: 'generated', // This should come from the API
                    completion_rate: 100, // This should come from the API
                    conflicts: 0, // This should come from the API
                    last_generated: schedule.created_at || new Date().toISOString(),
                    total_periods: 30, // This should come from the API
                    assigned_periods: 30 // This should come from the API
                }));
                setSchedules(transformedSchedules);

                // Fetch conflicts
                const conflictsResponse = await schedulesApi.analyzeConflicts(academicYearId, 'morning');
                // Transform API response to match our UI structure
                const transformedConflicts: ScheduleConflict[] = (conflictsResponse.data?.conflicts || []).map((conflict: any, index: number) => ({
                    id: index + 1,
                    type: 'constraint_violation', // This should come from the API
                    description: conflict.description,
                    affected_classes: conflict.affected_items || [],
                    severity: conflict.severity || 'medium',
                    suggested_solution: conflict.suggestion || 'حل التعارض حسب الاقتراح'
                }));
                setConflicts(transformedConflicts);

                // Fetch constraints
                const constraintsResponse = await schedulesApi.getConstraints(academicYearId);
                setConstraints(constraintsResponse.data || []);
            } catch (error: any) {
                console.error('Error fetching schedule data:', error);
                toast({
                    title: "خطأ في تحميل البيانات",
                    description: error.message || "حدث خطأ أثناء تحميل بيانات الجداول",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [academicYearId]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'generated':
                return <Badge className="bg-green-100 text-green-800">مُنشأ</Badge>;
            case 'partial':
                return <Badge className="bg-yellow-100 text-yellow-800">جزئي</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800">فشل</Badge>;
            case 'pending':
                return <Badge className="bg-gray-100 text-gray-800">معلق</Badge>;
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
            default:
                return <Badge variant="secondary">غير محدد</Badge>;
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'high':
                return <Badge className="bg-red-100 text-red-800">عالية</Badge>;
            case 'medium':
                return <Badge className="bg-yellow-100 text-yellow-800">متوسطة</Badge>;
            case 'low':
                return <Badge className="bg-blue-100 text-blue-800">منخفضة</Badge>;
            default:
                return <Badge variant="secondary">غير محدد</Badge>;
        }
    };

    const filteredSchedules = schedules.filter(schedule => {
        const matchesSession = selectedSession === 'all' || schedule.session_type === selectedSession;
        const matchesStatus = selectedStatus === 'all' || schedule.status === selectedStatus;
        return matchesSession && matchesStatus;
    });

    const getScheduleStats = () => {
        const total = schedules.length;
        const generated = schedules.filter(s => s.status === 'generated').length;
        const partial = schedules.filter(s => s.status === 'partial').length;
        const failed = schedules.filter(s => s.status === 'failed').length;
        const totalConflicts = schedules.reduce((sum, s) => sum + s.conflicts, 0);
        const averageCompletion = total > 0 ? schedules.reduce((sum, s) => sum + s.completion_rate, 0) / total : 0;

        return { total, generated, partial, failed, totalConflicts, averageCompletion };
    };

    const stats = getScheduleStats();

    const handleGenerateSchedules = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        try {
            // Call the backend API to generate schedules
            const response = await schedulesApi.create({
                academic_year_id: academicYearId,
                session_type: 'morning' // This should be dynamic
                // Add other required fields as needed
            });

            if (response.success && response.data) {
                // Simulate schedule generation process
                const interval = setInterval(() => {
                    setGenerationProgress(prev => {
                        if (prev >= 100) {
                            clearInterval(interval);
                            setIsGenerating(false);
                            // Refresh the schedules data
                            // fetchData(); // This would refresh the data
                            return 100;
                        }
                        return prev + 10;
                    });
                }, 500);

                toast({
                    title: "تم إنشاء الجداول بنجاح",
                    description: "تم إنشاء جداول الصفوف بنجاح",
                });
            } else {
                throw new Error(response.message || 'فشل في إنشاء الجداول');
            }
        } catch (error: any) {
            console.error('Error generating schedules:', error);
            toast({
                title: "خطأ في إنشاء الجداول",
                description: error.message || "حدث خطأ أثناء إنشاء الجداول",
                variant: "destructive"
            });
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">إدارة الجداول الدراسية</h1>
                    <p className="text-muted-foreground">
                        إنشاء ومراجعة وإدارة الجداول الدراسية للصفوف
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open('/schedules/constraints', '_blank')}
                    >
                        <Settings className="h-4 w-4" />
                        إدارة القيود
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={handleGenerateSchedules}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <RotateCcw className="h-4 w-4 animate-spin" />
                                جاري الإنشاء...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                إنشاء الجداول
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>إنشاء الجداول الدراسية</span>
                                <span>{generationProgress}%</span>
                            </div>
                            <Progress value={generationProgress} className="w-full" />
                            <p className="text-sm text-muted-foreground">
                                جاري معالجة الصفوف والقيود وإنشاء الجداول المحسّنة...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي الجداول</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.generated} مُنشأ، {stats.partial} جزئي
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">معدل الإنجاز</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.averageCompletion.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">متوسط إنجاز الجداول</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">التعارضات</p>
                                <p className="text-2xl font-bold text-red-600">{stats.totalConflicts}</p>
                                <p className="text-xs text-muted-foreground">تعارضات نشطة</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">الجداول الفاشلة</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.failed}</p>
                                <p className="text-xs text-muted-foreground">تحتاج مراجعة</p>
                            </div>
                            <XCircle className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="schedules" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="schedules">الجداول</TabsTrigger>
                    <TabsTrigger value="conflicts">التعارضات</TabsTrigger>
                    <TabsTrigger value="export">التصدير</TabsTrigger>
                </TabsList>

                <TabsContent value="schedules" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">التصفية:</span>
                                </div>
                                <Select value={selectedSession} onValueChange={setSelectedSession}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">جميع الجلسات</SelectItem>
                                        <SelectItem value="morning">صباحي</SelectItem>
                                        <SelectItem value="evening">مسائي</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">جميع الحالات</SelectItem>
                                        <SelectItem value="generated">مُنشأ</SelectItem>
                                        <SelectItem value="partial">جزئي</SelectItem>
                                        <SelectItem value="failed">فشل</SelectItem>
                                        <SelectItem value="pending">معلق</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Schedules Grid */}
                    {!loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSchedules.map((schedule) => (
                                <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg">{schedule.class_name} - {schedule.section}</CardTitle>
                                            {getStatusBadge(schedule.status)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getSessionBadge(schedule.session_type)}
                                            <Badge variant="outline" className="text-xs">
                                                آخر تحديث: {new Date(schedule.last_generated).toLocaleDateString('ar-IQ')}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Progress */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>نسبة الإنجاز</span>
                                                <span>{schedule.completion_rate}%</span>
                                            </div>
                                            <Progress value={schedule.completion_rate} className="w-full" />
                                            <div className="text-xs text-muted-foreground">
                                                {schedule.assigned_periods} من {schedule.total_periods} حصة
                                            </div>
                                        </div>

                                        {/* Conflicts */}
                                        {schedule.conflicts > 0 && (
                                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                <span className="text-sm text-red-700">
                                                    {schedule.conflicts} تعارض يحتاج حل
                                                </span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2 border-t">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="h-4 w-4 ml-1" />
                                                عرض
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Download className="h-4 w-4 ml-1" />
                                                تصدير
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="conflicts" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                التعارضات والمشاكل
                            </CardTitle>
                            <CardDescription>
                                مراجعة وحل التعارضات في الجداول الدراسية
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {conflicts.map((conflict) => (
                                        <div key={conflict.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                                        <span className="font-medium">{conflict.description}</span>
                                                        {getSeverityBadge(conflict.severity)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mb-2">
                                                        الصفوف المتأثرة: {conflict.affected_classes.join(', ')}
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">الحل المقترح: </span>
                                                        {conflict.suggested_solution}
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    حل
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {conflicts.length === 0 && (
                                        <div className="text-center py-8 text-green-600">
                                            <CheckCircle2 className="h-12 w-12 mx-auto mb-3" />
                                            <p className="font-medium">لا توجد تعارضات!</p>
                                            <p className="text-sm">جميع الجداول تم إنشاؤها بنجاح</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="export" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    تصدير PDF
                                </CardTitle>
                                <CardDescription>
                                    تصدير الجداول بصيغة PDF للطباعة
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full gap-2">
                                    <Download className="h-4 w-4" />
                                    تصدير PDF
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    تصدير Excel
                                </CardTitle>
                                <CardDescription>
                                    تصدير الجداول بصيغة Excel للتعديل
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full gap-2">
                                    <Download className="h-4 w-4" />
                                    تصدير Excel
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    تصدير تقويم
                                </CardTitle>
                                <CardDescription>
                                    تصدير للتقاويم الرقمية (Google Calendar)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full gap-2">
                                    <Download className="h-4 w-4" />
                                    تصدير تقويم
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ScheduleManagementPage;