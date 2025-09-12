import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepWizardProps {
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onBack?: () => void
  onSkip?: () => void
  canGoNext?: boolean
  canGoBack?: boolean
  showSkip?: boolean
  children: React.ReactNode
  title: string
  subtitle?: string
}

export const StepWizard = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  canGoNext = true,
  canGoBack = true,
  showSkip = false,
  children,
  title,
  subtitle
}: StepWizardProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header with Progress */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 min-h-[calc(100vh-200px)]">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 sticky bottom-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              {canGoBack && onBack && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {showSkip && onSkip && (
                <Button variant="ghost" onClick={onSkip}>
                  Skip
                </Button>
              )}
            </div>

            {onNext && (
              <Button 
                variant={currentStep === totalSteps ? "hero" : "default"}
                onClick={onNext}
                disabled={!canGoNext}
                className={cn(
                  "transition-all duration-300",
                  currentStep === totalSteps && "animate-pulse-glow"
                )}
              >
                {currentStep === totalSteps ? "Complete" : "Next"}
                {currentStep !== totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}