import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  RefreshCw, 
  Download,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { monitoringApi } from '@/services/api';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  user?: string;
  user_id?: number;
  ip_address?: string;
  additional_data?: string;
}

const SystemLogsViewerPage: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevel, setLogLevel] = useState<'all' | 'info' | 'warning' | 'error' | 'debug'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Fetch logs from API
  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        // Fetch logs from the monitoring API
        const response = await monitoringApi.getLogs({
          limit: 100
        });
        
        if (response.success && response.data) {
          // Transform the API response to match our LogEntry interface
          const apiLogs: LogEntry[] = response.data.map((log: any) => ({
            id: log.id,
            timestamp: log.timestamp,
            level: log.level.toLowerCase() as 'info' | 'warning' | 'error' | 'debug',
            message: log.message,
            source: log.module || 'Unknown',
            user: log.user_id ? `User ${log.user_id}` : undefined,
            ip_address: log.ip_address,
            additional_data: log.additional_data
          }));
          
          setLogs(apiLogs);
          setFilteredLogs(apiLogs);
        } else {
          throw new Error(response.message || "Failed to load logs");
        }
      } catch (error: any) {
        console.error('Failed to load logs:', error);
        toast({
          title: "خطأ في تحميل السجلات",
          description: error.message || "حدث خطأ أثناء تحميل سجلات النظام",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLogs();
  }, [toast]);

  useEffect(() => {
    // Filter logs based on search term, log level, and date range
    let result = [...logs];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.source.toLowerCase().includes(term) ||
        (log.user && log.user.toLowerCase().includes(term))
      );
    }
    
    // Apply log level filter
    if (logLevel !== 'all') {
      result = result.filter(log => log.level === logLevel);
    }
    
    // Apply date range filter
    const now = new Date();
    switch (dateRange) {
      case 'today':
        result = result.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter(log => new Date(log.timestamp) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter(log => new Date(log.timestamp) >= monthAgo);
        break;
    }
    
    setFilteredLogs(result);
  }, [logs, searchTerm, logLevel, dateRange]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'debug':
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">معلومة</span>;
      case 'warning':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">تحذير</span>;
      case 'error':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">خطأ</span>;
      case 'debug':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">تصحيح</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">غير معروف</span>;
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      // Fetch fresh logs from the API
      const response = await monitoringApi.getLogs({
        limit: 100
      });
      
      if (response.success && response.data) {
        // Transform the API response to match our LogEntry interface
        const apiLogs: LogEntry[] = response.data.map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp,
          level: log.level.toLowerCase() as 'info' | 'warning' | 'error' | 'debug',
          message: log.message,
          source: log.module || 'Unknown',
          user: log.user_id ? `User ${log.user_id}` : undefined,
          ip_address: log.ip_address,
          additional_data: log.additional_data
        }));
        
        setLogs(apiLogs);
        setFilteredLogs(apiLogs);
        
        toast({
          title: "تحديث السجلات",
          description: "تم تحديث سجلات النظام بنجاح"
        });
      } else {
        throw new Error(response.message || "Failed to refresh logs");
      }
    } catch (error: any) {
      console.error('Failed to refresh logs:', error);
      toast({
        title: "خطأ في تحديث السجلات",
        description: error.message || "حدث خطأ أثناء تحديث سجلات النظام",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // In a real implementation, this would export logs to a file via API
      toast({
        title: "تصدير السجلات",
        description: "جاري تصدير سجلات النظام..."
      });
      
      // Simulate export process
      setTimeout(() => {
        toast({
          title: "نجاح التصدير",
          description: "تم تصدير سجلات النظام بنجاح"
        });
      }, 1500);
    } catch (error: any) {
      console.error('Failed to export logs:', error);
      toast({
        title: "خطأ في تصدير السجلات",
        description: error.message || "حدث خطأ أثناء تصدير سجلات النظام",
        variant: "destructive"
      });
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
          <h1 className="text-3xl font-bold text-primary">سجلات النظام</h1>
          <p className="text-muted-foreground">عرض وتحليل سجلات النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>تصفية السجلات</CardTitle>
          <CardDescription>قم بتصفية السجلات حسب المستوى أو التاريخ أو البحث</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">بحث</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="ابحث في الرسائل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="logLevel">مستوى السجل</Label>
            <Select value={logLevel} onValueChange={(value: any) => setLogLevel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر مستوى السجل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="info">معلومات</SelectItem>
                <SelectItem value="warning">تحذيرات</SelectItem>
                <SelectItem value="error">أخطاء</SelectItem>
                <SelectItem value="debug">تصحيح</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dateRange">نطاق التاريخ</Label>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نطاق التاريخ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">الأسبوع الماضي</SelectItem>
                <SelectItem value="month">الشهر الماضي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              إجمالي السجلات: {filteredLogs.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجلات النظام</CardTitle>
          <CardDescription>قائمة بجميع سجلات النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Info className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">لا توجد سجلات</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                لا توجد سجلات تطابق معايير التصفية الخاصة بك
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      {getLevelIcon(log.level)}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getLevelBadge(log.level)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: ar })}
                          </span>
                          {log.user && (
                            <span className="text-sm text-muted-foreground">
                              المستخدم: {log.user}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-medium">{log.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          المصدر: {log.source}
                        </p>
                        {log.ip_address && (
                          <p className="text-sm text-muted-foreground mt-1">
                            عنوان IP: {log.ip_address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogsViewerPage;