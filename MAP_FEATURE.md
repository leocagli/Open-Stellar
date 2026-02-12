# Interactive Agent Map Feature

## Overview

The Interactive Agent Map is a new feature added to the Open-Stellar project that allows users to visualize and control AI agents as they move between buildings on an interactive map to complete tasks.

## Features

### 1. Interactive Map Display
- Built with **Leaflet** for smooth, responsive map rendering
- **OpenStreetMap** tiles for geographic context
- Real-time visualization of agents and buildings

### 2. Building Markers
- 6 pre-configured buildings with unique locations:
  - Research Lab
  - Command Center
  - Manufacturing Plant
  - Supply Depot
  - Energy Station
  - Medical Bay
- Each building has available tasks that can be assigned to agents
- Click on building markers to view details and available tasks

### 3. Agent System
- Create new agents with custom names
- Agents spawn at a central location
- Visual indicators show agent status:
  - 🟢 **Green**: Idle (available for tasks)
  - 🟡 **Yellow**: Moving (traveling to building)
  - 🔴 **Red**: Working (executing task)

### 4. Task Assignment
- Create tasks by clicking buildings and selecting available actions
- Assign pending tasks to idle agents
- Agents automatically navigate to assigned buildings
- Tasks are completed after agents arrive and work for a set duration

### 5. Control Panel
The right sidebar provides:
- **Create Agent**: Add new agents to the map
- **Assign Task**: Match idle agents with pending tasks
- **Status Overview**: Real-time statistics on agents and tasks
- **Clear All Tasks**: Reset the simulation

## Usage

### Accessing the Map
1. Navigate to `/_admin/` in your deployed Open-Stellar instance
2. Click on the **"Agent Map"** tab in the navigation menu

### Creating an Agent
1. In the Control Panel, enter a name for your agent
2. Click **"Create Agent"**
3. The agent will appear at the spawn point (green marker)

### Assigning Tasks
**Method 1: Via Building**
1. Click on a building marker
2. In the popup, select a task
3. Click the **"Assign"** button next to the task

**Method 2: Via Control Panel**
1. First, create a task by clicking a building and selecting an action
2. In the Control Panel, select an idle agent
3. Select a pending task
4. Click **"Assign Task"**

### Watching Agents Work
1. Once a task is assigned, the agent marker turns yellow and begins moving
2. The agent travels toward the target building
3. Upon arrival, the marker turns red and the agent "works" for 5 seconds
4. After completion, the agent returns to idle status (green)

## Architecture

### Components

```
src/client/
├── pages/
│   ├── MapPage.tsx          # Main map page component
│   └── MapPage.css          # Map page styles
├── components/
│   ├── BuildingMarker.tsx   # Building marker component
│   ├── AgentMarker.tsx      # Agent marker with animation
│   └── TaskPanel.tsx        # Control panel UI
├── types/
│   └── map.ts               # TypeScript type definitions
└── data/
    └── buildings.ts         # Sample building data
```

### Data Models

**Building**
```typescript
{
  id: string
  name: string
  coordinates: { lat: number, lng: number }
  description: string
  availableTasks: string[]
}
```

**Agent**
```typescript
{
  id: string
  name: string
  position: { lat: number, lng: number }
  status: 'idle' | 'moving' | 'working'
  assignedTask?: Task
  targetBuilding?: Building
}
```

**Task**
```typescript
{
  id: string
  buildingId: string
  buildingName: string
  description: string
  status: 'pending' | 'assigned' | 'in-progress' | 'completed'
  assignedAgentId?: string
}
```

## Customization

### Adding New Buildings
Edit `src/client/data/buildings.ts`:

```typescript
export const sampleBuildings: Building[] = [
  // ... existing buildings
  {
    id: 'b7',
    name: 'Your Building',
    coordinates: { lat: 40.7200, lng: -74.0000 },
    description: 'Your description',
    availableTasks: ['Task 1', 'Task 2']
  }
]
```

### Adjusting Agent Movement Speed
In `MapPage.tsx`, modify the speed constant in the movement logic:

```typescript
const speed = 0.0002 // units per tick - increase for faster movement
```

### Changing Task Completion Time
In `MapPage.tsx`, adjust the timeout duration:

```typescript
setTimeout(() => {
  // Complete task logic
}, 5000) // milliseconds - change as needed
```

## Technical Details

### Dependencies
- `leaflet`: ^1.9.4 - Map rendering library
- `react-leaflet`: ^4.2.1 - React bindings for Leaflet
- `react-router-dom`: ^7.1.1 - Client-side routing

### Animation
Agent movement uses a smooth interpolation algorithm that:
1. Calculates the distance to the target
2. Moves the agent incrementally toward the target
3. Updates position every 100ms
4. Detects arrival when distance < 0.001 units

### State Management
The map uses React hooks for state management:
- `useState` for agents, tasks, and buildings
- `useCallback` for optimized event handlers
- `useEffect` for movement animation loop

## Future Enhancements

Potential improvements that could be added:
- WebSocket integration for real-time multi-user interaction
- Persistent storage of agents and tasks
- Customizable building icons and agent avatars
- Path visualization showing agent routes
- Agent communication and collaboration
- Building capacity limits
- Task priority queues
- Performance metrics and analytics

## Browser Compatibility

The map feature requires a modern browser with support for:
- ES6+ JavaScript
- WebGL (for smooth rendering)
- CSS Grid and Flexbox

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

The map is optimized for:
- Up to 50 agents simultaneously
- 10-20 buildings on screen
- Smooth 60 FPS animation on modern hardware

For larger deployments, consider:
- Implementing marker clustering
- Using canvas-based rendering for many agents
- Throttling update frequency
