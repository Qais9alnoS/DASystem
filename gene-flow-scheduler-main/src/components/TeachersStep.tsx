import { useState } from "react"
import { GalleryCard } from "@/components/GalleryCard"
import { StepWizard } from "@/components/StepWizard"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { User, BookOpen, Users, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Teacher {
  id: string
  name: string
  subjects: string[]
  classes: string[]
  availability: boolean[][]
}

interface TeachersStepProps {
  onNext: () => void
  onBack: () => void
}

export const TeachersStep = ({ onNext, onBack }: TeachersStepProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    subjects: [] as string[],
    classes: [] as string[],
    availability: Array(5).fill(null).map(() => Array(8).fill(true))
  })
  const { toast } = useToast()

  const availableSubjects = ["الرياضيات", "اللغة الإنجليزية", "العلوم", "اللغة العربية", "التاريخ", "الجغرافيا", "الفنون", "التربية البدنية"]
  const availableClasses = [
    "روضة 3", "الصف الأول", "الصف الثاني", "الصف الثالث", "الصف الرابع", "الصف الخامس",
    "الصف السادس", "الصف السابع", "الصف الثامن", "الصف التاسع", "الصف العاشر", "الصف الحادي عشر", "الصف الثاني عشر"
  ]
  const days = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
  const periods = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة"]

  const handleAddTeacher = () => {
    if (!newTeacher.name.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى إدخال اسم المعلم",
        variant: "destructive"
      })
      return
    }

    const teacher: Teacher = {
      id: Date.now().toString(),
      name: newTeacher.name,
      subjects: newTeacher.subjects,
      classes: newTeacher.classes,
      availability: newTeacher.availability
    }

    setTeachers([...teachers, teacher])
    setNewTeacher({
      name: "",
      subjects: [],
      classes: [],
      availability: Array(5).fill(null).map(() => Array(8).fill(true))
    })
    setIsModalOpen(false)
    
    toast({
      title: "تمت إضافة المعلم",
      description: `تم إضافة ${teacher.name} بنجاح`
    })
  }

  const handleDeleteTeacher = (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id))
    toast({
      title: "Teacher Deleted",
      description: "Teacher has been removed"
    })
  }

  const toggleSubject = (subject: string) => {
    setNewTeacher(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const toggleClass = (className: string) => {
    setNewTeacher(prev => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className]
    }))
  }

  const toggleAvailability = (day: number, period: number) => {
    setNewTeacher(prev => ({
      ...prev,
      availability: prev.availability.map((dayAvail, dayIndex) =>
        dayIndex === day
          ? dayAvail.map((periodAvail, periodIndex) =>
              periodIndex === period ? !periodAvail : periodAvail
            )
          : dayAvail
      )
    }))
  }

  const getAvailabilityCount = (teacher: Teacher) => {
    return teacher.availability.flat().filter(Boolean).length
  }

  return (
    <StepWizard
      currentStep={2}
      totalSteps={4}
      title="معلومات المعلمين"
      subtitle="إضافة المعلمين وتحديد مواعيدهم"
      onNext={onNext}
      onBack={onBack}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Existing teachers */}
        {teachers.map((teacher) => (
          <GalleryCard
            key={teacher.id}
            title={teacher.name}
            onDelete={() => handleDeleteTeacher(teacher.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4 ml-2" />
                {teacher.subjects.length} مادة
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 ml-2" />
                {teacher.classes.length} صف
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 ml-2" />
                {getAvailabilityCount(teacher)}/40 حصة متاحة
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">المواد:</div>
                <div className="flex flex-wrap gap-1">
                  {teacher.subjects.slice(0, 2).map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                  {teacher.subjects.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{teacher.subjects.length - 2} أخرى
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </GalleryCard>
        ))}

        {/* Add new teacher card */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <div>
              <GalleryCard
                isAddCard
                title="إضافة معلم"
                description="إضافة معلم جديد مع المواد والمواعيد المتاحة"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="acrylic-card sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in border-0 shadow-elevation-3">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <User className="w-5 h-5 ml-2 text-primary" />
                إضافة معلم جديد
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Teacher Name */}
              <div className="space-y-2">
                <Label htmlFor="teacher-name">اسم المعلم</Label>
                <Input
                  id="teacher-name"
                  placeholder="مثال: د. سارة أحمد"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                />
              </div>

              {/* Subjects */}
              <div className="space-y-2">
                <Label>المواد التي يدرسها</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSubjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={newTeacher.subjects.includes(subject) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSubject(subject)}
                      className="text-xs justify-start"
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Classes */}
              <div className="space-y-2">
                <Label>الصفوف التي يدرسها</Label>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {availableClasses.map((className) => (
                    <Button
                      key={className}
                      variant={newTeacher.classes.includes(className) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleClass(className)}
                      className="text-xs"
                    >
                      {className}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Availability Grid */}
              <div className="space-y-2">
                <Label>المواعيد المتاحة (اضغط للتبديل)</Label>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-9 gap-1 text-xs">
                    {/* Header */}
                    <div></div>
                    {periods.map((period) => (
                      <div key={period} className="text-center font-medium p-1">
                        {period}
                      </div>
                    ))}

                    {/* Availability grid */}
                    {days.map((day, dayIndex) => (
                      <div key={day} className="contents">
                        <div className="font-medium p-1 text-right">{day}</div>
                        {periods.map((_, periodIndex) => (
                          <div
                            key={`${dayIndex}-${periodIndex}`}
                            className={`aspect-square rounded cursor-pointer transition-colors ${
                              newTeacher.availability[dayIndex][periodIndex]
                                ? 'bg-primary hover:bg-primary/80'
                                : 'bg-destructive/20 hover:bg-destructive/30'
                            }`}
                            onClick={() => toggleAvailability(dayIndex, periodIndex)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    المتاح: {newTeacher.availability.flat().filter(Boolean).length}/40 حصة
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 space-x-reverse">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddTeacher}>
                  إضافة المعلم
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teachers.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <User className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">لا يوجد معلمون حتى الآن</h3>
          <p className="text-muted-foreground">
            أضف معلمين لتحديد من سيدرس المواد
          </p>
        </div>
      )}
    </StepWizard>
  )
}
