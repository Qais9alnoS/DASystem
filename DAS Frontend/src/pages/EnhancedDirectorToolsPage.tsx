import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DirectorPasswordResetForm } from '@/components/layout/DirectorPasswordResetForm';
import {
    Target,
    Briefcase,
    BookOpen,
    StickyNote,
    Settings,
    Plus,
    Calendar,
    Award,
    DollarSign,
    Folder,
    Search,
    Key
} from 'lucide-react';

interface DirectorNote {
    id: number;
    folder_type: 'goals' | 'projects' | 'blogs' | 'notes' | 'educational_admin';
    title: string;
    content: string;
    note_date: string;
}

interface Reward {
    id: number;
    title: string;
    recipient_name: string;
    recipient_type: 'student' | 'teacher' | 'other';
    amount: number;
    reward_date: string;
}

export function EnhancedDirectorToolsPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('notes');
    const [notes, setNotes] = useState<DirectorNote[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<'goals' | 'projects' | 'blogs' | 'notes' | 'educational_admin'>('goals');
    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [showRewardDialog, setShowRewardDialog] = useState(false);

    const [noteForm, setNoteForm] = useState({
        title: '',
        content: '',
        folder_type: 'goals' as 'goals' | 'projects' | 'blogs' | 'notes' | 'educational_admin',
        note_date: new Date().toISOString().split('T')[0]
    });

    const [rewardForm, setRewardForm] = useState({
        title: '',
        recipient_name: '',
        recipient_type: 'student' as 'student' | 'teacher' | 'other',
        amount: 0,
        reward_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const mockNotes: DirectorNote[] = [
            {
                id: 1,
                folder_type: 'goals',
                title: 'أهداف العام الدراسي 2025',
                content: 'تحسين مستوى التعليم وزيادة معدلات النجاح بنسبة 15%',
                note_date: '2024-09-01'
            },
            {
                id: 2,
                folder_type: 'projects',
                title: 'مشروع تطوير المختبرات',
                content: 'خطة شاملة لتجهيز مختبرات العلوم بأحدث الأجهزة',
                note_date: '2024-09-15'
            }
        ];

        const mockRewards: Reward[] = [
            {
                id: 1,
                title: 'جائزة التفوق الأكاديمي',
                recipient_name: 'أحمد محمد علي',
                recipient_type: 'student',
                amount: 100000,
                reward_date: '2024-06-15'
            }
        ];

        setNotes(mockNotes);
        setRewards(mockRewards);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getFolderIcon = (folderType: string) => {
        switch (folderType) {
            case 'goals': return <Target className="h-5 w-5" />;
            case 'projects': return <Briefcase className="h-5 w-5" />;
            case 'blogs': return <BookOpen className="h-5 w-5" />;
            case 'notes': return <StickyNote className="h-5 w-5" />;
            case 'educational_admin': return <Settings className="h-5 w-5" />;
            default: return <StickyNote className="h-5 w-5" />;
        }
    };

    const getFolderName = (folderType: string) => {
        switch (folderType) {
            case 'goals': return 'الأهداف';
            case 'projects': return 'المشاريع';
            case 'blogs': return 'المدونات';
            case 'notes': return 'الملاحظات';
            case 'educational_admin': return 'الإدارة التعليمية';
            default: return 'أخرى';
        }
    };

    const filteredNotes = notes.filter(note => note.folder_type === selectedFolder);

    const addNote = () => {
        if (!noteForm.title.trim() || !noteForm.content.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال العنوان والمحتوى",
                variant: "destructive"
            });
            return;
        }

        const newNote: DirectorNote = {
            id: Date.now(),
            ...noteForm
        };

        setNotes([...notes, newNote]);
        setNoteForm({
            title: '',
            content: '',
            folder_type: 'goals',
            note_date: new Date().toISOString().split('T')[0]
        });
        setShowNoteDialog(false);

        toast({
            title: "تم إضافة الملاحظة بنجاح",
            description: `تم حفظ "${newNote.title}" في مجلد ${getFolderName(newNote.folder_type)}`
        });
    };

    const addReward = () => {
        if (!rewardForm.title.trim() || !rewardForm.recipient_name.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال جميع البيانات المطلوبة",
                variant: "destructive"
            });
            return;
        }

        const newReward: Reward = {
            id: Date.now(),
            ...rewardForm
        };

        setRewards([...rewards, newReward]);
        setRewardForm({
            title: '',
            recipient_name: '',
            recipient_type: 'student',
            amount: 0,
            reward_date: new Date().toISOString().split('T')[0]
        });
        setShowRewardDialog(false);

        toast({
            title: "تم تسجيل المكافأة بنجاح",
            description: `مكافأة ${newReward.title} للمستفيد ${newReward.recipient_name}`
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">أدوات المدير المحسّنة</h1>
                    <p className="text-muted-foreground mt-2">إدارة الملاحظات والمكافآت والمساعدات</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="notes" className="flex items-center">
                        <Folder className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        الملاحظات المجلدة
                    </TabsTrigger>
                    <TabsTrigger value="rewards" className="flex items-center">
                        <Award className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        المكافآت
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center">
                        <Key className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        إعادة تعيين كلمة المرور
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Select value={selectedFolder} onValueChange={(value: any) => setSelectedFolder(value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="goals">الأهداف</SelectItem>
                                <SelectItem value="projects">المشاريع</SelectItem>
                                <SelectItem value="blogs">المدونات</SelectItem>
                                <SelectItem value="notes">الملاحظات</SelectItem>
                                <SelectItem value="educational_admin">الإدارة التعليمية</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={() => setShowNoteDialog(true)} className="flex items-center">
                            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            ملاحظة جديدة
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredNotes.map((note) => (
                            <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            {getFolderIcon(note.folder_type)}
                                            <Badge variant="outline" className="text-xs">
                                                {getFolderName(note.folder_type)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                            {note.note_date}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg">{note.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {note.content}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="rewards" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">سجل المكافآت</h2>
                        <Button onClick={() => setShowRewardDialog(true)} className="flex items-center">
                            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            مكافأة جديدة
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {rewards.map((reward) => (
                            <Card key={reward.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{reward.title}</h3>
                                            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm mt-2">
                                                <div className="flex items-center">
                                                    <Award className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                                    {reward.recipient_name}
                                                </div>
                                                <Badge variant="outline">
                                                    {reward.recipient_type === 'student' ? 'طالب' :
                                                        reward.recipient_type === 'teacher' ? 'معلم' : 'آخر'}
                                                </Badge>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                                    {reward.reward_date}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(reward.amount)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="password" className="space-y-6">
                    <DirectorPasswordResetForm />
                </TabsContent>
            </Tabs>

            {/* Add Note Dialog */}
            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="noteFolder">المجلد</Label>
                                <Select
                                    value={noteForm.folder_type}
                                    onValueChange={(value: any) => setNoteForm({ ...noteForm, folder_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
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
                                <Label htmlFor="noteDate">التاريخ</Label>
                                <Input
                                    id="noteDate"
                                    type="date"
                                    value={noteForm.note_date}
                                    onChange={(e) => setNoteForm({ ...noteForm, note_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="noteTitle">العنوان</Label>
                            <Input
                                id="noteTitle"
                                value={noteForm.title}
                                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                placeholder="عنوان الملاحظة"
                            />
                        </div>
                        <div>
                            <Label htmlFor="noteContent">المحتوى</Label>
                            <Textarea
                                id="noteContent"
                                value={noteForm.content}
                                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                placeholder="محتوى الملاحظة"
                                rows={6}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={addNote}>
                            حفظ الملاحظة
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Reward Dialog */}
            <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة مكافأة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="rewardTitle">عنوان المكافأة</Label>
                            <Input
                                id="rewardTitle"
                                value={rewardForm.title}
                                onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                                placeholder="مثال: جائزة التفوق"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="recipientName">اسم المستفيد</Label>
                                <Input
                                    id="recipientName"
                                    value={rewardForm.recipient_name}
                                    onChange={(e) => setRewardForm({ ...rewardForm, recipient_name: e.target.value })}
                                    placeholder="اسم الطالب أو المعلم"
                                />
                            </div>
                            <div>
                                <Label htmlFor="recipientType">نوع المستفيد</Label>
                                <Select
                                    value={rewardForm.recipient_type}
                                    onValueChange={(value: any) => setRewardForm({ ...rewardForm, recipient_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">طالب</SelectItem>
                                        <SelectItem value="teacher">معلم</SelectItem>
                                        <SelectItem value="other">آخر</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="rewardAmount">قيمة المكافأة</Label>
                                <Input
                                    id="rewardAmount"
                                    type="number"
                                    value={rewardForm.amount}
                                    onChange={(e) => setRewardForm({ ...rewardForm, amount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="rewardDate">تاريخ المكافأة</Label>
                                <Input
                                    id="rewardDate"
                                    type="date"
                                    value={rewardForm.reward_date}
                                    onChange={(e) => setRewardForm({ ...rewardForm, reward_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={addReward}>
                            تسجيل المكافأة
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default EnhancedDirectorToolsPage;