from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, extract
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from ..database import get_db
from ..models.finance import FinanceTransaction, FinanceCategory, Budget, ExpenseCategory, IncomeCategory, PaymentMethod
from ..models.students import StudentPayment
from ..models.teachers import TeacherFinance
from ..models.users import User
from ..schemas.finance import (
    FinanceTransactionCreate, FinanceTransactionUpdate, FinanceTransactionResponse,
    BudgetCreate, BudgetUpdate, BudgetResponse,
    ExpenseCategoryCreate, ExpenseCategoryUpdate, ExpenseCategoryResponse,
    IncomeCategoryCreate, IncomeCategoryUpdate, IncomeCategoryResponse,
    PaymentMethodCreate, PaymentMethodUpdate, PaymentMethodResponse,
    FinancialSummary, MonthlyFinancialReport, AnnualFinancialReport
)
from ..core.dependencies import get_current_user, get_director_user, get_finance_user

router = APIRouter(prefix="/finance", tags=["finance"])

# Finance Transaction Management
@router.get("/transactions", response_model=List[FinanceTransactionResponse])
async def get_finance_transactions(
    academic_year_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    payment_method: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Get all finance transactions with optional filtering"""
    query = db.query(FinanceTransaction)
    
    if academic_year_id:
        query = query.filter(FinanceTransaction.academic_year_id == academic_year_id)
    
    if transaction_type:
        query = query.filter(FinanceTransaction.transaction_type == transaction_type)
    
    if category:
        query = query.filter(FinanceTransaction.category.ilike(f"%{category}%"))
    
    if start_date:
        query = query.filter(FinanceTransaction.transaction_date >= start_date)
    
    if end_date:
        query = query.filter(FinanceTransaction.transaction_date <= end_date)
    
    if payment_method:
        query = query.filter(FinanceTransaction.payment_method == payment_method)
    
    transactions = query.order_by(FinanceTransaction.transaction_date.desc()).offset(skip).limit(limit).all()
    return transactions

@router.post("/transactions", response_model=FinanceTransactionResponse)
async def create_finance_transaction(
    transaction: FinanceTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Create a new finance transaction"""
    db_transaction = FinanceTransaction(**transaction.dict(), created_by=current_user.id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/transactions/{transaction_id}", response_model=FinanceTransactionResponse)
async def get_finance_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Get a specific finance transaction"""
    transaction = db.query(FinanceTransaction).filter(FinanceTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.put("/transactions/{transaction_id}", response_model=FinanceTransactionResponse)
async def update_finance_transaction(
    transaction_id: int,
    transaction_update: FinanceTransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Update a finance transaction"""
    transaction = db.query(FinanceTransaction).filter(FinanceTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    update_data = transaction_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    return transaction

@router.delete("/transactions/{transaction_id}")
async def delete_finance_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Delete a finance transaction"""
    transaction = db.query(FinanceTransaction).filter(FinanceTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

# Budget Management
@router.get("/budgets", response_model=List[BudgetResponse])
async def get_budgets(
    academic_year_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    period_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Get all budgets with optional filtering"""
    query = db.query(Budget)
    
    if academic_year_id:
        query = query.filter(Budget.academic_year_id == academic_year_id)
    
    if category:
        query = query.filter(Budget.category.ilike(f"%{category}%"))
    
    if period_type:
        query = query.filter(Budget.period_type == period_type)
    
    budgets = query.all()
    
    # Calculate spent and remaining amounts for each budget
    budget_responses = []
    for budget in budgets:
        spent_query = db.query(func.sum(FinanceTransaction.amount)).filter(
            and_(
                FinanceTransaction.academic_year_id == budget.academic_year_id,
                FinanceTransaction.transaction_type == "expense",
                FinanceTransaction.category == budget.category
            )
        )
        
        if budget.period_type == "monthly" and budget.period_value:
            spent_query = spent_query.filter(
                extract('month', FinanceTransaction.transaction_date) == budget.period_value
            )
        elif budget.period_type == "quarterly" and budget.period_value:
            start_month = (budget.period_value - 1) * 3 + 1
            end_month = budget.period_value * 3
            spent_query = spent_query.filter(
                and_(
                    extract('month', FinanceTransaction.transaction_date) >= start_month,
                    extract('month', FinanceTransaction.transaction_date) <= end_month
                )
            )
        
        spent_amount = spent_query.scalar() or Decimal('0.00')
        remaining_amount = budget.budgeted_amount - spent_amount
        
        budget_response = BudgetResponse(
            id=budget.id,
            academic_year_id=budget.academic_year_id,
            category=budget.category,
            budgeted_amount=budget.budgeted_amount,
            period_type=budget.period_type,
            period_value=budget.period_value,
            description=budget.description,
            spent_amount=spent_amount,
            remaining_amount=remaining_amount,
            created_at=budget.created_at,
            updated_at=budget.updated_at
        )
        budget_responses.append(budget_response)
    
    return budget_responses

@router.post("/budgets", response_model=BudgetResponse)
async def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Create a new budget"""
    # Check if budget already exists for this category and period
    existing_budget = db.query(Budget).filter(
        and_(
            Budget.academic_year_id == budget.academic_year_id,
            Budget.category == budget.category,
            Budget.period_type == budget.period_type,
            Budget.period_value == budget.period_value
        )
    ).first()
    
    if existing_budget:
        raise HTTPException(status_code=400, detail="Budget already exists for this category and period")
    
    db_budget = Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    # Create response with calculated fields
    budget_response = BudgetResponse(
        id=db_budget.id,
        academic_year_id=db_budget.academic_year_id,
        category=db_budget.category,
        budgeted_amount=db_budget.budgeted_amount,
        period_type=db_budget.period_type,
        period_value=db_budget.period_value,
        description=db_budget.description,
        spent_amount=Decimal('0.00'),
        remaining_amount=db_budget.budgeted_amount,
        created_at=db_budget.created_at,
        updated_at=db_budget.updated_at
    )
    
    return budget_response

@router.put("/budgets/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: int,
    budget_update: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Update a budget"""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    update_data = budget_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    return budget

# Financial Reports
@router.get("/reports/summary", response_model=FinancialSummary)
async def get_financial_summary(
    academic_year_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Get financial summary for a period"""
    base_query = db.query(FinanceTransaction).filter(
        FinanceTransaction.academic_year_id == academic_year_id
    )
    
    if start_date:
        base_query = base_query.filter(FinanceTransaction.transaction_date >= start_date)
    
    if end_date:
        base_query = base_query.filter(FinanceTransaction.transaction_date <= end_date)
    
    # Calculate totals
    total_income = base_query.filter(
        FinanceTransaction.transaction_type == "income"
    ).with_entities(func.sum(FinanceTransaction.amount)).scalar() or Decimal('0.00')
    
    total_expenses = base_query.filter(
        FinanceTransaction.transaction_type == "expense"
    ).with_entities(func.sum(FinanceTransaction.amount)).scalar() or Decimal('0.00')
    
    # Student fees collected
    student_fees_query = db.query(func.sum(StudentPayment.payment_amount)).filter(
        and_(
            StudentPayment.academic_year_id == academic_year_id,
            StudentPayment.payment_status == "completed"
        )
    )
    
    if start_date:
        student_fees_query = student_fees_query.filter(StudentPayment.payment_date >= start_date)
    if end_date:
        student_fees_query = student_fees_query.filter(StudentPayment.payment_date <= end_date)
    
    student_fees_collected = student_fees_query.scalar() or Decimal('0.00')
    
    # Teacher salaries paid
    teacher_salaries_query = db.query(func.sum(TeacherFinance.total_amount)).filter(
        and_(
            TeacherFinance.academic_year_id == academic_year_id,
            TeacherFinance.payment_status == "paid"
        )
    )
    
    if start_date:
        teacher_salaries_query = teacher_salaries_query.filter(TeacherFinance.payment_date >= start_date)
    if end_date:
        teacher_salaries_query = teacher_salaries_query.filter(TeacherFinance.payment_date <= end_date)
    
    teacher_salaries_paid = teacher_salaries_query.scalar() or Decimal('0.00')
    
    # Pending payments
    pending_payments = db.query(func.sum(StudentPayment.payment_amount)).filter(
        and_(
            StudentPayment.academic_year_id == academic_year_id,
            StudentPayment.payment_status == "pending"
        )
    ).scalar() or Decimal('0.00')
    
    return FinancialSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=total_income - total_expenses,
        student_fees_collected=student_fees_collected,
        teacher_salaries_paid=teacher_salaries_paid,
        pending_payments=pending_payments
    )

@router.get("/reports/monthly/{year}/{month}", response_model=MonthlyFinancialReport)
async def get_monthly_financial_report(
    year: int,
    month: int,
    academic_year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Get monthly financial report"""
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    # Get summary for the month
    summary = await get_financial_summary(
        academic_year_id=academic_year_id,
        start_date=start_date,
        end_date=end_date,
        db=db,
        current_user=current_user
    )
    
    # Top expense categories
    top_expenses = db.query(
        FinanceTransaction.category,
        func.sum(FinanceTransaction.amount).label('total')
    ).filter(
        and_(
            FinanceTransaction.academic_year_id == academic_year_id,
            FinanceTransaction.transaction_type == "expense",
            FinanceTransaction.transaction_date >= start_date,
            FinanceTransaction.transaction_date < end_date
        )
    ).group_by(FinanceTransaction.category).order_by(func.sum(FinanceTransaction.amount).desc()).limit(5).all()
    
    top_expense_categories = [
        {"category": expense.category, "amount": expense.total}
        for expense in top_expenses
    ]
    
    # Income breakdown
    income_breakdown_query = db.query(
        FinanceTransaction.category,
        func.sum(FinanceTransaction.amount).label('total')
    ).filter(
        and_(
            FinanceTransaction.academic_year_id == academic_year_id,
            FinanceTransaction.transaction_type == "income",
            FinanceTransaction.transaction_date >= start_date,
            FinanceTransaction.transaction_date < end_date
        )
    ).group_by(FinanceTransaction.category).all()
    
    income_breakdown = [
        {"category": income.category, "amount": income.total}
        for income in income_breakdown_query
    ]
    
    return MonthlyFinancialReport(
        year=year,
        month=month,
        summary=summary,
        top_expense_categories=top_expense_categories,
        income_breakdown=income_breakdown
    )

# Category Management
@router.get("/expense-categories", response_model=List[ExpenseCategoryResponse])
async def get_expense_categories(
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Get all expense categories"""
    query = db.query(ExpenseCategory)
    
    if is_active is not None:
        query = query.filter(ExpenseCategory.is_active == is_active)
    
    categories = query.all()
    return categories

@router.post("/expense-categories", response_model=ExpenseCategoryResponse)
async def create_expense_category(
    category: ExpenseCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Create a new expense category"""
    # Check if category already exists
    existing_category = db.query(ExpenseCategory).filter(ExpenseCategory.name == category.name).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Expense category already exists")
    
    db_category = ExpenseCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/income-categories", response_model=List[IncomeCategoryResponse])
async def get_income_categories(
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Get all income categories"""
    query = db.query(IncomeCategory)
    
    if is_active is not None:
        query = query.filter(IncomeCategory.is_active == is_active)
    
    categories = query.all()
    return categories

@router.post("/income-categories", response_model=IncomeCategoryResponse)
async def create_income_category(
    category: IncomeCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Create a new income category"""
    # Check if category already exists
    existing_category = db.query(IncomeCategory).filter(IncomeCategory.name == category.name).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Income category already exists")
    
    db_category = IncomeCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Payment Method Management
@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods(
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_finance_user)
):
    """Get all payment methods"""
    query = db.query(PaymentMethod)
    
    if is_active is not None:
        query = query.filter(PaymentMethod.is_active == is_active)
    
    methods = query.all()
    return methods

@router.post("/payment-methods", response_model=PaymentMethodResponse)
async def create_payment_method(
    method: PaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Create a new payment method"""
    # Check if method already exists
    existing_method = db.query(PaymentMethod).filter(PaymentMethod.name == method.name).first()
    if existing_method:
        raise HTTPException(status_code=400, detail="Payment method already exists")
    
    db_method = PaymentMethod(**method.dict())
    db.add(db_method)
    db.commit()
    db.refresh(db_method)
    return db_method