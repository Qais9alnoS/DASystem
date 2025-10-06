import React, { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  BookOpen,
  Calendar,
  User,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { DEFAULT_GRADES, DEFAULT_DIVISIONS } from '@/types/project';
import { getAllUniqueSubjects } from '@/lib/defaultSubjects';

interface Teacher {
  id?: number;
  name: string;
  availableDays: string[];
  maxDailyHours: number;
  subjects: TeacherSubjectAssignment[];
}

interface TeacherSubjectAssignment {
  subjectName: string;
  gradeId: number;
  gradeName: string;
  divisionIds: number[];
  divisionNames: string[];
}

const SCHOOL_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export const TeachersManagementPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  // Mock data - will be replaced with actual data from backend
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: 1,
      name: "أحمد محمد علي",
      availableDays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء"],
      maxDailyHours: 6,
      subjects: [
        {
          subjectName: "رياضيات",
          gradeId: 1,
          gradeName: "الصف الأول الابتدائي",
          divisionIds: [1],
          divisionNames: ["أ"]
        },
        {
          subjectName: "رياضيات",
          gradeId: 2,
          gradeName: "الصف الثاني الابتدائي",
          divisionIds: [1],
          divisionNames: ["أ"]
        }
      ]
    },
    {
      id: 2,
      name: "فاطمة خالد",
      availableDays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      maxDailyHours: 5,
      subjects: [
        {
          subjectName: "لغة عربية",
          gradeId: 7,
          gradeName: "الصف السابع",
          divisionIds: [1, 2],
          divisionNames: ["شباب", "بنات"]
        }
      ]
    }
  ]);

  const [newTeacher, setNewTeacher] = useState<Teacher>({
    name: '',
    availableDays: [],
    maxDailyHours: 6,
    subjects: []
  });

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectAssignment, setNewSubjectAssignment] = useState({
    subjectName: '',
    gradeId: 1,
    divisionIds: [] as number[]
  });

  const uniqueSubjects = getAllUniqueSubjects();

  const getDivisionsForGrade = (gradeOrder: number) => {
    return DEFAULT_DIVISIONS.filter(div => div.grade_order === gradeOrder);
  };

  const handleAddTeacher = () => {
    const newId = Math.max(...teachers.map(t => t.id || 0)) + 1;
    setTeachers([...teachers, { ...newTeacher, id: newId }]);
    setNewTeacher({
      name: '',
      availableDays: [],
      maxDailyHours: 6,
      subjects: []
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher({ ...teacher });
  };

  const handleUpdateTeacher = () => {
    if (!editingTeacher) return;
    
    setTeachers(teachers.map(t => 
      t.id === editingTeacher.id ? editingTeacher : t
    ));
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = (teacherId: number) => {
    setTeachers(teachers.filter(t => t.id !== teacherId));
  };

  const handleAddSubjectToTeacher = (teacher: Teacher) => {
    const selectedGrade = DEFAULT_GRADES[newSubjectAssignment.gradeId - 1];
    const selectedDivisions = getDivisionsForGrade(newSubjectAssignment.gradeId);
    const assignedDivisions = selectedDivisions.filter((_, index) => 
      newSubjectAssignment.divisionIds.includes(index + 1)
    );

    const newAssignment: TeacherSubjectAssignment = {
      subjectName: newSubjectAssignment.subjectName,
      gradeId: newSubjectAssignment.gradeId,
      gradeName: selectedGrade.name,
      divisionIds: newSubjectAssignment.divisionIds,
      divisionNames: assignedDivisions.map(div => div.name)
    };

    const updatedTeacher = {
      ...teacher,
      subjects: [...teacher.subjects, newAssignment]
    };

    setTeachers(teachers.map(t => t.id === teacher.id ? updatedTeacher : t));
    setSelectedTeacher(updatedTeacher);
    
    setNewSubjectAssignment({
      subjectName: '',
      gradeId: 1,
      divisionIds: []
    });
    setIsAddingSubject(false);
  };

  const handleRemoveSubjectFromTeacher = (teacher: Teacher, subjectIndex: number) => {
    const updatedTeacher = {
      ...teacher,
      subjects: teacher.subjects.filter((_, index) => index !== subjectIndex)
    };
    
    setTeachers(teachers.map(t => t.id === teacher.id ? updatedTeacher : t));
    setSelectedTeacher(updatedTeacher);
  };

  const getTotalWeeklyHours = (teacher: Teacher): number => {
    // This would calculate based on subject assignments and weekly hours
    return teacher.subjects.length * 4; // Simplified calculation
  };

  const getWorkloadStatus = (teacher: Teacher): { status: string; color: string } => {
    const totalHours = getTotalWeeklyHours(teacher);
    const maxWeeklyHours = teacher.maxDailyHours * teacher.availableDays.length;
    
    if (totalHours > maxWeeklyHours) {
      return { status: "محمل زائد", color: "destructive" };
    } else if (totalHours > maxWeeklyHours * 0.8) {
      return { status: "محمل جيد", color: "default" };
    } else {
      return { status: "متاح", color: "secondary" };
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المعلمين</h1>
          <p className="text-muted-foreground">
            إضافة وإدارة المعلمين ومواد تدريسهم
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة معلم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة معلم جديد</DialogTitle>
              <DialogDescription>
                أضف معلم جديد وحدد مواد تدريسه وأوقات توفره
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teacherName">اسم المعلم</Label>
                <Input
                  id="teacherName"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  placeholder="مثال: أحمد محمد علي"
                  className="text-right"
                />
              </div>
              
              <div>
                <Label htmlFor="maxDailyHours">أقصى عدد حصص يومية</Label>
                <Input
                  id="maxDailyHours"
                  type="number"
                  min="1"
                  max="8"
                  value={newTeacher.maxDailyHours}
                  onChange={(e) => setNewTeacher({...newTeacher, maxDailyHours: parseInt(e.target.value)})}
                  className="text-right"
                />
              </div>

              <div>
                <Label>أيام التوفر</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {SCHOOL_DAYS.map((day) => (
                    <div key={day} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`day-${day}`}
                        checked={newTeacher.availableDays.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewTeacher({
                              ...newTeacher,
                              availableDays: [...newTeacher.availableDays, day]
                            });
                          } else {
                            setNewTeacher({
                              ...newTeacher,
                              availableDays: newTeacher.availableDays.filter(d => d !== day)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`day-${day}`} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddTeacher} 
                  disabled={!newTeacher.name.trim() || newTeacher.availableDays.length === 0}
                >
                  إضافة المعلم
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teachers List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teachers Cards */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                قائمة المعلمين ({teachers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {teachers.map((teacher) => {
                    const workload = getWorkloadStatus(teacher);
                    return (
                      <div
                        key={teacher.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedTeacher?.id === teacher.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedTeacher(teacher)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{teacher.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {teacher.subjects.length} مواد تدريس
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={workload.color as any} className="text-xs">
                                {workload.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {getTotalWeeklyHours(teacher)} حصة أسبوعياً
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTeacher(teacher);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeacher(teacher.id!);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {teachers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا يوجد معلمين مضافين</p>
                      <p className="text-sm">ابدأ بإضافة معلم جديد</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Details */}
        <div className="lg:col-span-2">
          {selectedTeacher ? (
            <div className="space-y-4">
              {/* Teacher Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedTeacher.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">أيام التوفر</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTeacher.availableDays.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">أقصى حصص يومية</Label>
                      <p className="text-lg font-semibold">{selectedTeacher.maxDailyHours}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{selectedTeacher.subjects.length}</p>
                      <p className="text-sm text-muted-foreground">مواد التدريس</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{getTotalWeeklyHours(selectedTeacher)}</p>
                      <p className="text-sm text-muted-foreground">حصة أسبوعياً</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedTeacher.availableDays.length}</p>
                      <p className="text-sm text-muted-foreground">أيام متاحة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Assignments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      مواد التدريس
                    </CardTitle>
                    <CardDescription>
                      المواد والصفوف المخصصة لهذا المعلم
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddingSubject(true)}
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة مادة
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTeacher.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{subject.subjectName}</h4>
                          <p className="text-sm text-muted-foreground">{subject.gradeName}</p>
                          <div className="flex gap-1 mt-1">
                            {subject.divisionNames.map((division) => (
                              <Badge key={division} variant="secondary" className="text-xs">
                                شعبة {division}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSubjectFromTeacher(selectedTeacher, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {selectedTeacher.subjects.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>لا توجد مواد مخصصة</p>
                        <p className="text-sm">أضف مواد التدريس لهذا المعلم</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">اختر معلماً لعرض التفاصيل</p>
                <p className="text-sm">انقر على أي معلم من القائمة لعرض معلوماته</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Subject Dialog */}
      {isAddingSubject && selectedTeacher && (
        <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مادة تدريس</DialogTitle>
              <DialogDescription>
                أضف مادة جديدة للمعلم {selectedTeacher.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subjectSelect">المادة الدراسية</Label>
                <Select value={newSubjectAssignment.subjectName} onValueChange={(value) => setNewSubjectAssignment({...newSubjectAssignment, subjectName: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="gradeSelect">الصف الدراسي</Label>
                <Select value={newSubjectAssignment.gradeId.toString()} onValueChange={(value) => setNewSubjectAssignment({...newSubjectAssignment, gradeId: parseInt(value), divisionIds: []})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_GRADES.map((grade, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الشعب</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getDivisionsForGrade(newSubjectAssignment.gradeId).map((division, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`division-${index}`}
                        checked={newSubjectAssignment.divisionIds.includes(index + 1)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewSubjectAssignment({
                              ...newSubjectAssignment,
                              divisionIds: [...newSubjectAssignment.divisionIds, index + 1]
                            });
                          } else {
                            setNewSubjectAssignment({
                              ...newSubjectAssignment,
                              divisionIds: newSubjectAssignment.divisionIds.filter(id => id !== index + 1)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`division-${index}`} className="text-sm">
                        شعبة {division.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleAddSubjectToTeacher(selectedTeacher)}
                  disabled={!newSubjectAssignment.subjectName || newSubjectAssignment.divisionIds.length === 0}
                >
                  إضافة
                </Button>
                <Button variant="outline" onClick={() => setIsAddingSubject(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Teacher Dialog */}
      {editingTeacher && (
        <Dialog open={!!editingTeacher} onOpenChange={() => setEditingTeacher(null)}>
          <DialogContent className="sm:max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل بيانات المعلم</DialogTitle>
              <DialogDescription>
                تعديل معلومات المعلم وأوقات توفره
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTeacherName">اسم المعلم</Label>
                <Input
                  id="editTeacherName"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
                  className="text-right"
                />
              </div>
              
              <div>
                <Label htmlFor="editMaxDailyHours">أقصى عدد حصص يومية</Label>
                <Input
                  id="editMaxDailyHours"
                  type="number"
                  min="1"
                  max="8"
                  value={editingTeacher.maxDailyHours}
                  onChange={(e) => setEditingTeacher({...editingTeacher, maxDailyHours: parseInt(e.target.value)})}
                  className="text-right"
                />
              </div>

              <div>
                <Label>أيام التوفر</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {SCHOOL_DAYS.map((day) => (
                    <div key={day} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`edit-day-${day}`}
                        checked={editingTeacher.availableDays.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditingTeacher({
                              ...editingTeacher,
                              availableDays: [...editingTeacher.availableDays, day]
                            });
                          } else {
                            setEditingTeacher({
                              ...editingTeacher,
                              availableDays: editingTeacher.availableDays.filter(d => d !== day)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`edit-day-${day}`} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateTeacher}>
                  <Check className="h-4 w-4 ml-1" />
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setEditingTeacher(null)}>
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