import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createArticle } from '../api';
import { UploadCloud, FileText, Loader2, Sparkles } from 'lucide-react';

const Upload = () => {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await createArticle(rawText, user.username);
      navigate(`/editor/${response.data.id}`);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Duplicate anomaly detected in data stream.');
      } else {
        setError('Processing failure. Please retry.');
      }
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRawText(`[Extracted payload from ${file.name}]\n\nSystem initialization protocol engaged. Verify operational integrity before proceeding.`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[50%] bg-primary-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Data Ingestion</h1>
        <p className="text-gray-400 mt-2">Provide unstructured data for AI structurization.</p>
      </div>

      <div className="glass-panel rounded-2xl p-8 relative z-10">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Raw Input Stream
            </label>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl opacity-20 blur-sm pointer-events-none"></div>
              <textarea
                rows="8"
                className="w-full px-5 py-4 rounded-xl glass-input relative z-10 text-gray-200 placeholder-gray-600"
                placeholder="Paste raw data block here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={loading}
              ></textarea>
            </div>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-dark-800 text-xs text-gray-500 font-bold tracking-widest uppercase rounded-full border border-white/10">OR</span>
            </div>
          </div>

          <div>
            <label className="flex justify-center w-full h-32 px-4 transition bg-dark-900/50 border-2 border-primary-500/30 border-dashed rounded-xl appearance-none cursor-pointer hover:border-primary-400/60 hover:bg-primary-900/10 focus:outline-none group">
                <span className="flex items-center space-x-3">
                    <UploadCloud className="w-8 h-8 text-primary-500 group-hover:text-primary-400 transition-colors" />
                    <span className="font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                        Drop payload (PDF, DOCX) or <span className="text-secondary-400 border-b border-secondary-400/30 pb-0.5">browse</span>
                    </span>
                </span>
                <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} disabled={loading} />
            </label>
          </div>

          <div className="flex justify-end pt-6 border-t border-white/5 mt-8">
            <button
              type="submit"
              disabled={loading || !rawText.trim()}
              className={`inline-flex items-center px-8 py-3 text-sm font-bold rounded-xl transition-all ${
                loading || !rawText.trim() 
                  ? 'bg-dark-700 text-gray-500 cursor-not-allowed border border-white/5' 
                  : 'neon-button border border-white/10'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-300" />
                  <span className="text-primary-200 animate-pulse">Processing Core...</span>
                </>
              ) : (
                <>
                  <Sparkles className="-ml-1 mr-2 h-5 w-5" />
                  Synthesize Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
