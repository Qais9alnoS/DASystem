import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    Plus,
    Edit,
    Ban,
    CheckCircle,
    Layers,
    Settings,
    Calendar,
    Clock,
    Star,
    Trash2,
    Loader2
} from 'lucide-react';
import { schedulesApi } from '@/services/api';
import { ScheduleConstraint } from '@/types/school';

interface ConstraintTemplate {
    id: number;
    template_name: string;
    template_description: string;
    constraint_config: Partial<ScheduleConstraint>;
    is_system_template: boolean;
    usage_count: number;
    created_at: string;
}

const AdvancedScheduleConstraintsPage: React.FC = () => {
    const [constraints, setConstraints] = useState<ScheduleConstraint[]>([]);
    const [templates, setTemplates] = useState<ConstraintTemplate[]>([]);
    const [activeTab, setActiveTab] = useState<string>('constraints');
    const [showConstraintDialog, setShowConstraintDialog] = useState(false);
    const [editingConstraint, setEditingConstraint] = useState<ScheduleConstraint | null>(null);
    const [constraintForm, setConstraintForm] = useState<Partial<ScheduleConstraint>>({
        constraint_type: 'forbidden',
        session_type: 'both',
        priority_level: 2,
        description: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [academicYearId, setAcademicYearId] = useState<number>(1); // Default to 1, should be dynamic

    // Fetch constraints and templates when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch constraints
                const constraintsResponse = await schedulesApi.getConstraints(academicYearId);
                setConstraints(constraintsResponse.data || []);

                // Fetch constraint templates
                const templatesResponse = await schedulesApi.getConstraintTemplates();
                if (templatesResponse.success && templatesResponse.data) {
                    // Add usage_count property for UI display (not part of the API response)
                    const templatesWithUsage: any[] = templatesResponse.data.map(template => ({
                        ...template,
                        usage_count: 0 // This would need to be tracked separately or added to the backend
                    }));
                    setTemplates(templatesWithUsage);
                }
            } catch (error: any) {
                console.error('Error fetching constraints data:', error);
                toast({
                    title: "خطأ في تحميل البيانات",
                    description: error.message || "حدث خطأ أثناء تحميل بيانات القيود",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [academicYearId]);

    const getConstraintTypeIcon = (type: string) => {
        switch (type) {
            case 'forbidden': return <Ban className="h-4 w-4 text-red-500" />;
            case 'required': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'max_consecutive': return <Layers className="h-4 w-4 text-orange-500" />;
            default: return <Settings className="h-4 w-4" />;
        }
    };

    const getConstraintTypeName = (type: string) => {
        switch (type) {
            case 'forbidden': return 'ممنوع';
            case 'required': return 'مطلوب';
            case 'max_consecutive': return 'حد أقصى متتالي';
            default: return 'غير محدد';
        }
    };

    const getPriorityBadge = (level: number) => {
        const colors = {
            1: 'bg-gray-100 text-gray-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-orange-100 text-orange-800',
            4: 'bg-red-100 text-red-800'
        };
        const labels = {
            1: 'منخفض',
            2: 'متوسط',
            3: 'عالي',
            4: 'حرج'
        };
        return (
            <Badge className={cn('text-xs', colors[level as keyof typeof colors])}>
                {labels[level as keyof typeof labels]}
            </Badge>
        );
    };

    const getDayName = (day: number) => {
        const days = {
            1: 'الاثنين',
            2: 'الثلاثاء',
            3: 'الأربعاء',
            4: 'الخميس',
            5: 'الجمعة'
        };
        return days[day as keyof typeof days] || 'غير محدد';
    };

    const addConstraint = async () => {
        if (!constraintForm.description?.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال وصف القيد",
                variant: "destructive"
            });
            return;
        }

        try {
            if (editingConstraint) {
                // Update existing constraint
                const response = await schedulesApi.updateConstraint(editingConstraint.id!, {
                    ...constraintForm,
                    academic_year_id: academicYearId
                });
                
                if (response.success && response.data) {
                    setConstraints(constraints.map(c => c.id === editingConstraint.id ? response.data! : c));
                    toast({
                        title: "تم تحديث القيد بنجاح",
                        description: `تم تحديث القيد: ${response.data.description}`
                    });
                } else {
                    throw new Error(response.message || 'فشل في تحديث القيد');
                }
            } else {
                // Create new constraint
                const response = await schedulesApi.createConstraint({
                    ...constraintForm,
                    academic_year_id: academicYearId
                } as ScheduleConstraint);
                
                if (response.success && response.data) {
                    setConstraints([...constraints, response.data]);
                    toast({
                        title: "تم إضافة القيد بنجاح",
                        description: `تم إضافة قيد جديد: ${response.data.description}`
                    });
                } else {
                    throw new Error(response.message || 'فشل في إضافة القيد');
                }
            }

            // Reset form
            setConstraintForm({
                constraint_type: 'forbidden',
                session_type: 'both',
                priority_level: 2,
                description: '',
                is_active: true
            });
            setEditingConstraint(null);
            setShowConstraintDialog(false);
        } catch (error: any) {
            console.error('Error saving constraint:', error);
            toast({
                title: "خطأ في حفظ القيد",
                description: error.message || "حدث خطأ أثناء حفظ القيد",
                variant: "destructive"
            });
        }
    };

    const editConstraint = (constraint: ScheduleConstraint) => {
        setConstraintForm(constraint);
        setEditingConstraint(constraint);
        setShowConstraintDialog(true);
    };

    const deleteConstraint = async (id: number) => {
        try {
            const response = await schedulesApi.deleteConstraint(id);
            
            if (response.success) {
                setConstraints(constraints.filter(c => c.id !== id));
                toast({
                    title: "تم حذف القيد",
                    description: "تم حذف القيد بنجاح"
                });
            } else {
                throw new Error(response.message || 'فشل في حذف القيد');
            }
        } catch (error: any) {
            console.error('Error deleting constraint:', error);
            toast({
                title: "خطأ في حذف القيد",
                description: error.message || "حدث خطأ أثناء حذف القيد",
                variant: "destructive"
            });
        }
    };

    const applyTemplate = (template: ConstraintTemplate) => {
        setConstraintForm({
            ...template.constraint_config,
            description: template.template_description,
            session_type: 'both',
            is_active: true
        });
        setShowConstraintDialog(true);

        setTemplates(templates.map(t =>
            t.id === template.id ? { ...t, usage_count: (t as any).usage_count + 1 } : t
        ));

        toast({
            title: "تم تطبيق القالب",
            description: `تم تطبيق قالب: ${template.template_name}`
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">قيود الجدول المتقدمة</h1>
                    <p className="text-muted-foreground mt-2">إدارة قيود الجدولة والقوالب المحفوظة</p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button onClick={() => setShowConstraintDialog(true)} className="flex items-center">
                        <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        قيد جديد
                    </Button>
                </div>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!loading && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="constraints">القيود النشطة</TabsTrigger>
                        <TabsTrigger value="templates">القوالب</TabsTrigger>
                    </TabsList>

                    <TabsContent value="constraints" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {constraints.map((constraint) => (
                                <Card key={constraint.id} className={cn(
                                    "transition-all duration-200",
                                    !constraint.is_active && "opacity-60"
                                )}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                                                    {getConstraintTypeIcon(constraint.constraint_type)}
                                                    <span className="font-semibold">
                                                        {getConstraintTypeName(constraint.constraint_type)}
                                                    </span>
                                                    {getPriorityBadge(constraint.priority_level)}
                                                    <Badge variant={constraint.is_active ? 'default' : 'secondary'}>
                                                        {constraint.is_active ? 'نشط' : 'معطل'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {constraint.description}
                                                </p>
                                                <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-muted-foreground">
                                                    {constraint.day_of_week && (
                                                        <div className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                                            {getDayName(constraint.day_of_week)}
                                                        </div>
                                                    )}
                                                    {constraint.period_number && (
                                                        <div className="flex items-center">
                                                            <Clock className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                                            الحصة {constraint.period_number}
                                                        </div>
                                                    )}
                                                    <Badge variant="outline" className="text-xs">
                                                        {constraint.session_type === 'morning' ? 'صباحي' :
                                                            constraint.session_type === 'evening' ? 'مسائي' : 'كلاهما'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => editConstraint(constraint)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteConstraint(constraint.id!)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="templates" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((template) => (
                                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{template.template_name}</CardTitle>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                {template.is_system_template && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Star className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                                        نظام
                                                    </Badge>
                                                )}
                                                <Badge variant="secondary" className="text-xs">
                                                    {template.usage_count} استخدام
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {template.template_description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                {getConstraintTypeIcon(template.constraint_config.constraint_type!)}
                                                <span className="text-sm font-medium">
                                                    {getConstraintTypeName(template.constraint_config.constraint_type!)}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => applyTemplate(template)}
                                            >
                                                تطبيق
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            )}

            {/* Add/Edit Constraint Dialog */}
            <Dialog open={showConstraintDialog} onOpenChange={setShowConstraintDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingConstraint ? 'تعديل القيد' : 'إضافة قيد جديد'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="constraint_type" className="text-right">
                                نوع القيد
                            </Label>
                            <Select
                                value={constraintForm.constraint_type}
                                onValueChange={(value) => setConstraintForm({
                                    ...constraintForm,
                                    constraint_type: value as any
                                })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="اختر نوع القيد" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="forbidden">ممنوع</SelectItem>
                                    <SelectItem value="required">مطلوب</SelectItem>
                                    <SelectItem value="max_consecutive">حد أقصى متتالي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="session_type" className="text-right">
                                نوع الجلسة
                            </Label>
                            <Select
                                value={constraintForm.session_type}
                                onValueChange={(value) => setConstraintForm({
                                    ...constraintForm,
                                    session_type: value as any
                                })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="اختر نوع الجلسة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="both">كلاهما</SelectItem>
                                    <SelectItem value="morning">صباحي</SelectItem>
                                    <SelectItem value="evening">مسائي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority_level" className="text-right">
                                مستوى الأولوية
                            </Label>
                            <Select
                                value={constraintForm.priority_level?.toString()}
                                onValueChange={(value) => setConstraintForm({
                                    ...constraintForm,
                                    priority_level: parseInt(value)
                                })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="اختر مستوى الأولوية" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">منخفض</SelectItem>
                                    <SelectItem value="2">متوسط</SelectItem>
                                    <SelectItem value="3">عالي</SelectItem>
                                    <SelectItem value="4">حرج</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="day_of_week" className="text-right">
                                يوم الأسبوع
                            </Label>
                            <Select
                                value={constraintForm.day_of_week?.toString() || ""}
                                onValueChange={(value) => setConstraintForm({
                                    ...constraintForm,
                                    day_of_week: value ? parseInt(value) : undefined
                                })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="اختر يوم الأسبوع (اختياري)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">لا يوجد</SelectItem>
                                    <SelectItem value="1">الاثنين</SelectItem>
                                    <SelectItem value="2">الثلاثاء</SelectItem>
                                    <SelectItem value="3">الأربعاء</SelectItem>
                                    <SelectItem value="4">الخميس</SelectItem>
                                    <SelectItem value="5">الجمعة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="period_number" className="text-right">
                                رقم الحصة
                            </Label>
                            <Input
                                id="period_number"
                                type="number"
                                value={constraintForm.period_number || ''}
                                onChange={(e) => setConstraintForm({
                                    ...constraintForm,
                                    period_number: e.target.value ? parseInt(e.target.value) : undefined
                                })}
                                className="col-span-3"
                                placeholder="رقم الحصة (اختياري)"
                                min="1"
                                max="10"
                            />
                        </div>

                        {constraintForm.constraint_type === 'max_consecutive' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="max_value" className="text-right">
                                    الحد الأقصى
                                </Label>
                                <Input
                                    id="max_value"
                                    type="number"
                                    value={constraintForm.max_consecutive_periods || ''}
                                    onChange={(e) => setConstraintForm({
                                        ...constraintForm,
                                        max_consecutive_periods: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                    className="col-span-3"
                                    placeholder="الحد الأقصى للحصص المتتالية"
                                    min="1"
                                    max="5"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                الوصف
                            </Label>
                            <Textarea
                                id="description"
                                value={constraintForm.description || ''}
                                onChange={(e) => setConstraintForm({
                                    ...constraintForm,
                                    description: e.target.value
                                })}
                                className="col-span-3"
                                placeholder="أدخل وصف القيد..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="is_active" className="text-right">
                                نشط
                            </Label>
                            <Switch
                                id="is_active"
                                checked={constraintForm.is_active || false}
                                onCheckedChange={(checked) => setConstraintForm({
                                    ...constraintForm,
                                    is_active: checked
                                })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConstraintDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={addConstraint}>
                            {editingConstraint ? 'تحديث' : 'إضافة'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdvancedScheduleConstraintsPage;