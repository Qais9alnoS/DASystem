import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Calendar, 
  Database, 
  FileArchive, 
  HardDrive, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Upload, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  format 
} from 'date-fns';
import { 
  ar 
} from 'date-fns/locale';
import { 
  systemApi 
} from '@/services/api';
import { 
  useToast 
} from '@/hooks/use-toast';

interface Backup {
  id?: number;
  name: string;
  type: 'database' | 'files' | 'full';
  size?: number;
  created_at: string;
  status: 'success' | 'failed' | 'in_progress';
  error_message?: string;
}

interface BackupStats {
  total_backups: number;
  total_size: number;
  last_backup?: string;
  backup_types: {
    database: number;
    files: number;
    full: number;
  };
}

const BackupManagementPage: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupType, setBackupType] = useState<'database' | 'files' | 'full'>('full');
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch backups
  const { data: backups = [], isLoading, refetch } = useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      const response = await systemApi.listBackups();
      if (response.success) {
        return response.data?.backups || [];
      }
      throw new Error(response.message || 'Failed to fetch backups');
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch backup stats
  const { data: stats } = useQuery({
    queryKey: ['backupStats'],
    queryFn: async () => {
      const response = await systemApi.getBackupStats();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch backup stats');
    },
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (data: { backup_name: string; type: 'database' | 'files' | 'full' }) => {
      switch (data.type) {
        case 'database':
          return systemApi.createDatabaseBackup(data.backup_name);
        case 'files':
          // For now, we'll use the same endpoint but this should be updated
          return systemApi.createDatabaseBackup(data.backup_name);
        case 'full':
          // For now, we'll use the same endpoint but this should be updated
          return systemApi.createDatabaseBackup(data.backup_name);
        default:
          throw new Error('Invalid backup type');
      }
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'نجاح',
          description: 'تم إنشاء النسخة الاحتياطية بنجاح',
        });
        queryClient.invalidateQueries({ queryKey: ['backups'] });
        queryClient.invalidateQueries({ queryKey: ['backupStats'] });
        setIsCreateDialogOpen(false);
        setBackupName('');
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'فشل في إنشاء النسخة الاحتياطية',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء النسخة الاحتياطية',
        variant: 'destructive',
      });
    },
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: async (backupName: string) => {
      return systemApi.restoreBackup(backupName);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'نجاح',
          description: 'تم استعادة النسخة الاحتياطية بنجاح',
        });
        setIsRestoreDialogOpen(false);
        setSelectedBackup(null);
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'فشل في استعادة النسخة الاحتياطية',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في استعادة النسخة الاحتياطية',
        variant: 'destructive',
      });
    },
  });

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم النسخة الاحتياطية',
        variant: 'destructive',
      });
      return;
    }

    createBackupMutation.mutate({ backup_name: backupName, type: backupType });
  };

  const handleRestoreBackup = () => {
    if (selectedBackup) {
      restoreBackupMutation.mutate(selectedBackup.name);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default">ناجح</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">قيد التنفيذ</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">إدارة النسخ الاحتياطية</h1>
          <p className="text-muted-foreground">إدارة وتنظيم النسخ الاحتياطية للنظام</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إنشاء نسخة احتياطية
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي النسخ</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_backups || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحجم الإجمالي</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats?.total_size)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر نسخة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.last_backup 
                ? format(new Date(stats.last_backup), 'yyyy-MM-dd', { locale: ar })
                : 'لا توجد'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النوع الكامل</CardTitle>
            <FileArchive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.backup_types?.full || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>النسخ الاحتياطية</CardTitle>
          <CardDescription>قائمة بجميع النسخ الاحتياطية المحفوظة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <FileArchive className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">لا توجد نسخ احتياطية</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                ابدأ بإنشاء نسخة احتياطية جديدة
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحجم</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup: Backup) => (
                  <TableRow key={backup.name}>
                    <TableCell className="font-medium">{backup.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {backup.type === 'database' && 'قاعدة البيانات'}
                        {backup.type === 'files' && 'الملفات'}
                        {backup.type === 'full' && 'كامل'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(backup.size)}</TableCell>
                    <TableCell>
                      {format(new Date(backup.created_at), 'yyyy-MM-dd HH:mm', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(backup.status)}
                        <span className="mr-2">{getStatusBadge(backup.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBackup(backup);
                            setIsRestoreDialogOpen(true);
                          }}
                          disabled={backup.status !== 'success'}
                        >
                          <Upload className="h-4 w-4 ml-1" />
                          استعادة
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Download functionality would go here
                          }}
                        >
                          <Download className="h-4 w-4 ml-1" />
                          تحميل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Delete functionality would go here
                          }}
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء نسخة احتياطية</DialogTitle>
            <DialogDescription>
              أدخل اسم النسخة الاحتياطية واختر نوعها
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="backupName" className="text-right">
                الاسم
              </Label>
              <Input
                id="backupName"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                className="col-span-3"
                placeholder="أدخل اسم النسخة الاحتياطية"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="backupType" className="text-right">
                النوع
              </Label>
              <Select
                value={backupType}
                onValueChange={(value: 'database' | 'files' | 'full') => setBackupType(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر نوع النسخة الاحتياطية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">نسخة كاملة</SelectItem>
                  <SelectItem value="database">قاعدة البيانات فقط</SelectItem>
                  <SelectItem value="files">الملفات فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={createBackupMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateBackup}
              disabled={createBackupMutation.isPending || !backupName.trim()}
            >
              {createBackupMutation.isPending && (
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              )}
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استعادة النسخة الاحتياطية</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد استعادة النسخة الاحتياطية "{selectedBackup?.name}"؟
              هذه العملية ستستبدل البيانات الحالية.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              سيتم فقدان جميع البيانات الحالية بعد هذه العملية. يُنصح بأخذ نسخة احتياطية قبل الاستعادة.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRestoreDialogOpen(false)}
              disabled={restoreBackupMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestoreBackup}
              disabled={restoreBackupMutation.isPending}
            >
              {restoreBackupMutation.isPending && (
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              )}
              تأكيد الاستعادة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupManagementPage;