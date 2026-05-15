import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../api';
import { KeyRound, User, Hexagon } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLogin(username, password);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Try admin/admin or viewer/viewer.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-gray-100">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary-600/20 blur-[150px] rounded-full animate-pulse mix-blend-screen"></div>
        <div className="absolute bottom-[0%] -right-[10%] w-[60%] h-[60%] bg-secondary-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="max-w-md w-full space-y-8 glass-panel p-10 rounded-2xl relative z-10 border border-white/10 animate-fade-in-up">
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center w-16 h-16 mb-4">
            <Hexagon size={64} className="text-primary-500 absolute animate-glow-pulse" strokeWidth={1} />
            <div className="w-3 h-3 bg-secondary-400 rounded-full z-10 shadow-[0_0_15px_#06b6d4]"></div>
          </div>
          <h2 className="mt-2 text-center text-4xl font-extrabold tracking-tight text-white">
            DHL <span className="neon-text">Logistics</span>
          </h2>
          <p className="mt-3 text-center text-sm text-gray-400">
            Secure access to the knowledge core
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-4 pl-12 glass-input placeholder-gray-500 text-sm"
                placeholder="Operator ID (Username)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-4 pl-12 glass-input placeholder-gray-500 text-sm"
                placeholder="Access Code (Password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white neon-button"
            >
              Login
            </button>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-4 tracking-widest uppercase">
            System Demo: admin / admin OR viewer / viewer
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
