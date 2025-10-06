import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileManagementPage from '../pages/FileManagementPage';

// Mock all child components to avoid complex dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <div data-testid="table">{children}</div>,
  TableBody: ({ children }: { children: React.ReactNode }) => <div data-testid="table-body">{children}</div>,
  TableCell: ({ children }: { children: React.ReactNode }) => <div data-testid="table-cell">{children}</div>,
  TableHead: ({ children }: { children: React.ReactNode }) => <div data-testid="table-head">{children}</div>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="table-header">{children}</div>,
  TableRow: ({ children }: { children: React.ReactNode }) => <div data-testid="table-row">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label data-testid="label">{children}</label>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div data-testid="select-item">{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ children }: { children: React.ReactNode }) => <div data-testid="select-value">{children}</div>,
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-description">{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <div data-testid="badge">{children}</div>,
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <div data-testid="separator" />,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-trigger">{children}</div>,
}));

vi.mock('lucide-react', () => ({
  File: () => <div data-testid="file-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Image: () => <div data-testid="image-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  HardDrive: () => <div data-testid="hard-drive-icon" />,
  Folder: () => <div data-testid="folder-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
}));

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

// Mock use-toast
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('FileManagementPage', () => {
  it('renders without crashing', () => {
    render(<FileManagementPage />);
    
    expect(screen.getByText('إدارة الملفات')).toBeInTheDocument();
    expect(screen.getByText('رفع وتنظيم الملفات الخاصة بالنظام')).toBeInTheDocument();
  });

  it('displays the upload button', () => {
    render(<FileManagementPage />);
    
    // Find the upload button specifically (not the dialog title)
    const uploadButtons = screen.getAllByText('رفع ملف');
    // The first one should be the main upload button
    expect(uploadButtons[0]).toBeInTheDocument();
  });

  it('displays storage stats cards', () => {
    render(<FileManagementPage />);
    
    // Check for the three storage stats cards
    expect(screen.getByText('إجمالي الملفات')).toBeInTheDocument();
    expect(screen.getByText('المساحة المستخدمة')).toBeInTheDocument();
    expect(screen.getByText('المساحة المتاحة')).toBeInTheDocument();
  });

  it('displays file management section', () => {
    render(<FileManagementPage />);
    
    expect(screen.getByText('الملفات')).toBeInTheDocument();
    expect(screen.getByText('قائمة بجميع الملفات المحفوظة في النظام')).toBeInTheDocument();
  });
});