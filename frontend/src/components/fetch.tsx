'use client';
import React, { useEffect, useState } from 'react';

export default function Fetch() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [expandedTodo, setExpandedTodo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5000/all/todos?userId=${userId || ''}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch todos');
      setTodos(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTodo = (id) => {
    setExpandedTodo(expandedTodo === id ? null : id);
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditForm({ title: todo.title, description: todo.description || '' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '' });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/edit-todo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update todo');
      }

      await fetchTodos();
      setEditingId(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/delete-todo/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete todo');
      }

      await fetchTodos();
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleCompletion = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/toggle-todo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update task status');
      }

      await fetchTodos();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-[60vh] bg-slate-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
          <span className="bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent">
            My Tasks
          </span>
        </h2>
        
        {error && (
          <div className="bg-rose-100 text-rose-800 p-4 rounded-xl mb-6 text-center border border-rose-200">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {todos.map((todo) => (
            <div 
              key={todo.id} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 border ${
                todo.is_completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'border-slate-200 hover:border-teal-300'
              } ${todo.description ? 'cursor-pointer hover:shadow-md' : ''}`}
            >
              <div className="flex items-center p-5">
                <button
                  onClick={() => toggleCompletion(todo.id, todo.is_completed)}
                  className="mr-3 flex-shrink-0"
                  aria-label={todo.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    todo.is_completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-300 hover:border-green-500'
                  }`}>
                    {todo.is_completed && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>

                <div className="flex-1">
                  {editingId === todo.id ? (
                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border-b border-slate-300 focus:outline-none focus:border-teal-500"
                    />
                  ) : (
                    <span 
                      className={`font-medium text-lg ${
                        todo.is_completed ? 'text-slate-500 line-through' : 'text-slate-800'
                      }`}
                      onClick={() => todo.description && toggleTodo(todo.id)}
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2 ml-3">
                  {editingId === todo.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="text-sm text-white bg-teal-500 hover:bg-teal-600 px-3 py-1 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(todo)}
                        className="text-slate-500 hover:text-teal-600 transition-colors"
                        title="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-slate-500 hover:text-rose-600 transition-colors"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {todo.description && editingId !== todo.id && (
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="text-slate-500 hover:text-teal-600 transition-colors"
                      title={expandedTodo === todo.id ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          expandedTodo === todo.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {editingId === todo.id ? (
                <div className="px-5 pb-5">
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    rows="3"
                    placeholder="Add description..."
                  />
                </div>
              ) : (
                todo.description && expandedTodo === todo.id && (
                  <div className={`px-5 pb-5 pt-3 text-slate-600 text-base border-t ${
                    todo.is_completed ? 'bg-green-50/50 border-green-200' : 'bg-teal-50/50 border-teal-100/50'
                  }`}>
                    {todo.description}
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        {todos.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-600 mb-2">No tasks yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Get started by adding your first task using the form above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}