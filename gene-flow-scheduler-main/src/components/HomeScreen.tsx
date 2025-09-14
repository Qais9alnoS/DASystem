import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Settings, HelpCircle, Calendar, Users, BookOpen, Clock, Moon, Sun, Bell, BarChart3, UserCheck, BookMarked } from "lucide-react"
import schoolBackground from "@/assets/school-background.jpg"
import { useTheme } from "next-themes"

interface HomeScreenProps {
  onCreateSchedule: () => void
}

export const HomeScreen = ({ onCreateSchedule }: HomeScreenProps) => {
  const { theme, setTheme } = useTheme()

  const mainActions = [
    {
      title: "إنشاء جدول جديد",
      description: "ابدأ في بناء جدول أسبوعي جديد",
      icon: Calendar,
      action: onCreateSchedule,
      color: "primary"
    },
    {
      title: "إدارة المعلمين",
      description: "عرض وتعديل بيانات المعلمين",
      icon: UserCheck,
      action: () => {},
      color: "secondary"
    },
    {
      title: "إدارة المواد",
      description: "تنظيم المواد الدراسية",
      icon: BookMarked,
      action: () => {},
      color: "accent"
    },
    {
      title: "التقارير والإحصائيات",
      description: "عرض تقارير الأداء",
      icon: BarChart3,
      action: () => {},
      color: "primary"
    }
  ]

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
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Header - Fixed */}
        <header className="glass border-b border-border/20 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-primary/20 shadow-glow">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary">برنامج جين للإدارة المدرسية</h1>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="acrylic-card border-0 w-10 h-10 rounded-xl hover:bg-primary/10 transition-all duration-300"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-secondary" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="acrylic-card border-0 w-10 h-10 rounded-xl hover:bg-primary/10">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="acrylic-card border-0 w-10 h-10 rounded-xl hover:bg-primary/10">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          {/* Welcome Message */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-primary mb-4">أهلاً وسهلاً بعودتك</h2>
            <p className="text-xl text-muted-foreground opacity-90">نظام متكامل لإدارة الجداول المدرسية بكل كفاءة واحترافية</p>
          </div>

          {/* Main Action Grid */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-4xl mb-16">
            {mainActions.map((action, index) => (
              <Card 
                key={index}
                className="acrylic-card card-hover rounded-2xl p-6 border-0 cursor-pointer transition-all duration-300 group"
                onClick={action.action}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 bg-${action.color}/20 rounded-2xl flex items-center justify-center border border-${action.color}/20 group-hover:bg-${action.color}/30 transition-colors duration-300`}>
                    <action.icon className={`w-8 h-8 text-${action.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground opacity-90">
                    {action.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Schedules Section */}
          <div className="w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground flex items-center">
                <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center mr-3 border border-secondary/20">
                  <Clock className="w-4 h-4 text-secondary" />
                </div>
                الجداول الأخيرة
              </h3>
              <span className="text-sm text-muted-foreground opacity-70">
                سيتم إضافة الجداول تلقائياً عند إنشائها
              </span>
            </div>
            
            <div className="grid gap-4">
              <Card className="acrylic-card rounded-2xl p-6 border-0 border-l-4 border-l-primary/30 transition-all duration-300 hover:border-l-primary/60 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center border border-primary/20">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-1">لا توجد جداول حتى الآن</p>
                      <p className="text-sm text-muted-foreground opacity-80">أنشئ أول جدول لك للبدء في التنظيم</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    عرض التفاصيل
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="glass border-t border-border/20 px-8 py-4 text-center">
          <p className="text-sm text-muted-foreground opacity-80">
            برنامج جين للإدارة المدرسية • الإصدار 1.0.0 • 
            <a href="#" className="text-primary hover:underline mx-2">الدعم الفني</a>
          </p>
        </footer>
      </div>
    </div>
  )
}