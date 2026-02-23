"use client"

import { useCitySimulation } from "@/hooks/use-city-simulation"
import { CityHeader } from "@/components/city-header"
import { DistrictPanel } from "@/components/district-panel"
import { CityGrid } from "@/components/city-grid"
import { AgentDetail } from "@/components/agent-detail"
import { ActivityLog } from "@/components/activity-log"

export default function MoltbotCityPage() {
  const {
    agents,
    districts,
    stats,
    selectedAgent,
    setSelectedAgent,
    selectedDistrict,
    setSelectedDistrict,
    isRunning,
    toggleSimulation,
    speed,
    cycleSpeed,
    logs,
  } = useCitySimulation()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Scanline overlay */}
      <div className="scanline pointer-events-none fixed inset-0 z-50" />

      {/* Header */}
      <CityHeader
        stats={stats}
        isRunning={isRunning}
        speed={speed}
        onToggle={toggleSimulation}
        onCycleSpeed={cycleSpeed}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* District sidebar */}
        <div className="hidden w-56 overflow-auto lg:block xl:w-64">
          <DistrictPanel
            districts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
          />
        </div>

        {/* City view + Log */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile district selector */}
          <div className="flex gap-2 overflow-auto border-b border-border p-2 lg:hidden">
            <button
              onClick={() => setSelectedDistrict(null)}
              className={`whitespace-nowrap rounded-md border px-3 py-1 text-[10px] font-mono transition-colors ${
                selectedDistrict === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              All
            </button>
            {districts.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDistrict(d.id)}
                className={`whitespace-nowrap rounded-md border px-3 py-1 text-[10px] font-mono transition-colors ${
                  selectedDistrict === d.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Agent grid */}
          <CityGrid
            agents={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
          />

          {/* Activity log */}
          <ActivityLog logs={logs} />
        </div>

        {/* Agent detail panel */}
        {selectedAgent && (
          <div className="hidden overflow-auto md:block">
            <AgentDetail
              agent={selectedAgent}
              onClose={() => setSelectedAgent(null)}
            />
          </div>
        )}
      </div>

      {/* Mobile agent detail overlay */}
      {selectedAgent && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedAgent(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-auto rounded-t-xl border-t border-border bg-card">
            <AgentDetail
              agent={selectedAgent}
              onClose={() => setSelectedAgent(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
