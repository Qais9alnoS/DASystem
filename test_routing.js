// Simple test to verify routing configuration
const fs = require('fs');
const path = require('path');

// Check if App.tsx file exists
const appPath = path.join(__dirname, 'DAS Frontend', 'src', 'App.tsx');

if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf8');
  
  // Check for the key routing patterns we fixed
  const hasCorrectRoutes = content.includes('<Route path="/*" element={<ProtectedApp />} />');
  const hasDashboardRoute = content.includes('<Route path="dashboard" element={<DashboardPage />} />');
  const hasLayoutWrapper = content.includes('<Route path="/*" element={<DesktopLayout />}>');
  
  console.log('Routing Configuration Check:');
  console.log('==========================');
  console.log('App.tsx file exists:', true);
  console.log('Correct main route pattern:', hasCorrectRoutes);
  console.log('Dashboard route configured:', hasDashboardRoute);
  console.log('DesktopLayout wrapper configured:', hasLayoutWrapper);
  
  if (hasCorrectRoutes && hasDashboardRoute && hasLayoutWrapper) {
    console.log('\n✅ Routing configuration appears to be correct!');
    console.log('The fix should resolve the "Page not found" issue.');
  } else {
    console.log('\n❌ Routing configuration may still have issues.');
  }
} else {
  console.log('❌ App.tsx file not found at expected location');
}