import React, { useState, useEffect, useCallback } from 'react'

// Initial dashboard data
const initialDashboardData = {
  categories: [
    {
      id: 'cspm',
      name: 'CSPM Executive Dashboard',
      color: 'from-blue-500 to-cyan-500',
      widgets: [
        { 
          id: 'w1', 
          name: 'Cloud Accounts', 
          text: 'Total: 2 Connected (2)', 
          createdAt: new Date().toISOString()
        },
        { 
          id: 'w2', 
          name: 'Cloud Account Risk Assessment', 
          text: 'Failed: 1689 (36%), Warning: 681 (7%), Not available: 36 (4%), Passed: 7253 (53%)', 
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'cwpp',
      name: 'CWPP Dashboard',
      color: 'from-purple-500 to-pink-500',
      widgets: [
        { 
          id: 'w3', 
          name: 'Top 5 Namespace Specific Alerts', 
          text: 'No Graph data available!', 
          createdAt: new Date().toISOString()
        },
        { 
          id: 'w4', 
          name: 'Workload Alerts', 
          text: 'No Graph data available!', 
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'registry',
      name: 'Registry Scan',
      color: 'from-green-500 to-teal-500',
      widgets: [
        { 
          id: 'w5', 
          name: 'Image Risk Assessment', 
          text: 'Total Vulnerabilities: 1470, Critical: 9, High: 150', 
          createdAt: new Date().toISOString()
        },
        { 
          id: 'w6', 
          name: 'Image Security Issues', 
          text: 'Total Images: 1470, Critical: 2, High: 2', 
          createdAt: new Date().toISOString()
        }
      ]
    }
  ]
}

// Custom hook for dashboard state management
const useDashboardStore = () => {
  const [dashboardData, setDashboardData] = useState(() => {
    const saved = localStorage.getItem('dashboardData')
    return saved ? JSON.parse(saved) : initialDashboardData
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData))
  }, [dashboardData])

  const addWidget = useCallback((categoryId, widget) => {
    setDashboardData(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { 
              ...cat, 
              widgets: [...cat.widgets, { 
                ...widget, 
                id: `w${Date.now()}`, 
                createdAt: new Date().toISOString()
              }] 
            }
          : cat
      )
    }))
  }, [])

  const removeWidget = useCallback((categoryId, widgetId) => {
    setDashboardData(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, widgets: cat.widgets.filter(w => w.id !== widgetId) }
          : cat
      )
    }))
  }, [])

  const updateWidget = useCallback((categoryId, widgetId, updates) => {
    setDashboardData(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, widgets: cat.widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w) }
          : cat
      )
    }))
  }, [])

  const getAllWidgets = useCallback(() => {
    return dashboardData.categories.flatMap(cat => 
      cat.widgets.map(widget => ({ 
        ...widget, 
        categoryId: cat.id, 
        categoryName: cat.name, 
        categoryColor: cat.color 
      }))
    )
  }, [dashboardData])

  const getFilteredWidgets = useCallback(() => {
    const allWidgets = getAllWidgets()
    let filtered = allWidgets

    if (searchTerm) {
      filtered = filtered.filter(widget => 
        widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        widget.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [getAllWidgets, searchTerm])

  return {
    dashboardData,
    searchTerm,
    setSearchTerm,
    addWidget,
    removeWidget,
    updateWidget,
    getAllWidgets,
    getFilteredWidgets
  }
}

// Widget Component
const Widget = ({ widget, categoryId, categoryColor, onRemove, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(widget.name)
  const [editText, setEditText] = useState(widget.text)

  const handleSave = () => {
    onUpdate(categoryId, widget.id, { 
      name: editName, 
      text: editText
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditName(widget.name)
    setEditText(widget.text)
    setIsEditing(false)
  }

  return (
    <div className="widget-card glass-effect rounded-2xl p-6 premium-shadow relative group animate-fade-in">
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full p-2 transition-all duration-200"
          title="Edit widget"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          onClick={() => onRemove(categoryId, widget.id)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
          title="Delete widget"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-start mb-4">
        <div className={`w-3 h-3 bg-gradient-to-r ${categoryColor} rounded-full mr-3 mt-2 flex-shrink-0`}></div>
        {isEditing ? (
          <input 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="font-bold text-gray-800 text-lg leading-tight pr-20 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none flex-1"
            placeholder="Widget name"
          />
        ) : (
          <h3 className="font-bold text-gray-800 text-lg leading-tight pr-20">{widget.name}</h3>
        )}
      </div>

      <div className="ml-6 mb-4">
        {isEditing ? (
          <textarea 
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-gray-600 text-sm leading-relaxed bg-transparent border-2 border-blue-300 rounded-lg p-3 focus:border-blue-500 outline-none resize-none"
            rows="3"
            placeholder="Widget content"
          />
        ) : (
          <p className="text-gray-600 text-sm leading-relaxed">{widget.text}</p>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end gap-2 ml-6">
          <button 
            onClick={handleCancel}
            className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-3 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all duration-200"
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}

// Add Widget Modal Component
const AddWidgetModal = ({ isOpen, onClose, onAdd, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [widgetName, setWidgetName] = useState('')
  const [widgetText, setWidgetText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedCategory && widgetName.trim() && widgetText.trim()) {
      onAdd(selectedCategory, { 
        name: widgetName.trim(), 
        text: widgetText.trim()
      })
      setWidgetName('')
      setWidgetText('')
      setSelectedCategory('')
      onClose()
    }
  }

  const resetForm = () => {
    setWidgetName('')
    setWidgetText('')
    setSelectedCategory('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-lg premium-shadow-lg animate-modal-enter">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Add New Widget</h2>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 search-input text-gray-800"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Widget Name *</label>
            <input 
              type="text" 
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
              className="w-full p-3 search-input text-gray-800"
              placeholder="Enter widget name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Widget Content *</label>
            <textarea 
              value={widgetText}
              onChange={(e) => setWidgetText(e.target.value)}
              className="w-full p-3 search-input h-24 resize-none text-gray-800"
              placeholder="Enter widget content"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={handleClose}
              className="flex-1 px-4 py-3 glass-effect text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium premium-shadow"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 btn-premium text-white rounded-xl font-medium"
            >
              Add Widget
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Dashboard Component
const Dashboard = () => {
  const { 
    dashboardData, 
    searchTerm, 
    setSearchTerm,
    addWidget, 
    removeWidget,
    updateWidget,
    getFilteredWidgets 
  } = useDashboardStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const filteredWidgets = getFilteredWidgets()

  const handleQuickAdd = (categoryId) => {
    const widgetName = prompt('Enter Widget Name:')
    if (widgetName && widgetName.trim()) {
      const widgetText = prompt('Enter Widget Text:')
      if (widgetText && widgetText.trim()) {
        addWidget(categoryId, { 
          name: widgetName.trim(), 
          text: widgetText.trim()
        })
      } else if (widgetText !== null) {
        alert('Widget Text is required!')
      }
    } else if (widgetName !== null) {
      alert('Widget Name is required!')
    }
  }

  const getTotalWidgets = () => {
    return dashboardData.categories.reduce((total, cat) => total + cat.widgets.length, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Enhanced Header */}
      <header className="glass-effect premium-shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-float">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse-ring"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">CNAPP Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-xl p-1 premium-shadow">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'dashboard' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('search')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'search' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Search & Filter
                </button>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-premium text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Widget
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' ? (
          // Dashboard View
          <div className="space-y-8">
            {dashboardData.categories.map(category => (
              <div key={category.id} className="category-glass rounded-2xl premium-shadow-lg p-8 animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-10 bg-gradient-to-b ${category.color} rounded-full`}></div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                      <p className="text-sm text-gray-600">Manage your {category.name.toLowerCase()} widgets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`bg-gradient-to-r ${category.color} bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium text-gray-700 premium-shadow`}>
                      {category.widgets.length} widget{category.widgets.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.widgets.map(widget => (
                    <Widget 
                      key={widget.id} 
                      widget={widget} 
                      categoryId={category.id}
                      categoryColor={category.color}
                      onRemove={removeWidget}
                      onUpdate={updateWidget}
                    />
                  ))}
                  
                  {/* Add Widget Box */}
                  <button 
                    className="glass-effect rounded-2xl p-6 premium-shadow border-2 border-dashed border-blue-300 add-widget-hover transition-all duration-300 group cursor-pointer w-full"
                    onClick={() => handleQuickAdd(category.id)}
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-center">
                      <div className={`w-14 h-14 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-700 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-200">Quick Add Widget</h3>
                      <p className="text-gray-500 text-sm">Click to add widget with prompts</p>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Search & Filter View
          <div className="category-glass rounded-2xl premium-shadow-lg p-8 animate-fade-in">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Search Widgets</h2>
                  <p className="text-sm text-gray-600">Find and manage widgets across all categories</p>
                </div>
              </div>
              
              <div className="relative mb-6">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text"
                  placeholder="Search widgets by name or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 search-input text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            {filteredWidgets.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600">Found {filteredWidgets.length} widget{filteredWidgets.length !== 1 ? 's' : ''}</p>
                </div>
                {filteredWidgets.map(widget => (
                  <div key={`${widget.categoryId}-${widget.id}`} className="glass-effect rounded-xl p-6 premium-shadow hover:shadow-lg transition-all duration-300 group animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 bg-gradient-to-r ${widget.categoryColor} rounded-full flex-shrink-0`}></div>
                          <h3 className="font-bold text-gray-800 text-lg">{widget.name}</h3>
                          <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 px-3 py-1 rounded-full font-medium premium-shadow">
                            {widget.categoryName}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed ml-6">{widget.text}</p>
                      </div>
                      <button 
                        onClick={() => removeWidget(widget.categoryId, widget.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all duration-200 ml-4"
                        title="Delete widget"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass-effect rounded-2xl premium-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium text-lg mb-2">
                  {searchTerm ? 'No widgets found matching your search' : 'Start typing to search widgets'}
                </p>
                <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        )}
      </main>

      <AddWidgetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addWidget}
        categories={dashboardData.categories}
      />
    </div>
  )
}

export default Dashboard