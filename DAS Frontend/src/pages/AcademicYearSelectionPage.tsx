import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { academicYearsApi } from '@/services/api';
import { AcademicYear } from '@/types/school';
import { Calendar, School, Plus, ArrowRight } from 'lucide-react';
import { IOSNavbar } from '@/components/ui/ios-navbar';

export function AcademicYearSelectionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await academicYearsApi.getAll();
      if (response.success && response.data) {
        setAcademicYears(response.data);
        // Auto-select the active year if there's only one
        if (response.data.length === 1) {
          setSelectedYearId(response.data[0].id!);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch academic years');
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل السنوات الدراسية",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectYear = () => {
    if (selectedYearId) {
      // Save the selected year to localStorage
      localStorage.setItem('selected_academic_year_id', selectedYearId.toString());
      // Navigate to dashboard
      navigate('/dashboard');
    }
  };

  const handleCreateNewYear = () => {
    navigate('/academic-years');
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
      <IOSNavbar title="اختر السنة الدراسية" largeTitle={true} />
      
      <div className="p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8 mt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              اختر السنة الدراسية
            </h1>
            <p className="text-muted-foreground mt-2">
              يرجى اختيار السنة الدراسية التي ترغب في العمل عليها
            </p>
          </div>

          <Card className="rounded-3xl border-0 shadow-ios w-full">
            <CardHeader className="space-y-1 p-4">
              <CardTitle className="text-xl text-center">
                <Calendar className="h-5 w-5 inline ml-2" />
                السنوات الدراسية المتاحة
              </CardTitle>
              <CardDescription className="text-center">
                اختر سنة دراسية من القائمة أو أنشئ سنة جديدة
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-4">
              {academicYears.length > 0 ? (
                <div className="space-y-3">
                  {academicYears.map((year) => (
                    <div
                      key={year.id}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedYearId === year.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedYearId(year.id!)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{year.year_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {year.description || 'لا يوجد وصف'}
                          </p>
                        </div>
                        {year.is_active && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            نشطة
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد سنوات دراسية</h3>
                  <p className="text-muted-foreground">
                    قم بإنشاء السنة الدراسية الأولى للبدء في استخدام النظام
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSelectYear}
                  disabled={!selectedYearId}
                  className="flex-1 rounded-full"
                >
                  <ArrowRight className="h-4 w-4 ml-2" />
                  متابعة
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCreateNewYear}
                  className="flex-1 rounded-full"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  سنة جديدة
                </Button>
              </div>
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

export default AcademicYearSelectionPage;