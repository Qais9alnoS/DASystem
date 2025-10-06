import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { financeApi, academicYearsApi } from '@/services/api';
import { Budget, AcademicYear } from '@/types/school';
import { Plus, Edit, Trash2, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export const BudgetManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form state
  const [budgetForm, setBudgetForm] = useState({
    academic_year_id: 0,
    category: '',
    budgeted_amount: 0,
    period_type: 'annual' as 'annual' | 'monthly' | 'quarterly',
    period_value: undefined as number | undefined,
    description: ''
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch academic years
        const yearsResponse = await academicYearsApi.getAll();
        if (yearsResponse.success && yearsResponse.data) {
          setAcademicYears(yearsResponse.data);
          // Set default to the first active academic year
          const activeYear = yearsResponse.data.find(year => year.is_active) || yearsResponse.data[0];
          if (activeYear) {
            setSelectedAcademicYear(activeYear.id || null);
            setBudgetForm(prev => ({ ...prev, academic_year_id: activeYear.id || 0 }));
          }
        }

        // Fetch budgets
        await fetchBudgets();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "خطأ",
          description: "فشل في تحميل البيانات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch budgets when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      fetchBudgets();
    }
  }, [selectedAcademicYear]);

  const fetchBudgets = async () => {
    if (!selectedAcademicYear) return;
    
    try {
      const response = await financeApi.getBudgets({ academic_year_id: selectedAcademicYear });
      if (response.success && response.data) {
        setBudgets(response.data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الميزانيات",
        variant: "destructive"
      });
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

  const handleCreateBudget = async () => {
    if (!budgetForm.category.trim() || budgetForm.budgeted_amount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      const budgetData = {
        ...budgetForm,
        academic_year_id: selectedAcademicYear || budgetForm.academic_year_id
      };

      const response = await financeApi.createBudget(budgetData);
      
      if (response.success && response.data) {
        setBudgets([...budgets, response.data]);
        resetForm();
        setShowBudgetDialog(false);
        
        toast({
          title: "نجاح",
          description: "تم إنشاء الميزانية بنجاح"
        });
      } else {
        throw new Error(response.message || 'فشل في إنشاء الميزانية');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في إنشاء الميزانية",
        variant: "destructive"
      });
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget || !budgetForm.category.trim() || budgetForm.budgeted_amount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await financeApi.updateBudget(editingBudget.id!, {
        category: budgetForm.category,
        budgeted_amount: budgetForm.budgeted_amount,
        period_type: budgetForm.period_type,
        period_value: budgetForm.period_value,
        description: budgetForm.description
      });
      
      if (response.success && response.data) {
        setBudgets(budgets.map(b => b.id === editingBudget.id ? response.data! : b));
        resetForm();
        setShowBudgetDialog(false);
        
        toast({
          title: "نجاح",
          description: "تم تحديث الميزانية بنجاح"
        });
      } else {
        throw new Error(response.message || 'فشل في تحديث الميزانية');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في تحديث الميزانية",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBudget = async (id: number) => {
    try {
      const response = await financeApi.deleteBudget(id);
      
      if (response.success) {
        setBudgets(budgets.filter(b => b.id !== id));
        toast({
          title: "نجاح",
          description: "تم حذف الميزانية بنجاح"
        });
      } else {
        throw new Error(response.message || 'فشل في حذف الميزانية');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في حذف الميزانية",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setBudgetForm({
      academic_year_id: selectedAcademicYear || 0,
      category: '',
      budgeted_amount: 0,
      period_type: 'annual',
      period_value: undefined,
      description: ''
    });
    setEditingBudget(null);
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      academic_year_id: budget.academic_year_id,
      category: budget.category,
      budgeted_amount: budget.budgeted_amount,
      period_type: budget.period_type,
      period_value: budget.period_value,
      description: budget.description || ''
    });
    setShowBudgetDialog(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowBudgetDialog(true);
  };

  const getTotalBudgeted = () => {
    return budgets.reduce((sum, budget) => sum + budget.budgeted_amount, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((sum, budget) => sum + (budget.spent_amount || 0), 0);
  };

  const getTotalRemaining = () => {
    return budgets.reduce((sum, budget) => sum + (budget.remaining_amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الميزانيات</h1>
          <p className="text-muted-foreground">
            إنشاء وإدارة الميزانيات السنوية والشهرية
          </p>
        </div>
        <div className="flex gap-2">
          <Select 
            value={selectedAcademicYear?.toString() || ''} 
            onValueChange={(value) => setSelectedAcademicYear(parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر السنة الدراسية" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year.id} value={year.id?.toString() || ''}>
                  {year.year_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 ml-2" />
            ميزانية جديدة
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الميزانيات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalBudgeted())}</div>
            <p className="text-xs text-muted-foreground">المبلغ المخطط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإنفاق الفعلي</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(getTotalSpent())}</div>
            <p className="text-xs text-muted-foreground">المبلغ المستهلك</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalRemaining())}</div>
            <p className="text-xs text-muted-foreground">المبلغ المتبقي</p>
          </CardContent>
        </Card>
      </div>

      {/* Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle>الميزانيات</CardTitle>
          <CardDescription>
            قائمة بجميع الميزانيات المُنشأة للسنة الدراسية المحددة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفئة</TableHead>
                  <TableHead>المبلغ المخطط</TableHead>
                  <TableHead>المبلغ المستهلك</TableHead>
                  <TableHead>المتبقي</TableHead>
                  <TableHead>الفترة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.category}</TableCell>
                    <TableCell>{formatCurrency(budget.budgeted_amount)}</TableCell>
                    <TableCell>
                      <span className={budget.spent_amount && budget.spent_amount > 0 ? "text-red-600" : ""}>
                        {formatCurrency(budget.spent_amount || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={budget.remaining_amount && budget.remaining_amount > 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(budget.remaining_amount || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {budget.period_type === 'annual' && 'سنوية'}
                        {budget.period_type === 'monthly' && `شهرية - ${budget.period_value || ''}`}
                        {budget.period_type === 'quarterly' && `ربع سنوية - ${budget.period_value || ''}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => budget.id && handleDeleteBudget(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4" />
              <p>لا توجد ميزانيات مُنشأة</p>
              <p className="text-sm mt-2">ابدأ بإنشاء ميزانية جديدة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? 'تعديل الميزانية' : 'إنشاء ميزانية جديدة'}
            </DialogTitle>
            <DialogDescription>
              {editingBudget 
                ? 'قم بتعديل تفاصيل الميزانية' 
                : 'قم بإنشاء ميزانية جديدة لفئة معينة'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="category">الفئة *</Label>
              <Input
                id="category"
                value={budgetForm.category}
                onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                placeholder="مثال: رواتب المعلمين"
              />
            </div>
            
            <div>
              <Label htmlFor="budgeted_amount">المبلغ المخطط *</Label>
              <Input
                id="budgeted_amount"
                type="number"
                value={budgetForm.budgeted_amount || ''}
                onChange={(e) => setBudgetForm({...budgetForm, budgeted_amount: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="period_type">نوع الفترة</Label>
              <Select
                value={budgetForm.period_type}
                onValueChange={(value: 'annual' | 'monthly' | 'quarterly') => 
                  setBudgetForm({...budgetForm, period_type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">سنوية</SelectItem>
                  <SelectItem value="monthly">شهرية</SelectItem>
                  <SelectItem value="quarterly">ربع سنوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(budgetForm.period_type === 'monthly' || budgetForm.period_type === 'quarterly') && (
              <div>
                <Label htmlFor="period_value">
                  {budgetForm.period_type === 'monthly' ? 'رقم الشهر' : 'رقم الربع'}
                </Label>
                <Input
                  id="period_value"
                  type="number"
                  min={budgetForm.period_type === 'monthly' ? 1 : 1}
                  max={budgetForm.period_type === 'monthly' ? 12 : 4}
                  value={budgetForm.period_value || ''}
                  onChange={(e) => setBudgetForm({...budgetForm, period_value: parseInt(e.target.value) || undefined})}
                  placeholder={budgetForm.period_type === 'monthly' ? "1-12" : "1-4"}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Input
                id="description"
                value={budgetForm.description}
                onChange={(e) => setBudgetForm({...budgetForm, description: e.target.value})}
                placeholder="وصف الميزانية"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={editingBudget ? handleUpdateBudget : handleCreateBudget}>
              {editingBudget ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetManagementPage;