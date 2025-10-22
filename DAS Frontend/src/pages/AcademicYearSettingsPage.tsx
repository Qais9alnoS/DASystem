import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { systemApi } from '@/services/api';
import { Settings, Calendar, Save } from 'lucide-react';
import { IOSNavbar } from '@/components/ui/ios-navbar';

export function AcademicYearSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoOpenYear, setAutoOpenYear] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Try to fetch the auto-open setting
      // This is a simplified approach - in a real implementation, you'd fetch from the backend
      const savedSetting = localStorage.getItem('auto_open_academic_year');
      if (savedSetting !== null) {
        setAutoOpenYear(savedSetting === 'true');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعدادات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now
      localStorage.setItem('auto_open_academic_year', autoOpenYear ? 'true' : 'false');
      
      // In a real implementation, you would also save to the backend:
      // await systemApi.updateConfiguration(
      //   'auto_open_academic_year',
      //   autoOpenYear ? 'true' : 'false',
      //   'boolean',
      //   'Automatically open the last active academic year on startup',
      //   'academic'
      // );
      
      toast({
        title: "نجاح",
        description: "تم حفظ الإعدادات بنجاح",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <IOSNavbar title="إعدادات السنة الدراسية" largeTitle={true} />
      
      <div className="p-4 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إعدادات السنة الدراسية</h1>
          <p className="text-muted-foreground mt-1">
            إدارة إعدادات السنة الدراسية والتشغيل التلقائي
          </p>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-ios">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                تخصيص سلوك النظام عند بدء التشغيل
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="auto-open" className="text-sm font-medium">
                      فتح السنة تلقائياً
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      فتح آخر سنة دراسية نشطة عند بدء التشغيل
                    </p>
                  </div>
                </div>
                <Switch
                  id="auto-open"
                  checked={autoOpenYear}
                  onCheckedChange={setAutoOpenYear}
                />
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSave}
                  className="w-full rounded-full"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Save className="h-4 w-4" />
                      <span>حفظ الإعدادات</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-ios">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  عند تفعيل خيار "فتح السنة تلقائياً"، سيتم فتح آخر سنة دراسية نشطة تلقائياً عند بدء تشغيل النظام.
                </p>
                <p>
                  عند إلغاء تفعيل هذا الخيار، سيتم عرض صفحة اختيار السنة الدراسية عند كل بدء تشغيل للنظام.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AcademicYearSettingsPage;