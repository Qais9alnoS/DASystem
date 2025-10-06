import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Clock, 
  Calendar,
  GraduationCap,
  Users,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { ChangePasswordForm } from '@/components/layout/ChangePasswordForm';
import { systemApi } from '@/services/api';

interface ProjectSettings {
  // Basic Settings
  projectName: string;
  schoolDays: string[];
  periodsPerDay: number;
  periodDuration: number; // minutes
  breakDuration: number; // minutes
  
  // Grade Settings
  enabledGrades: {
    primary: boolean;
    preparatory: boolean;
    secondary: boolean;
    baccalaureate: boolean;
  };
  
  // Division Settings
  defaultDivisionTypes: {
    primary: string; // single, boys_girls, custom
    preparatory: string;
    secondary: string; 
    baccalaureate: string; // mixed includes literary track
  };
  
  // Scheduling Preferences
  prioritizeTeacherWorkload: boolean;
  allowEmptyPeriods: boolean;
  distributeSubjectsEvenly: boolean;
  preferMorningForImportantSubjects: boolean;
  avoidLastPeriodForDifficultSubjects: boolean;
  
  // Advanced Settings
  autoGenerateAfterChanges: boolean;
  saveBackupBeforeGeneration: boolean;
  maxGenerationAttempts: number;
  enableConflictResolution: boolean;
}

const SettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();

  // Settings data - will be replaced with actual data from backend
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    // Basic Settings
    projectName: "مدرسة الأمل الابتدائية",
    schoolDays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
    periodsPerDay: 6,
    periodDuration: 45, // minutes
    breakDuration: 15, // minutes
    
    // Grade Settings
    enabledGrades: {
      primary: true,
      preparatory: true,
      secondary: true,
      baccalaureate: true
    },
    
    // Division Settings
    defaultDivisionTypes: {
      primary: "single", // single, boys_girls, custom
      preparatory: "boys_girls",
      secondary: "boys_girls", 
      baccalaureate: "mixed" // mixed includes literary track
    },
    
    // Scheduling Preferences
    prioritizeTeacherWorkload: true,
    allowEmptyPeriods: false,
    distributeSubjectsEvenly: true,
    preferMorningForImportantSubjects: true,
    avoidLastPeriodForDifficultSubjects: true,
    
    // Advanced Settings
    autoGenerateAfterChanges: false,
    saveBackupBeforeGeneration: true,
    maxGenerationAttempts: 100,
    enableConflictResolution: true
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedSettings, setSavedSettings] = useState<any>(null);

  useEffect(() => {
    // Load settings from backend
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await systemApi.getConfigurations();
        if (response.success && response.data) {
          setSavedSettings(response.data);
          // Map API response to our local state structure
          mapApiSettingsToState(response.data.configurations);
        } else {
          throw new Error(response.message || "Failed to load settings");
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: "خطأ في تحميل الإعدادات",
          description: "حدث خطأ أثناء تحميل إعدادات المشروع",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [projectId, toast]);

  const mapApiSettingsToState = (apiSettings: any) => {
    // This function maps API settings to our local state structure
    // For now, we'll use the default settings since we need to implement
    // the proper mapping based on the actual API response structure
    setProjectSettings(prev => ({ ...prev }));
  };

  const SCHOOL_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  const updateSetting = (path: string, value: any) => {
    setProjectSettings(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      // Save settings to backend
      setIsLoading(true);
      
      // Save each setting individually
      const settingsToSave = [
        { key: 'academic.school_name', value: projectSettings.projectName, type: 'string', category: 'academic' },
        { key: 'scheduling.periods_per_day', value: projectSettings.periodsPerDay.toString(), type: 'integer', category: 'scheduling' },
        { key: 'scheduling.period_duration_minutes', value: projectSettings.periodDuration.toString(), type: 'integer', category: 'scheduling' },
        { key: 'scheduling.break_duration_minutes', value: projectSettings.breakDuration.toString(), type: 'integer', category: 'scheduling' },
        { key: 'scheduling.prioritize_teacher_workload', value: projectSettings.prioritizeTeacherWorkload.toString(), type: 'boolean', category: 'scheduling' },
        { key: 'scheduling.allow_empty_periods', value: projectSettings.allowEmptyPeriods.toString(), type: 'boolean', category: 'scheduling' },
        { key: 'scheduling.distribute_subjects_evenly', value: projectSettings.distributeSubjectsEvenly.toString(), type: 'boolean', category: 'scheduling' },
        { key: 'scheduling.prefer_morning_for_important_subjects', value: projectSettings.preferMorningForImportantSubjects.toString(), type: 'boolean', category: 'scheduling' },
        { key: 'scheduling.avoid_last_period_for_difficult_subjects', value: projectSettings.avoidLastPeriodForDifficultSubjects.toString(), type: 'boolean', category: 'scheduling' },
        { key: 'scheduling.auto_generate_after_changes', value: projectSettings.autoGenerateAfterChanges.toString(), type: 'boolean', category: 'scheduling' },
        { key: 'scheduling.save_backup_before_generation', value: projectSettings.saveBackupBeforeGeneration.toString(), type: 'boolean', category: 'scheduling' },
        { key: 'scheduling.max_generation_attempts', value: projectSettings.maxGenerationAttempts.toString(), type: 'integer', category: 'scheduling' },
        { key: 'scheduling.enable_conflict_resolution', value: projectSettings.enableConflictResolution.toString(), type: 'boolean', category: 'scheduling' },
      ];
      
      // Save each setting
      for (const setting of settingsToSave) {
        await systemApi.updateConfiguration(
          setting.key,
          setting.value,
          setting.type,
          undefined,
          setting.category
        );
      }
      
      setHasUnsavedChanges(false);
      
      toast({
        title: "نجاح",
        description: "تم حفظ الإعدادات بنجاح"
      });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: error.message || "حدث خطأ أثناء حفظ إعدادات المشروع",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default settings
    setProjectSettings({
      // Basic Settings
      projectName: "مدرسة الأمل الابتدائية",
      schoolDays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      periodsPerDay: 6,
      periodDuration: 45, // minutes
      breakDuration: 15, // minutes
      
      // Grade Settings
      enabledGrades: {
        primary: true,
        preparatory: true,
        secondary: true,
        baccalaureate: true
      },
      
      // Division Settings
      defaultDivisionTypes: {
        primary: "single", // single, boys_girls, custom
        preparatory: "boys_girls",
        secondary: "boys_girls", 
        baccalaureate: "mixed" // mixed includes literary track
      },
      
      // Scheduling Preferences
      prioritizeTeacherWorkload: true,
      allowEmptyPeriods: false,
      distributeSubjectsEvenly: true,
      preferMorningForImportantSubjects: true,
      avoidLastPeriodForDifficultSubjects: true,
      
      // Advanced Settings
      autoGenerateAfterChanges: false,
      saveBackupBeforeGeneration: true,
      maxGenerationAttempts: 100,
      enableConflictResolution: true
    });
    setHasUnsavedChanges(false);
    
    toast({
      title: "نجاح",
      description: "تم إعادة تعيين الإعدادات إلى القيم الافتراضية"
    });
  };

  const toggleSchoolDay = (day: string) => {
    const currentDays = projectSettings.schoolDays;
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    updateSetting('schoolDays', updatedDays);
  };

  if (isLoading && !savedSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات المشروع</h1>
          <p className="text-muted-foreground">
            تخصيص إعدادات الجدولة والمشروع
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleResetSettings}
            disabled={!hasUnsavedChanges}
          >
            <RotateCcw className="h-4 w-4 ml-1" />
            إعادة تعيين
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-1" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">يوجد تغييرات غير محفوظة</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              تأكد من حفظ التغييرات قبل المغادرة
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">الإعدادات الأساسية</TabsTrigger>
          <TabsTrigger value="schedule">إعدادات الجدولة</TabsTrigger>
          <TabsTrigger value="grades">الصفوف والشعب</TabsTrigger>
          <TabsTrigger value="password">كلمة المرور</TabsTrigger>
          <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
        </TabsList>

        {/* Basic Settings */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                معلومات المشروع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">اسم المشروع</Label>
                <Input
                  id="projectName"
                  value={projectSettings.projectName}
                  onChange={(e) => updateSetting('projectName', e.target.value)}
                  className="text-right"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                أيام الدوام
              </CardTitle>
              <CardDescription>
                حدد أيام الدوام المدرسي (يجب اختيار 5 أيام على الأقل)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SCHOOL_DAYS.map((day) => (
                  <Button
                    key={day}
                    variant={projectSettings.schoolDays.includes(day) ? "default" : "outline"}
                    onClick={() => toggleSchoolDay(day)}
                    className="justify-start"
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                إعدادات الحصص
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="periodsPerDay">عدد الحصص في اليوم</Label>
                <Input
                  id="periodsPerDay"
                  type="number"
                  min="1"
                  max="12"
                  value={projectSettings.periodsPerDay}
                  onChange={(e) => updateSetting('periodsPerDay', parseInt(e.target.value) || 6)}
                />
              </div>
              <div>
                <Label htmlFor="periodDuration">مدة الحصة (بالدقائق)</Label>
                <Input
                  id="periodDuration"
                  type="number"
                  min="10"
                  max="120"
                  value={projectSettings.periodDuration}
                  onChange={(e) => updateSetting('periodDuration', parseInt(e.target.value) || 45)}
                />
              </div>
              <div>
                <Label htmlFor="breakDuration">مدة الاستراحة (بالدقائق)</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  min="5"
                  max="60"
                  value={projectSettings.breakDuration}
                  onChange={(e) => updateSetting('breakDuration', parseInt(e.target.value) || 15)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Settings */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                تفضيلات الجدولة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>إعطاء الأولوية لتحميل المعلم</Label>
                  <p className="text-sm text-muted-foreground">
                    توزيع الحصص بشكل متساوي على المعلمين
                  </p>
                </div>
                <Switch
                  checked={projectSettings.prioritizeTeacherWorkload}
                  onCheckedChange={(checked) => updateSetting('prioritizeTeacherWorkload', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>السماح بالفترات الفارغة</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح بإنشاء جداول تحتوي على فترات فارغة
                  </p>
                </div>
                <Switch
                  checked={projectSettings.allowEmptyPeriods}
                  onCheckedChange={(checked) => updateSetting('allowEmptyPeriods', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>توزيع المواد بشكل متساوي</Label>
                  <p className="text-sm text-muted-foreground">
                    توزيع المواد على مدار الأسبوع بشكل متساوي
                  </p>
                </div>
                <Switch
                  checked={projectSettings.distributeSubjectsEvenly}
                  onCheckedChange={(checked) => updateSetting('distributeSubjectsEvenly', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>تفضيل الصباح للمواد المهمة</Label>
                  <p className="text-sm text-muted-foreground">
                    وضع المواد المهمة في الحصص الصباحية
                  </p>
                </div>
                <Switch
                  checked={projectSettings.preferMorningForImportantSubjects}
                  onCheckedChange={(checked) => updateSetting('preferMorningForImportantSubjects', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>تجنب آخر حصة للمواد الصعبة</Label>
                  <p className="text-sm text-muted-foreground">
                    عدم وضع المواد الصعبة في آخر الحصص
                  </p>
                </div>
                <Switch
                  checked={projectSettings.avoidLastPeriodForDifficultSubjects}
                  onCheckedChange={(checked) => updateSetting('avoidLastPeriodForDifficultSubjects', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grades Settings */}
        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                تفعيل المراحل الدراسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>المرحلة الابتدائية</Label>
                  <p className="text-sm text-muted-foreground">
                    الصفوف من 1 إلى 6
                  </p>
                </div>
                <Switch
                  checked={projectSettings.enabledGrades.primary}
                  onCheckedChange={(checked) => updateSetting('enabledGrades.primary', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>المرحلة الإعدادية</Label>
                  <p className="text-sm text-muted-foreground">
                    الصفوف من 7 إلى 9
                  </p>
                </div>
                <Switch
                  checked={projectSettings.enabledGrades.preparatory}
                  onCheckedChange={(checked) => updateSetting('enabledGrades.preparatory', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>المرحلة الثانوية</Label>
                  <p className="text-sm text-muted-foreground">
                    الصفوف من 10 إلى 11
                  </p>
                </div>
                <Switch
                  checked={projectSettings.enabledGrades.secondary}
                  onCheckedChange={(checked) => updateSetting('enabledGrades.secondary', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>المرحلة البكالوريا</Label>
                  <p className="text-sm text-muted-foreground">
                    الصف 12
                  </p>
                </div>
                <Switch
                  checked={projectSettings.enabledGrades.baccalaureate}
                  onCheckedChange={(checked) => updateSetting('enabledGrades.baccalaureate', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                أنواع الشعب الافتراضية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primaryDivision">المرحلة الابتدائية</Label>
                <Select
                  value={projectSettings.defaultDivisionTypes.primary}
                  onValueChange={(value) => updateSetting('defaultDivisionTypes.primary', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">شعبة واحدة</SelectItem>
                    <SelectItem value="boys_girls">شباب وبنات</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="preparatoryDivision">المرحلة الإعدادية</Label>
                <Select
                  value={projectSettings.defaultDivisionTypes.preparatory}
                  onValueChange={(value) => updateSetting('defaultDivisionTypes.preparatory', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">شعبة واحدة</SelectItem>
                    <SelectItem value="boys_girls">شباب وبنات</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="secondaryDivision">المرحلة الثانوية</Label>
                <Select
                  value={projectSettings.defaultDivisionTypes.secondary}
                  onValueChange={(value) => updateSetting('defaultDivisionTypes.secondary', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">شعبة واحدة</SelectItem>
                    <SelectItem value="boys_girls">شباب وبنات</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="baccalaureateDivision">المرحلة البكالوريا</Label>
                <Select
                  value={projectSettings.defaultDivisionTypes.baccalaureate}
                  onValueChange={(value) => updateSetting('defaultDivisionTypes.baccalaureate', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">مختلط (علمي وآداب)</SelectItem>
                    <SelectItem value="scientific">علمي فقط</SelectItem>
                    <SelectItem value="literary">آداب فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Settings */}
        <TabsContent value="password">
          <ChangePasswordForm />
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات متقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>إنشاء جدول تلقائي بعد التغييرات</Label>
                  <p className="text-sm text-muted-foreground">
                    إنشاء جدول جديد تلقائيًا عند تغيير الإعدادات
                  </p>
                </div>
                <Switch
                  checked={projectSettings.autoGenerateAfterChanges}
                  onCheckedChange={(checked) => updateSetting('autoGenerateAfterChanges', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>حفظ نسخة احتياطية قبل الإنشاء</Label>
                  <p className="text-sm text-muted-foreground">
                    حفظ نسخة احتياطية من الجدول الحالي قبل إنشاء جدول جديد
                  </p>
                </div>
                <Switch
                  checked={projectSettings.saveBackupBeforeGeneration}
                  onCheckedChange={(checked) => updateSetting('saveBackupBeforeGeneration', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>تمكين حل التعارضات</Label>
                  <p className="text-sm text-muted-foreground">
                    محاولة حل التعارضات تلقائيًا أثناء إنشاء الجدول
                  </p>
                </div>
                <Switch
                  checked={projectSettings.enableConflictResolution}
                  onCheckedChange={(checked) => updateSetting('enableConflictResolution', checked)}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="maxGenerationAttempts">الحد الأقصى لمحاولات الإنشاء</Label>
                <Input
                  id="maxGenerationAttempts"
                  type="number"
                  min="1"
                  max="1000"
                  value={projectSettings.maxGenerationAttempts}
                  onChange={(e) => updateSetting('maxGenerationAttempts', parseInt(e.target.value) || 100)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  عدد المحاولات القصوى لإنشاء جدول مثالي
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;