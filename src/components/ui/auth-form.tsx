/**
 * src/components/ui/auth-form.tsx
 * @description Authentication form component for handling login and signup
 */

import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { supabase } from '../../lib/supabase';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * @description Form component for handling user authentication
 * @param {AuthFormProps} props - Component props
 * @returns {JSX.Element} Authentication form with validation and error handling
 */
export const AuthForm = ({ mode, onSuccess }: AuthFormProps): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setErrors({ general: 'An account with this email already exists. Please log in instead.' });
          } else {
            setErrors({ general: error.message });
          }
          return;
        }

        onSuccess();
        alert('Please check your email to verify your account!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login')) {
            setErrors({ general: 'Invalid email or password' });
          } else {
            setErrors({ general: error.message });
          }
          return;
        }

        onSuccess();
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
          {errors.general}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`border-2 ${errors.email ? 'border-red-500' : 'border-gray-800'}`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={`border-2 ${errors.password ? 'border-red-500' : 'border-gray-800'}`}
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
      </Button>
    </form>
  );
};