import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    School,
    Users,
    BookOpen,
    Settings,
    Plus,
    Edit,
    Trash2,
    Building,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Clock
} from 'lucide-react';

interface SchoolInfo {
    id: number;
    name: string;
    arabic_name: string;
    address: string;
    phone: string;
    email: string;
    max_capacity: number;
    current_enrollment: number;
    academic_year: string;
}

interface ClassInfo {
    id: number;
    name: string;
    grade_level: number;
    section: string;
    capacity: number;
    current_students: number;
    session_type: 'morning' | 'evening';
}

const SchoolInformationPage: React.FC = () => {
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [activeTab, setActiveTab] = useState('school_info');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState<'school' | 'class'>('school');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const mockSchoolInfo: SchoolInfo = {
        id: 1,
        name: 'Al-Noor Educational School',
        arabic_name: 'مدرسة النور التعليمية',
        address: 'شارع الجامعة، بغداد، العراق',
        phone: '+964 1 234 5678',
        email: 'info@alnoor-school.edu.iq',
        max_capacity: 1200,
        current_enrollment: 980,
        academic_year: '2024-2025'
    };

    const mockClasses: ClassInfo[] = [
        {
            id: 1,
            name: 'الصف الأول أ',
            grade_level: 1,
            section: 'أ',
            capacity: 30,
            current_students: 28,
            session_type: 'morning'
        },
        {
            id: 2,
            name: 'الصف الثاني ب',
            grade_level: 2,
            section: 'ب',
            capacity: 30,
            current_students: 25,
            session_type: 'morning'
        },
        {
            id: 3,
            name: 'الصف السادس أ - مسائي',
            grade_level: 6,
            section: 'أ',
            capacity: 35,
            current_students: 32,
            session_type: 'evening'
        }
    ];

    useEffect(() => {
        setSchoolInfo(mockSchoolInfo);
        setClasses(mockClasses);
    }, []);

    const openDialog = (type: typeof dialogType, item?: any) => {
        setDialogType(type);
        setEditingItem(item);
        setFormData(item || {});
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
        setEditingItem(null);
        setFormData({});
    };

    const saveItem = () => {
        if (dialogType === 'school' && schoolInfo) {
            setSchoolInfo({ ...schoolInfo, ...formData });
            toast({
                title: "تم تحديث معلومات المدرسة",
                description: "تم حفظ المعلومات بنجاح"
            });
        } else if (dialogType === 'class') {
            if (editingItem) {
                setClasses(classes.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
            } else {
                const newClass: ClassInfo = {
                    id: Date.now(),
                    current_students: 0,
                    ...formData
                };
                setClasses([...classes, newClass]);
            }
            toast({
                title: editingItem ? "تم تحديث الصف" : "تم إضافة الصف",
                description: "تم حفظ معلومات الصف بنجاح"
            });
        }
        closeDialog();
    };

    const deleteItem = (id: number) => {
        setClasses(classes.filter(c => c.id !== id));
        toast({
            title: "تم الحذف",
            description: "تم حذف الصف بنجاح"
        });
    };

    const getSessionTypeLabel = (type: string) => {
        return type === 'morning' ? 'صباحي' : 'مسائي';
    };

    const getOccupancyPercentage = (current: number, capacity: number) => {
        return Math.round((current / capacity) * 100);
    };

    if (!schoolInfo) return <div>Loading...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">معلومات المدرسة</h1>
                    <p className="text-muted-foreground mt-2">إدارة معلومات المدرسة والصفوف والمواد</p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button onClick={() => openDialog('school', schoolInfo)} variant="outline">
                        <Settings className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        إعدادات المدرسة
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="school_info">معلومات المدرسة</TabsTrigger>
                    <TabsTrigger value="classes">الصفوف</TabsTrigger>
                </TabsList>

                <TabsContent value="school_info" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <School className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" />
                                    المعلومات الأساسية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">اسم المدرسة</Label>
                                    <p className="text-lg font-semibold">{schoolInfo.arabic_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">العنوان</Label>
                                    <p className="flex items-center text-sm">
                                        <MapPin className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                        {schoolInfo.address}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">الهاتف</Label>
                                        <p className="flex items-center text-sm">
                                            <Phone className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                            {schoolInfo.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                                        <p className="flex items-center text-sm">
                                            <Mail className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                            {schoolInfo.email}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" />
                                    الإحصائيات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">السنة الدراسية</Label>
                                    <p className="text-lg font-semibold">{schoolInfo.academic_year}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">الطاقة الاستيعابية</Label>
                                    <p className="text-2xl font-bold">{schoolInfo.max_capacity}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">العدد الحالي</Label>
                                    <p className="text-2xl font-bold text-green-600">{schoolInfo.current_enrollment}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">عدد الصفوف</Label>
                                    <p className="text-2xl font-bold">{classes.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="classes" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">إدارة الصفوف</h3>
                        <Button onClick={() => openDialog('class')}>
                            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            إضافة صف
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((classInfo) => (
                            <Card key={classInfo.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{classInfo.name}</CardTitle>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDialog('class', classInfo)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteItem(classInfo.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">المرحلة:</span>
                                            <Badge variant="outline">الصف {classInfo.grade_level}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">الشعبة:</span>
                                            <span className="font-medium">{classInfo.section}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">الجلسة:</span>
                                            <Badge variant="secondary">
                                                {getSessionTypeLabel(classInfo.session_type)}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">الطلاب:</span>
                                            <span className="font-medium">
                                                {classInfo.current_students} / {classInfo.capacity}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === 'school' ? 'تعديل معلومات المدرسة' :
                                editingItem ? 'تعديل الصف' : 'إضافة صف جديد'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {dialogType === 'school' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="arabic_name" className="text-right">الاسم بالعربية</Label>
                                    <Input
                                        id="arabic_name"
                                        value={formData.arabic_name || ''}
                                        onChange={(e) => setFormData({ ...formData, arabic_name: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="address" className="text-right">العنوان</Label>
                                    <Input
                                        id="address"
                                        value={formData.address || ''}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">الهاتف</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                            </>
                        )}

                        {dialogType === 'class' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">اسم الصف</Label>
                                    <Input
                                        id="name"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="grade_level" className="text-right">المرحلة</Label>
                                    <Input
                                        id="grade_level"
                                        type="number"
                                        value={formData.grade_level || ''}
                                        onChange={(e) => setFormData({ ...formData, grade_level: parseInt(e.target.value) })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="capacity" className="text-right">الطاقة الاستيعابية</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={formData.capacity || ''}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        className="col-span-3"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>
                            إلغاء
                        </Button>
                        <Button onClick={saveItem}>
                            {editingItem ? 'تحديث' : 'إضافة'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SchoolInformationPage;