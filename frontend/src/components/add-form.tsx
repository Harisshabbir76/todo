'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AddForm({ onTaskAdded = () => {} }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/add-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }

      setTitle('');
      setDescription('');
      onTaskAdded();
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        router.push('/login');
      }
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-slate-200 hover:shadow-md transition-shadow">
      <h2 className="text-2xl font-bold text-slate-800 mb-5 text-center">
        <span className="bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent">
          Add New Task
        </span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-2">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
            className="w-full px-4 py-3 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details..."
            rows={4}
            className="w-full px-4 py-3 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg shadow-md transition-all flex items-center justify-center ${
            isSubmitting 
              ? 'bg-teal-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Adding...
            </>
          ) : (
            'Add Task'
          )}
        </button>
      </form>
    </div>
  );
}