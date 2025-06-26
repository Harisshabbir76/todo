'use client';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Loader2, Check, ChevronDown, Edit, Trash2 } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
}

interface EditForm {
  title: string;
  description: string;
}

const Fetch = forwardRef((props, ref) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState('');
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const BASE_URL = 'https://todo-production-c2c6.up.railway.app';

  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: await response.text() || `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.error || 'Request failed');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format: Expected JSON');
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error (${url}):`, err);
      throw err instanceof Error ? err : new Error('Unknown error occurred');
    }
  };

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const data = await safeFetch(`${BASE_URL}/all/todos?userId=${userId || ''}`);
      setTodos(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchTodos
  }));

  useEffect(() => {
    fetchTodos();
  }, []);

  const toggleTodo = (id: string) => {
    setExpandedTodo(expandedTodo === id ? null : id);
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditForm({ 
      title: todo.title, 
      description: todo.description || '' 
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '' });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id: string) => {
    if (!editForm.title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setIsMutating(true);
    try {
      await safeFetch(`${BASE_URL}/edit-todo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      await fetchTodos();
      setEditingId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setIsMutating(false);
    }
  };

  const deleteTodo = async (id: string) => {
    setIsMutating(true);
    try {
      await safeFetch(`${BASE_URL}/delete-todo/${id}`, {
        method: 'DELETE',
      });
      await fetchTodos();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    } finally {
      setIsMutating(false);
    }
  };

  const toggleCompletion = async (id: string, currentStatus: boolean) => {
    setIsMutating(true);
    try {
      await safeFetch(`${BASE_URL}/toggle-todo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });
      await fetchTodos();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="min-h-[60vh] bg-white py-4 lg:py-6 px-2 lg:px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-6 text-center">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Tasks
          </span>
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 lg:p-4 rounded-xl mb-4 lg:mb-6 text-center border border-red-100 flex justify-between items-center">
            <span className="text-sm lg:text-base">{error}</span>
            <button 
              onClick={() => setError('')} 
              className="ml-2 text-red-800 hover:text-red-900"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8 lg:py-12">
            <Loader2 className="animate-spin h-10 w-10 lg:h-12 lg:w-12 text-indigo-600" />
          </div>
        ) : (
          <>
            <div className="space-y-3 lg:space-y-4">
              {todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 border ${
                    todo.is_completed 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'border-gray-200 hover:border-indigo-300'
                  } ${todo.description ? 'cursor-pointer hover:shadow-md' : ''}`}
                >
                  <div className="flex items-center p-3 lg:p-5">
                    <button
                      onClick={() => toggleCompletion(todo.id, todo.is_completed)}
                      className="mr-2 lg:mr-3 flex-shrink-0"
                      disabled={isMutating}
                      aria-label={todo.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        todo.is_completed 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-gray-300 hover:border-blue-500'
                      }`}>
                        {todo.is_completed && (
                          <Check className="w-2 h-2 lg:w-3 lg:h-3" strokeWidth={3} />
                        )}
                      </div>
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="w-full px-2 lg:px-3 py-1 lg:py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 text-sm lg:text-base"
                          autoFocus
                          disabled={isMutating}
                        />
                      ) : (
                        <span 
                          className={`font-medium text-base lg:text-lg truncate ${
                            todo.is_completed ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}
                          onClick={() => todo.description && toggleTodo(todo.id)}
                        >
                          {todo.title}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-1 lg:space-x-2 ml-2 lg:ml-3">
                      {editingId === todo.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(todo.id)}
                            disabled={isMutating}
                            className="text-xs lg:text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-2 lg:px-3 py-1 rounded-lg transition-colors flex items-center"
                          >
                            {isMutating ? <Loader2 className="animate-spin mr-1 h-3 w-3 lg:h-4 lg:w-4" /> : null}
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isMutating}
                            className="text-xs lg:text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 lg:px-3 py-1 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(todo)}
                            disabled={isMutating}
                            className="text-gray-500 hover:text-indigo-600 transition-colors"
                            title="Edit task"
                          >
                            <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            disabled={isMutating}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                          </button>
                        </>
                      )}
                      
                      {todo.description && editingId !== todo.id && (
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          disabled={isMutating}
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                          title={expandedTodo === todo.id ? 'Collapse' : 'Expand'}
                        >
                          <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 transform transition-transform ${
                            expandedTodo === todo.id ? 'rotate-180' : ''
                          }`} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {editingId === todo.id ? (
                    <div className="px-3 lg:px-5 pb-3 lg:pb-5">
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        className="w-full px-2 lg:px-3 py-1 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm lg:text-base"
                        rows={3}
                        placeholder="Add description..."
                        disabled={isMutating}
                      />
                    </div>
                  ) : (
                    todo.description && expandedTodo === todo.id && (
                      <div className={`px-3 lg:px-5 pb-3 lg:pb-5 pt-2 lg:pt-3 text-gray-600 text-sm lg:text-base border-t ${
                        todo.is_completed ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-100'
                      }`}>
                        {todo.description}
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>

            {todos.length === 0 && !isLoading && (
              <div className="text-center py-8 lg:py-12">
                <div className="mx-auto w-20 h-20 lg:w-24 lg:h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-3 lg:mb-4">
                  <svg className="w-10 h-10 lg:w-12 lg:h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-medium text-gray-600 mb-1 lg:mb-2">No tasks yet</h3>
                <p className="text-gray-500 text-sm lg:text-base max-w-md mx-auto">
                  Get started by adding your first task using the form above
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

Fetch.displayName = 'Fetch';

export default Fetch;