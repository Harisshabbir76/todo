'use client';
import AddForm from '../components/add-form';
import Fetch from '../components/fetch';
import { useRef } from 'react';

export default function Home() {
  const fetchRef = useRef<{ fetchTodos: () => void }>(null);

  return (
    <>
      
      <div className="container mx-auto px-4 pt-20 pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Add Form */}
          <div className="lg:w-1/3 lg:sticky lg:top-24 lg:h-fit">
            <AddForm onTaskAdded={() => fetchRef.current?.fetchTodos()} />
          </div>
          
          {/* Right Column - Task List */}
          <div className="lg:w-2/3">
            <Fetch ref={fetchRef} />
          </div>
        </div>
      </div>
    </>
  );
}