/**
 * src/components/ui/auth-form.tsx
 * @description Form component for handling authentication with validation
 */

import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

interface ValidationErrors {
  email: string;
  password: string;
}

/**
 * @description Form component with validation for login and signup
 * @param {AuthFormProps} props - Component props
 * @returns {JSX.Element} Authentication form with validation
 */
export const AuthForm = ({ mode, onSubmit, isLoading }: AuthFormProps): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({
    email: '',
    password: ''
  });

  /**
   * @description Validates email format using regex
   * @param {string} email - Email to validate
   * @returns {boolean} Whether the email is valid
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * @description Validates form fields and returns whether the form is valid
   * @returns {boolean} Whether all form fields are valid
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      email: '',
      password: ''
    };

    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (mode === 'signup' && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * @description Handles form submission with validation
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
          }}
          placeholder="Email"
          className={`w-full p-3 border-2 ${
            errors.email ? 'border-red-500' : 'border-gray-800'
          } rounded-lg font-['Roboto',Helvetica]`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
          }}
          placeholder="Password"
          className={`w-full p-3 border-2 ${
            errors.password ? 'border-red-500' : 'border-gray-800'
          } rounded-lg font-['Roboto',Helvetica]`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
      >
        {isLoading ? 'Loading...' : mode === 'login' ? 'Log In' : 'Sign Up'}
      </Button>
    </form>
  );
};