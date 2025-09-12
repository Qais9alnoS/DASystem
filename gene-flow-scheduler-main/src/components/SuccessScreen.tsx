import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Calendar, Download, Share, Settings } from "lucide-react"
import { useEffect, useState } from "react"

interface SuccessScreenProps {
  onGoToDashboard: () => void
}

export const SuccessScreen = ({ onGoToDashboard }: SuccessScreenProps) => {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="animate-bounce-in">
          <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto flex items-center justify-center shadow-glow">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <div className={`space-y-4 transition-all duration-1000 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold gradient-text">
            Schedule Created Successfully!
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Your weekly schedule has been generated and is ready for use. 
            The system has optimized the timetable based on your requirements.
          </p>
        </div>

        {/* Action Cards */}
        <div className={`grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-300 ${showContent ? 'animate-slide-up' : 'opacity-0'}`}>
          <Card className="p-6 card-hover bg-gradient-to-br from-card to-card-hover border-0 shadow-card">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">View Schedule</h3>
            <p className="text-sm text-muted-foreground">
              See the complete weekly timetable
            </p>
          </Card>

          <Card className="p-6 card-hover bg-gradient-to-br from-card to-card-hover border-0 shadow-card">
            <div className="w-12 h-12 bg-gradient-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Download className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Export</h3>
            <p className="text-sm text-muted-foreground">
              Download as PDF or Excel
            </p>
          </Card>

          <Card className="p-6 card-hover bg-gradient-to-br from-card to-card-hover border-0 shadow-card">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Share className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Share</h3>
            <p className="text-sm text-muted-foreground">
              Send to teachers and staff
            </p>
          </Card>
        </div>

        {/* Main Action Button */}
        <div className={`transition-all duration-1000 delay-500 ${showContent ? 'animate-scale-in' : 'opacity-0'}`}>
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onGoToDashboard}
            className="group"
          >
            <Settings className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-300" />
            Go to Dashboard
          </Button>
        </div>

        {/* Additional Info */}
        <div className={`bg-muted/30 rounded-2xl p-6 transition-all duration-1000 delay-700 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}>
          <h4 className="font-semibold mb-3 text-muted-foreground">Schedule Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-primary">12</div>
              <div className="text-muted-foreground">Classes</div>
            </div>
            <div>
              <div className="font-semibold text-secondary">8</div>
              <div className="text-muted-foreground">Subjects</div>
            </div>
            <div>
              <div className="font-semibold text-accent">15</div>
              <div className="text-muted-foreground">Teachers</div>
            </div>
            <div>
              <div className="font-semibold text-primary">5</div>
              <div className="text-muted-foreground">Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}