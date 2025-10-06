import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Send, 
  TestTube,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { systemApi } from '@/services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  sentAt: string;
  recipients: number;
}

const NotificationManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'error' | 'success'>('info');
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // In a real implementation, this would fetch notifications from an API endpoint
        // For now, we'll use mock data but simulate an API call
        setTimeout(() => {
          const mockNotifications: Notification[] = [
            {
              id: '1',
              title: 'تحديث النظام',
              message: 'تم تثبيت التحديث الجديد للنظام. يرجى إعادة تشغيل التطبيق.',
              severity: 'info',
              sentAt: new Date().toISOString(),
              recipients: 42
            },
            {
              id: '2',
              title: 'صيانة مجدولة',
              message: 'سيتم إجراء صيانة للنظام غدًا من 2:00 إلى 4:00 صباحًا.',
              severity: 'warning',
              sentAt: new Date(Date.now() - 86400000).toISOString(),
              recipients: 124
            },
            {
              id: '3',
              title: 'نسخة احتياطية مكتملة',
              message: 'تم إنشاء النسخة الاحتياطية بنجاح.',
              severity: 'success',
              sentAt: new Date(Date.now() - 172800000).toISOString(),
              recipients: 1
            }
          ];
          
          setNotifications(mockNotifications);
        }, 500);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        toast({
          title: "خطأ في تحميل الإشعارات",
          description: "حدث خطأ أثناء تحميل الإشعارات",
          variant: "destructive"
        });
      }
    };
    
    loadNotifications();
  }, [toast]);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "خطأ في الإرسال",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      
      // Send notification via API
      const response = await systemApi.sendNotification(title, message, severity);
      
      if (response.success) {
        toast({
          title: "نجاح",
          description: "تم إرسال الإشعار بنجاح"
        });
        
        // Add to notifications list
        const newNotification: Notification = {
          id: Date.now().toString(),
          title,
          message,
          severity,
          sentAt: new Date().toISOString(),
          recipients: 0 // This would be set by the backend
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        // Reset form
        setTitle('');
        setMessage('');
        setSeverity('info');
      } else {
        throw new Error(response.message || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال الإشعار",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      
      // Test Telegram connection via API
      const response = await systemApi.testTelegramConnection();
      
      if (response.success) {
        toast({
          title: "نجاح",
          description: "تم اختبار الاتصال بنجاح"
        });
      } else {
        throw new Error(response.message || 'Failed to test connection');
      }
    } catch (error: any) {
      console.error('Failed to test connection:', error);
      toast({
        title: "خطأ في الاختبار",
        description: error.message || "حدث خطأ أثناء اختبار الاتصال",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">معلومة</span>;
      case 'warning':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">تحذير</span>;
      case 'error':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">خطأ</span>;
      case 'success':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">نجاح</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">غير معروف</span>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">إدارة الإشعارات</h1>
          <p className="text-muted-foreground">إرسال وإدارة إشعارات النظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              إرسال إشعار جديد
            </CardTitle>
            <CardDescription>
              أرسل إشعارًا جديدًا إلى المستخدمين
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الإشعار"
              />
            </div>
            
            <div>
              <Label htmlFor="severity">الشدة</Label>
              <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر شدة الإشعار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومة</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="error">خطأ</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="أدخل محتوى الإشعار"
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSendNotification} 
                disabled={isSending || !title.trim() || !message.trim()}
              >
                {isSending && <Send className="h-4 w-4 ml-2 animate-spin" />}
                إرسال الإشعار
              </Button>
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting && <TestTube className="h-4 w-4 ml-2 animate-spin" />}
                اختبار الاتصال
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإشعارات الأخيرة
            </CardTitle>
            <CardDescription>
              قائمة بأحدث الإشعارات المرسلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      {getSeverityIcon(notification.severity)}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getSeverityBadge(notification.severity)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(notification.sentAt).toLocaleDateString('ar-IQ')}
                          </span>
                        </div>
                        <h3 className="mt-1 font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          تم إرساله إلى {notification.recipients} مستخدم
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationManagementPage;