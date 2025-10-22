import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { academicYearsApi } from '@/services/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, School, CheckCircle, Settings } from 'lucide-react';
import { IOSNavbar } from '@/components/ui/ios-navbar';

interface FirstRunSetupProps {
  onComplete: () => void;
}

export function FirstRunSetup({ onComplete }: FirstRunSetupProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    year_name: '',
    description: ''
  });
  const [autoOpenYear, setAutoOpenYear] = useState(true);

  // Check if this is first run on component mount
  useEffect(() => {
    const checkFirstRun = async () => {
      try {
        const response = await academicYearsApi.checkFirstRun();
        if (response.success && response.data) {
          setIsFirstRun(response.data.is_first_run);
        } else {
          throw new Error(response.message || 'Failed to check first run status');
        }
      } catch (error) {
        console.error('Error checking first run status:', error);
        toast({
          title: "خطأ",
          description: "فشل في التحقق من حالة الإعداد الأولي",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkFirstRun();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year_name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم السنة الدراسية",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const response = await academicYearsApi.initializeFirstYear({
        year_name: formData.year_name,
        description: formData.description,
        is_active: true
      });

      if (response.success && response.data) {
        // Save the auto-open setting
        try {
          await academicYearsApi.updateConfiguration(
            'auto_open_academic_year',
            autoOpenYear ? 'true' : 'false',
            'boolean',
            'Automatically open the last active academic year on startup',
            'academic'
          );
        } catch (configError) {
          console.warn('Failed to save auto-open setting:', configError);
        }

        toast({
          title: "نجاح",
          description: "تم إنشاء السنة الدراسية الأولى بنجاح"
        });
        
        // Call onComplete callback to indicate setup is complete
        onComplete();
      } else {
        throw new Error(response.message || 'Failed to create first academic year');
      }
    } catch (error: any) {
      console.error('Error creating first academic year:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء السنة الدراسية الأولى",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not first run, redirect to dashboard
  if (isFirstRun === false) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <IOSNavbar title="إعداد النظام لأول مرة" largeTitle={true} />
      
      <div className="p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8 mt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4">
              <School className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              إعداد النظام لأول مرة
            </h1>
            <p className="text-muted-foreground mt-2">
              لنبدأ بإنشاء السنة الدراسية الأولى
            </p>
          </div>

          <Card className="rounded-3xl border-0 shadow-ios w-full">
            <CardHeader className="space-y-1 p-4">
              <CardTitle className="text-xl text-center flex items-center justify-center">
                <Calendar className="h-5 w-5 ml-2" />
                السنة الدراسية الأولى
              </CardTitle>
              <CardDescription className="text-center">
                يرجى إدخال معلومات السنة الدراسية الأولى للنظام
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  هذه هي المرة الأولى لتشغيل النظام. سنقوم بإنشاء السنة الدراسية الأولى.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year_name">اسم السنة الدراسية</Label>
                  <Input
                    id="year_name"
                    placeholder="مثال: 2025-2026"
                    value={formData.year_name}
                    onChange={(e) => handleInputChange('year_name', e.target.value)}
                    className="rounded-2xl"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل اسم السنة الدراسية (مثل: 2025-2026)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Textarea
                    id="description"
                    placeholder="وصف مختصر للسنة الدراسية..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Settings className="h-5 w-5 text-muted-foreground" />
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

                <Button
                  type="submit"
                  className="w-full rounded-full"
                  disabled={creating || !formData.year_name.trim()}
                >
                  {creating ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الإنشاء...</span>
                    </div>
                  ) : (
                    'إنشاء السنة الدراسية'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>© 2025 نظام DAS لإدارة المدارس</p>
            <p>جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </div>
  );
}