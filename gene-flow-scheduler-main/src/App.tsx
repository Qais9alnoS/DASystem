import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { SplashScreen } from "@/components/SplashScreen"
import { HomeScreen } from "@/components/HomeScreen"
import { SubjectsStep } from "@/components/SubjectsStep"
import { TeachersStep } from "@/components/TeachersStep"
import { ClassesStep } from "@/components/ClassesStep"
import { SuccessScreen } from "@/components/SuccessScreen"

const queryClient = new QueryClient()

type AppState = 'splash' | 'home' | 'subjects' | 'teachers' | 'classes' | 'success'

const App = () => {
  const [currentState, setCurrentState] = useState<AppState>('splash')

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      if (currentState === 'splash') {
        setCurrentState('home')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentState])

  const handleSplashComplete = () => {
    setCurrentState('home')
  }

  const handleCreateSchedule = () => {
    setCurrentState('subjects')
  }

  const handleSubjectsNext = () => {
    setCurrentState('teachers')
  }

  const handleSubjectsBack = () => {
    setCurrentState('home')
  }

  const handleSubjectsSkip = () => {
    setCurrentState('teachers')
  }

  const handleTeachersNext = () => {
    setCurrentState('classes')
  }

  const handleTeachersBack = () => {
    setCurrentState('subjects')
  }

  const handleClassesNext = () => {
    setCurrentState('success')
  }

  const handleClassesBack = () => {
    setCurrentState('teachers')
  }

  const handleGoToDashboard = () => {
    setCurrentState('home')
  }

  const renderCurrentScreen = () => {
    switch (currentState) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />
      case 'home':
        return <HomeScreen onCreateSchedule={handleCreateSchedule} />
      case 'subjects':
        return (
          <SubjectsStep
            onNext={handleSubjectsNext}
            onBack={handleSubjectsBack}
            onSkip={handleSubjectsSkip}
          />
        )
      case 'teachers':
        return (
          <TeachersStep
            onNext={handleTeachersNext}
            onBack={handleTeachersBack}
          />
        )
      case 'classes':
        return (
          <ClassesStep
            onNext={handleClassesNext}
            onBack={handleClassesBack}
          />
        )
      case 'success':
        return <SuccessScreen onGoToDashboard={handleGoToDashboard} />
      default:
        return <HomeScreen onCreateSchedule={handleCreateSchedule} />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen font-inter">
            {renderCurrentScreen()}
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App