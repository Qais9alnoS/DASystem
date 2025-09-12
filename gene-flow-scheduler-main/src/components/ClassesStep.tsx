import { useState } from "react"
import { GalleryCard } from "@/components/GalleryCard"
import { StepWizard } from "@/components/StepWizard"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, BookOpen, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClassInfo {
  id: string
  name: string
  subjects: string[]
  maxPerDay: number
}

interface ClassesStepProps {
  onNext: () => void
  onBack: () => void
}

export const ClassesStep = ({ onNext, onBack }: ClassesStepProps) => {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newClass, setNewClass] = useState({
    name: "",
    subjects: [] as string[],
    maxPerDay: 6
  })
  const { toast } = useToast()

  const availableClasses = [
    "KG3", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ]
  const availableSubjects = ["Mathematics", "English", "Science", "Arabic", "History", "Geography", "Art", "PE"]

  const handleAddClass = () => {
    if (!newClass.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select or enter a class name",
        variant: "destructive"
      })
      return
    }

    const classInfo: ClassInfo = {
      id: Date.now().toString(),
      name: newClass.name,
      subjects: newClass.subjects,
      maxPerDay: newClass.maxPerDay
    }

    setClasses([...classes, classInfo])
    setNewClass({ name: "", subjects: [], maxPerDay: 6 })
    setIsModalOpen(false)
    
    toast({
      title: "Class Added",
      description: `${classInfo.name} has been added successfully`
    })
  }

  const handleDeleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id))
    toast({
      title: "Class Deleted",
      description: "Class has been removed"
    })
  }

  const toggleSubject = (subject: string) => {
    setNewClass(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const selectClassName = (className: string) => {
    setNewClass(prev => ({ ...prev, name: className }))
  }

  return (
    <StepWizard
      currentStep={3}
      totalSteps={4}
      title="معلومات الصفوف"
      subtitle="تكوين جداول الصفوف وتوزيع المواد"
      onNext={onNext}
      onBack={onBack}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Existing classes */}
        {classes.map((classInfo) => (
          <GalleryCard
            key={classInfo.id}
            title={classInfo.name}
            onDelete={() => handleDeleteClass(classInfo.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4 mr-2" />
                {classInfo.subjects.length} subjects
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                Max {classInfo.maxPerDay} periods/day
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Subjects:</div>
                <div className="flex flex-wrap gap-1">
                  {classInfo.subjects.slice(0, 3).map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                  {classInfo.subjects.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{classInfo.subjects.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </GalleryCard>
        ))}

        {/* Add new class card */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <div>
              <GalleryCard
                isAddCard
                title="Add Class"
                description="Configure a new class with subjects and limits"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md animate-scale-in">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                Add New Class
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Class Name Selection */}
              <div className="space-y-2">
                <Label>Class Name</Label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableClasses.map((className) => (
                    <Button
                      key={className}
                      variant={newClass.name === className ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectClassName(className)}
                      className="text-xs"
                    >
                      {className}
                    </Button>
                  ))}
                </div>
                
                {/* Custom name input */}
                <div className="pt-2">
                  <Label htmlFor="custom-name" className="text-sm">Or enter custom name:</Label>
                  <Input
                    id="custom-name"
                    placeholder="e.g. Grade 12-A, Science Section"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Subjects Assignment */}
              <div className="space-y-2">
                <Label>Assigned Subjects</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSubjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={newClass.subjects.includes(subject) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSubject(subject)}
                      className="text-xs justify-start"
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {newClass.subjects.length} subjects
                </p>
              </div>

              {/* Max Sessions Per Day */}
              <div className="space-y-2">
                <Label htmlFor="max-per-day">Maximum Sessions Per Day</Label>
                <Input
                  id="max-per-day"
                  type="number"
                  min="1"
                  max="8"
                  value={newClass.maxPerDay}
                  onChange={(e) => setNewClass({ ...newClass, maxPerDay: parseInt(e.target.value) || 6 })}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 6-8 sessions per day
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddClass}>
                  Add Class
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <GraduationCap className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">No classes yet</h3>
          <p className="text-muted-foreground">
            Add classes to complete your school structure setup
          </p>
        </div>
      )}
    </StepWizard>
  )
}
