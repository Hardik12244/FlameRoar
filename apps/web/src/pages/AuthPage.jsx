import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuth as useClerkAuth, SignIn, SignUp } from '@clerk/clerk-react';
import { Shield, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapWorldBackground } from '../components/map-ui';
import { motion } from 'framer-motion';

const clerkAppearance = {
  layout: {
    applicationName: 'FlameRoar',
    logoImageUrl: '',
    showOptionalFields: false,
    socialButtonsVariant: 'blockButton',
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-transparent shadow-none w-full border-none',
    card__main: 'p-0',
    headerTitle: 'text-map-ink font-bold',
    headerSubtitle: 'text-map-ink-muted',
    formButtonPrimary: 'bg-map-brown hover:bg-map-brown-soft text-white shadow-sm',
    formFieldInput: 'border-map-brown/20 focus:border-map-brown/45 focus:ring-map-water/40 rounded-xl',
    footerActionLink: 'text-map-brown hover:text-map-brown-soft',
    identityPreviewEditButton: 'text-map-brown',
  },
};

const AuthPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    selectedClass: 'Array Knight',
  });
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const { onboard, needsOnboarding, loginAsDemo } = useAuth();
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
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-map-brown/25 bg-gradient-to-b from-map-sand to-map-sand-deep shadow-[var(--shadow-map-soft)]">
                  <Shield className="h-7 w-7 text-map-brown" />
                </div>
                <h1 className="text-3xl font-bold md:text-4xl">FlameRoar <span className="text-2xl">🔥</span></h1>
                <p className="mt-2 font-semibold text-map-brown">DSA learning that feels like an adventure</p>
                <p className="mt-1 text-sm text-map-ink-muted">Progress in the world = progress in skill.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6 w-full max-w-md rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent p-5 text-center shadow-lg backdrop-blur-md"
            >
              <h3 className="font-bold text-map-brown text-sm md:text-base mb-1">Evaluating for a Role or Internship?</h3>
              <p className="text-xs text-map-ink-muted mb-3.5">Skip authentication and jump straight into a pre-leveled hero profile with activity logs, unlocked regions, and live challenges.</p>
              <button
                type="button"
                onClick={() => loginAsDemo()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡ Launch Instant Demo (Guest Mode)</span>
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/55 bg-white shadow-(--shadow-map-lift) overflow-hidden"
            >
                <div className="bg-map-brown/10 h-1 w-full" />
                <div className="p-4">
                  {showSignUp ? (
                    <SignUp 
                      routing="hash" 
                      signInUrl="/#signin" 
                      appearance={clerkAppearance} 
                      localization={{
                        signUp: {
                          start: {
                            title: 'Create your Hero',
                            subtitle: 'Join FlameRoar and start your adventure'
                          }
                        }
                      }}
                    /> 
                  ) : (
                    <SignIn 
                      routing="hash" 
                      signUpUrl="/#signup" 
                      appearance={clerkAppearance} 
                      localization={{
                        signIn: {
                          start: {
                            title: 'Sign in to FlameRoar',
                            subtitle: 'Continue your adventure'
                          }
                        }
                      }}
                    />
                  )}
                </div>
            </motion.div>
            
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              type="button" 
              onClick={() => setShowSignUp(!showSignUp)} 
              className="mt-6 text-sm font-semibold text-map-brown underline-offset-4 transition hover:underline"
            >
                {showSignUp ? "Already a hero? Sign In" : "New here? Sign Up"}
            </motion.button>
        </MapWorldBackground>
     );
  }



  if (needsOnboarding) {
    return (
        <MapWorldBackground className="flex min-h-screen w-full items-center justify-center p-4 text-map-ink">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel relative w-full max-w-md overflow-hidden p-8"
          >
            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-full -translate-x-1/2 rounded-full bg-map-water/25 blur-3xl mix-blend-multiply" />

            <div className="relative z-10 mb-8 text-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-map-brown/25 bg-white/70"
              >
                <Shield className="h-8 w-8 text-map-brown" />
              </motion.div>
              <h1 className="text-3xl font-bold">Forge your legend</h1>
              <p className="mt-1 text-sm text-map-ink-muted">Identity verified — choose how you appear in the world.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleOnboardSubmit} className="relative z-10 space-y-5">
              <div>
                  <label className="mb-1 block text-sm font-medium text-map-ink-muted">Hero name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-map-ink-muted" />
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={20}
                      placeholder="e.g. Async Ninja"
                      className="input-field pl-10"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  <p className="mt-1 text-xs text-map-ink-muted/60">3-20 characters, this is your in-game identity.</p>
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

              <motion.button 
                type="submit" 
                className="btn-primary mt-2 w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Initialize profile
              </motion.button>
            </form>
          </motion.div>
        </MapWorldBackground>
      );
  }

  return (
    <MapWorldBackground className="flex h-screen w-screen flex-col items-center justify-center gap-4 text-map-ink-muted">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="h-8 w-8 rounded-full border-2 border-map-brown/20 border-t-map-brown"
      />
      <p className="text-sm font-medium">Authenticating…</p>
    </MapWorldBackground>
  );
};

export default AuthPage;

