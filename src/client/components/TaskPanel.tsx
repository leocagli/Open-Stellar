import { useState } from 'react'
import type { Agent, Task } from '../types/map'

interface TaskPanelProps {
  agents: Agent[]
  tasks: Task[]
  onCreateAgent: (name: string) => void
  onAssignTask: (agentId: string, taskId: string) => void
  onClearTasks: () => void
}

export default function TaskPanel({
  agents,
  tasks,
  onCreateAgent,
  onAssignTask,
  onClearTasks
}: TaskPanelProps) {
  const [newAgentName, setNewAgentName] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<string>('')

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAgentName.trim()) {
      onCreateAgent(newAgentName.trim())
      setNewAgentName('')
    }
  }

  const handleAssignTask = () => {
    if (selectedAgent && selectedTask) {
      onAssignTask(selectedAgent, selectedTask)
      setSelectedAgent('')
      setSelectedTask('')
    }
  }

  const availableTasks = tasks.filter(t => t.status === 'pending')
  const idleAgents = agents.filter(a => a.status === 'idle')

  return (
    <div className="task-panel">
      <h2>Control Panel</h2>

      <section className="panel-section">
        <h3>Create Agent</h3>
        <form onSubmit={handleCreateAgent} className="create-agent-form">
          <input
            type="text"
            value={newAgentName}
            onChange={(e) => setNewAgentName(e.target.value)}
            placeholder="Agent name"
            className="agent-name-input"
          />
          <button type="submit" className="btn btn-primary">
            Create Agent
          </button>
        </form>
      </section>

      <section className="panel-section">
        <h3>Assign Task</h3>
        {idleAgents.length === 0 ? (
          <p className="hint">No idle agents available</p>
        ) : availableTasks.length === 0 ? (
          <p className="hint">No pending tasks available</p>
        ) : (
          <div className="assign-task-form">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="agent-select"
            >
              <option value="">Select Agent</option>
              {idleAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="task-select"
            >
              <option value="">Select Task</option>
              {availableTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.description} at {task.buildingName}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleAssignTask}
              disabled={!selectedAgent || !selectedTask}
              className="btn btn-success"
            >
              Assign Task
            </button>
          </div>
        )}
      </section>

      <section className="panel-section">
        <h3>Status Overview</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Total Agents:</span>
            <span className="status-value">{agents.length}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Idle:</span>
            <span className="status-value idle">{agents.filter(a => a.status === 'idle').length}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Moving:</span>
            <span className="status-value moving">{agents.filter(a => a.status === 'moving').length}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Working:</span>
            <span className="status-value working">{agents.filter(a => a.status === 'working').length}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Pending Tasks:</span>
            <span className="status-value">{availableTasks.length}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Completed:</span>
            <span className="status-value">{tasks.filter(t => t.status === 'completed').length}</span>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <h3>Actions</h3>
        <button
          onClick={onClearTasks}
          className="btn btn-danger"
        >
          Clear All Tasks
        </button>
      </section>
    </div>
  )
}
