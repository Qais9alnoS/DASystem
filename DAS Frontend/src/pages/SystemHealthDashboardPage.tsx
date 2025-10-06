import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Server, 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  HardDrive,
  Wifi,
  Cpu,
  MemoryStick,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { systemApi } from '@/services/api';

interface SystemStats {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  uptime: number;
  last_check: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface DatabaseStats {
  connection_count: number;
  query_performance: number;
  backup_status: 'success' | 'failed' | 'in_progress';
  last_backup: string;
}

interface StorageStats {
  total_size: number;
  used_size: number;
  free_size: number;
  file_count: number;
  backup_count: number;
}

interface SecurityStats {
  failed_logins: number;
  successful_logins: number;
  active_sessions: number;
  last_security_check: string;
  vulnerabilities: number;
}

const SystemHealthDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch system status
      const systemResponse = await systemApi.getStatus();
      if (systemResponse.success && systemResponse.data) {
        setSystemStats(systemResponse.data);
      }
      
      // Fetch backup stats (as a proxy for storage stats)
      const backupResponse = await systemApi.getBackupStats();
      if (backupResponse.success && backupResponse.data) {
        setStorageStats(backupResponse.data);
      }
      
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error('Error fetching system health data:', error);
      toast({
        title: "خطأ في تحميل بيانات حالة النظام",
        description: error.message || "حدث خطأ أثناء تحميل بيانات حالة النظام",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days} يوم ${hours} ساعة`;
    } else if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    } else {
      return `${minutes} دقيقة`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'صحي';
      case 'warning': return 'تحذير';
      case 'critical': return 'حرج';
      default: return 'غير معروف';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">حالة النظام</h1>
          <p className="text-muted-foreground">مراقبة صحة النظام والأداء</p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-sm text-muted-foreground">
            آخر تحديث: {format(new Date(lastUpdated), 'yyyy-MM-dd HH:mm', { locale: ar })}
          </span>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
            <div className={`w-3 h-3 rounded-full ${systemStats ? getStatusColor(systemStats.status) : 'bg-gray-500'}`}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats ? getStatusText(systemStats.status) : 'جاري التحميل...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStats ? `استخدام المعالج: ${systemStats.cpu_usage}%` : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استخدام المعالج</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.cpu_usage || 0}%</div>
            <Progress value={systemStats?.cpu_usage || 0} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استخدام الذاكرة</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.memory_usage || 0}%</div>
            <Progress value={systemStats?.memory_usage || 0} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وقت التشغيل</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats ? formatUptime(systemStats.uptime) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">مستقر</p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CPU & Memory Usage */}
        <Card>
          <CardHeader>
            <CardTitle>موارد النظام</CardTitle>
            <CardDescription>استخدام المعالج والذاكرة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span>استخدام المعالج</span>
                  <span>{systemStats?.cpu_usage || 0}%</span>
                </div>
                <Progress value={systemStats?.cpu_usage || 0} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>استخدام الذاكرة</span>
                  <span>{systemStats?.memory_usage || 0}%</span>
                </div>
                <Progress value={systemStats?.memory_usage || 0} className="w-full" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">عدد العمليات</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الشبكة</p>
                  <p className="text-2xl font-bold">
                    <Wifi className="h-5 w-5 text-green-500 inline mr-1" />
                    متصل
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disk Usage */}
        <Card>
          <CardHeader>
            <CardTitle>استخدام القرص الصلب</CardTitle>
            <CardDescription>تفاصيل استخدام القرص الصلب</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>المساحة المستخدمة</span>
                  <span>{storageStats ? formatFileSize(storageStats.used_size) : '0 بايت'} من {storageStats ? formatFileSize(storageStats.total_size) : '0 بايت'}</span>
                </div>
                <Progress 
                  value={storageStats ? (storageStats.used_size / storageStats.total_size) * 100 : 0} 
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الملفات</p>
                  <p className="text-2xl font-bold">{storageStats?.file_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">النسخ الاحتياطية</p>
                  <p className="text-2xl font-bold">{storageStats?.backup_count || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>قاعدة البيانات</CardTitle>
            <CardDescription>حالة وتقارير قاعدة البيانات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span>الاتصالات النشطة</span>
                <span>{databaseStats?.connection_count || 0}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>بنية البيانات</span>
                <span>{databaseStats?.backup_status === 'success' ? 'متوفرة' : 'غير متوفرة'}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>الأداء</span>
                <span>{databaseStats?.query_performance || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأمان</CardTitle>
            <CardDescription>تفاصيل أمنية النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span>الجلسات النشطة</span>
                <span>{securityStats?.active_sessions || 0}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>المحاولات الناجحة</span>
                <span>{securityStats?.successful_logins || 0}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>المحاولات الفاشلة</span>
                <span>{securityStats?.failed_logins || 0}</span>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>الضعف</span>
                  <span>{securityStats?.vulnerabilities || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الشبكة</CardTitle>
            <CardDescription>مراقبة الشبكة والاتصالات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span>الاتصالات النشطة</span>
                <span>42</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>السرعة الواردة</span>
                <span>1.2 ميجابايت/ثانية</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>السرعة الصادرة</span>
                <span>800 كيلوبايت/ثانية</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
};

export default SystemHealthDashboardPage;