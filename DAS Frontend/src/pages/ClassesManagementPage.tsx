import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GraduationCap,
  Users,
  Plus,
  Edit,
  Settings,
  CheckCircle,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { classesApi, subjectsApi } from '@/services/api';
import { Class, Subject } from '@/types/school';

interface ClassInfo {
  gradeId: number;
  gradeName: string;
  gradeOrder: number;
  level: string;
  divisions: DivisionInfo[];
  totalSubjects: number;
  assignedTeachers: number;
  status: 'complete' | 'incomplete' | 'missing';
}

interface DivisionInfo {
  id: number;
  name: string;
  type: string;
  studentCount?: number;
  hasTeachers: boolean;
  hasSubjects: boolean;
}

export const ClassesManagementPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        // For now, we'll use a default academic year ID
        // In a real implementation, this would come from the current academic year
        const response = await classesApi.getAll(1);
        
        if (response.success && response.data) {
          // Transform the API data to match our ClassInfo interface
          const transformedClasses = await Promise.all(response.data.map(async (cls: Class) => {
            // Fetch subjects for this class
            const subjectResponse = await subjectsApi.getAll(cls.id);
            const totalSubjects = subjectResponse.success ? subjectResponse.data?.length || 0 : 0;
            
            // For now, we'll use mock data for teachers and status
            // In a real implementation, this would come from the backend
            const assignedTeachers = Math.floor(Math.random() * 5); // Mock data
            const status = totalSubjects > 0 ? 'incomplete' : 'missing'; // Mock logic
            
            return {
              gradeId: cls.id || 0,
              gradeName: `${cls.grade_level} ${cls.grade_number}`,
              gradeOrder: cls.grade_number,
              level: cls.grade_level,
              totalSubjects: totalSubjects,
              assignedTeachers: assignedTeachers,
              status: status as 'complete' | 'incomplete' | 'missing',
              divisions: [
                {
                  id: 1,
                  name: `شعبة ${cls.section_count || 1}`,
                  type: 'شعبة واحدة',
                  studentCount: cls.max_students_per_section || 0,
                  hasTeachers: assignedTeachers > 0,
                  hasSubjects: totalSubjects > 0
                }
              ]
            } as ClassInfo;
          }));
          
          setClasses(transformedClasses);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const levels = ['all', 'ابتدائي', 'اعدادي', 'ثانوي', 'بكالوريا'];

  const filteredClasses = selectedLevel === 'all'
    ? classes
    : classes.filter(c => c.level === selectedLevel);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'complete':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'مكتمل' };
      case 'incomplete':
        return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'ناقص' };
      case 'missing':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'مفقود' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-50', label: 'غير محدد' };
    }
  };

  const getCompletionStats = () => {
    const total = classes.length;
    const complete = classes.filter(c => c.status === 'complete').length;
    const incomplete = classes.filter(c => c.status === 'incomplete').length;
    const missing = classes.filter(c => c.status === 'missing').length;

    return { total, complete, incomplete, missing };
  };

  const stats = getCompletionStats();

  const handleEditClass = (classInfo: ClassInfo) => {
    setEditingClass({ ...classInfo });
    setIsEditDialogOpen(true);
  };

  const addDivisionToClass = (classInfo: ClassInfo) => {
    const newDivision: DivisionInfo = {
      id: classInfo.divisions.length + 1,
      name: `شعبة ${classInfo.divisions.length + 1}`,
      type: 'مخصص',
      studentCount: 20,
      hasTeachers: false,
      hasSubjects: false
    };

    const updatedClass = {
      ...classInfo,
      divisions: [...classInfo.divisions, newDivision]
    };

    setClasses(classes.map(c => c.gradeId === classInfo.gradeId ? updatedClass : c));
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الصفوف والشعب</h1>
          <p className="text-muted-foreground">
            تنظيم الصفوف الدراسية والشعب وحالة اكتمال المعلومات
          </p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الصفوف</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صفوف مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{stats.complete}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صفوف ناقصة</p>
                <p className="text-2xl font-bold text-orange-600">{stats.incomplete}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نسبة الاكتمال</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((stats.complete / stats.total) * 100)}%
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تصفية حسب المرحلة</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="اختر المرحلة الدراسية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المراحل</SelectItem>
              {levels.slice(1).map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map((classInfo) => {
          const statusInfo = getStatusInfo(classInfo.status);
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={classInfo.gradeId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{classInfo.gradeName}</CardTitle>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${statusInfo.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                    <span className={`text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{classInfo.level}</Badge>
                  <span>الترتيب: {classInfo.gradeOrder}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{classInfo.totalSubjects}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">مادة دراسية</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{classInfo.assignedTeachers}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">معلم مخصص</p>
                  </div>
                </div>

                {/* Divisions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">الشعب ({classInfo.divisions.length})</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addDivisionToClass(classInfo)}
                      className="h-6 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 ml-1" />
                      إضافة
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {classInfo.divisions.map((division) => (
                      <div
                        key={division.id}
                        className="flex items-center justify-between p-2 border rounded text-sm"
                      >
                        <div>
                          <span className="font-medium">شعبة {division.name}</span>
                          {division.studentCount && (
                            <span className="text-muted-foreground mr-2">
                              ({division.studentCount} طالب)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {division.hasSubjects && (
                            <Badge variant="secondary" className="text-xs">مواد ✓</Badge>
                          )}
                          {division.hasTeachers && (
                            <Badge variant="secondary" className="text-xs">معلمين ✓</Badge>
                          )}
                          {!division.hasSubjects && !division.hasTeachers && (
                            <Badge variant="destructive" className="text-xs">ناقص</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClass(classInfo)}
                  >
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 ml-1" />
                    إعدادات
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Missing Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            ملخص المعلومات الناقصة
          </CardTitle>
          <CardDescription>
            الصفوف التي تحتاج إلى معلومات إضافية لإتمام الجدولة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {classes
              .filter(c => c.status !== 'complete')
              .map((classInfo) => (
                <div key={classInfo.gradeId} className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-800">{classInfo.gradeName}</h4>
                    <ul className="text-sm text-orange-700 mt-1 space-y-1">
                      {classInfo.divisions
                        .filter(div => !div.hasTeachers || !div.hasSubjects)
                        .map((division) => (
                          <li key={division.id}>
                            شعبة {division.name}:
                            {!division.hasSubjects && " مواد دراسية مفقودة"}
                            {!division.hasSubjects && !division.hasTeachers && "، "}
                            {!division.hasTeachers && " معلمين غير مخصصين"}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <Button variant="outline" size="sm">
                    إصلاح
                  </Button>
                </div>
              ))}

            {classes.filter(c => c.status !== 'complete').length === 0 && (
              <div className="text-center py-6 text-green-600">
                <CheckCircle className="h-12 w-12 mx-auto mb-3" />
                <p className="font-medium">جميع الصفوف مكتملة!</p>
                <p className="text-sm">لا توجد معلومات ناقصة</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Class Dialog */}
      {editingClass && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل {editingClass.gradeName}</DialogTitle>
              <DialogDescription>
                تعديل معلومات الصف والشعب التابعة له
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Class Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم الصف</Label>
                  <Input value={editingClass.gradeName} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>المرحلة</Label>
                  <Input value={editingClass.level} readOnly className="bg-muted" />
                </div>
              </div>

              {/* Divisions */}
              <div>
                <Label className="text-lg font-medium">الشعب</Label>
                <div className="space-y-3 mt-2">
                  {editingClass.divisions.map((division, index) => (
                    <div key={division.id} className="grid grid-cols-3 gap-3 p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm">اسم الشعبة</Label>
                        <Input
                          value={division.name}
                          onChange={(e) => {
                            const updatedDivisions = [...editingClass.divisions];
                            updatedDivisions[index] = { ...division, name: e.target.value };
                            setEditingClass({ ...editingClass, divisions: updatedDivisions });
                          }}
                          className="text-right"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">نوع الشعبة</Label>
                        <Select
                          value={division.type}
                          onValueChange={(value) => {
                            const updatedDivisions = [...editingClass.divisions];
                            updatedDivisions[index] = { ...division, type: value };
                            setEditingClass({ ...editingClass, divisions: updatedDivisions });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="شعبة واحدة">شعبة واحدة</SelectItem>
                            <SelectItem value="شباب">شباب</SelectItem>
                            <SelectItem value="بنات">بنات</SelectItem>
                            <SelectItem value="مختلط">مختلط</SelectItem>
                            <SelectItem value="مخصص">مخصص</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">عدد الطلاب</Label>
                        <Input
                          type="number"
                          value={division.studentCount || 0}
                          onChange={(e) => {
                            const updatedDivisions = [...editingClass.divisions];
                            updatedDivisions[index] = { ...division, studentCount: parseInt(e.target.value) };
                            setEditingClass({ ...editingClass, divisions: updatedDivisions });
                          }}
                          className="text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => {
                  setClasses(classes.map(c => c.gradeId === editingClass.gradeId ? editingClass : c));
                  setIsEditDialogOpen(false);
                }}>
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};