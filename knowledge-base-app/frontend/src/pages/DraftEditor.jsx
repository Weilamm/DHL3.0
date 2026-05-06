import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticles, updateArticle, updateArticleStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import { Save, CheckCircle, Send, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const DraftEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [steps, setSteps] = useState([]);
  const [tags, setTags] = useState('');

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
        setSteps(found.steps);
        setTags(found.tags.join(', '));
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
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      const updateData = { title, summary, steps, tags: tagsArray };
      
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

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));

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
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Executive Summary</label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 glass-input rounded-xl shadow-inner leading-relaxed"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Procedural Steps</label>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-dark-700 border border-white/5 text-primary-400 flex items-center justify-center font-bold text-xs shadow-sm mt-1">
                      {index + 1}
                    </div>
                    <textarea
                      rows="2"
                      className="flex-1 px-4 py-2 glass-input rounded-xl text-sm"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                    ></textarea>
                    <button
                      onClick={() => removeStep(index)}
                      className="p-2 mt-1 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition self-start opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addStep}
                className="mt-4 inline-flex items-center text-xs font-bold text-primary-400 hover:text-primary-300 px-3 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors uppercase tracking-wider"
              >
                <Plus size={14} className="mr-1" /> Add Step
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Metadata Tags</label>
            <input
              type="text"
              className="w-full px-4 py-2 glass-input rounded-xl text-sm"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., Security, Setup"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.split(',').map((t, i) => t.trim() && (
                <span key={i} className="px-2.5 py-1 text-xs font-medium bg-dark-700 border border-white/10 text-gray-300 rounded-md">
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>

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
