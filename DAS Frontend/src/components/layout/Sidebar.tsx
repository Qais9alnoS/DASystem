import React from 'react';
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
  CalendarDays
} from 'lucide-react';

const Sidebar = () => {
  const { projectId } = useParams();
  const { state } = useProject();
  const { projects } = state;

  const navigationItems = [
    {
      name: 'لوحة التحكم الرئيسية',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true
    }
  ];

  // Role-based navigation items (will be dynamic based on user role)
  const academicManagementItems = [
    {
      name: 'إدارة السنوات الدراسية',
      href: '/academic-years',
      icon: Calendar,
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
    }
  ];

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
    }
  ];

  const financialManagementItems = [
    {
      name: 'الإدارة المالية',
      href: '/finance',
      icon: DollarSign,
      show: true
    },
    {
      name: 'رسوم الطلاب',
      href: '/student-fees',
      icon: FileText,
      show: true
    }
  ];

  const scheduleManagementItems = [
    {
      name: 'إدارة الجداول',
      href: '/schedules',
      icon: Calendar,
      show: true
    },
    {
      name: 'قيود الجدولة',
      href: '/constraints',
      icon: ClipboardList,
      show: true
    }
  ];

  const activityManagementItems = [
    {
      name: 'إدارة الأنشطة',
      href: '/activities',
      icon: Trophy,
      show: true
    }
  ];

  const directorItems = [
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
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">DAS</span>
          </div>
          <div className="text-lg font-bold text-primary dark:text-primary">
            نظام إدارة المدرسة
          </div>
        </div>
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
              <item.icon className="ml-3 h-5 w-5" />
              {item.name}
            </NavLink>
          )
        ))}

        {/* Academic Management */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Student Management */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Teacher Management */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Financial Management */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Schedule Management */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Activity Management */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Director Tools */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
          >
            <Settings className="ml-3 h-5 w-5" />
            الإعدادات
          </NavLink>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 space-x-reverse">
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
      </div>
    </div>
  );
};

export { Sidebar };