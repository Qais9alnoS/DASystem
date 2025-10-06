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
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  GraduationCap,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { subjectsApi } from '@/services/realApi';
import { Subject, Class } from '@/types/school';
import { classesApi } from '@/services/realApi';

interface SubjectFormData {
  id?: number;
  class_id: number;
  subject_name: string;
  weekly_hours: number;
}

interface ClassInfo {
  id: number;
  name: string;
  level: string;
  grade_number: number;
}

export const SubjectsManagementPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [newSubject, setNewSubject] = useState<SubjectFormData>({
    class_id: 1,
    subject_name: '',
    weekly_hours: 1
  });

  // Fetch classes and subjects from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch classes
        const classesResponse = await classesApi.getAll();
        if (classesResponse.success && classesResponse.data) {
          const classInfo: ClassInfo[] = classesResponse.data.map((cls: Class) => ({
            id: cls.id || 0,
            name: `${cls.grade_level} ${cls.grade_number}${cls.section_count > 1 ? ` - الشعبة ${String.fromCharCode(64 + cls.section_count)}` : ''}`,
            level: cls.grade_level,
            grade_number: cls.grade_number
          }));
          setClasses(classInfo);
          
          // Set default class_id for new subjects
          if (classInfo.length > 0) {
            setNewSubject(prev => ({ ...prev, class_id: classInfo[0].id }));
          }
        }
        
        // Fetch subjects
        const subjectsResponse = await subjectsApi.getAll();
        if (subjectsResponse.success && subjectsResponse.data) {
          setSubjects(subjectsResponse.data);
        }
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

  const filteredSubjects = selectedGrade === 'all' 
    ? subjects 
    : subjects.filter(s => {
        const classInfo = classes.find(c => c.id === s.class_id);
        return classInfo ? classInfo.name === selectedGrade : false;
      });

  const getSubjectsByGrade = (gradeName: string) => {
    return subjects.filter(s => {
      const classInfo = classes.find(c => c.id === s.class_id);
      return classInfo ? classInfo.name === gradeName : false;
    });
  };

  const getTotalHoursForGrade = (gradeName: string) => {
    return subjects
      .filter(s => {
        const classInfo = classes.find(c => c.id === s.class_id);
        return classInfo ? classInfo.name === gradeName : false;
      })
      .reduce((total, s) => total + s.weekly_hours, 0);
  };

  const handleAddSubject = async () => {
    if (!newSubject.subject_name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المادة",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await subjectsApi.create({
        class_id: newSubject.class_id,
        subject_name: newSubject.subject_name,
        weekly_hours: newSubject.weekly_hours
      });

      if (response.success && response.data) {
        setSubjects([...subjects, response.data]);
        toast({
          title: "نجاح",
          description: "تمت إضافة المادة بنجاح",
          variant: "default"
        });
        
        // Reset form
        setNewSubject({
          class_id: classes.length > 0 ? classes[0].id : 1,
          subject_name: '',
          weekly_hours: 1
        });
        setIsAddDialogOpen(false);
      } else {
        throw new Error(response.message || 'فشل في إضافة المادة');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة المادة',
        variant: "destructive"
      });
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject({
      id: subject.id,
      class_id: subject.class_id,
      subject_name: subject.subject_name,
      weekly_hours: subject.weekly_hours
    });
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;
    
    if (!editingSubject.subject_name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المادة",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!editingSubject.id) {
        throw new Error('معرف المادة مفقود');
      }
      
      const response = await subjectsApi.update(editingSubject.id, {
        class_id: editingSubject.class_id,
        subject_name: editingSubject.subject_name,
        weekly_hours: editingSubject.weekly_hours
      });

      if (response.success && response.data) {
        setSubjects(subjects.map(s => 
          s.id === editingSubject.id ? response.data! : s
        ));
        toast({
          title: "نجاح",
          description: "تم تحديث المادة بنجاح",
          variant: "default"
        });
        setEditingSubject(null);
      } else {
        throw new Error(response.message || 'فشل في تحديث المادة');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث المادة',
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    // In a real implementation, we would call the delete API endpoint
    // For now, we'll just show a toast message since the API doesn't seem to have a delete endpoint
    toast({
      title: "ملاحظة",
      description: "حذف المواد غير متوفر حالياً في النظام",
      variant: "default"
    });
    
    // If delete functionality was available, it would look like this:
    /*
    try {
      const response = await subjectsApi.delete(subjectId);
      if (response.success) {
        setSubjects(subjects.filter(s => s.id !== subjectId));
        toast({
          title: "نجاح",
          description: "تم حذف المادة بنجاح",
          variant: "default"
        });
      } else {
        throw new Error(response.message || 'فشل في حذف المادة');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المادة',
        variant: "destructive"
      });
    }
    */
  };

  const uniqueGrades = Array.from(new Set(classes.map(c => c.name)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المواد الدراسية</h1>
          <p className="text-muted-foreground">
            إضافة وتعديل المواد الدراسية لكل صف
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة مادة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مادة جديدة</DialogTitle>
              <DialogDescription>
                أضف مادة دراسية جديدة للصف المحدد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subjectName">اسم المادة</Label>
                <Input
                  id="subjectName"
                  value={newSubject.subject_name}
                  onChange={(e) => setNewSubject({...newSubject, subject_name: e.target.value})}
                  placeholder="مثال: تربية إسلامية"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="weeklyHours">عدد الحصص الأسبوعية</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  min="1"
                  max="10"
                  value={newSubject.weekly_hours}
                  onChange={(e) => setNewSubject({...newSubject, weekly_hours: parseInt(e.target.value) || 1})}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="classSelect">الصف الدراسي</Label>
                <Select 
                  value={newSubject.class_id.toString()} 
                  onValueChange={(value) => setNewSubject({...newSubject, class_id: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSubject} disabled={!newSubject.subject_name.trim()}>
                  إضافة
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grade Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تصفية حسب الصف</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="اختر الصف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الصفوف</SelectItem>
              {uniqueGrades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Subjects by Grade */}
      <Tabs value={selectedGrade === 'all' ? 'overview' : 'list'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="list">قائمة المواد</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueGrades.map((gradeName) => {
              const gradeSubjects = getSubjectsByGrade(gradeName);
              const totalHours = getTotalHoursForGrade(gradeName);
              
              return (
                <Card key={gradeName} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {gradeName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">عدد المواد:</span>
                      <Badge variant="secondary">{gradeSubjects.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">إجمالي الحصص:</span>
                      <Badge variant="default">
                        {totalHours}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      {gradeSubjects.slice(0, 3).map((subject) => (
                        <div key={subject.id} className="flex justify-between text-sm">
                          <span>{subject.subject_name}</span>
                          <span className="text-muted-foreground">{subject.weekly_hours} حصص</span>
                        </div>
                      ))}
                      {gradeSubjects.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          و {gradeSubjects.length - 3} مواد أخرى...
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedGrade(gradeName)}
                    >
                      عرض التفاصيل
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {selectedGrade === 'all' ? 'جميع المواد' : `مواد ${selectedGrade}`}
              </CardTitle>
              <CardDescription>
                {filteredSubjects.length} مادة دراسية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSubjects.map((subject) => {
                  const classInfo = classes.find(c => c.id === subject.class_id);
                  return (
                    <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{subject.subject_name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{classInfo?.name || 'غير محدد'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{subject.weekly_hours} حصص</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => subject.id && handleDeleteSubject(subject.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredSubjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد مواد للصف المحدد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingSubject && (
        <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل المادة</DialogTitle>
              <DialogDescription>
                تعديل معلومات المادة الدراسية
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editSubjectName">اسم المادة</Label>
                <Input
                  id="editSubjectName"
                  value={editingSubject.subject_name}
                  onChange={(e) => setEditingSubject({...editingSubject, subject_name: e.target.value})}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="editWeeklyHours">عدد الحصص الأسبوعية</Label>
                <Input
                  id="editWeeklyHours"
                  type="number"
                  min="1"
                  max="10"
                  value={editingSubject.weekly_hours}
                  onChange={(e) => setEditingSubject({...editingSubject, weekly_hours: parseInt(e.target.value) || 1})}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="editClassSelect">الصف الدراسي</Label>
                <Select 
                  value={editingSubject.class_id.toString()} 
                  onValueChange={(value) => setEditingSubject({...editingSubject, class_id: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateSubject}>
                  <Check className="h-4 w-4 ml-1" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={() => setEditingSubject(null)}>
                  <X className="h-4 w-4 ml-1" />
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