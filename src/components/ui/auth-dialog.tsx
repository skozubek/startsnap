import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

export function AuthDialog({ isOpen, onClose, mode }: AuthDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        setMessage('Sign up successful! You can now log in.');
        console.log('Sign up successful');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        console.log('Login successful');
        onClose();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg border-2 border-gray-800 shadow-[5px_5px_0px_#1f2937] max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 font-['Space_Grotesk',Helvetica]">
          {mode === 'signup' ? 'Create Account' : 'Login'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border-2 border-gray-800 rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border-2 border-gray-800 rounded-lg"
              required
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1f2937] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-startsnap-french-rose text-white rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1f2937] transition-all"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}