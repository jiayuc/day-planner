import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">目标列表</h1>
      {/* 目标列表内容 */}
      <Link to="/timer" className="text-blue-500 underline">去计时</Link>
    </div>
  );
};

export default HomePage;
