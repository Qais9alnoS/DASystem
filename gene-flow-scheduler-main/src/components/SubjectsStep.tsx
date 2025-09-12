import { useState } from "react"
import { GalleryCard } from "@/components/GalleryCard"
import { StepWizard } from "@/components/StepWizard"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Subject {
  id: string
  name: string
  weeklyHours: number
  classes: string[]
}

interface SubjectsStepProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export const SubjectsStep = ({ onNext, onBack, onSkip }: SubjectsStepProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSubject, setNewSubject] = useState({
    name: "",
    weeklyHours: 1,
    classes: [] as string[]
  })
  const { toast } = useToast()

  const availableClasses = [
    "روضة 3", "الصف الأول", "الصف الثاني", "الصف الثالث", "الصف الرابع", "الصف الخامس",
    "الصف السادس", "الصف السابع", "الصف الثامن", "الصف التاسع", "الصف العاشر", "الصف الحادي عشر", "الصف الثاني عشر"
  ]

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى إدخال اسم المادة",
        variant: "destructive"
      })
      return
    }

    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      weeklyHours: newSubject.weeklyHours,
      classes: newSubject.classes
    }

    setSubjects([...subjects, subject])
    setNewSubject({ name: "", weeklyHours: 1, classes: [] })
    setIsModalOpen(false)
    
    toast({
      title: "تمت إضافة المادة",
      description: `تم إضافة ${subject.name} بنجاح`
    })
  }

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id))
    toast({
      title: "Subject Deleted",
      description: "Subject has been removed"
    })
  }

  const toggleClass = (className: string) => {
    setNewSubject(prev => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className]
    }))
  }

  return (
    <StepWizard
      currentStep={1}
      totalSteps={4}
      title="معلومات المواد"
      subtitle="حدد المواد ومتطلباتها الأسبوعية"
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      canGoBack={false}
      showSkip={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Existing subjects */}
        {subjects.map((subject) => (
          <GalleryCard
            key={subject.id}
            title={subject.name}
            onDelete={() => handleDeleteSubject(subject.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 ml-2" />
                {subject.weeklyHours} حصص/أسبوع
              </div>
              
              <div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Users className="w-4 h-4 ml-2" />
                  الصفوف ({subject.classes.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {subject.classes.slice(0, 3).map((className) => (
                    <Badge key={className} variant="secondary" className="text-xs">
                      {className}
                    </Badge>
                  ))}
                  {subject.classes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{subject.classes.length - 3} أخرى
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </GalleryCard>
        ))}

        {/* Add new subject card */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <div>
              <GalleryCard
                isAddCard
                title="إضافة مادة"
                description="إنشاء مادة جديدة مع الصفوف والحصص الأسبوعية"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="acrylic-card sm:max-w-md animate-scale-in border-0 shadow-elevation-3">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <BookOpen className="w-5 h-5 ml-2 text-primary" />
                إضافة مادة جديدة
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Subject Name */}
              <div className="space-y-2">
                <Label htmlFor="subject-name">اسم المادة</Label>
                <Input
                  id="subject-name"
                  placeholder="مثال: الرياضيات، اللغة الإنجليزية، العلوم"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
              </div>

              {/* Weekly Hours */}
              <div className="space-y-2">
                <Label htmlFor="weekly-hours">الحصص الأسبوعية</Label>
                <Input
                  id="weekly-hours"
                  type="number"
                  min="1"
                  max="20"
                  value={newSubject.weeklyHours}
                  onChange={(e) => setNewSubject({ ...newSubject, weeklyHours: parseInt(e.target.value) || 1 })}
                />
              </div>

              {/* Classes Selection */}
              <div className="space-y-2">
                <Label>الصفوف</Label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableClasses.map((className) => (
                    <Button
                      key={className}
                      variant={newSubject.classes.includes(className) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleClass(className)}
                      className="text-xs"
                    >
                      {className}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  المختار: {newSubject.classes.length} صف
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 space-x-reverse">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddSubject}>
                  إضافة المادة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <BookOpen className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">لا توجد مواد حتى الآن</h3>
          <p className="text-muted-foreground">
            أضف أول مادة لك لبدء عملية الجدولة
          </p>
        </div>
      )}
    </StepWizard>
  )
}
