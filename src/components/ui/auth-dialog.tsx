import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

export function AuthDialog({ 
  isOpen, 
  onClose, 
  mode: initialMode 
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMode, setCurrentMode] = useState(initialMode);

  // Reset to initial mode whenever dialog is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
      // Reset form state
      setEmail("");
      setPassword("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen, initialMode]);

  const handleToggleMode = () => {
    setCurrentMode(currentMode === "login" ? "signup" : "login");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (currentMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border-[3px] border-gray-800">
        <h2 className="text-4xl font-bold text-startsnap-ebony-clay mb-8 font-['Space_Grotesk',Helvetica]">
          {currentMode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica]"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] w-40"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] w-40"
            >
              {loading ? "Processing..." : currentMode === "signup" ? "Sign Up" : "Log In"}
            </Button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-startsnap-french-rose hover:underline focus:outline-none"
            >
              {currentMode === "signup"
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}