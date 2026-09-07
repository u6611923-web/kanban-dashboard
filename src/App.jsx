import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const TASKS_KEY = 'kanban_tasks'
const CATEGORIES_KEY = 'kanban_categories'

// Replace these names with the responsible-person data provided by your instructor.
const PEOPLE = [
  { id: 1, name: 'Alex' },
  { id: 2, name: 'Jamie' },
  { id: 3, name: 'Taylor' },
]

const DEFAULT_CATEGORIES = ['Development', 'Design', 'Testing']

const SAMPLE_TASKS = [
  {
    id: 1,
    title: 'Create project layout',
    description: 'Set up the React project and main Kanban columns.',
    category: 'Development',
    startDate: '2026-09-05',
    dueDate: '2026-09-08',
    completeDate: '',
    responsiblePersonId: 1,
    status: 'TO DO',
  },
  {
    id: 2,
    title: 'Design task cards',
    description: 'Create a clean task card UI for the board.',
    category: 'Design',
    startDate: '2026-09-04',
    dueDate: '2026-09-07',
    completeDate: '',
    responsiblePersonId: 2,
    status: 'DOING',
  },
  {
    id: 3,
    title: 'Test Local Storage',
    description: 'Check that tasks remain after refresh.',
    category: 'Testing',
    startDate: '2026-09-01',
    dueDate: '2026-09-05',
    completeDate: '2026-09-04',
    responsiblePersonId: 3,
    status: 'DONE',
  },
  {
    id: 4,
    title: 'Prepare dashboard cards',
    description: 'Calculate totals by status and overdue tasks.',
    category: 'Development',
    startDate: '2026-09-02',
    dueDate: '2026-09-06',
    completeDate: '2026-09-06',
    responsiblePersonId: 1,
    status: 'DONE',
  },
  {
    id: 5,
    title: 'Check responsive layout',
    description: 'Make the board usable on smaller screens.',
    category: 'Testing',
    startDate: '2026-09-03',
    dueDate: '2026-09-04',
    completeDate: '2026-09-06',
    responsiblePersonId: 2,
    status: 'DONE',
  },
]

const STATUS_ORDER = ['TO DO', 'DOING', 'DONE']
const STATUS_COLORS = ['#6366f1', '#f59e0b', '#10b981']

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function todayString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function App() {
  const [page, setPage] = useState(() =>
    window.location.hash.includes('dashboard') ? 'dashboard' : 'board',
  )
  const [tasks, setTasks] = useState(() => readStored(TASKS_KEY, SAMPLE_TASKS))
  const [categories, setCategories] = useState(() =>
    readStored(CATEGORIES_KEY, DEFAULT_CATEGORIES),
  )

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    const handleHash = () =>
      setPage(window.location.hash.includes('dashboard') ? 'dashboard' : 'board')
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Kanban Board</h1>
          <p>Task Management Dashboard</p>
        </div>
        <nav>
          <a className={page === 'board' ? 'active' : ''} href="#/">
            Board
          </a>
          <a className={page === 'dashboard' ? 'active' : ''} href="#/dashboard">
            Dashboard
          </a>
        </nav>
      </header>

      <main>
        {page === 'board' ? (
          <KanbanBoard
            tasks={tasks}
            setTasks={setTasks}
            categories={categories}
            setCategories={setCategories}
          />
        ) : (
          <Dashboard tasks={tasks} categories={categories} />
        )}
      </main>
    </div>
  )
}

function KanbanBoard({ tasks, setTasks, categories, setCategories }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [newCategory, setNewCategory] = useState('')

  const openNew = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const saveTask = (formTask) => {
    if (editingTask) {
      setTasks((current) =>
        current.map((task) => (task.id === editingTask.id ? { ...formTask, id: task.id } : task)),
      )
    } else {
      setTasks((current) => [...current, { ...formTask, id: Date.now() }])
    }
    setModalOpen(false)
  }

  const deleteTask = (id) => {
    if (window.confirm('Delete this task?')) {
      setTasks((current) => current.filter((task) => task.id !== id))
    }
  }

  const moveTask = (task, direction) => {
    const currentIndex = STATUS_ORDER.indexOf(task.status)
    const nextIndex = currentIndex + direction
    if (nextIndex < 0 || nextIndex >= STATUS_ORDER.length) return

    const nextStatus = STATUS_ORDER[nextIndex]
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: nextStatus,
              completeDate:
                nextStatus === 'DONE' ? item.completeDate || todayString() : '',
            }
          : item,
      ),
    )
  }

  const addCategory = (event) => {
    event.preventDefault()
    const clean = newCategory.trim()
    if (!clean) return
    if (!categories.some((category) => category.toLowerCase() === clean.toLowerCase())) {
      setCategories((current) => [...current, clean])
    }
    setNewCategory('')
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Kanban Board</h2>
          <p>Create tasks, assign people, and move work through the workflow.</p>
        </div>
        <button className="primary-btn" onClick={openNew}>+ New Task</button>
      </div>

      <form className="category-bar" onSubmit={addCategory}>
        <label htmlFor="new-category">Add category</label>
        <input
          id="new-category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="e.g. Documentation"
        />
        <button type="submit" className="secondary-btn">Add</button>
        <span>{categories.length} categories available</span>
      </form>

      <div className="board-grid">
        {STATUS_ORDER.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status)
          return (
            <div className="kanban-column" key={status}>
              <div className="column-title">
                <h3>{status}</h3>
                <span>{columnTasks.length}</span>
              </div>
              <div className="task-list">
                {columnTasks.length === 0 && <div className="empty-state">No tasks</div>}
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEdit}
                    onDelete={deleteTask}
                    onMove={moveTask}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          categories={categories}
          onSave={saveTask}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  )
}

function TaskCard({ task, onEdit, onDelete, onMove }) {
  const person = PEOPLE.find((p) => p.id === Number(task.responsiblePersonId))
  const overdue = task.status !== 'DONE' && task.dueDate && task.dueDate < todayString()

  return (
    <article className="task-card">
      <div className="task-card-top">
        <span className="category-pill">{task.category}</span>
        {overdue && <span className="overdue-pill">Overdue</span>}
      </div>
      <h4>{task.title}</h4>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
        <span><strong>Person:</strong> {person?.name || 'Unassigned'}</span>
        <span><strong>Start:</strong> {task.startDate || '-'}</span>
        <span><strong>Due:</strong> {task.dueDate || '-'}</span>
        {task.status === 'DONE' && (
          <span><strong>Completed:</strong> {task.completeDate || '-'}</span>
        )}
      </div>
      <div className="card-actions">
        <div>
          <button
            className="icon-btn"
            disabled={task.status === 'TO DO'}
            onClick={() => onMove(task, -1)}
            title="Move left"
          >
            ←
          </button>
          <button
            className="icon-btn"
            disabled={task.status === 'DONE'}
            onClick={() => onMove(task, 1)}
            title="Move right"
          >
            →
          </button>
        </div>
        <div>
          <button className="text-btn" onClick={() => onEdit(task)}>Edit</button>
          <button className="text-btn danger" onClick={() => onDelete(task.id)}>Delete</button>
        </div>
      </div>
    </article>
  )
}

function TaskModal({ task, categories, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || categories[0] || '',
    startDate: task?.startDate || '',
    dueDate: task?.dueDate || '',
    completeDate: task?.completeDate || '',
    responsiblePersonId: task?.responsiblePersonId || PEOPLE[0]?.id || '',
    status: task?.status || 'TO DO',
  }))

  const setField = (field, value) => {
    setForm((current) => {
      const updated = { ...current, [field]: value }
      if (field === 'status') {
        if (value === 'DONE' && !updated.completeDate) updated.completeDate = todayString()
        if (value !== 'DONE') updated.completeDate = ''
      }
      return updated
    })
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (form.dueDate && form.startDate && form.dueDate < form.startDate) {
      alert('Due date cannot be before the start date.')
      return
    }
    onSave(form)
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Create Task'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="task-form">
          <label>
            Title
            <input required value={form.title} onChange={(e) => setField('title', e.target.value)} />
          </label>
          <label>
            Description
            <textarea rows="3" value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </label>
          <div className="form-row">
            <label>
              Category
              <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              Responsible Person
              <select
                value={form.responsiblePersonId}
                onChange={(e) => setField('responsiblePersonId', Number(e.target.value))}
              >
                {PEOPLE.map((person) => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Start Date
              <input type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
            </label>
            <label>
              Due Date
              <input type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Status
              <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                {STATUS_ORDER.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label>
              Complete Date
              <input
                type="date"
                disabled={form.status !== 'DONE'}
                value={form.completeDate}
                onChange={(e) => setField('completeDate', e.target.value)}
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Dashboard({ tasks, categories }) {
  const total = tasks.length
  const todo = tasks.filter((t) => t.status === 'TO DO').length
  const doing = tasks.filter((t) => t.status === 'DOING').length
  const done = tasks.filter((t) => t.status === 'DONE').length
  const overdue = tasks.filter(
    (t) => t.status !== 'DONE' && t.dueDate && t.dueDate < todayString(),
  ).length

  const statusData = [
    { name: 'TO DO', value: todo },
    { name: 'DOING', value: doing },
    { name: 'DONE', value: done },
  ]

  const categoryData = useMemo(() => {
    const allCategories = Array.from(new Set([...categories, ...tasks.map((t) => t.category)]))
    return allCategories
      .filter(Boolean)
      .map((category) => ({
        category,
        tasks: tasks.filter((task) => task.category === category).length,
      }))
  }, [tasks, categories])

  const completionData = useMemo(() => {
    const result = { Early: 0, 'On Time': 0, Late: 0 }
    tasks
      .filter((t) => t.status === 'DONE' && t.completeDate && t.dueDate)
      .forEach((task) => {
        if (task.completeDate < task.dueDate) result.Early += 1
        else if (task.completeDate === task.dueDate) result['On Time'] += 1
        else result.Late += 1
      })
    return Object.entries(result).map(([name, value]) => ({ name, value }))
  }, [tasks])

  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Live summary calculated from the Kanban task data.</p>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Total Tasks" value={total} />
        <SummaryCard label="TO DO" value={todo} />
        <SummaryCard label="DOING" value={doing} />
        <SummaryCard label="DONE" value={done} />
        <SummaryCard label="Overdue" value={overdue} warning />
      </div>

      <div className="dashboard-grid">
        <ChartCard title="Task Status">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                {statusData.map((entry, index) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasks by Category">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} margin={{ left: 0, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completion Performance" wide>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  )
}

function SummaryCard({ label, value, warning }) {
  return (
    <div className={`summary-card ${warning ? 'warning' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ChartCard({ title, children, wide }) {
  return (
    <div className={`chart-card ${wide ? 'wide' : ''}`}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

export default App
