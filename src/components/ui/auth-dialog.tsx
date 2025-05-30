import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { supabase } from '../../lib/supabase';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>(mode);

  const handleAuth = async (authType: 'signup' | 'login') => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;

      if (authType === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        
        // If sign-up was successful, check if profile was created
        if (result.data?.user) {
          console.log('User created:', result.data.user);
          
          // Wait a moment for the trigger to execute
          setTimeout(async () => {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', result.data.user.id)
              .single();
            
            if (profileError) {
              console.error('Error fetching profile after signup:', profileError);
              alert('User created but profile creation may have failed. Please contact support.');
            } else {
              console.log('Profile automatically created:', profile);
              alert('Sign-up successful and profile created!');
            }
          }, 1000); // Give the database trigger a second to process
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (authType === 'login') {
        console.log('Login successful!');
      }
      
      onClose();
    } catch (error) {
      console.error(`Error during ${authType}:`, error);
      setError(error.message || `Failed to ${authType}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'signup' | 'login');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8 text-center">
            {activeTab === 'signup' ? 'Join StartSnap' : 'Welcome Back'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={mode} value={activeTab} onValueChange={handleTabChange} className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="login" className="font-['Roboto',Helvetica] font-medium">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="font-['Roboto',Helvetica] font-medium">
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <form onSubmit={(e) => { e.preventDefault(); handleAuth('login'); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
                    Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="startsnap-button w-full bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <form onSubmit={(e) => { e.preventDefault(); handleAuth('signup'); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
                    Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button 
                  type="submit"
                  disabled={loading}
                  className="startsnap-button w-full bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};