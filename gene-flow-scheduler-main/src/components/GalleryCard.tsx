import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GalleryCardProps {
  title?: string
  subtitle?: string
  description?: string
  isAddCard?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

export const GalleryCard = ({
  title,
  subtitle, 
  description,
  isAddCard = false,
  onEdit,
  onDelete,
  onClick,
  className,
  children
}: GalleryCardProps) => {
  if (isAddCard) {
    return (
      <Card 
        className={cn(
          "p-8 card-hover cursor-pointer bg-gradient-to-br from-muted/30 to-muted/10 border-dashed border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 group transition-all duration-300",
          className
        )}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-8 h-8 text-white group-hover:rotate-180 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-semibold text-primary group-hover:text-primary-glow transition-colors">
            {title || "Add New"}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {description || "Click to add a new item"}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "p-6 card-hover bg-gradient-to-br from-card to-card-hover border-0 shadow-card group cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          {/* Action buttons */}
          {(onEdit || onDelete) && (
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </Card>
  )
}