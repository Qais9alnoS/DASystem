import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { searchApi } from '@/services/api';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import {
    User,
    GraduationCap,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    Search,
    X,
    Users,
    BookOpen,
    Clock,
    Filter,
    Loader2
} from 'lucide-react';

interface SearchResult {
    id: number;
    name: string;
    type: 'student' | 'teacher';
    status: 'current' | 'former';
    // Student specific
    father_name?: string;
    grade?: string;
    section?: string;
    session?: string;
    academic_year?: number;
    has_financial_dues?: boolean;
    last_year?: string;
    // Teacher specific
    subjects?: string[];
    classes?: string[];
    phone?: string;
}

interface SearchFilters {
    scope?: string;
    academic_year_id?: number;
    session_type?: string;
    grade_level?: string;
    has_financial_dues?: boolean;
}

interface SearchResults {
    students: {
        current: SearchResult[];
        former: SearchResult[];
    };
    teachers: {
        current: SearchResult[];
        former: SearchResult[];
    };
    total_results: number;
}

export function UniversalSearchPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((query: string, filters: SearchFilters) => {
            if (query.length >= 3) {
                performSearch(query, filters);
            } else {
                setSearchResults(null);
            }
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(searchQuery, filters);
    }, [searchQuery, filters, debouncedSearch]);

    const performSearch = async (query: string, searchFilters: SearchFilters) => {
        setIsSearching(true);
        
        try {
            // Call the real API with filters
            const response = await searchApi.universal(query, {
                ...searchFilters,
                limit: 50,
                skip: 0
            });
            
            if (response.success && response.data) {
                // Transform API response to match our UI structure
                const transformedResults: SearchResults = {
                    students: {
                        current: response.data.students?.current?.map((student: any) => ({
                            id: student.id,
                            name: student.name,
                            type: 'student',
                            status: 'current',
                            father_name: student.father_name,
                            grade: student.grade,
                            section: student.section,
                            session: student.session,
                            academic_year: student.academic_year,
                            has_financial_dues: student.has_financial_dues
                        })) || [],
                        former: response.data.students?.former?.map((student: any) => ({
                            id: student.id,
                            name: student.name,
                            type: 'student',
                            status: 'former',
                            father_name: student.father_name,
                            grade: student.grade,
                            section: student.section,
                            last_year: student.last_year
                        })) || []
                    },
                    teachers: {
                        current: response.data.teachers?.current?.map((teacher: any) => ({
                            id: teacher.id,
                            name: teacher.name,
                            type: 'teacher',
                            status: 'current',
                            subjects: teacher.subjects,
                            classes: teacher.classes,
                            phone: teacher.phone,
                            academic_year: teacher.academic_year
                        })) || [],
                        former: response.data.teachers?.former?.map((teacher: any) => ({
                            id: teacher.id,
                            name: teacher.name,
                            type: 'teacher',
                            status: 'former',
                            last_year: teacher.last_year
                        })) || []
                    },
                    total_results: response.data.total_results || 0
                };

                setSearchResults(transformedResults);
            } else {
                // Handle error case
                setSearchResults({
                    students: { current: [], former: [] },
                    teachers: { current: [], former: [] },
                    total_results: 0
                });
                toast({
                    title: "خطأ في البحث",
                    description: response.message || "حدث خطأ أثناء البحث",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            console.error('Search error:', error);
            setSearchResults({
                students: { current: [], former: [] },
                teachers: { current: [], former: [] },
                total_results: 0
            });
            toast({
                title: "خطأ في البحث",
                description: error.message || "حدث خطأ أثناء البحث",
                variant: "destructive"
            });
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
        setSelectedResult(null);
        setFilters({});
    };

    const openProfile = (result: SearchResult) => {
        toast({
            title: "فتح الملف الشخصي",
            description: `سيتم فتح ملف ${result.name}`,
        });
        setSelectedResult(result);
    };

    const getSessionBadgeColor = (session: string) => {
        return session === 'صباحي' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const updateFilter = (key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }));
    };

    // Function to highlight search terms in text
    const highlightText = (text: string, query: string) => {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <span key={index} className="bg-yellow-200 dark:bg-yellow-600 font-semibold">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">البحث الشامل</h1>
                    <p className="text-muted-foreground mt-2">البحث في قاعدة بيانات الطلاب والمعلمين</p>
                </div>
            </div>

            {/* Search Input and Filters */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            placeholder="ابحث باسم الطالب أو المعلم (3 أحرف كحد أدنى)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rtl:pr-10 rtl:pl-10 text-lg py-3"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSearch}
                                className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                        </Button>

                        {searchQuery.length > 0 && searchQuery.length < 3 && (
                            <p className="text-sm text-muted-foreground">
                                يرجى إدخال 3 أحرف على الأقل للبحث
                            </p>
                        )}
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">نطاق البحث</label>
                                <Select 
                                    value={filters.scope || ''} 
                                    onValueChange={(value) => updateFilter('scope', value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر النطاق" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">الكل</SelectItem>
                                        <SelectItem value="students">الطلاب فقط</SelectItem>
                                        <SelectItem value="teachers">المعلمين فقط</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">السنة الدراسية</label>
                                <Select 
                                    value={filters.academic_year_id?.toString() || ''} 
                                    onValueChange={(value) => updateFilter('academic_year_id', value ? parseInt(value) : undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر السنة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">الكل</SelectItem>
                                        <SelectItem value="2025">2025-2026</SelectItem>
                                        <SelectItem value="2024">2024-2025</SelectItem>
                                        <SelectItem value="2023">2023-2024</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">الجلسة</label>
                                <Select 
                                    value={filters.session_type || ''} 
                                    onValueChange={(value) => updateFilter('session_type', value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الجلسة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">الكل</SelectItem>
                                        <SelectItem value="morning">صباحي</SelectItem>
                                        <SelectItem value="evening">مسائي</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">المستوى الدراسي</label>
                                <Select 
                                    value={filters.grade_level || ''} 
                                    onValueChange={(value) => updateFilter('grade_level', value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر المستوى" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">الكل</SelectItem>
                                        <SelectItem value="primary">ابتدائي</SelectItem>
                                        <SelectItem value="intermediate">إعدادي</SelectItem>
                                        <SelectItem value="secondary">ثانوي</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {isSearching && (
                        <div className="flex items-center justify-center mt-4">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span className="text-muted-foreground">جاري البحث...</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults && searchResults.total_results > 0 && (
                <div className="space-y-6">
                    {/* Results Summary */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <Badge variant="outline" className="text-base px-3 py-1">
                            {searchResults.total_results} نتيجة
                        </Badge>
                        <span className="text-muted-foreground">للبحث: "{searchQuery}"</span>
                    </div>

                    {/* Current Students */}
                    {searchResults.students.current.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <GraduationCap className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                                    الطلاب الحاليين ({searchResults.students.current.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {searchResults.students.current.map((student) => (
                                    <div
                                        key={`student-current-${student.id}`}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => openProfile(student)}
                                    >
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <Avatar>
                                                <AvatarFallback>{student.name.split(' ')[0][0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{highlightText(student.name, searchQuery)}</h3>
                                                {student.father_name && (
                                                    <p className="text-sm text-muted-foreground">
                                                        والده: {highlightText(student.father_name, searchQuery)}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {student.grade}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        شعبة {student.section}
                                                    </Badge>
                                                    {student.session && (
                                                        <Badge className={cn("text-xs", getSessionBadgeColor(student.session))}>
                                                            {student.session}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            {student.has_financial_dues && (
                                                <Badge variant="destructive" className="text-xs">
                                                    <CreditCard className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                                    مستحقات
                                                </Badge>
                                            )}
                                            <Badge variant="secondary" className="text-xs">
                                                نشط
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Former Students */}
                    {searchResults.students.former.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <GraduationCap className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                                    الطلاب السابقين ({searchResults.students.former.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {searchResults.students.former.map((student) => (
                                    <div
                                        key={`student-former-${student.id}`}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors opacity-75"
                                        onClick={() => openProfile(student)}
                                    >
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <Avatar>
                                                <AvatarFallback>{student.name.split(' ')[0][0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{highlightText(student.name, searchQuery)}</h3>
                                                {student.father_name && (
                                                    <p className="text-sm text-muted-foreground">
                                                        والده: {highlightText(student.father_name, searchQuery)}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {student.grade}
                                                    </Badge>
                                                    {student.last_year && (
                                                        <Badge variant="outline" className="text-xs">
                                                            آخر عام: {student.last_year}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <Badge variant="outline" className="text-xs">
                                                سابق
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Current Teachers */}
                    {searchResults.teachers.current.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                                    المعلمين الحاليين ({searchResults.teachers.current.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {searchResults.teachers.current.map((teacher) => (
                                    <div
                                        key={`teacher-current-${teacher.id}`}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => openProfile(teacher)}
                                    >
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <Avatar>
                                                <AvatarFallback>{teacher.name.split(' ')[0][0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{highlightText(teacher.name, searchQuery)}</h3>
                                                {teacher.phone && (
                                                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">{teacher.phone}</span>
                                                    </div>
                                                )}
                                                {teacher.subjects && teacher.subjects.length > 0 && (
                                                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                                                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">
                                                            {teacher.subjects.map((subject, index) => (
                                                                <span key={index}>
                                                                    {highlightText(subject, searchQuery)}
                                                                    {index < teacher.subjects!.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    </div>
                                                )}
                                                {teacher.classes && teacher.classes.length > 0 && (
                                                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                                                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">
                                                            {teacher.classes.map((cls, index) => (
                                                                <span key={index}>
                                                                    {highlightText(cls, searchQuery)}
                                                                    {index < teacher.classes!.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <Badge variant="secondary" className="text-xs">
                                                نشط
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Former Teachers */}
                    {searchResults.teachers.former.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                                    المعلمين السابقين ({searchResults.teachers.former.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {searchResults.teachers.former.map((teacher) => (
                                    <div
                                        key={`teacher-former-${teacher.id}`}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors opacity-75"
                                        onClick={() => openProfile(teacher)}
                                    >
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <Avatar>
                                                <AvatarFallback>{teacher.name.split(' ')[0][0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{highlightText(teacher.name, searchQuery)}</h3>
                                                {teacher.last_year && (
                                                    <p className="text-sm text-muted-foreground">
                                                        آخر عام: {teacher.last_year}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <Badge variant="outline" className="text-xs">
                                                سابق
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* No Results */}
            {searchResults && searchResults.total_results === 0 && searchQuery.length >= 3 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
                        <p className="text-muted-foreground">
                            لم يتم العثور على أي طالب أو معلم يطابق "{searchQuery}"
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!searchResults && searchQuery.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">البحث الشامل</h3>
                        <p className="text-muted-foreground">
                            ابدأ بكتابة اسم الطالب أو المعلم للبحث في قاعدة البيانات
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default UniversalSearchPage;