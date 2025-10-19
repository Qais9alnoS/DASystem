import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  School,
  Settings,
  Calendar,
  DollarSign,
  FileText,
  GraduationCap,
  ClipboardList,
  Trophy,
  HeartHandshake,
  UserCheck,
  CalendarDays,
  Database,
  HardDrive,
  Bell,
  FileArchive,
  BarChart3,
  Shield,
  Search,
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Cpu,
  MemoryStick,
  Zap,
  Wallet,
  Target,
  StickyNote,
  Book,
  Truck,
  Award,
  Folder,
  Key,
  TrendingUp,
  PieChart,
  Receipt,
  Calculator,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Filter,
  Layers,
  Ban,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelRight,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, sidebarWidth }) => {
  const { projectId } = useParams();
  const { state } = useProject();
  const { projects } = state;

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigationItems = [
    {
      name: 'لوحة التحكم الرئيسية',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true
    }
  ];

  // Academic Management
  const academicManagementItems = [
    {
      name: 'إدارة السنوات الدراسية',
      href: '/academic-years',
      icon: Calendar,
      show: true
    },
    {
      name: 'نقل السنة الدراسية',
      href: '/academic-years/migrate',
      icon: RefreshCw,
      show: true
    },
    {
      name: 'إدارة الفصول',
      href: '/classes',
      icon: School,
      show: true
    },
    {
      name: 'إدارة المواد',
      href: '/subjects',
      icon: BookOpen,
      show: true
    }
  ];

  // Student Management
  const studentManagementItems = [
    {
      name: 'إدارة الطلاب',
      href: '/students',
      icon: GraduationCap,
      show: true
    },
    {
      name: 'السجلات الأكاديمية',
      href: '/student-records',
      icon: FileText,
      show: true
    },
    {
      name: 'الحضور والغياب',
      href: '/attendance',
      icon: UserCheck,
      show: true
    },
    {
      name: 'إدارة الرسوم الدراسية',
      href: '/student-fees',
      icon: DollarSign,
      show: true
    }
  ];

  // Teacher Management
  const teacherManagementItems = [
    {
      name: 'إدارة المعلمين',
      href: '/teachers',
      icon: Users,
      show: true
    },
    {
      name: 'جداول المعلمين',
      href: '/teacher-schedules',
      icon: CalendarDays,
      show: true
    },
    {
      name: 'حضور المعلمين',
      href: '/teachers/attendance',
      icon: UserCheck,
      show: true
    },
    {
      name: 'رواتب المعلمين',
      href: '/teachers/payroll',
      icon: Wallet,
      show: true
    }
  ];

  // Financial Management
  const financialManagementItems = [
    {
      name: 'الإدارة المالية',
      href: '/finance',
      icon: DollarSign,
      show: true
    },
    {
      name: 'الخزينة',
      href: '/finance/treasury',
      icon: Wallet,
      show: true
    },
    {
      name: 'الميزانية',
      href: '/budget',
      icon: PieChart,
      show: true
    },
    {
      name: 'التقارير المالية',
      href: '/finance/reports',
      icon: BarChart3,
      show: true
    }
  ];

  // Schedule Management
  const scheduleManagementItems = [
    {
      name: 'إدارة الجداول',
      href: '/schedules',
      icon: Calendar,
      show: true
    },
    {
      name: 'إنشاء الجداول',
      href: '/schedules/generate',
      icon: Plus,
      show: true
    },
    {
      name: 'عرض الجداول',
      href: '/schedules/view',
      icon: Eye,
      show: true
    },
    {
      name: 'قيود الجدولة',
      href: '/constraints',
      icon: ClipboardList,
      show: true
    },
    {
      name: 'القيود المتقدمة',
      href: '/schedules/advanced-constraints',
      icon: Layers,
      show: true
    }
  ];

  // Activity Management
  const activityManagementItems = [
    {
      name: 'إدارة الأنشطة',
      href: '/activities',
      icon: Trophy,
      show: true
    },
    {
      name: 'بوابة التواصل',
      href: '/parents/portal',
      icon: Phone,
      show: true
    }
  ];

  // System Management
  const systemManagementItems = [
    {
      name: 'إدارة الملفات',
      href: '/files',
      icon: FileArchive,
      show: true
    },
    {
      name: 'إدارة النسخ الاحتياطية',
      href: '/backups',
      icon: Database,
      show: true
    },
    {
      name: 'إدارة الإشعارات',
      href: '/notifications',
      icon: Bell,
      show: true
    },
    {
      name: 'حالة النظام',
      href: '/system/health',
      icon: Cpu,
      show: true
    },
    {
      name: 'سجل النظام',
      href: '/system/logs',
      icon: FileText,
      show: true
    }
  ];

  // Director Tools
  const directorItems = [
    {
      name: 'لوحة المدير',
      href: '/director/dashboard',
      icon: Building,
      show: true
    },
    {
      name: 'ملاحظات المدير',
      href: '/director/notes',
      icon: FileText,
      show: true
    },
    {
      name: 'المكافآت',
      href: '/director/rewards',
      icon: Trophy,
      show: true
    },
    {
      name: 'المساعدات',
      href: '/director/assistance',
      icon: HeartHandshake,
      show: true
    },
    {
      name: 'أدوات المدير المحسّنة',
      href: '/director/tools',
      icon: Settings,
      show: true
    }
  ];

  // Search & Settings
  const searchSettingsItems = [
    {
      name: 'البحث الشامل',
      href: '/search',
      icon: Search,
      show: true
    },
    {
      name: 'إعدادات المدرسة',
      href: '/settings',
      icon: Settings,
      show: true
    },
    {
      name: 'معلومات المدرسة',
      href: '/school-info',
      icon: School,
      show: true
    }
  ];

  // Determine if we should show text based on sidebar width
  const showText = sidebarWidth > 100;

  return (
    <div className={`h-full flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`} dir="rtl">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 px-4">
        {isCollapsed ? (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">D</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">DAS</span>
            </div>
            <div className="text-lg font-bold text-primary dark:text-primary">
              نظام إدارة المدرسة
            </div>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelRight className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {/* Main Dashboard */}
        {navigationItems.map((item) => (
          item.show && (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
              {(!isCollapsed && showText) && item.name}
            </NavLink>
          )
        ))}

        {/* Academic Management */}
        <div className="pt-4">
          <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed || !showText ? 'hidden' : ''}`}>
            الإدارة الأكاديمية
          </div>
          {academicManagementItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Student Management */}
        <div className="pt-4">
          <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed || !showText ? 'hidden' : ''}`}>
            إدارة الطلاب
          </div>
          {studentManagementItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Teacher Management */}
        <div className="pt-4">
          <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed || !showText ? 'hidden' : ''}`}>
            إدارة المعلمين
          </div>
          {teacherManagementItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Financial Management */}
        <div className="pt-4">
          <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed || !showText ? 'hidden' : ''}`}>
            الإدارة المالية
          </div>
          {financialManagementItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Schedule Management */}
        <div className="pt-4">
          <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed || !showText ? 'hidden' : ''}`}>
            إدارة الجداول
          </div>
          {scheduleManagementItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Activity Management */}
        <div className="pt-4">
          <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed || !showText ? 'hidden' : ''}`}>
            الأنشطة المدرسية
          </div>
          {activityManagementItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* System Management */}
        <div className="pt-4">
          <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed || !showText ? 'hidden' : ''}`}>
            إدارة النظام
          </div>
          {systemManagementItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Director Tools */}
        <div className="pt-4">
          <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed || !showText ? 'hidden' : ''}`}>
            أدوات المدير
          </div>
          {directorItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Search & Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {searchSettingsItems.map((item) => (
            item.show && (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className={`${isCollapsed || !showText ? 'mx-auto' : 'ml-3'} h-5 w-5`} />
                {(!isCollapsed && showText) && item.name}
              </NavLink>
            )
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {isCollapsed || !showText ? (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">م</span>
            </div>
          </div>
        ) : (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">م</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              مدير النظام
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              نظام إدارة المدرسة
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export { Sidebar };