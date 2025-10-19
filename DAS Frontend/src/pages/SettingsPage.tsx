import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOSSwitch } from '@/components/ui/ios-switch';
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
import { IOSNavbar } from '@/components/ui/ios-navbar';
import { IOSTabBar } from '@/components/ui/ios-tabbar';
import { SegmentedControl } from '@/components/ui/segmented-control';

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
  const [activeTab, setActiveTab] = useState('general');
  const [iosActiveTab, setIosActiveTab] = useState("settings");

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
    } catch (error) {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (savedSettings) {
      mapApiSettingsToState(savedSettings.configurations);
      setHasUnsavedChanges(false);
      toast({
        title: "تمت إعادة التعيين",
        description: "تمت إعادة الإعدادات إلى القيم المحفوظة"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* iOS Navigation Bar */}
      <IOSNavbar 
        title="الإعدادات" 
        largeTitle={true}
      />
      
      <div className="p-4 pb-24">
        {/* Header with save/reset buttons */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              إعدادات النظام
            </h1>
            <p className="text-muted-foreground mt-1">
              تخصيص إعدادات المشروع والجدولة
            </p>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSettings}
              disabled={!hasUnsavedChanges}
              className="rounded-full"
            >
              <RotateCcw className="h-4 w-4 ml-2" />
              إعادة تعيين
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges || isLoading}
              className="rounded-full"
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </Button>
          </div>
        </div>

        {/* Segmented Control for Tabs */}
        <div className="mb-6">
          <SegmentedControl
            options={[
              { value: "general", label: "عامة" },
              { value: "scheduling", label: "جدولة" },
              { value: "advanced", label: "متقدمة" },
              { value: "password", label: "كلمة المرور" }
            ]}
            value={activeTab}
            onValueChange={setActiveTab}
          />
        </div>

        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card className="rounded-3xl border-0 shadow-ios">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  الإعدادات الأساسية
                </CardTitle>
                <CardDescription>
                  إعدادات عامة للمدرسة والنظام
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">اسم المدرسة</Label>
                  <Input
                    id="projectName"
                    value={projectSettings.projectName}
                    onChange={(e) => updateSetting('projectName', e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>أيام الدراسة</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCHOOL_DAYS.map((day) => (
                      <div key={day} className="flex items-center space-x-2 space-x-reverse">
                        <IOSSwitch
                          checked={projectSettings.schoolDays.includes(day)}
                          onCheckedChange={(checked) => {
                            const newDays = checked
                              ? [...projectSettings.schoolDays, day]
                              : projectSettings.schoolDays.filter(d => d !== day);
                            updateSetting('schoolDays', newDays);
                          }}
                        />
                        <Label className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodsPerDay">عدد الحصص في اليوم</Label>
                    <Input
                      id="periodsPerDay"
                      type="number"
                      min="1"
                      max="12"
                      value={projectSettings.periodsPerDay}
                      onChange={(e) => updateSetting('periodsPerDay', parseInt(e.target.value) || 6)}
                      className="rounded-2xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="periodDuration">مدة الحصة (بالدقائق)</Label>
                    <Input
                      id="periodDuration"
                      type="number"
                      min="10"
                      max="120"
                      value={projectSettings.periodDuration}
                      onChange={(e) => updateSetting('periodDuration', parseInt(e.target.value) || 45)}
                      className="rounded-2xl"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">مدة الاستراحة (بالدقائق)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    min="0"
                    max="60"
                    value={projectSettings.breakDuration}
                    onChange={(e) => updateSetting('breakDuration', parseInt(e.target.value) || 15)}
                    className="rounded-2xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "scheduling" && (
          <div className="space-y-6">
            {/* Scheduling Preferences */}
            <Card className="rounded-3xl border-0 shadow-ios">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  تفضيلات الجدولة
                </CardTitle>
                <CardDescription>
                  تخصيص خوارزمية الجدولة
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">إعطاء الأولوية لحمولة المعلم</Label>
                      <p className="text-sm text-muted-foreground">
                        توزيع الحصص بشكل متساوٍ على المعلمين
                      </p>
                    </div>
                    <IOSSwitch
                      checked={projectSettings.prioritizeTeacherWorkload}
                      onCheckedChange={(checked) => updateSetting('prioritizeTeacherWorkload', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">السماح بالفترات الفارغة</Label>
                      <p className="text-sm text-muted-foreground">
                        السماح بفترات فارغة في الجدول
                      </p>
                    </div>
                    <IOSSwitch
                      checked={projectSettings.allowEmptyPeriods}
                      onCheckedChange={(checked) => updateSetting('allowEmptyPeriods', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">توزيع المواد بشكل متساوٍ</Label>
                      <p className="text-sm text-muted-foreground">
                        توزيع المواد على مدار الأسبوع
                      </p>
                    </div>
                    <IOSSwitch
                      checked={projectSettings.distributeSubjectsEvenly}
                      onCheckedChange={(checked) => updateSetting('distributeSubjectsEvenly', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">تفضيل المواد المهمة في الصباح</Label>
                      <p className="text-sm text-muted-foreground">
                        وضع المواد المهمة في الحصص الأولى
                      </p>
                    </div>
                    <IOSSwitch
                      checked={projectSettings.preferMorningForImportantSubjects}
                      onCheckedChange={(checked) => updateSetting('preferMorningForImportantSubjects', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">تجنب آخر حصة للمواد الصعبة</Label>
                      <p className="text-sm text-muted-foreground">
                        عدم وضع المواد الصعبة في آخر اليوم
                      </p>
                    </div>
                    <IOSSwitch
                      checked={projectSettings.avoidLastPeriodForDifficultSubjects}
                      onCheckedChange={(checked) => updateSetting('avoidLastPeriodForDifficultSubjects', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-6">
            {/* Advanced Settings */}
            <Card className="rounded-3xl border-0 shadow-ios">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  الإعدادات المتقدمة
                </CardTitle>
                <CardDescription>
                  إعدادات متقدمة للتحكم في النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">توليد الجدول تلقائيًا بعد التغييرات</Label>
                      <p className="text-sm text-muted-foreground">
                        توليد الجدول تلقائيًا عند إجراء تغييرات
                      </p>
                    </div>
                    <IOSSwitch
                      checked={projectSettings.autoGenerateAfterChanges}
                      onCheckedChange={(checked) => updateSetting('autoGenerateAfterChanges', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">حفظ نسخة احتياطية قبل التوليد</Label>
                      <p className="text-sm text-muted-foreground">
                        حفظ نسخة احتياطية قبل كل عملية توليد
                      </p>
                    </div>
                    <IOSSwitch
                      checked={projectSettings.saveBackupBeforeGeneration}
                      onCheckedChange={(checked) => updateSetting('saveBackupBeforeGeneration', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxGenerationAttempts">الحد الأقصى لمحاولات التوليد</Label>
                    <Input
                      id="maxGenerationAttempts"
                      type="number"
                      min="1"
                      max="1000"
                      value={projectSettings.maxGenerationAttempts}
                      onChange={(e) => updateSetting('maxGenerationAttempts', parseInt(e.target.value) || 100)}
                      className="rounded-2xl"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">تمكين حل التضارب</Label>
                      <p className="text-sm text-muted-foreground">
                        تفعيل خوارزمية حل التضارب تلقائيًا
                      </p>
                    </div>
                    <IOSSwitch
                      checked={projectSettings.enableConflictResolution}
                      onCheckedChange={(checked) => updateSetting('enableConflictResolution', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "password" && (
          <Card className="rounded-3xl border-0 shadow-ios">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                تغيير كلمة المرور
              </CardTitle>
              <CardDescription>
                تحديث كلمة مرور الحساب
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        )}
      </div>

      {/* iOS Tab Bar */}
      <IOSTabBar activeTab={iosActiveTab} onTabChange={setIosActiveTab} />
    </div>
  );
};

export default SettingsPage;