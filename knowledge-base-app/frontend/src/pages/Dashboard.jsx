import React, { useEffect, useState } from 'react';
import { getArticles } from '../api';
import { BookOpen, FileEdit, CheckCircle, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deleteArticle } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, draft: 0, reviewed: 0, published: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getArticles();
      const articles = response.data;
      
      const draft = articles.filter(a => a.status === 'draft').length;
      const reviewed = articles.filter(a => a.status === 'reviewed').length;
      const published = articles.filter(a => a.status === 'published').length;
      
      setStats({ total: articles.length, draft, reviewed, published });
      setRecent(articles.slice(-5).reverse());
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteArticle(id);
        fetchData();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const StatCard = ({ title, value, icon, gradient, shadow }) => (
    <div className={`glass-panel p-6 rounded-2xl flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-white to-transparent mix-blend-overlay"></div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} ${shadow} text-white relative z-10`}>
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-gray-400 mt-2 text-sm">System metrics and recent knowledge extraction logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Entities" 
          value={stats.total} 
          icon={<BookOpen size={26} />} 
          gradient="from-blue-500 to-blue-700"
          shadow="shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />
        <StatCard 
          title="Drafts" 
          value={stats.draft} 
          icon={<FileEdit size={26} />} 
          gradient="from-yellow-500 to-orange-600"
          shadow="shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        />
        <StatCard 
          title="Reviewed" 
          value={stats.reviewed} 
          icon={<Clock size={26} />} 
          gradient="from-purple-500 to-purple-700"
          shadow="shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        />
        <StatCard 
          title="Published" 
          value={stats.published} 
          icon={<CheckCircle size={26} />} 
          gradient="from-emerald-400 to-emerald-600"
          shadow="shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden mt-8 border border-white/5">
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Extractions</h2>
          <Link to="/knowledge-base" className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center transition-colors">
            View Archive <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No data available in sector.</div>
          ) : (
            recent.map(article => (
              <div key={article.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-base font-semibold text-gray-200 truncate group-hover:text-primary-400 transition-colors">{article.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{article.summary}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`px-3 py-1 text-xs font-bold rounded-md border tracking-wider uppercase ${
                    article.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    article.status === 'reviewed' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {article.status}
                  </span>
                   <Link 
                    to={`/editor/${article.id}`} 
                    className="p-2 rounded-lg bg-dark-700 text-gray-300 hover:text-white hover:bg-primary-600 transition-all shadow-sm"
                    title="Edit Record"
                  >
                    <FileEdit size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-2 rounded-lg bg-dark-700 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all shadow-sm"
                    title="Delete Record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
