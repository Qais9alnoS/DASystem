import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  Settings, 
  Calendar,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Plus,
  Play
} from 'lucide-react';

export const ProjectDashboardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Mock data - will be replaced with actual project data from backend
  const projectStats = {
    name: "مدرسة الأمل الابتدائية",
    totalGrades: 12,
    completedGrades: 8,
    totalTeachers: 15,
    totalSubjects: 45,
    activeConstraints: 12,
    lastGenerated: "2024-01-15",
    hasSchedules: true
  };

  const completionPercentage = (projectStats.completedGrades / projectStats.totalGrades) * 100;

  const quickActions = [
    {
      title: "إدارة المواد",
      description: "إضافة وتعديل المواد الدراسية",
      icon: BookOpen,
      path: `/projects/${projectId}/subjects`,
      color: "bg-blue-500"
    },
    {
      title: "إدارة المعلمين",
      description: "إضافة معلمين وتحديد جداولهم",
      icon: Users,
      path: `/projects/${projectId}/teachers`,
      color: "bg-green-500"
    },
    {
      title: "إدارة الصفوف",
      description: "تنظيم الصفوف والشعب",
      icon: GraduationCap,
      path: `/projects/${projectId}/classes`,
      color: "bg-purple-500"
    },
    {
      title: "القيود والشروط",
      description: "تحديد قيود الجدولة",
      icon: AlertTriangle,
      path: `/projects/${projectId}/constraints`,
      color: "bg-orange-500"
    },
    {
      title: "الإعدادات",
      description: "تخصيص إعدادات المشروع",
      icon: Settings,
      path: `/projects/${projectId}/settings`,
      color: "bg-gray-500"
    }
  ];

  const missingDataItems = [
    "الصف الأول الابتدائي - نقص في معلومات المعلمين",
    "الصف الثاني الابتدائي - لم يتم تحديد قيود",
    "الصف الثالث الثانوي - معلم الفيزياء غير محدد"
  ];

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{projectStats.name}</h1>
        <p className="text-primary-foreground/80">
          آخر تحديث: {projectStats.lastGenerated}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الصفوف</p>
                <p className="text-2xl font-bold">{projectStats.totalGrades}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المعلمين</p>
                <p className="text-2xl font-bold">{projectStats.totalTeachers}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المواد</p>
                <p className="text-2xl font-bold">{projectStats.totalSubjects}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">القيود النشطة</p>
                <p className="text-2xl font-bold">{projectStats.activeConstraints}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              حالة إنشاء الجداول
            </CardTitle>
            <CardDescription>
              تقدم إنشاء الجداول الدراسية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>الصفوف المكتملة</span>
                <span>{projectStats.completedGrades} من {projectStats.totalGrades}</span>
              </div>
              <Progress value={completionPercentage} className="w-full" />
            </div>
            
            <div className="flex items-center gap-2">
              {projectStats.hasSchedules ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">تم إنشاء الجداول بنجاح</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-600">في انتظار إنشاء الجداول</span>
                </>
              )}
            </div>

            <Button className="w-full" size="lg" onClick={() => navigate(`/projects/${projectId}/generate`)}>
              <Play className="h-4 w-4 ml-2" />
              إنشاء الجداول الدراسية
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              معلومات ناقصة
            </CardTitle>
            <CardDescription>
              الصفوف التي تحتاج إلى معلومات إضافية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingDataItems.length > 0 ? (
                missingDataItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-orange-700">{item}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-2 rounded bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">جميع المعلومات مكتملة</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>
            الوصول السريع لإدارة مكونات المشروع
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate(action.path)}
              >
                <div className={`${action.color} p-2 rounded-lg text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Schedules Preview */}
      {projectStats.hasSchedules && (
        <Card>
          <CardHeader>
            <CardTitle>الجداول المنشأة حديثاً</CardTitle>
            <CardDescription>
              آخر الجداول التي تم إنشاؤها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["الصف الأول الابتدائي - أ", "الصف الثاني الابتدائي - أ", "الصف الثالث الابتدائي - أ"].map((className, index) => (
                <div key={index} className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{className}</span>
                    <Badge variant="secondary">مكتمل</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    30 حصة أسبوعياً
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};