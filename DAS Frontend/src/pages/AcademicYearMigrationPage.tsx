import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AcademicYear } from '@/types/school';
import {
    CalendarDays,
    Users,
    GraduationCap,
    ArrowRight,
    Copy,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Database,
    FileText,
    School
} from 'lucide-react';

interface MigrationOptions {
    copySchoolStructure: boolean;
    promoteStudents: boolean;
    copyTeachers: boolean;
    carryOverDues: boolean;
    updateAges: boolean;
}

interface MigrationPreview {
    studentsToPromote: Array<{
        currentGrade: string;
        nextGrade: string;
        count: number;
    }>;
    studentsToGraduate: number;
    teachersToMigrate: number;
    outstandingDues: number;
    newStructure: {
        classes: number;
        subjects: number;
        sections: number;
    };
}

export function AcademicYearMigrationPage() {
    const { toast } = useToast();
    const [currentYear, setCurrentYear] = useState<AcademicYear | null>(null);
    const [newYearName, setNewYearName] = useState('');
    const [newYearDescription, setNewYearDescription] = useState('');
    const [migrationOptions, setMigrationOptions] = useState<MigrationOptions>({
        copySchoolStructure: true,
        promoteStudents: true,
        copyTeachers: true,
        carryOverDues: true,
        updateAges: true
    });
    const [migrationPreview, setMigrationPreview] = useState<MigrationPreview | null>(null);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);

    // Mock current academic year
    useEffect(() => {
        setCurrentYear({
            id: 2024,
            year_name: '2024-2025',
            description: 'العام الدراسي الحالي',
            is_active: true
        });
        setNewYearName('2025-2026');
        setNewYearDescription('العام الدراسي الجديد');
    }, []);

    const generateMigrationPreview = async () => {
        setIsGeneratingPreview(true);

        // Simulate API call to generate preview
        setTimeout(() => {
            const mockPreview: MigrationPreview = {
                studentsToPromote: [
                    { currentGrade: 'ابتدائي الأول', nextGrade: 'ابتدائي الثاني', count: 45 },
                    { currentGrade: 'ابتدائي الثاني', nextGrade: 'ابتدائي الثالث', count: 42 },
                    { currentGrade: 'ابتدائي الثالث', nextGrade: 'ابتدائي الرابع', count: 38 },
                    { currentGrade: 'ابتدائي الرابع', nextGrade: 'ابتدائي الخامس', count: 41 },
                    { currentGrade: 'ابتدائي الخامس', nextGrade: 'ابتدائي السادس', count: 39 },
                    { currentGrade: 'ابتدائي السادس', nextGrade: 'إعدادي الأول', count: 36 },
                    { currentGrade: 'إعدادي الأول', nextGrade: 'إعدادي الثاني', count: 34 },
                    { currentGrade: 'إعدادي الثاني', nextGrade: 'إعدادي الثالث', count: 32 },
                ],
                studentsToGraduate: 28,
                teachersToMigrate: 15,
                outstandingDues: 2500000, // IQD
                newStructure: {
                    classes: 8,
                    subjects: 12,
                    sections: 16
                }
            };
            setMigrationPreview(mockPreview);
            setShowPreviewDialog(true);
            setIsGeneratingPreview(false);
        }, 2000);
    };

    const executeMigration = async () => {
        setIsMigrating(true);

        // Simulate migration process
        setTimeout(() => {
            toast({
                title: "تم إنشاء العام الدراسي الجديد بنجاح!",
                description: `تم نقل البيانات للعام الدراسي ${newYearName}`,
            });
            setIsMigrating(false);
            setShowPreviewDialog(false);

            // Reset form
            setNewYearName('');
            setNewYearDescription('');
            setMigrationPreview(null);
        }, 3000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">نقل العام الدراسي</h1>
                    <p className="text-muted-foreground mt-2">إنشاء عام دراسي جديد ونقل البيانات من العام السابق</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    <CalendarDays className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    العام الحالي: {currentYear?.year_name}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Migration Configuration */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <School className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" />
                                إعدادات النقل
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* New Year Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">معلومات العام الجديد</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="yearName">اسم العام الدراسي</Label>
                                        <Input
                                            id="yearName"
                                            value={newYearName}
                                            onChange={(e) => setNewYearName(e.target.value)}
                                            placeholder="2025-2026"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="yearDescription">الوصف</Label>
                                        <Input
                                            id="yearDescription"
                                            value={newYearDescription}
                                            onChange={(e) => setNewYearDescription(e.target.value)}
                                            placeholder="العام الدراسي الجديد"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Migration Options */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">خيارات النقل</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <Checkbox
                                            id="copyStructure"
                                            checked={migrationOptions.copySchoolStructure}
                                            onCheckedChange={(checked) =>
                                                setMigrationOptions(prev => ({ ...prev, copySchoolStructure: checked as boolean }))
                                            }
                                        />
                                        <Label htmlFor="copyStructure" className="flex items-center">
                                            <Database className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                            نسخ هيكل المدرسة (الصفوف والمواد)
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <Checkbox
                                            id="promoteStudents"
                                            checked={migrationOptions.promoteStudents}
                                            onCheckedChange={(checked) =>
                                                setMigrationOptions(prev => ({ ...prev, promoteStudents: checked as boolean }))
                                            }
                                        />
                                        <Label htmlFor="promoteStudents" className="flex items-center">
                                            <TrendingUp className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                            ترفيع الطلاب للصفوف التالية
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <Checkbox
                                            id="copyTeachers"
                                            checked={migrationOptions.copyTeachers}
                                            onCheckedChange={(checked) =>
                                                setMigrationOptions(prev => ({ ...prev, copyTeachers: checked as boolean }))
                                            }
                                        />
                                        <Label htmlFor="copyTeachers" className="flex items-center">
                                            <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                            نقل بيانات المعلمين
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <Checkbox
                                            id="carryDues"
                                            checked={migrationOptions.carryOverDues}
                                            onCheckedChange={(checked) =>
                                                setMigrationOptions(prev => ({ ...prev, carryOverDues: checked as boolean }))
                                            }
                                        />
                                        <Label htmlFor="carryDues" className="flex items-center">
                                            <FileText className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                            نقل المستحقات المالية المعلقة
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <Checkbox
                                            id="updateAges"
                                            checked={migrationOptions.updateAges}
                                            onCheckedChange={(checked) =>
                                                setMigrationOptions(prev => ({ ...prev, updateAges: checked as boolean }))
                                            }
                                        />
                                        <Label htmlFor="updateAges" className="flex items-center">
                                            <CalendarDays className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                            تحديث أعمار الطلاب تلقائياً
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4 rtl:space-x-reverse pt-4">
                                <Button
                                    onClick={generateMigrationPreview}
                                    disabled={!newYearName || !newYearDescription || isGeneratingPreview}
                                    className="flex items-center"
                                >
                                    {isGeneratingPreview ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
                                    ) : (
                                        <ArrowRight className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                    )}
                                    معاينة النقل
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Year Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>ملخص العام الحالي</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">إجمالي الطلاب</span>
                                    <Badge variant="secondary">335 طالب</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">المعلمين النشطين</span>
                                    <Badge variant="secondary">15 معلم</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">الصفوف الدراسية</span>
                                    <Badge variant="secondary">8 صفوف</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">المستحقات المعلقة</span>
                                    <Badge variant="outline">{formatCurrency(2500000)}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle className="text-sm">تحذيرات مهمة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start space-x-2 rtl:space-x-reverse">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                                    <span className="text-muted-foreground">تأكد من عمل نسخة احتياطية قبل النقل</span>
                                </div>
                                <div className="flex items-start space-x-2 rtl:space-x-reverse">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                                    <span className="text-muted-foreground">سيتم إلغاء تفعيل العام الحالي</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Migration Preview Dialog */}
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>معاينة نقل العام الدراسي</DialogTitle>
                    </DialogHeader>

                    {migrationPreview && (
                        <div className="space-y-6">
                            {/* Student Promotions */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">ترفيع الطلاب</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {migrationPreview.studentsToPromote.map((promotion, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                                <Badge variant="outline">{promotion.count}</Badge>
                                                <span className="text-sm">{promotion.currentGrade}</span>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{promotion.nextGrade}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center">
                                        <GraduationCap className="h-5 w-5 text-green-600 mr-2 rtl:ml-2 rtl:mr-0" />
                                        <span className="font-medium text-green-800">
                                            {migrationPreview.studentsToGraduate} طالب سيتخرج من المدرسة
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Migration Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                        <div className="text-2xl font-bold">{migrationPreview.teachersToMigrate}</div>
                                        <div className="text-sm text-muted-foreground">معلم سينقل</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                                        <div className="text-2xl font-bold">{formatCurrency(migrationPreview.outstandingDues)}</div>
                                        <div className="text-sm text-muted-foreground">مستحقات معلقة</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                        <div className="text-2xl font-bold">{migrationPreview.newStructure.classes}</div>
                                        <div className="text-sm text-muted-foreground">صف دراسي</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex space-x-2 rtl:space-x-reverse">
                        <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={executeMigration}
                            disabled={isMigrating}
                            className="flex items-center"
                        >
                            {isMigrating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            )}
                            تنفيذ النقل
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AcademicYearMigrationPage;