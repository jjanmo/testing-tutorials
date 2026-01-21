import Link from 'next/link';

const Home = () => {
  return (
    <div className="flex flex-col items-center h-screen bg-amber-50 py-40">
      <h1 className="text-3xl font-bold mb-10">Testing Tutorial</h1>
      <Link href="/level-1" className="text-blue-500 hover:text-blue-700">
        Level 1
      </Link>
    </div>
  );
};

export default Home;
