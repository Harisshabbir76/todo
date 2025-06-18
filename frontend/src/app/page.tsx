import AddForm from '../components/add-form';
import Fetch from '../components/fetch';

export default function Home() {
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <AddForm />
      <Fetch />
    </div>
  );
}