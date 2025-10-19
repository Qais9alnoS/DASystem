import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, GraduationCap, Users, DollarSign, Calendar, Trophy, FileText, BookOpen, BarChart3 } from 'lucide-react';
import { directorApi, activitiesApi, academicYearsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { IOSNavbar } from '@/components/ui/ios-navbar';
import { IOSTabBar } from '@/components/ui/ios-tabbar';
import { IOSList, IOSListItem, IOSListHeader } from '@/components/ui/ios-list';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useProject();
  const { projects, isLoading: projectsLoading } = state;
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    monthly_revenue: 0,
    active_activities: 0
  });
  
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("home");

  // Fetch real dashboard stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch academic years to get the active one
        const yearsResponse = await academicYearsApi.getAll();
        if (yearsResponse.success && yearsResponse.data) {
          const activeYear = yearsResponse.data.find((year: any) => year.is_active) || yearsResponse.data[0];
          if (activeYear) {
            setSelectedAcademicYear(activeYear.id || null);
          }
        }
        
        // Fetch dashboard stats
        const response = await directorApi.getDashboardStats();
        if (response.success && response.data) {
          setStats({
            total_students: response.data.total_students || 0,
            total_teachers: response.data.total_teachers || 0,
            monthly_revenue: response.data.monthly_revenue || 0,
            active_activities: response.data.active_activities || 0
          });
        }
        
        // Fetch recent activities
        if (selectedAcademicYear) {
          const activitiesResponse = await activitiesApi.getAll({
            academic_year_id: selectedAcademicYear,
            is_active: true,
            limit: 5
          });
          
          if (activitiesResponse.success && activitiesResponse.data) {
            // Sort by creation date and take the most recent 3
            const sortedActivities = activitiesResponse.data
              .sort((a: any, b: any) => 
                new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
              )
              .slice(0, 3);
            setRecentActivities(sortedActivities);
          }
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: error.message || "حدث خطأ أثناء تحميل بيانات لوحة التحكم",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedAcademicYear]);

  const formatCurrency = (amount: number) => {
    // Format as ليرة without using IQD currency code
    return `${new Intl.NumberFormat('ar-IQ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)} ليرة`;
  };

  const statsData = [
    {
      title: 'إجمالي الطلاب',
      value: loading ? 'جاري التحميل...' : stats.total_students.toLocaleString(),
      icon: GraduationCap,
      color: 'text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20'
    },
    {
      title: 'إجمالي المعلمين',
      value: loading ? 'جاري التحميل...' : stats.total_teachers.toLocaleString(),
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10 dark:bg-secondary/20'
    },
    {
      title: 'العائدات الشهرية',
      value: loading ? 'جاري التحميل...' : formatCurrency(stats.monthly_revenue),
      icon: DollarSign,
      color: 'text-accent',
      bgColor: 'bg-accent/10 dark:bg-accent/20'
    },
    {
      title: 'الأنشطة النشطة',
      value: loading ? 'جاري التحميل...' : stats.active_activities.toLocaleString(),
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  const quickActions = [
    {
      title: 'تسجيل طالب جديد',
      description: 'إضافة طالب جديد إلى النظام',
      icon: GraduationCap,
      action: () => navigate('/students/new'),
      color: 'text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20'
    },
    {
      title: 'إضافة معلم',
      description: 'تسجيل معلم جديد في النظام',
      icon: Users,
      action: () => navigate('/teachers/new'),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10 dark:bg-secondary/20'
    },
    {
      title: 'عرض التقارير المالية',
      description: 'مراجعة الوضع المالي للمدرسة',
      icon: BarChart3,
      action: () => navigate('/finance/reports'),
      color: 'text-accent',
      bgColor: 'bg-accent/10 dark:bg-accent/20'
    }
  ];

  const isLoading = loading || projectsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* iOS Navigation Bar */}
      <IOSNavbar 
        title="لوحة التحكم" 
        largeTitle={true}
      />
      
      <div className="p-4 pb-24">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="rounded-3xl border-0 shadow-ios">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 rounded-3xl border-0 shadow-ios">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <IOSList>
              {quickActions.map((action, index) => (
                <IOSListItem 
                  key={index} 
                  icon={<action.icon className={`h-5 w-5 ${action.color}`} />}
                  chevron
                  onClick={action.action}
                >
                  <div>
                    <h3 className="font-medium text-foreground">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </IOSListItem>
              ))}
            </IOSList>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="rounded-3xl border-0 shadow-ios">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">آخر الأنشطة</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <IOSList>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any, index: number) => (
                  <IOSListItem 
                    key={index} 
                    icon={<Trophy className="h-5 w-5 text-primary" />}
                    chevron
                    onClick={() => navigate(`/activities/${activity.id}`)}
                  >
                    <div>
                      <h4 className="font-medium text-foreground">
                        {activity.name}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at || activity.start_date).toLocaleDateString('ar-IQ')}
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {activity.activity_type === 'academic' && 'أكاديمي'}
                          {activity.activity_type === 'sports' && 'رياضي'}
                          {activity.activity_type === 'cultural' && 'ثقافي'}
                          {activity.activity_type === 'social' && 'اجتماعي'}
                          {activity.activity_type === 'trip' && 'رحلة'}
                        </span>
                      </div>
                    </div>
                  </IOSListItem>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted" />
                  <p>لا توجد أنشطة حديثة</p>
                </div>
              )}
            </IOSList>
          </CardContent>
        </Card>
      </div>

      {/* iOS Tab Bar */}
      <IOSTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export { DashboardPage };