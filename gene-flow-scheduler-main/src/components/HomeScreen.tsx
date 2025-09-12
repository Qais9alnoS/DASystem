import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Settings, HelpCircle, Calendar, Clock, Moon, Sun } from "lucide-react"
import schoolBackground from "@/assets/school-background.jpg"
import { useTheme } from "next-themes"

interface HomeScreenProps {
  onCreateSchedule: () => void
}

export const HomeScreen = ({ onCreateSchedule }: HomeScreenProps) => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Background with Enhanced Blur */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${schoolBackground})` }}
      >
        <div className="absolute inset-0 glass-effect"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Content Area - 70% width */}
        <div className="flex-1 p-8 flex flex-col">
          {/* Header with Theme Toggle */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-primary/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-primary/20 shadow-glow">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                برنامج جين
              </h1>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="acrylic-card border-0 w-12 h-12 rounded-2xl hover:bg-primary/10 transition-all duration-300"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-secondary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </Button>
          </div>

          {/* Welcome Section - Premium Acrylic */}
          <div className="acrylic-card rounded-3xl p-10 mb-12 animate-fade-in border border-border/10">
            <h2 className="text-5xl font-bold text-primary mb-6 leading-tight">
              أهلاً وسهلاً بعودتك
            </h2>
            <p className="text-xl text-muted-foreground opacity-95 leading-relaxed">
              نظم جداول مدرستك بكل سهولة وذكاء مع واجهة حديثة ومتقدمة
            </p>
          </div>

          {/* Recent Schedules Section */}
          <div className="flex-1">
            <h3 className="text-2xl font-semibold mb-8 text-foreground flex items-center">
              <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center mr-3 border border-secondary/20">
                <Clock className="w-4 h-4 text-secondary" />
              </div>
              الجداول الأخيرة
            </h3>
            
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="acrylic-card card-hover rounded-3xl p-8 border-0 border-l-4 border-l-primary/30 transition-all duration-300 hover:border-l-primary/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 space-x-reverse">
                      <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center border border-primary/20">
                        <Clock className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-foreground mb-2">لا توجد جداول حتى الآن</p>
                        <p className="text-md text-muted-foreground opacity-90">أنشئ أول جدول لك للبدء في التنظيم</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Action Panel - Solid Premium */}
        <div className="w-96 p-8 flex flex-col justify-between bg-background border-l border-border/20 shadow-2xl">
          {/* Main Actions */}
          <div className="space-y-8 pt-16">
            {/* Primary Action Button */}
            <Button 
              onClick={onCreateSchedule}
              className="w-full h-20 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-0 rounded-2xl group transition-all duration-500 hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              <div className="flex items-center justify-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-colors duration-300">
                  <Plus className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <span className="text-xl font-semibold text-white">إنشاء جدول أسبوعي جديد</span>
              </div>
            </Button>
            
            {/* Secondary Action Button */}
            <Button 
              variant="outline" 
              size="lg" 
              disabled 
              className="w-full h-16 bg-muted/50 border-border/30 rounded-2xl opacity-70 hover:opacity-90 transition-opacity duration-300"
            >
              <div className="flex items-center justify-center space-x-3 space-x-reverse">
                <Plus className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg text-muted-foreground">قريباً</span>
              </div>
            </Button>

            {/* Quick Stats Section - Replacing unnecessary cards */}
            <div className="space-y-6 pt-12">
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-border/20">
                <h4 className="font-semibold mb-3 text-foreground text-lg flex items-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mr-3 border border-primary/20">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  إحصائيات سريعة
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground">جداول</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">0</p>
                    <p className="text-sm text-muted-foreground">حصص</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Settings - Premium Icons */}
          <div className="flex justify-center space-x-4 space-x-reverse pb-4">
            <Button variant="ghost" size="icon" className="acrylic-card border-0 w-14 h-14 rounded-2xl hover:bg-primary/10 transition-all duration-300 hover:scale-110">
              <HelpCircle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors duration-300" />
            </Button>
            <Button variant="ghost" size="icon" className="acrylic-card border-0 w-14 h-14 rounded-2xl hover:bg-primary/10 transition-all duration-300 hover:scale-110">
              <Settings className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}