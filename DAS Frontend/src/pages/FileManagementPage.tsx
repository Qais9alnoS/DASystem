import React, { useState } from 'react';
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
  File, 
  FileText, 
  Image, 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Folder,
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
  filesApi 
} from '@/services/api';
import { 
  useToast 
} from '@/hooks/use-toast';
import { FileItem, StorageStats } from '@/types/school';

const FileManagementPage: React.FC = () => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [relatedEntityType, setRelatedEntityType] = useState<string>('');
  const [relatedEntityId, setRelatedEntityId] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch files
  const { data: files = [], isLoading, refetch } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const response = await filesApi.getAll();
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || 'Failed to fetch files');
    },
  });

  // Fetch storage stats
  const { data: stats } = useQuery({
    queryKey: ['storageStats'],
    queryFn: async () => {
      const response = await filesApi.getStorageStats();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch storage stats');
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (fileData: { file: File; related_entity_type?: string; related_entity_id?: number }) => {
      const formData = new FormData();
      formData.append('file', fileData.file);
      if (fileData.related_entity_type) formData.append('related_entity_type', fileData.related_entity_type);
      if (fileData.related_entity_id) formData.append('related_entity_id', fileData.related_entity_id.toString());
      
      const response = await filesApi.upload(formData);
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'نجاح',
          description: 'تم رفع الملف بنجاح',
        });
        queryClient.invalidateQueries({ queryKey: ['files'] });
        queryClient.invalidateQueries({ queryKey: ['storageStats'] });
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setRelatedEntityType('');
        setRelatedEntityId('');
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'فشل في رفع الملف',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في رفع الملف',
        variant: 'destructive',
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await filesApi.delete(fileId);
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'نجاح',
          description: 'تم حذف الملف بنجاح',
        });
        queryClient.invalidateQueries({ queryKey: ['files'] });
        queryClient.invalidateQueries({ queryKey: ['storageStats'] });
        setIsDeleteDialogOpen(false);
        setFileToDelete(null);
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'فشل في حذف الملف',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف الملف',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadFile = () => {
    if (!selectedFile) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف للرفع',
        variant: 'destructive',
      });
      return;
    }

    const fileData: any = { file: selectedFile };
    if (relatedEntityType) fileData.related_entity_type = relatedEntityType;
    if (relatedEntityId) fileData.related_entity_id = parseInt(relatedEntityId);

    uploadFileMutation.mutate(fileData);
  };

  const handleDeleteFile = () => {
    if (fileToDelete) {
      deleteFileMutation.mutate(fileToDelete.id);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeBadge = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Badge variant="default">صورة</Badge>;
    } else if (fileType === 'application/pdf') {
      return <Badge variant="default">PDF</Badge>;
    } else {
      return <Badge variant="outline">ملف</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">إدارة الملفات</h1>
          <p className="text-muted-foreground">رفع وتنظيم الملفات الخاصة بالنظام</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="ml-2 h-4 w-4" />
          رفع ملف
        </Button>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الملفات</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.file_count || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المساحة المستخدمة</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats?.used_size || 0)}</div>
            <p className="text-xs text-muted-foreground">
              من أصل {formatFileSize(stats?.total_size || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المساحة المتاحة</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats?.free_size || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>الملفات</CardTitle>
          <CardDescription>قائمة بجميع الملفات المحفوظة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <File className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">لا توجد ملفات</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                ابدأ برفع ملف جديد
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الملف</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحجم</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المرتبط بـ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file: FileItem) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getFileIcon(file.file_type)}
                        <div className="mr-3">
                          <div className="font-medium">{file.original_filename}</div>
                          <div className="text-sm text-muted-foreground">{file.filename}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getFileTypeBadge(file.file_type)}
                    </TableCell>
                    <TableCell>{formatFileSize(file.file_size)}</TableCell>
                    <TableCell>
                      {format(new Date(file.created_at), 'yyyy-MM-dd HH:mm', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {file.related_entity_type && (
                        <Badge variant="secondary">
                          {file.related_entity_type} #{file.related_entity_id}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // In a real implementation, this would trigger a download
                              // For now, we'll show a toast message
                              toast({
                                title: 'تحميل الملف',
                                description: 'جاري تجهيز الملف للتحميل',
                              });
                            } catch (error) {
                              toast({
                                title: 'خطأ',
                                description: 'فشل في تحميل الملف',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          <Download className="h-4 w-4 ml-1" />
                          تحميل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFileToDelete(file);
                            setIsDeleteDialogOpen(true);
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

      {/* Upload File Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفع ملف</DialogTitle>
            <DialogDescription>
              اختر ملف لرفعه إلى النظام
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                الملف
              </Label>
              <div className="col-span-3">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entityType" className="text-right">
                مرتبط بـ
              </Label>
              <Select
                value={relatedEntityType}
                onValueChange={setRelatedEntityType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">طالب</SelectItem>
                  <SelectItem value="teacher">معلم</SelectItem>
                  <SelectItem value="activity">نشاط</SelectItem>
                  <SelectItem value="other">آخر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {relatedEntityType && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entityId" className="text-right">
                  الرقم
                </Label>
                <Input
                  id="entityId"
                  value={relatedEntityId}
                  onChange={(e) => setRelatedEntityId(e.target.value)}
                  className="col-span-3"
                  placeholder="أدخل رقم الكيان"
                  type="number"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={uploadFileMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUploadFile}
              disabled={uploadFileMutation.isPending || !selectedFile}
            >
              {uploadFileMutation.isPending && (
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              )}
              رفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete File Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الملف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد حذف الملف "{fileToDelete?.original_filename}"؟
              هذه العملية لا يمكن التراجع عنها.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              سيتم حذف الملف نهائياً من النظام.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteFileMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFile}
              disabled={deleteFileMutation.isPending}
            >
              {deleteFileMutation.isPending && (
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              )}
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManagementPage;