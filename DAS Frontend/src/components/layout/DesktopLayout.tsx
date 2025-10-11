import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useProject } from '@/contexts/ProjectContext';

const DesktopLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useProject();
  const { currentProject, isLoading } = state;

  const isProjectRoute = location.pathname.includes('/projects/');
  const showSidebar = true; // Always show sidebar for authenticated users

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Main content area - overlay titlebar is provided natively by Tauri */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 border-r border-border bg-card">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ overscrollBehavior: 'none' }}>
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export { DesktopLayout };