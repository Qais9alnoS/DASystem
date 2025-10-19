import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth, ProtectedRoute } from '@/contexts/AuthContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { SplashScreen } from '@/components/SplashScreen';
import LoginPage from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import StudentsPage from '@/pages/StudentsPage';
import TeachersPage from '@/pages/TeachersPage';
import AcademicYearsPage from '@/pages/AcademicYearsPage';
import AcademicYearMigrationPage from '@/pages/AcademicYearMigrationPage';
import { FinancialDashboardPage } from '@/pages/FinancialDashboardPage';
import TreasurySystemPage from '@/pages/TreasurySystemPage';
import { ClassesManagementPage } from '@/pages/ClassesManagementPage';
import { SubjectsManagementPage } from '@/pages/SubjectsManagementPage';
import ActivitiesManagementPage from '@/pages/ActivitiesManagementPage';
import ScheduleManagementPage from '@/pages/ScheduleManagementPage';
import AdvancedScheduleConstraintsPage from '@/pages/AdvancedScheduleConstraintsPage';
import { ConstraintsManagementPage } from '@/pages/ConstraintsManagementPage';
import DirectorToolsPage from '@/pages/DirectorToolsPage';
import EnhancedDirectorToolsPage from '@/pages/EnhancedDirectorToolsPage';
import ComprehensiveStudentManagementPage from './pages/ComprehensiveStudentManagementPage';
import { ComprehensiveTeacherManagementPage } from '@/pages/ComprehensiveTeacherManagementPage';
import TeacherAttendancePage from '@/pages/TeacherAttendancePage';
import TeacherPayrollSystemPage from '@/pages/TeacherPayrollSystemPage';
import ParentCommunicationPortalPage from '@/pages/ParentCommunicationPortalPage';
import SchoolInformationPage from '@/pages/SchoolInformationPage';
import UniversalSearchPage from '@/pages/UniversalSearchPage';
import NotFound from '@/pages/NotFound';
import IOSDemoPage from '@/pages/IOSDemoPage';

// Additional pages with default exports
import DirectorDashboardPage from '@/pages/DirectorDashboardPage';
import BackupManagementPage from '@/pages/BackupManagementPage';
import FileManagementPage from '@/pages/FileManagementPage';
import NotificationManagementPage from '@/pages/NotificationManagementPage';

// Additional pages with named exports
import { BudgetManagementPage } from '@/pages/BudgetManagementPage';
import { ProjectDashboardPage } from '@/pages/ProjectDashboardPage';
import { ScheduleGenerationPage } from '@/pages/ScheduleGenerationPage';
import { ScheduleViewerPage } from '@/pages/ScheduleViewerPage';
import SettingsPage from '@/pages/SettingsPage';
import SystemHealthDashboardPage from '@/pages/SystemHealthDashboardPage';
import SystemLogsViewerPage from '@/pages/SystemLogsViewerPage';

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedApp = () => {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/*" element={<DesktopLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* iOS Demo Page */}
        <Route path="ios-demo" element={<IOSDemoPage />} />
        
        {/* Academic Management */}
        <Route path="academic-years" element={<AcademicYearsPage />} />
        <Route path="academic-years/migrate" element={<AcademicYearMigrationPage />} />
        <Route path="classes" element={<ClassesManagementPage />} />
        <Route path="subjects" element={<SubjectsManagementPage />} />

        {/* Student Management */}
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/comprehensive" element={<ComprehensiveStudentManagementPage />} />
        <Route path="students/new" element={<StudentsPage />} />
        <Route path="student-records" element={<ComprehensiveStudentManagementPage />} />
        <Route path="attendance" element={<ComprehensiveStudentManagementPage />} />

        {/* Teacher Management */}
        <Route path="teachers" element={<ComprehensiveTeacherManagementPage />} />
        <Route path="teachers/new" element={<ComprehensiveTeacherManagementPage />} />
        <Route path="teachers/attendance" element={<TeacherAttendancePage />} />
        <Route path="teachers/payroll" element={<TeacherPayrollSystemPage />} />
        <Route path="parents/portal" element={<ParentCommunicationPortalPage />} />
        <Route path="teacher-schedules" element={<ScheduleManagementPage />} />

        {/* Financial Management */}
        <Route path="finance" element={<FinancialDashboardPage />} />
        <Route path="finance/treasury" element={<TreasurySystemPage />} />
        <Route path="finance/reports" element={<FinancialDashboardPage />} />
        <Route path="student-fees" element={<FinancialDashboardPage />} />
        <Route path="budget" element={<BudgetManagementPage />} />

        {/* Schedule Management */}
        <Route path="schedules" element={<ScheduleManagementPage />} />
        <Route path="schedules/generate" element={<ScheduleGenerationPage />} />
        <Route path="schedules/view" element={<ScheduleViewerPage />} />
        <Route path="schedules/advanced-constraints" element={<AdvancedScheduleConstraintsPage />} />
        <Route path="constraints" element={<ConstraintsManagementPage />} />

        {/* Activities */}
        <Route path="activities" element={<ActivitiesManagementPage />} />

        {/* System Management */}
        <Route path="files" element={<FileManagementPage />} />
        <Route path="backups" element={<BackupManagementPage />} />
        <Route path="notifications" element={<NotificationManagementPage />} />
        <Route path="system/health" element={<SystemHealthDashboardPage />} />
        <Route path="system/logs" element={<SystemLogsViewerPage />} />

        {/* Director Tools */}
        <Route path="director/dashboard" element={<DirectorDashboardPage />} />
        <Route path="director/notes" element={<EnhancedDirectorToolsPage />} />
        <Route path="director/rewards" element={<EnhancedDirectorToolsPage />} />
        <Route path="director/assistance" element={<EnhancedDirectorToolsPage />} />
        <Route path="director/tools" element={<DirectorToolsPage />} />

        {/* Search & Settings */}
        <Route path="search" element={<UniversalSearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="school-info" element={<SchoolInformationPage />} />
        
        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} storageKey="theme-preference">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <ProjectProvider>
                <Router>
                  <div className="app-container bg-background text-foreground font-ios">
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/*" element={<ProtectedApp />} />
                    </Routes>
                    <Toaster />
                  </div>
                </Router>
              </ProjectProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;