'use client';
import AddForm from '../components/add-form';
import Fetch from '../components/fetch';
import { useRef } from 'react';

export default function Home() {
  const fetchRef = useRef<{ fetchTodos: () => void }>(null);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-8">
         
        <div className="md:w-1/3">
          <AddForm onTaskAdded={() => fetchRef.current?.fetchTodos()} />
        </div>
        
        
        <div className="md:w-2/3">
          <Fetch ref={fetchRef} />
        </div>
      </div>
    </div>
  );
}