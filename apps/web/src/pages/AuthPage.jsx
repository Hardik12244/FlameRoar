import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuth as useClerkAuth, SignIn, SignUp } from '@clerk/clerk-react';
import { Shield, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapWorldBackground } from '../components/map-ui';

const AuthPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    selectedClass: 'Array Knight',
  });
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const { onboard, needsOnboarding } = useAuth();
  const { isSignedIn } = useClerkAuth();
  const navigate = useNavigate();

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await onboard(formData.username, formData.selectedClass);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  if (!isSignedIn) {
     return (
        <MapWorldBackground className="flex min-h-screen w-full flex-col items-center justify-center p-4 text-map-ink">
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-map-brown/25 bg-gradient-to-b from-map-sand to-map-sand-deep shadow-[var(--shadow-map-soft)]">
                  <Shield className="h-7 w-7 text-map-brown" />
                </div>
                <h1 className="text-3xl font-bold md:text-4xl">FlameRoar <span className="text-2xl">🔥</span></h1>
                <p className="mt-2 font-semibold text-map-brown">DSA learning that feels like an adventure</p>
                <p className="mt-1 text-sm text-map-ink-muted">Progress in the world = progress in skill.</p>
            </div>
            
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/55 bg-white shadow-(--shadow-map-lift) overflow-hidden">
                <div className="bg-map-brown/10 h-1 w-full" />
                <div className="p-4">
                  {showSignUp ? (
                    <SignUp routing="hash" signInUrl="/#signin" appearance={{ elements: { rootBox: "w-full", card: "bg-transparent shadow-none w-full border-none", card__main: "p-0" } }} /> 
                  ) : (
                    <SignIn routing="hash" signUpUrl="/#signup" appearance={{ elements: { rootBox: "w-full", card: "bg-transparent shadow-none w-full border-none", card__main: "p-0" } }} />
                  )}
                </div>
            </div>
            
            <button type="button" onClick={() => setShowSignUp(!showSignUp)} className="mt-6 text-sm font-semibold text-map-brown underline-offset-4 transition hover:underline">
                {showSignUp ? "Already a hero? Sign In" : "New here? Sign Up"}
            </button>
        </MapWorldBackground>
     );
  }

  if (needsOnboarding) {
    return (
        <MapWorldBackground className="flex min-h-screen w-full items-center justify-center p-4 text-map-ink">
          <div className="glass-panel relative w-full max-w-md overflow-hidden p-8">
            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-full -translate-x-1/2 rounded-full bg-map-water/25 blur-3xl mix-blend-multiply" />

            <div className="relative z-10 mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-map-brown/25 bg-white/70">
                <Shield className="h-8 w-8 text-map-brown" />
              </div>
              <h1 className="text-3xl font-bold">Forge your legend</h1>
              <p className="mt-1 text-sm text-map-ink-muted">Identity verified — choose how you appear in the world.</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="relative z-10 space-y-5">
              <div>
                  <label className="mb-1 block text-sm font-medium text-map-ink-muted">Hero name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-map-ink-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Async Ninja"
                      className="input-field pl-10"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
              </div>

              <div>
                  <label className="mb-1 block text-sm font-medium text-map-ink-muted">Starting class</label>
                  <select 
                    className="input-field cursor-pointer appearance-none"
                    value={formData.selectedClass}
                    onChange={(e) => setFormData({...formData, selectedClass: e.target.value})}
                  >
                    <option value="Array Knight">🛡️ Array Knight</option>
                    <option value="Recursion Mage">🪄 Recursion Mage</option>
                    <option value="Graph Assassin">🗡️ Graph Assassin</option>
                    <option value="Pointer Paladin">⚔️ Pointer Paladin</option>
                  </select>
              </div>

              <button type="submit" className="btn-primary mt-2 w-full">
                Initialize profile
              </button>
            </form>
          </div>
        </MapWorldBackground>
      );
  }

  return (
    <MapWorldBackground className="flex h-screen w-screen items-center justify-center text-map-ink-muted">
      Authenticating…
    </MapWorldBackground>
  );
};

export default AuthPage;
