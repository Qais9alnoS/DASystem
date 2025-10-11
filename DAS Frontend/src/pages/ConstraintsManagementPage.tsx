import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  X,
  Clock,
  Calendar,
  BookOpen,
  Users,
  Ban,
  Target,
  Repeat,
  Loader2
} from 'lucide-react';
import { schedulesApi } from '@/services/api';
import { ScheduleConstraint } from '@/types/school';
import { ConstraintType } from '@/types/project';
import { DEFAULT_GRADES, DEFAULT_DIVISIONS } from '@/types/project';
import { getAllUniqueSubjects } from '@/lib/defaultSubjects';

interface Constraint {
  id?: number;
  type: ConstraintType;
  description: string;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
  parameters: {
    subjectName?: string;
    teacherName?: string;
    gradeName?: string;
    divisionName?: string;
    day?: string;
    period?: number;
    relatedSubjectName?: string;
    maxHours?: number;
    minBreak?: number;
  };
}

const SCHOOL_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const PERIODS = [1, 2, 3, 4, 5, 6];

export const ConstraintsManagementPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConstraint, setEditingConstraint] = useState<Constraint | null>(null);
  const [loading, setLoading] = useState(true);
  const [academicYearId, setAcademicYearId] = useState<number>(1); // Default to 1, should be dynamic
  const { toast } = useToast();
  
  // Real data from backend
  const [constraints, setConstraints] = useState<Constraint[]>([]);

  const [newConstraint, setNewConstraint] = useState<Constraint>({
    type: ConstraintType.ForbiddenPeriod,
    description: '',
    isActive: true,
    priority: 'medium',
    parameters: {}
  });

  const uniqueSubjects = getAllUniqueSubjects();
  const mockTeachers = ["أحمد محمد علي", "فاطمة خالد", "عمر السيد", "نادية حسن"]; // Mock data

  const filteredConstraints = selectedType === 'all' 
    ? constraints 
    : constraints.filter(c => c.type === selectedType);

  const getConstraintTypeInfo = (type: ConstraintType) => {
    switch (type) {
      case ConstraintType.ForbiddenPeriod:
        return { icon: Ban, color: 'text-red-500', bg: 'bg-red-50', label: 'فترة ممنوعة', description: 'منع جدولة مادة في وقت محدد' };
      case ConstraintType.RequiredPeriod:
        return { icon: Target, color: 'text-blue-500', bg: 'bg-blue-50', label: 'فترة مطلوبة', description: 'إجبار جدولة مادة في وقت محدد' };
      case ConstraintType.Sequential:
        return { icon: Repeat, color: 'text-purple-500', bg: 'bg-purple-50', label: 'منع التتالي', description: 'منع تتالي حصص نفس المادة' };
      case ConstraintType.MaxDailyHours:
        return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', label: 'أقصى ساعات يومية', description: 'تحديد أقصى عدد حصص للمعلم يومياً' };
      case ConstraintType.MinBreakBetween:
        return { icon: Calendar, color: 'text-green-500', bg: 'bg-green-50', label: 'فاصل بين الحصص', description: 'تحديد فاصل زمني بين حصص المعلم' };
      default:
        return { icon: Shield, color: 'text-gray-500', bg: 'bg-gray-50', label: 'غير محدد', description: '' };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'destructive', label: 'عالي' };
      case 'medium':
        return { color: 'default', label: 'متوسط' };
      case 'low':
        return { color: 'secondary', label: 'منخفض' };
      default:
        return { color: 'outline', label: 'غير محدد' };
    }
  };

  const generateDescription = (constraint: Constraint): string => {
    const { type, parameters } = constraint;
    
    switch (type) {
      case ConstraintType.ForbiddenPeriod:
        let desc = `منع`;
        if (parameters.subjectName) desc += ` مادة ${parameters.subjectName}`;
        if (parameters.teacherName) desc += ` للمعلم ${parameters.teacherName}`;
        if (parameters.day) desc += ` في يوم ${parameters.day}`;
        if (parameters.period) desc += ` الحصة ${parameters.period}`;
        if (parameters.gradeName) desc += ` للصف ${parameters.gradeName}`;
        return desc;
        
      case ConstraintType.RequiredPeriod:
        let reqDesc = `يجب جدولة`;
        if (parameters.subjectName) reqDesc += ` مادة ${parameters.subjectName}`;
        if (parameters.teacherName) reqDesc += ` للمعلم ${parameters.teacherName}`;
        if (parameters.day) reqDesc += ` في يوم ${parameters.day}`;
        if (parameters.period) reqDesc += ` الحصة ${parameters.period}`;
        if (parameters.gradeName) reqDesc += ` للصف ${parameters.gradeName}`;
        return reqDesc;
        
      case ConstraintType.Sequential:
        return `منع تتالي حصص ${parameters.subjectName || 'المادة المحددة'}`;
        
      case ConstraintType.MaxDailyHours:
        return `أقصى ${parameters.maxHours || 6} حصص يومياً للمعلم ${parameters.teacherName || 'المحدد'}`;
        
      case ConstraintType.MinBreakBetween:
        return `فاصل ${parameters.minBreak || 1} حصة بين دروس المعلم ${parameters.teacherName || 'المحدد'}`;
        
      default:
        return constraint.description || 'قيد غير محدد';
    }
  };

  // Fetch constraints from backend when component mounts
  useEffect(() => {
    const fetchConstraints = async () => {
      setLoading(true);
      try {
        const response = await schedulesApi.getConstraints(academicYearId);
        if (response.success && response.data) {
          // Convert ScheduleConstraint to Constraint format for UI
          const convertedConstraints: Constraint[] = response.data.map((constraint: ScheduleConstraint) => ({
            id: constraint.id,
            type: constraint.constraint_type === 'forbidden' ? ConstraintType.ForbiddenPeriod :
                  constraint.constraint_type === 'required' ? ConstraintType.RequiredPeriod :
                  constraint.constraint_type === 'max_consecutive' ? ConstraintType.Sequential :
                  ConstraintType.ForbiddenPeriod, // default fallback
            description: constraint.description || '',
            isActive: constraint.is_active || true,
            priority: constraint.priority_level === 4 ? 'high' :
                     constraint.priority_level === 3 ? 'medium' :
                     constraint.priority_level === 2 ? 'low' : 'medium', // default fallback
            parameters: {
              subjectName: '', // Would need to fetch subject name from API
              day: constraint.day_of_week ? SCHOOL_DAYS[constraint.day_of_week - 1] : undefined,
              period: constraint.period_number,
              maxHours: constraint.max_consecutive_periods,
            }
          }));
          setConstraints(convertedConstraints);
        }
      } catch (error: any) {
        console.error('Error fetching constraints:', error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: error.message || "حدث خطأ أثناء تحميل القيود",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConstraints();
  }, [academicYearId, toast]);

  const handleAddConstraint = async () => {
    // Convert Constraint to ScheduleConstraint format for API
    const scheduleConstraint: any = {
      academic_year_id: academicYearId,
      constraint_type: newConstraint.type === ConstraintType.ForbiddenPeriod ? 'forbidden' :
                      newConstraint.type === ConstraintType.RequiredPeriod ? 'required' :
                      'max_consecutive',
      description: generateDescription(newConstraint),
      is_active: newConstraint.isActive,
      priority_level: newConstraint.priority === 'high' ? 4 :
                     newConstraint.priority === 'medium' ? 3 :
                     newConstraint.priority === 'low' ? 2 : 3, // default fallback
      day_of_week: newConstraint.parameters.day ? SCHOOL_DAYS.indexOf(newConstraint.parameters.day) + 1 : undefined,
      period_number: newConstraint.parameters.period,
      max_consecutive_periods: newConstraint.parameters.maxHours,
    };

    try {
      const response = await schedulesApi.createConstraint(scheduleConstraint);
      if (response.success && response.data) {
        // Convert back to Constraint format for UI
        const constraint: Constraint = {
          id: response.data.id,
          type: response.data.constraint_type === 'forbidden' ? ConstraintType.ForbiddenPeriod :
                response.data.constraint_type === 'required' ? ConstraintType.RequiredPeriod :
                ConstraintType.Sequential,
          description: response.data.description || '',
          isActive: response.data.is_active || true,
          priority: response.data.priority_level === 4 ? 'high' :
                   response.data.priority_level === 3 ? 'medium' :
                   response.data.priority_level === 2 ? 'low' : 'medium',
          parameters: {
            subjectName: '',
            day: response.data.day_of_week ? SCHOOL_DAYS[response.data.day_of_week - 1] : undefined,
            period: response.data.period_number,
            maxHours: response.data.max_consecutive_periods,
          }
        };
        
        setConstraints([...constraints, constraint]);
        setIsAddDialogOpen(false);
        setNewConstraint({
          type: ConstraintType.ForbiddenPeriod,
          description: '',
          isActive: true,
          priority: 'medium',
          parameters: {}
        });
        
        toast({
          title: "تم إضافة القيد",
          description: "تم إضافة القيد بنجاح"
        });
      } else {
        throw new Error(response.message || 'فشل في إضافة القيد');
      }
    } catch (error: any) {
      console.error('Error adding constraint:', error);
      toast({
        title: "خطأ في إضافة القيد",
        description: error.message || "حدث خطأ أثناء إضافة القيد",
        variant: "destructive"
      });
    }
  };

  const handleEditConstraint = (constraint: Constraint) => {
    setEditingConstraint({ ...constraint });
  };

  const handleUpdateConstraint = async () => {
    if (!editingConstraint || !editingConstraint.id) return;
    
    // Convert Constraint to ScheduleConstraint format for API
    const scheduleConstraint: any = {
      constraint_type: editingConstraint.type === ConstraintType.ForbiddenPeriod ? 'forbidden' :
                      editingConstraint.type === ConstraintType.RequiredPeriod ? 'required' :
                      'max_consecutive',
      description: generateDescription(editingConstraint),
      is_active: editingConstraint.isActive,
      priority_level: editingConstraint.priority === 'high' ? 4 :
                     editingConstraint.priority === 'medium' ? 3 :
                     editingConstraint.priority === 'low' ? 2 : 3,
      day_of_week: editingConstraint.parameters.day ? SCHOOL_DAYS.indexOf(editingConstraint.parameters.day) + 1 : undefined,
      period_number: editingConstraint.parameters.period,
      max_consecutive_periods: editingConstraint.parameters.maxHours,
    };

    try {
      const response = await schedulesApi.updateConstraint(editingConstraint.id, scheduleConstraint);
      if (response.success && response.data) {
        // Convert back to Constraint format for UI
        const updatedConstraint: Constraint = {
          id: response.data.id,
          type: response.data.constraint_type === 'forbidden' ? ConstraintType.ForbiddenPeriod :
                response.data.constraint_type === 'required' ? ConstraintType.RequiredPeriod :
                ConstraintType.Sequential,
          description: response.data.description || '',
          isActive: response.data.is_active || true,
          priority: response.data.priority_level === 4 ? 'high' :
                   response.data.priority_level === 3 ? 'medium' :
                   response.data.priority_level === 2 ? 'low' : 'medium',
          parameters: {
            subjectName: '',
            day: response.data.day_of_week ? SCHOOL_DAYS[response.data.day_of_week - 1] : undefined,
            period: response.data.period_number,
            maxHours: response.data.max_consecutive_periods,
          }
        };
        
        setConstraints(constraints.map(c => 
          c.id === editingConstraint.id ? updatedConstraint : c
        ));
        setEditingConstraint(null);
        
        toast({
          title: "تم تحديث القيد",
          description: "تم تحديث القيد بنجاح"
        });
      } else {
        throw new Error(response.message || 'فشل في تحديث القيد');
      }
    } catch (error: any) {
      console.error('Error updating constraint:', error);
      toast({
        title: "خطأ في تحديث القيد",
        description: error.message || "حدث خطأ أثناء تحديث القيد",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConstraint = async (constraintId: number) => {
    try {
      const response = await schedulesApi.deleteConstraint(constraintId);
      if (response.success) {
        setConstraints(constraints.filter(c => c.id !== constraintId));
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

  const toggleConstraintStatus = async (constraintId: number) => {
    const constraint = constraints.find(c => c.id === constraintId);
    if (!constraint) return;
    
    try {
      const response = await schedulesApi.updateConstraint(constraintId, {
        is_active: !constraint.isActive
      });
      if (response.success && response.data) {
        setConstraints(constraints.map(c => 
          c.id === constraintId ? { ...c, isActive: !c.isActive } : c
        ));
        toast({
          title: "تم تحديث حالة القيد",
          description: `تم ${constraint.isActive ? 'تعطيل' : 'تنشيط'} القيد بنجاح`
        });
      } else {
        throw new Error(response.message || 'فشل في تحديث حالة القيد');
      }
    } catch (error: any) {
      console.error('Error toggling constraint status:', error);
      toast({
        title: "خطأ في تحديث حالة القيد",
        description: error.message || "حدث خطأ أثناء تحديث حالة القيد",
        variant: "destructive"
      });
    }
  };

  const getConstraintStats = () => {
    const total = constraints.length;
    const active = constraints.filter(c => c.isActive).length;
    const inactive = total - active;
    const byType = {
      forbidden: constraints.filter(c => c.type === ConstraintType.ForbiddenPeriod).length,
      required: constraints.filter(c => c.type === ConstraintType.RequiredPeriod).length,
      sequential: constraints.filter(c => c.type === ConstraintType.Sequential).length,
      workload: constraints.filter(c => c.type === ConstraintType.MaxDailyHours || c.type === ConstraintType.MinBreakBetween).length
    };
    
    return { total, active, inactive, byType };
  };

  const stats = getConstraintStats();

  const renderConstraintForm = (constraint: Constraint, isEditing: boolean = false) => {
    const typeInfo = getConstraintTypeInfo(constraint.type);
    
    return (
      <div className="space-y-4">
        <div>
          <Label>نوع القيد</Label>
          <Select 
            value={constraint.type} 
            onValueChange={(value) => {
              const updated = { ...constraint, type: value as ConstraintType, parameters: {} };
              if (isEditing) {
                setEditingConstraint?.(updated);
              } else {
                setNewConstraint(updated);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ConstraintType.ForbiddenPeriod}>
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-500" />
                  فترة ممنوعة
                </div>
              </SelectItem>
              <SelectItem value={ConstraintType.RequiredPeriod}>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  فترة مطلوبة
                </div>
              </SelectItem>
              <SelectItem value={ConstraintType.Sequential}>
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-purple-500" />
                  منع التتالي
                </div>
              </SelectItem>
              <SelectItem value={ConstraintType.MaxDailyHours}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  أقصى ساعات يومية
                </div>
              </SelectItem>
              <SelectItem value={ConstraintType.MinBreakBetween}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  فاصل بين الحصص
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">{typeInfo.description}</p>
        </div>

        {/* Common Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>المادة الدراسية (اختياري)</Label>
            <Select 
              value={constraint.parameters.subjectName || ''} 
              onValueChange={(value) => {
                const updated = { ...constraint, parameters: { ...constraint.parameters, subjectName: value } };
                if (isEditing) {
                  setEditingConstraint?.(updated);
                } else {
                  setNewConstraint(updated);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون تحديد</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>المعلم (اختياري)</Label>
            <Select 
              value={constraint.parameters.teacherName || ''} 
              onValueChange={(value) => {
                const updated = { ...constraint, parameters: { ...constraint.parameters, teacherName: value } };
                if (isEditing) {
                  setEditingConstraint?.(updated);
                } else {
                  setNewConstraint(updated);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المعلم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون تحديد</SelectItem>
                {mockTeachers.map((teacher) => (
                  <SelectItem key={teacher} value={teacher}>
                    {teacher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Time-based Parameters */}
        {(constraint.type === ConstraintType.ForbiddenPeriod || constraint.type === ConstraintType.RequiredPeriod) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>اليوم (اختياري)</Label>
              <Select 
                value={constraint.parameters.day || ''} 
                onValueChange={(value) => {
                  const updated = { ...constraint, parameters: { ...constraint.parameters, day: value } };
                  if (isEditing) {
                    setEditingConstraint?.(updated);
                  } else {
                    setNewConstraint(updated);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر اليوم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون تحديد</SelectItem>
                  {SCHOOL_DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>رقم الحصة (اختياري)</Label>
              <Select 
                value={constraint.parameters.period?.toString() || ''} 
                onValueChange={(value) => {
                  const updated = { ...constraint, parameters: { ...constraint.parameters, period: value ? parseInt(value) : undefined } };
                  if (isEditing) {
                    setEditingConstraint?.(updated);
                  } else {
                    setNewConstraint(updated);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحصة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون تحديد</SelectItem>
                  {PERIODS.map((period) => (
                    <SelectItem key={period} value={period.toString()}>
                      الحصة {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Workload Parameters */}
        {constraint.type === ConstraintType.MaxDailyHours && (
          <div>
            <Label>أقصى عدد حصص يومية</Label>
            <Input 
              type="number" 
              min="1" 
              max="8" 
              value={constraint.parameters.maxHours || 6}
              onChange={(e) => {
                const updated = { ...constraint, parameters: { ...constraint.parameters, maxHours: parseInt(e.target.value) } };
                if (isEditing) {
                  setEditingConstraint?.(updated);
                } else {
                  setNewConstraint(updated);
                }
              }}
              className="text-right"
            />
          </div>
        )}

        {constraint.type === ConstraintType.MinBreakBetween && (
          <div>
            <Label>الحد الأدنى للفاصل (عدد الحصص)</Label>
            <Input 
              type="number" 
              min="1" 
              max="3" 
              value={constraint.parameters.minBreak || 1}
              onChange={(e) => {
                const updated = { ...constraint, parameters: { ...constraint.parameters, minBreak: parseInt(e.target.value) } };
                if (isEditing) {
                  setEditingConstraint?.(updated);
                } else {
                  setNewConstraint(updated);
                }
              }}
              className="text-right"
            />
          </div>
        )}

        <div>
          <Label>الأولوية</Label>
          <Select 
            value={constraint.priority} 
            onValueChange={(value) => {
              const updated = { ...constraint, priority: value as 'high' | 'medium' | 'low' };
              if (isEditing) {
                setEditingConstraint?.(updated);
              } else {
                setNewConstraint(updated);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">عالي</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="low">منخفض</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generated Description Preview */}
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-sm font-medium">معاينة الوصف:</Label>
          <p className="text-sm mt-1">{generateDescription(constraint)}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل القيود...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة القيود والشروط</h1>
          <p className="text-muted-foreground">
            تحديد قيود الجدولة والشروط المطلوبة
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة قيد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة قيد جديد</DialogTitle>
              <DialogDescription>
                أضف قيد جديد لتحسين عملية الجدولة
              </DialogDescription>
            </DialogHeader>
            {renderConstraintForm(newConstraint)}
            <div className="flex gap-2">
              <Button onClick={handleAddConstraint}>
                إضافة القيد
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">إجمالي القيود</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-muted-foreground">قيود نشطة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <X className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p className="text-2xl font-bold">{stats.inactive}</p>
            <p className="text-sm text-muted-foreground">قيود معطلة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Ban className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.byType.forbidden}</p>
            <p className="text-sm text-muted-foreground">قيود منع</p>
          </CardContent>
        </Card>
      </div>

      {/* Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تصفية حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="اختر نوع القيد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value={ConstraintType.ForbiddenPeriod}>فترات ممنوعة</SelectItem>
              <SelectItem value={ConstraintType.RequiredPeriod}>فترات مطلوبة</SelectItem>
              <SelectItem value={ConstraintType.Sequential}>منع التتالي</SelectItem>
              <SelectItem value={ConstraintType.MaxDailyHours}>أقصى ساعات يومية</SelectItem>
              <SelectItem value={ConstraintType.MinBreakBetween}>فاصل بين الحصص</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Constraints List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            قائمة القيود ({filteredConstraints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredConstraints.map((constraint) => {
              const typeInfo = getConstraintTypeInfo(constraint.type);
              const priorityInfo = getPriorityInfo(constraint.priority);
              const TypeIcon = typeInfo.icon;

              return (
                <div 
                  key={constraint.id} 
                  className={`p-4 border rounded-lg transition-colors ${
                    constraint.isActive ? 'bg-background' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                        <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{typeInfo.label}</h3>
                          <Badge variant={priorityInfo.color as any} className="text-xs">
                            {priorityInfo.label}
                          </Badge>
                          {!constraint.isActive && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              معطل
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {constraint.description}
                        </p>
                        
                        {/* Parameters Summary */}
                        <div className="flex flex-wrap gap-2">
                          {constraint.parameters.subjectName && (
                            <Badge variant="secondary" className="text-xs">
                              <BookOpen className="h-3 w-3 ml-1" />
                              {constraint.parameters.subjectName}
                            </Badge>
                          )}
                          {constraint.parameters.teacherName && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 ml-1" />
                              {constraint.parameters.teacherName}
                            </Badge>
                          )}
                          {constraint.parameters.day && (
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="h-3 w-3 ml-1" />
                              {constraint.parameters.day}
                            </Badge>
                          )}
                          {constraint.parameters.period && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 ml-1" />
                              الحصة {constraint.parameters.period}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={constraint.isActive}
                        onCheckedChange={() => toggleConstraintStatus(constraint.id!)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditConstraint(constraint)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteConstraint(constraint.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredConstraints.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">لا توجد قيود</p>
                <p className="text-sm">
                  {selectedType === 'all' 
                    ? 'ابدأ بإضافة قيود جديدة لتحسين الجدولة' 
                    : 'لا توجد قيود من النوع المحدد'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Constraint Dialog */}
      {editingConstraint && (
        <Dialog open={!!editingConstraint} onOpenChange={() => setEditingConstraint(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل القيد</DialogTitle>
              <DialogDescription>
                تعديل معلومات القيد والشروط
              </DialogDescription>
            </DialogHeader>
            {renderConstraintForm(editingConstraint, true)}
            <div className="flex gap-2">
              <Button onClick={handleUpdateConstraint}>
                حفظ التغييرات
              </Button>
              <Button variant="outline" onClick={() => setEditingConstraint(null)}>
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};