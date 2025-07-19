'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AddFormProps {
  onTaskAdded?: () => void;
}

export default function AddForm({ onTaskAdded = () => {} }: AddFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://16.171.197.202:5000/add-todo', {
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
      if (error instanceof Error && error.message.includes('Unauthorized')) {
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
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 border border-gray-200 hover:shadow-md transition-shadow">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-5 text-center">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Add New Task
        </span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-2">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
            className="w-full px-3 lg:px-4 py-2 lg:py-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details..."
            rows={4}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 lg:py-3 px-4 rounded-lg text-white font-medium text-base lg:text-lg shadow-md transition-all flex items-center justify-center ${
            isSubmitting 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4 lg:h-5 lg:w-5" />
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