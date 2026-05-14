import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticles, updateArticle, updateArticleStatus, deleteArticle } from '../api';
import { useAuth } from '../context/AuthContext';
import { Save, CheckCircle, Send, ArrowLeft, Plus, Trash2, Clock, Paperclip, Terminal } from 'lucide-react';

const DraftEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await getArticles();
      const found = response.data.find(a => a.id === id);
      if (found) {
        setArticle(found);
        setTitle(found.title);
        setSummary(found.summary);
        setTags(found.tags || []);
        setSteps(found.steps || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSave = async (newStatus = null) => {
    setSaving(true);
    try {
      const updateData = { title, summary, tags, steps };
      
      await updateArticle(id, updateData);
      
      if (newStatus && newStatus !== article.status) {
        await updateArticleStatus(id, newStatus);
        setArticle({ ...article, ...updateData, status: newStatus });
      } else {
        setArticle({ ...article, ...updateData });
      }
      
      if (newStatus === 'published') {
        navigate('/knowledge-base');
      }
    } catch (err) {
      console.error('Failed to save', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this record?')) {
      try {
        await deleteArticle(id);
        navigate('/knowledge-base');
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };


  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Establishing connection...</div>;
  if (!article) return <div className="text-center py-20 text-red-400">Record not found in the database.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Editor Console</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border tracking-widest uppercase ${
                article.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                article.status === 'reviewed' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}>
                {article.status}
              </span>
              <span className="text-xs text-gray-500 font-mono">v{article.version}.0</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
            <button
            onClick={() => handleSave(article.status)}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <Save size={16} className="mr-2 text-gray-400" />
            Save Draft
          </button>
          
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 transition-colors"
          >
            <Trash2 size={16} className="mr-2" />
            Delete Record
          </button>
          
          {(user.role === 'Admin' || user.role === 'Editor' || user.role === 'Reviewer') && article.status === 'draft' && (
            <button
              onClick={() => handleSave('reviewed')}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-purple-500/50 text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white bg-purple-600/20 hover:bg-purple-600/40 transition-all"
            >
              <CheckCircle size={16} className="mr-2 text-purple-400" />
              Mark Reviewed
            </button>
          )}

          {(user.role === 'Admin' || user.role === 'Editor') && article.status !== 'published' && (
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-emerald-500/50 text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] text-white bg-emerald-600/20 hover:bg-emerald-600/40 transition-all"
            >
              <Send size={16} className="mr-2 text-emerald-400" />
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-8 space-y-6 relative overflow-hidden">
             {/* Decorative subtle gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Designation / Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 glass-input rounded-xl text-lg font-medium shadow-inner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Extracted Message</label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 glass-input rounded-xl shadow-inner leading-relaxed"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider flex justify-between">
                <span>Procedural Steps</span>
                <button 
                  onClick={() => setSteps([...steps, ''])}
                  className="text-primary-400 hover:text-primary-300 flex items-center text-[10px]"
                >
                  <Plus size={12} className="mr-1" /> Add Step
                </button>
              </label>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/10 text-primary-400 text-[10px] flex items-center justify-center font-bold border border-primary-500/20">
                      {index + 1}
                    </span>
                    <input
                      className="flex-1 glass-input px-3 py-1.5 rounded-lg text-sm"
                      value={step}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index] = e.target.value;
                        setSteps(newSteps);
                      }}
                    />
                    <button 
                      onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider flex items-center">
              <Tag size={14} className="mr-2 text-orange-400" /> Categorization Tags
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-md text-[10px] font-bold flex items-center">
                  {tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1.5 hover:text-red-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 glass-input px-3 py-1.5 rounded-lg text-xs" 
                placeholder="New tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag) {
                    setTags([...new Set([...tags, newTag])]);
                    setNewTag('');
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (newTag) {
                    setTags([...new Set([...tags, newTag])]);
                    setNewTag('');
                  }
                }}
                className="p-1.5 bg-primary-600 rounded-lg text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          {article.sourceFile && (
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider flex items-center">
                <Paperclip size={14} className="mr-2" /> Source Attachment
              </h3>
              <div className="flex items-center p-3 bg-dark-800/50 border border-white/5 rounded-lg">
                <span className="text-sm text-primary-400 font-medium truncate">{article.sourceFile}</span>
              </div>
            </div>
          )}

          {article.rpaMetadata && (
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider flex items-center">
                <Terminal size={14} className="mr-2 text-primary-400" /> RPA Metadata
              </h3>
              <div className="space-y-3">
                {Object.entries(article.rpaMetadata).map(([key, value]) => (
                  <div className="flex flex-col" key={key}>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium text-gray-300 break-all">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider flex items-center">
              <Clock size={14} className="mr-2" /> Revision Log
            </h3>
            <div className="relative border-l border-white/10 ml-2 space-y-6 pb-2">
              {article.history.map((h, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute w-2.5 h-2.5 bg-primary-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
                  <div className="text-xs font-bold text-gray-300">v{h.version}.0 <span className="text-gray-500 font-normal ml-2">{new Date(h.updatedAt).toLocaleDateString()}</span></div>
                  <div className="text-sm text-gray-400 mt-1">{h.changes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftEditor;
