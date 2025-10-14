import { useState } from "react"
import { ChevronDown, ChevronRight, Sparkles, Settings, Eye, EyeOff } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { cn } from "../lib/utils"

interface ProgressiveFeature {
  id: string
  name: string
  description: string
  category: "basic" | "intermediate" | "advanced"
  enabled: boolean
  icon: React.ComponentType<{ className?: string }>
}

interface ProgressiveDisclosureProps {
  title: string
  description?: string
  features: ProgressiveFeature[]
  onFeatureToggle: (featureId: string, enabled: boolean) => void
  className?: string
}

const categoryColors = {
  basic: "bg-green-100 text-green-800 border-green-200",
  intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  advanced: "bg-purple-100 text-purple-800 border-purple-200",
}

const categoryIcons = {
  basic: Sparkles,
  intermediate: Settings,
  advanced: Eye,
}

export function ProgressiveDisclosure({
  title,
  description,
  features,
  onFeatureToggle,
  className
}: ProgressiveDisclosureProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const visibleFeatures = showAdvanced 
    ? features 
    : features.filter(f => f.category !== "advanced")

  const basicFeatures = features.filter(f => f.category === "basic")
  const intermediateFeatures = features.filter(f => f.category === "intermediate")
  const advancedFeatures = features.filter(f => f.category === "advanced")

  return (
    <div className={cn("border rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Feature Categories */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Basic Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-sm">Basic Features</h4>
                <Badge variant="outline" className="text-xs">
                  {basicFeatures.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {basicFeatures.map(feature => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <feature.icon className="h-3 w-3 text-green-600" />
                      <span className="text-xs">{feature.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onFeatureToggle(feature.id, !feature.enabled)}
                    >
                      {feature.enabled ? (
                        <Eye className="h-3 w-3 text-green-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Intermediate Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-amber-600" />
                <h4 className="font-medium text-sm">Intermediate</h4>
                <Badge variant="outline" className="text-xs">
                  {intermediateFeatures.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {intermediateFeatures.map(feature => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <feature.icon className="h-3 w-3 text-amber-600" />
                      <span className="text-xs">{feature.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onFeatureToggle(feature.id, !feature.enabled)}
                    >
                      {feature.enabled ? (
                        <Eye className="h-3 w-3 text-amber-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-sm">Advanced</h4>
                <Badge variant="outline" className="text-xs">
                  {advancedFeatures.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {advancedFeatures.map(feature => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <feature.icon className="h-3 w-3 text-purple-600" />
                      <span className="text-xs">{feature.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onFeatureToggle(feature.id, !feature.enabled)}
                    >
                      {feature.enabled ? (
                        <Eye className="h-3 w-3 text-purple-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Show Advanced Toggle */}
          {advancedFeatures.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-sm font-medium">Advanced Features</p>
                <p className="text-xs text-muted-foreground">
                  Show advanced features for power users
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "Hide Advanced" : "Show Advanced"}
              </Button>
            </div>
          )}

          {/* Usage Tips */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 text-sm">💡 Usage Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Start with basic features and gradually enable more as you become comfortable</li>
              <li>• Advanced features are designed for experienced users</li>
              <li>• You can toggle features on/off at any time</li>
              <li>• Disabled features won't appear in the interface</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
