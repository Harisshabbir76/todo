'use client';
import AddForm from '../components/add-form';
import Fetch from '../components/fetch';
import { useRef } from 'react';

export default function Home() {
  const fetchRef = useRef<{ fetchTodos: () => void }>(null);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <AddForm onTaskAdded={() => fetchRef.current?.fetchTodos()} />
      <Fetch ref={fetchRef} />
    </div>
  );
}