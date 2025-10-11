import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ScheduleGenerator } from '@/components/schedule/ScheduleGenerator';
import { academicYearsApi } from '@/services/api';
import { AcademicYear } from '@/types/school';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const ScheduleGenerationPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sessionType, setSessionType] = useState<'morning' | 'evening'>('morning');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch academic years for selection
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await academicYearsApi.getAll();
        if (response.success && response.data) {
          setAcademicYears(response.data);
          // Set the active year as default selection
          const activeYear = response.data.find(year => year.is_active);
          if (activeYear && activeYear.id) {
            setSelectedYear(activeYear.id);
          } else if (response.data.length > 0 && response.data[0].id) {
            setSelectedYear(response.data[0].id);
          }
        }
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في تحميل السنوات الدراسية",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicYears();
  }, [toast]);

  if (loading) {
    return <div className="p-6">جاري تحميل السنوات الدراسية...</div>;
  }

  if (academicYears.length === 0) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            لا توجد سنوات دراسية متوفرة. يرجى إنشاء سنة دراسية أولاً.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إنشاء الجداول الدراسية</h1>
        <p className="text-muted-foreground">إنشاء جداول تلقائية للصفوف والشعب</p>
      </div>

      {/* Year and Session Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">السنة الدراسية</label>
          <select 
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full p-2 border rounded mt-1"
          >
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.year_name} {year.is_active ? '(نشطة)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium">الفصل</label>
          <select 
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value as 'morning' | 'evening')}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="morning">صباحي</option>
            <option value="evening">مسائي</option>
          </select>
        </div>
      </div>

      {selectedYear && (
        <ScheduleGenerator 
          projectId={projectId || '1'} 
          academicYearId={selectedYear}
          sessionType={sessionType}
          onScheduleGenerated={(result) => {
            console.log('Schedule generation result:', result);
            toast({
              title: "تم إنشاء الجداول",
              description: `تم إنشاء الجداول بنجاح`
            });
          }}
        />
      )}
    </div>
  );
};