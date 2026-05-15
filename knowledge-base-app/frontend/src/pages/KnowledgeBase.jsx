import React, { useState, useEffect, useMemo } from 'react';
import { getArticles } from '../api';
import { Search, Filter, Database, ChevronRight, User, Calendar, Trash2, Tag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deleteArticle } from '../api';
import { useAuth } from '../context/AuthContext';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(isViewer ? 'published' : 'all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await getArticles();
      setArticles(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteArticle(id);
        fetchArticles();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('WARNING: This will permanently delete ALL archived records. Proceed?')) {
      try {
        await Promise.all(articles.map(a => deleteArticle(a.id)));
        fetchArticles();
      } catch (err) {
        console.error('Clear all failed:', err);
      }
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (article.summary && article.summary.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
      const matchesCreator = creatorFilter === 'all' || (article.creator || 'System') === creatorFilter;
      const matchesTag = tagFilter === 'all' || (article.tags && article.tags.includes(tagFilter));
      const matchesDate = !dateFilter || new Date(article.createdAt).toISOString().split('T')[0] === dateFilter;
      
      return matchesSearch && matchesStatus && matchesCreator && matchesTag && matchesDate;
    });
  }, [articles, searchTerm, statusFilter, creatorFilter, tagFilter, dateFilter]);

  const uniqueCreators = useMemo(() => {
    const creators = new Set(articles.map(a => a.creator || 'System'));
    return Array.from(creators);
  }, [articles]);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    articles.forEach(a => {
      if (a.tags) a.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags);
  }, [articles]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Knowledge Archive</h1>
          <p className="text-gray-400 mt-2 text-sm">Query and manage processed structural data.</p>
        </div>
        <div className="flex gap-3">
          {!isViewer && (
            <button 
              onClick={handleClearAll}
              className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
            >
              Clear Archive
            </button>
          )}
          {!isViewer && (
            <Link 
              to="/upload"
              className="neon-button px-6 py-2.5 rounded-xl text-sm font-bold flex items-center"
            >
              <span className="text-lg mr-2 leading-none">+</span> New Ingestion
            </Link>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 relative">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row flex-wrap gap-4 bg-dark-900/50 backdrop-blur-md">
          <div className="relative flex-1 min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-primary-500" />
            </div>
            <input
              type="text"
              placeholder="Search designations or metadata..."
              className="pl-11 w-full px-4 py-2.5 glass-input rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 flex-wrap flex-1 min-w-[300px]">
            <div className="relative flex-1 min-w-[140px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter size={18} className="text-secondary-500" />
              </div>
              <select
                className="pl-11 pr-8 py-2.5 glass-input rounded-xl text-sm appearance-none w-full cursor-pointer text-gray-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={isViewer}
              >
                <option value="all" className="bg-dark-900">All Status</option>
                <option value="draft" className="bg-dark-900">Draft Status</option>
                <option value="reviewed" className="bg-dark-900">Reviewed Status</option>
                <option value="published" className="bg-dark-900">Published Status</option>
              </select>
            </div>
            <div className="relative flex-1 min-w-[140px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-primary-400" />
              </div>
              <select
                className="pl-11 pr-8 py-2.5 glass-input rounded-xl text-sm appearance-none w-full cursor-pointer text-gray-200"
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
              >
                <option value="all" className="bg-dark-900">All Creators</option>
                {uniqueCreators.map(c => (
                  <option key={c} value={c} className="bg-dark-900">{c}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 min-w-[140px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Tag size={18} className="text-orange-400" />
              </div>
              <select
                className="pl-11 pr-8 py-2.5 glass-input rounded-xl text-sm appearance-none w-full cursor-pointer text-gray-200"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="all" className="bg-dark-900">All Tags</option>
                {uniqueTags.map(t => (
                  <option key={t} value={t} className="bg-dark-900">{t}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 min-w-[140px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar size={18} className="text-emerald-400" />
              </div>
              <input
                type="date"
                className="pl-11 pr-4 py-2.5 glass-input rounded-xl text-sm w-full text-gray-200 [color-scheme:dark]"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-500">
            <Database size={48} className="mb-4 text-primary-500/50 animate-pulse" />
            <p className="animate-pulse tracking-widest text-sm uppercase">Querying Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Designation</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-gray-500">
                      <Database size={48} className="mx-auto text-white/10 mb-4" />
                      <p className="tracking-wider uppercase text-sm">0 Records Found</p>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map(article => (
                    <tr key={article.id} className="hover:bg-white/5 transition-colors group cursor-default">
                      <td className="p-5">
                        <div className="font-semibold text-gray-200 group-hover:text-primary-400 transition-colors">{article.title}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {article.tags && article.tags.map(t => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10 uppercase font-bold tracking-tighter">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500 truncate w-72 mt-2">{article.summary}</div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex px-3 py-1 text-[10px] font-bold rounded border tracking-widest uppercase ${
                          article.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          article.status === 'reviewed' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-gray-500 font-mono text-xs">
                        {new Date(article.createdAt).toISOString().split('T')[0]}
                      </td>
                      <td className="p-5 text-right flex items-center justify-end gap-2">
                        <Link 
                          to={`/editor/${article.id}`}
                          className="inline-flex items-center text-primary-400 hover:text-primary-300 font-bold text-xs uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-primary-500/10 transition"
                        >
                          {isViewer ? 'View' : 'Access'} <ChevronRight size={14} className="ml-1" />
                        </Link>
                        {!isViewer && (
                        <button 
                          onClick={() => handleDelete(article.id, article.title)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
