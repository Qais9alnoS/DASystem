// Simple test to verify routing configuration
const fs = require('fs');
const path = require('path');

// Check if App.tsx file exists and has correct routing
const appPath = path.join(__dirname, 'DAS Frontend', 'src', 'App.tsx');

if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf8');
  
  // Check for the key routing patterns
  const hasCorrectMainRoute = content.includes('<Route path="/*" element={<ProtectedApp />} />');
  const hasLayoutAsRouteElement = content.includes('<Route path="/*" element={<DesktopLayout />}>');
  const hasDashboardRoute = content.includes('<Route path="dashboard" element={<DashboardPage />} />');
  const hasProperNesting = content.includes('<Route index element={<Navigate to="/dashboard" replace />} />');
  
  console.log('Routing Configuration Verification:');
  console.log('=================================');
  console.log('✅ App.tsx file exists');
  console.log('✅ Main route uses /* pattern:', hasCorrectMainRoute);
  console.log('✅ DesktopLayout used as route element:', hasLayoutAsRouteElement);
  console.log('✅ Dashboard route properly configured:', hasDashboardRoute);
  console.log('✅ Index route redirects to dashboard:', hasProperNesting);
  
  if (hasCorrectMainRoute && hasLayoutAsRouteElement && hasDashboardRoute && hasProperNesting) {
    console.log('\n🎉 ALL ROUTING CONFIGURATIONS ARE CORRECT!');
    console.log('The /dashboard route should now work properly.');
  } else {
    console.log('\n❌ Some routing configurations may still have issues.');
  }
} else {
  console.log('❌ App.tsx file not found');
}