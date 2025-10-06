import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, GraduationCap, Users, DollarSign, Calendar, Trophy, FileText, BookOpen, BarChart3 } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useProject();
  const { projects, isLoading } = state;

  const stats = [
    {
      title: 'إجمالي الطلاب',
      value: '1,247',
      icon: GraduationCap,
      color: 'text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20'
    },
    {
      title: 'إجمالي المعلمين',
      value: '89',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10 dark:bg-secondary/20'
    },
    {
      title: 'العائدات الشهرية',
      value: '245,000 ر.س',
      icon: DollarSign,
      color: 'text-accent',
      bgColor: 'bg-accent/10 dark:bg-accent/20'
    },
    {
      title: 'الأنشطة النشطة',
      value: '12',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            مرحباً بك في نظام DAS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            نظام متكامل لإدارة شؤون المدرسة
          </p>
        </div>
        <Button
          onClick={() => navigate('/students/new')}
          className="gap-2 btn-fluent"
        >
          <Plus className="h-4 w-4" />
          طالب جديد
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="fluent-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="fluent-card border-0 hover:translate-y-[-2px] transition-all cursor-pointer"
            onClick={action.action}
          >
            <CardContent className="p-6">
              <div className={`p-3 rounded-md ${action.bgColor} w-fit mb-4`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {action.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card className="fluent-card border-0">
        <CardHeader>
          <CardTitle>آخر الأنشطة</CardTitle>
          <CardDescription>
            آخر العمليات والأنشطة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-md">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    تم تسجيل 15 طالباً جديداً
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    اليوم - 2:30 م
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-secondary/10 dark:bg-secondary/20 rounded-md">
                  <DollarSign className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    تم تحصيل 85,000 ر.س
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    أمس - 4:15 م
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-accent/10 dark:bg-accent/20 rounded-md">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    تم إنشاء جدول جديد
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    أمس - 11:20 ص
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DashboardPage };