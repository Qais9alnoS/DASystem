import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
    FileText,
    Plus,
    Edit,
    Trophy,
    Building,
    Calendar,
    DollarSign,
    Users,
    Target,
    BookOpen,
    Search,
    Filter,
    Eye,
    Download,
    Trash2
} from 'lucide-react';
import { directorApi } from '@/services/api';
import { DirectorNote, Reward, AssistanceRecord } from '@/types/school';

export const DirectorToolsPage: React.FC = () => {
    const [notes, setNotes] = useState<DirectorNote[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [assistance, setAssistance] = useState<AssistanceRecord[]>([]);
    const [loading, setLoading] = useState({
        notes: true,
        rewards: true,
        assistance: true
    });
    const [selectedFolderType, setSelectedFolderType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
    const [isAddRewardDialogOpen, setIsAddRewardDialogOpen] = useState(false);
    const [isAddAssistanceDialogOpen, setIsAddAssistanceDialogOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [editingAssistance, setEditingAssistance] = useState<AssistanceRecord | null>(null);
    const [isEditRewardDialogOpen, setIsEditRewardDialogOpen] = useState(false);
    const [isEditAssistanceDialogOpen, setIsEditAssistanceDialogOpen] = useState(false);
    const { toast } = useToast();

    // Fetch data from API
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch notes
            setLoading(prev => ({ ...prev, notes: true }));
            const notesResponse = await directorApi.getNotes();
            if (notesResponse.success && notesResponse.data) {
                setNotes(notesResponse.data);
            }
            setLoading(prev => ({ ...prev, notes: false }));

            // Fetch rewards
            setLoading(prev => ({ ...prev, rewards: true }));
            const rewardsResponse = await directorApi.getRewards();
            if (rewardsResponse.success && rewardsResponse.data) {
                setRewards(rewardsResponse.data);
            }
            setLoading(prev => ({ ...prev, rewards: false }));

            // Fetch assistance records
            setLoading(prev => ({ ...prev, assistance: true }));
            const assistanceResponse = await directorApi.getAssistanceRecords();
            if (assistanceResponse.success && assistanceResponse.data) {
                setAssistance(assistanceResponse.data);
            }
            setLoading(prev => ({ ...prev, assistance: false }));
        } catch (error: any) {
            console.error('Error fetching director tools data:', error);
            toast({
                title: "خطأ في تحميل البيانات",
                description: error.message || "حدث خطأ أثناء تحميل بيانات أدوات المدير",
                variant: "destructive"
            });
            setLoading({ notes: false, rewards: false, assistance: false });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getFolderTypeInfo = (type: string) => {
        switch (type) {
            case 'goals':
                return { icon: Target, label: 'الأهداف', color: 'text-blue-600' };
            case 'projects':
                return { icon: Building, label: 'المشاريع', color: 'text-green-600' };
            case 'blogs':
                return { icon: BookOpen, label: 'المدونات', color: 'text-purple-600' };
            case 'notes':
                return { icon: FileText, label: 'الملاحظات', color: 'text-orange-600' };
            case 'educational_admin':
                return { icon: Users, label: 'الإدارة التعليمية', color: 'text-red-600' };
            default:
                return { icon: FileText, label: 'غير محدد', color: 'text-gray-600' };
        }
    };

    const getRecipientTypeBadge = (type: string) => {
        switch (type) {
            case 'student':
                return <Badge className="bg-blue-100 text-blue-800">طالب</Badge>;
            case 'teacher':
                return <Badge className="bg-green-100 text-green-800">معلم</Badge>;
            case 'other':
                return <Badge className="bg-gray-100 text-gray-800">آخر</Badge>;
            default:
                return <Badge variant="secondary">غير محدد</Badge>;
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchesFolder = selectedFolderType === 'all' || note.folder_type === selectedFolderType;
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFolder && matchesSearch;
    });

    const getNotesStats = () => {
        const totalNotes = notes.length;
        const goalNotes = notes.filter(n => n.folder_type === 'goals').length;
        const projectNotes = notes.filter(n => n.folder_type === 'projects').length;
        const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0);
        const totalAssistance = assistance.reduce((sum, a) => sum + a.amount, 0);

        return { totalNotes, goalNotes, projectNotes, totalRewards, totalAssistance };
    };

    const stats = getNotesStats();

    // Handle adding a new note
    const handleAddNote = async (noteData: Omit<DirectorNote, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const response = await directorApi.createNote(noteData);
            if (response.success && response.data) {
                setNotes(prev => [...prev, response.data!]);
                setIsAddNoteDialogOpen(false);
                toast({
                    title: "نجاح",
                    description: "تمت إضافة الملاحظة بنجاح"
                });
            } else {
                throw new Error(response.message || "فشل في إضافة الملاحظة");
            }
        } catch (error: any) {
            console.error('Error adding note:', error);
            toast({
                title: "خطأ في إضافة الملاحظة",
                description: error.message || "حدث خطأ أثناء إضافة الملاحظة",
                variant: "destructive"
            });
        }
    };

    // Handle adding a new reward
    const handleAddReward = async (rewardData: Omit<Reward, 'id' | 'created_at'>) => {
        try {
            const response = await directorApi.createReward(rewardData);
            if (response.success && response.data) {
                setRewards(prev => [...prev, response.data!]);
                setIsAddRewardDialogOpen(false);
                toast({
                    title: "نجاح",
                    description: "تمت إضافة المكافأة بنجاح"
                });
            } else {
                throw new Error(response.message || "فشل في إضافة المكافأة");
            }
        } catch (error: any) {
            console.error('Error adding reward:', error);
            toast({
                title: "خطأ في إضافة المكافأة",
                description: error.message || "حدث خطأ أثناء إضافة المكافأة",
                variant: "destructive"
            });
        }
    };

    // Handle updating a reward
    const handleUpdateReward = async (rewardData: Partial<Reward>) => {
        if (!editingReward) return;
        
        try {
            const response = await directorApi.updateReward(editingReward.id!, rewardData);
            if (response.success && response.data) {
                setRewards(prev => prev.map(reward => reward.id === editingReward.id ? response.data! : reward));
                setIsEditRewardDialogOpen(false);
                setEditingReward(null);
                toast({
                    title: "نجاح",
                    description: "تم تحديث المكافأة بنجاح"
                });
            } else {
                throw new Error(response.message || "فشل في تحديث المكافأة");
            }
        } catch (error: any) {
            console.error('Error updating reward:', error);
            toast({
                title: "خطأ في تحديث المكافأة",
                description: error.message || "حدث خطأ أثناء تحديث المكافأة",
                variant: "destructive"
            });
        }
    };

    // Handle deleting a reward
    const handleDeleteReward = async (id: number) => {
        try {
            const response = await directorApi.deleteReward(id);
            if (response.success) {
                setRewards(prev => prev.filter(reward => reward.id !== id));
                toast({
                    title: "نجاح",
                    description: "تم حذف المكافأة بنجاح"
                });
            } else {
                throw new Error(response.message || "فشل في حذف المكافأة");
            }
        } catch (error: any) {
            console.error('Error deleting reward:', error);
            toast({
                title: "خطأ في حذف المكافأة",
                description: error.message || "حدث خطأ أثناء حذف المكافأة",
                variant: "destructive"
            });
        }
    };

    // Handle adding a new assistance record
    const handleAddAssistance = async (assistanceData: Omit<AssistanceRecord, 'id' | 'created_at'>) => {
        try {
            const response = await directorApi.createAssistanceRecord(assistanceData);
            if (response.success && response.data) {
                setAssistance(prev => [...prev, response.data!]);
                setIsAddAssistanceDialogOpen(false);
                toast({
                    title: "نجاح",
                    description: "تمت إضافة سجل المساعدة بنجاح"
                });
            } else {
                throw new Error(response.message || "فشل في إضافة سجل المساعدة");
            }
        } catch (error: any) {
            console.error('Error adding assistance record:', error);
            toast({
                title: "خطأ في إضافة سجل المساعدة",
                description: error.message || "حدث خطأ أثناء إضافة سجل المساعدة",
                variant: "destructive"
            });
        }
    };

    // Handle updating an assistance record
    const handleUpdateAssistance = async (assistanceData: Partial<AssistanceRecord>) => {
        if (!editingAssistance) return;
        
        try {
            const response = await directorApi.updateAssistanceRecord(editingAssistance.id!, assistanceData);
            if (response.success && response.data) {
                setAssistance(prev => prev.map(record => record.id === editingAssistance.id ? response.data! : record));
                setIsEditAssistanceDialogOpen(false);
                setEditingAssistance(null);
                toast({
                    title: "نجاح",
                    description: "تم تحديث سجل المساعدة بنجاح"
                });
            } else {
                throw new Error(response.message || "فشل في تحديث سجل المساعدة");
            }
        } catch (error: any) {
            console.error('Error updating assistance record:', error);
            toast({
                title: "خطأ في تحديث سجل المساعدة",
                description: error.message || "حدث خطأ أثناء تحديث سجل المساعدة",
                variant: "destructive"
            });
        }
    };

    // Handle deleting an assistance record
    const handleDeleteAssistance = async (id: number) => {
        try {
            const response = await directorApi.deleteAssistanceRecord(id);
            if (response.success) {
                setAssistance(prev => prev.filter(record => record.id !== id));
                toast({
                    title: "نجاح",
                    description: "تم حذف سجل المساعدة بنجاح"
                });
            } else {
                throw new Error(response.message || "فشل في حذف سجل المساعدة");
            }
        } catch (error: any) {
            console.error('Error deleting assistance record:', error);
            toast({
                title: "خطأ في حذف سجل المساعدة",
                description: error.message || "حدث خطأ أثناء حذف سجل المساعدة",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">أدوات المدير</h1>
                    <p className="text-muted-foreground">
                        إدارة الملاحظات والمكافآت وسجلات المساعدات
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">إجمالي الملاحظات</p>
                                <p className="text-2xl font-bold">{stats.totalNotes}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.goalNotes} أهداف، {stats.projectNotes} مشاريع
                                </p>
                            </div>
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">المكافآت</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRewards)}</p>
                                <p className="text-xs text-muted-foreground">{rewards.length} مكافأة</p>
                            </div>
                            <Trophy className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">المساعدات</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalAssistance)}</p>
                                <p className="text-xs text-muted-foreground">{assistance.length} مساعدة</p>
                            </div>
                            <Building className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">صافي الدعم</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(stats.totalAssistance - stats.totalRewards)}
                                </p>
                                <p className="text-xs text-muted-foreground">بعد المكافآت</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="notes">الملاحظات الإدارية</TabsTrigger>
                    <TabsTrigger value="rewards">المكافآت</TabsTrigger>
                    <TabsTrigger value="assistance">المساعدات</TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="space-y-6">
                    {/* Notes Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث في الملاحظات..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 w-64"
                                />
                            </div>
                            <Select value={selectedFolderType} onValueChange={setSelectedFolderType}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع المجلدات</SelectItem>
                                    <SelectItem value="goals">الأهداف</SelectItem>
                                    <SelectItem value="projects">المشاريع</SelectItem>
                                    <SelectItem value="blogs">المدونات</SelectItem>
                                    <SelectItem value="notes">الملاحظات</SelectItem>
                                    <SelectItem value="educational_admin">الإدارة التعليمية</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    إضافة ملاحظة
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md" dir="rtl">
                                <DialogHeader>
                                    <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
                                    <DialogDescription>إضافة ملاحظة إدارية جديدة</DialogDescription>
                                </DialogHeader>
                                <AddNoteForm onSubmit={handleAddNote} onCancel={() => setIsAddNoteDialogOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Notes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.map((note) => {
                            const folderInfo = getFolderTypeInfo(note.folder_type);
                            const FolderIcon = folderInfo.icon;

                            return (
                                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg leading-tight">{note.title}</CardTitle>
                                            <Badge variant="outline" className={folderInfo.color}>
                                                <FolderIcon className="h-3 w-3 ml-1" />
                                                {folderInfo.label}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 inline ml-1" />
                                            {new Date(note.note_date).toLocaleDateString('ar-IQ')}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {note.content}
                                        </p>

                                        <div className="flex gap-2 pt-2 border-t">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="h-4 w-4 ml-1" />
                                                عرض
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Edit className="h-4 w-4 ml-1" />
                                                تعديل
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="rewards" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">سجل المكافآت والتكريمات</h3>
                        <Dialog open={isAddRewardDialogOpen} onOpenChange={setIsAddRewardDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    إضافة مكافأة
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md" dir="rtl">
                                <DialogHeader>
                                    <DialogTitle>إضافة مكافأة جديدة</DialogTitle>
                                    <DialogDescription>تسجيل مكافأة أو تكريم جديد</DialogDescription>
                                </DialogHeader>
                                <AddRewardForm onSubmit={handleAddReward} onCancel={() => setIsAddRewardDialogOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>العنوان</TableHead>
                                        <TableHead>المستفيد</TableHead>
                                        <TableHead>النوع</TableHead>
                                        <TableHead>القيمة</TableHead>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rewards.map((reward) => (
                                        <TableRow key={reward.id}>
                                            <TableCell className="font-medium">{reward.title}</TableCell>
                                            <TableCell>{reward.recipient_name}</TableCell>
                                            <TableCell>{getRecipientTypeBadge(reward.recipient_type)}</TableCell>
                                            <TableCell className="text-green-600 font-bold">
                                                {formatCurrency(reward.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(reward.reward_date).toLocaleDateString('ar-IQ')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingReward(reward);
                                                            setIsEditRewardDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDeleteReward(reward.id!)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assistance" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">سجل المساعدات والدعم</h3>
                        <Dialog open={isAddAssistanceDialogOpen} onOpenChange={setIsAddAssistanceDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    إضافة مساعدة
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md" dir="rtl">
                                <DialogHeader>
                                    <DialogTitle>إضافة مساعدة جديدة</DialogTitle>
                                    <DialogDescription>تسجيل مساعدة أو دعم جديد</DialogDescription>
                                </DialogHeader>
                                <AddAssistanceForm onSubmit={handleAddAssistance} onCancel={() => setIsAddAssistanceDialogOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>العنوان</TableHead>
                                        <TableHead>الجهة المانحة</TableHead>
                                        <TableHead>القيمة</TableHead>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assistance.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.title}</TableCell>
                                            <TableCell>{record.organization}</TableCell>
                                            <TableCell className="text-blue-600 font-bold">
                                                {formatCurrency(record.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(record.assistance_date).toLocaleDateString('ar-IQ')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingAssistance(record);
                                                            setIsEditAssistanceDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDeleteAssistance(record.id!)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Reward Dialog */}
            <Dialog open={isEditRewardDialogOpen} onOpenChange={(open) => {
                setIsEditRewardDialogOpen(open);
                if (!open) setEditingReward(null);
            }}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل المكافأة</DialogTitle>
                        <DialogDescription>تعديل تفاصيل المكافأة</DialogDescription>
                    </DialogHeader>
                    {editingReward && (
                        <EditRewardForm 
                            reward={editingReward} 
                            onSubmit={handleUpdateReward} 
                            onCancel={() => {
                                setIsEditRewardDialogOpen(false);
                                setEditingReward(null);
                            }} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Assistance Dialog */}
            <Dialog open={isEditAssistanceDialogOpen} onOpenChange={(open) => {
                setIsEditAssistanceDialogOpen(open);
                if (!open) setEditingAssistance(null);
            }}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل سجل المساعدة</DialogTitle>
                        <DialogDescription>تعديل تفاصيل سجل المساعدة</DialogDescription>
                    </DialogHeader>
                    {editingAssistance && (
                        <EditAssistanceForm 
                            record={editingAssistance} 
                            onSubmit={handleUpdateAssistance} 
                            onCancel={() => {
                                setIsEditAssistanceDialogOpen(false);
                                setEditingAssistance(null);
                            }} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Add Note Form Component
const AddNoteForm: React.FC<{
    onSubmit: (note: Omit<DirectorNote, 'id' | 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [folderType, setFolderType] = useState<'goals' | 'projects' | 'blogs' | 'notes' | 'educational_admin'>('notes');
    const [content, setContent] = useState('');
    const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            academic_year_id: 1, // This should be dynamically selected
            folder_type: folderType,
            title,
            content,
            note_date: noteDate
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>العنوان</Label>
                <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="عنوان الملاحظة" 
                    required 
                />
            </div>
            <div>
                <Label>المجلد</Label>
                <Select value={folderType} onValueChange={(value: any) => setFolderType(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر المجلد" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="goals">الأهداف</SelectItem>
                        <SelectItem value="projects">المشاريع</SelectItem>
                        <SelectItem value="blogs">المدونات</SelectItem>
                        <SelectItem value="notes">الملاحظات</SelectItem>
                        <SelectItem value="educational_admin">الإدارة التعليمية</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>التاريخ</Label>
                <Input 
                    type="date" 
                    value={noteDate} 
                    onChange={(e) => setNoteDate(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <Label>المحتوى</Label>
                <Textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="محتوى الملاحظة..." 
                    rows={4} 
                    required 
                />
            </div>
            <div className="flex gap-2">
                <Button type="submit">إضافة</Button>
                <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
            </div>
        </form>
    );
};

// Add Reward Form Component
const AddRewardForm: React.FC<{
    onSubmit: (reward: Omit<Reward, 'id' | 'created_at'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientType, setRecipientType] = useState<'student' | 'teacher' | 'other'>('student');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [rewardDate, setRewardDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            academic_year_id: 1, // This should be dynamically selected
            title,
            reward_date: rewardDate,
            recipient_name: recipientName,
            recipient_type: recipientType,
            amount: parseFloat(amount) || 0,
            description
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="عنوان المكافأة" 
                required 
            />
            <Input 
                value={recipientName} 
                onChange={(e) => setRecipientName(e.target.value)} 
                placeholder="اسم المستفيد" 
                required 
            />
            <Select value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="نوع المستفيد" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="student">طالب</SelectItem>
                    <SelectItem value="teacher">معلم</SelectItem>
                    <SelectItem value="other">آخر</SelectItem>
                </SelectContent>
            </Select>
            <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="قيمة المكافأة (دينار)" 
                required 
            />
            <Input 
                type="date" 
                value={rewardDate} 
                onChange={(e) => setRewardDate(e.target.value)} 
                required 
            />
            <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="وصف المكافأة..." 
                rows={3} 
            />
            <div className="flex gap-2">
                <Button type="submit">إضافة</Button>
                <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
            </div>
        </form>
    );
};

// Edit Reward Form Component
const EditRewardForm: React.FC<{
    reward: Reward;
    onSubmit: (reward: Partial<Reward>) => void;
    onCancel: () => void;
}> = ({ reward, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(reward.title);
    const [recipientName, setRecipientName] = useState(reward.recipient_name);
    const [recipientType, setRecipientType] = useState(reward.recipient_type);
    const [amount, setAmount] = useState(reward.amount.toString());
    const [description, setDescription] = useState(reward.description);
    const [rewardDate, setRewardDate] = useState(reward.reward_date);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            reward_date: rewardDate,
            recipient_name: recipientName,
            recipient_type: recipientType,
            amount: parseFloat(amount) || 0,
            description
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="عنوان المكافأة" 
                required 
            />
            <Input 
                value={recipientName} 
                onChange={(e) => setRecipientName(e.target.value)} 
                placeholder="اسم المستفيد" 
                required 
            />
            <Select value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="نوع المستفيد" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="student">طالب</SelectItem>
                    <SelectItem value="teacher">معلم</SelectItem>
                    <SelectItem value="other">آخر</SelectItem>
                </SelectContent>
            </Select>
            <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="قيمة المكافأة (دينار)" 
                required 
            />
            <Input 
                type="date" 
                value={rewardDate} 
                onChange={(e) => setRewardDate(e.target.value)} 
                required 
            />
            <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="وصف المكافأة..." 
                rows={3} 
            />
            <div className="flex gap-2">
                <Button type="submit">تحديث</Button>
                <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
            </div>
        </form>
    );
};

// Add Assistance Form Component
const AddAssistanceForm: React.FC<{
    onSubmit: (record: Omit<AssistanceRecord, 'id' | 'created_at'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [organization, setOrganization] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [assistanceDate, setAssistanceDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            academic_year_id: 1, // This should be dynamically selected
            title,
            assistance_date: assistanceDate,
            organization,
            amount: parseFloat(amount) || 0,
            description
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="عنوان المساعدة" 
                required 
            />
            <Input 
                value={organization} 
                onChange={(e) => setOrganization(e.target.value)} 
                placeholder="الجهة المانحة" 
                required 
            />
            <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="قيمة المساعدة (دينار)" 
                required 
            />
            <Input 
                type="date" 
                value={assistanceDate} 
                onChange={(e) => setAssistanceDate(e.target.value)} 
                required 
            />
            <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="وصف المساعدة..." 
                rows={3} 
            />
            <div className="flex gap-2">
                <Button type="submit">إضافة</Button>
                <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
            </div>
        </form>
    );
};

// Edit Assistance Form Component
const EditAssistanceForm: React.FC<{
    record: AssistanceRecord;
    onSubmit: (record: Partial<AssistanceRecord>) => void;
    onCancel: () => void;
}> = ({ record, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(record.title);
    const [organization, setOrganization] = useState(record.organization);
    const [amount, setAmount] = useState(record.amount.toString());
    const [description, setDescription] = useState(record.description);
    const [assistanceDate, setAssistanceDate] = useState(record.assistance_date);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            assistance_date: assistanceDate,
            organization,
            amount: parseFloat(amount) || 0,
            description
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="عنوان المساعدة" 
                required 
            />
            <Input 
                value={organization} 
                onChange={(e) => setOrganization(e.target.value)} 
                placeholder="الجهة المانحة" 
                required 
            />
            <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="قيمة المساعدة (دينار)" 
                required 
            />
            <Input 
                type="date" 
                value={assistanceDate} 
                onChange={(e) => setAssistanceDate(e.target.value)} 
                required 
            />
            <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="وصف المساعدة..." 
                rows={3} 
            />
            <div className="flex gap-2">
                <Button type="submit">تحديث</Button>
                <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
            </div>
        </form>
    );
};

export default DirectorToolsPage;