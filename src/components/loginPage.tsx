"use client"
import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, ArrowRight, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { GoogleLoginButton } from "@/components/GoogleLogin";

// Password validation requirements
const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', regex: /.{8,}/ },
  { label: 'One uppercase letter', regex: /[A-Z]/ },
  { label: 'One lowercase letter', regex: /[a-z]/ },
  { label: 'One number', regex: /[0-9]/ },
  { label: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage = () => {
  const { login, signup } = useApp();
  const { showToast } = useToast();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean; name: boolean }>({
    email: false,
    password: false,
    name: false,
  });
  const router = useRouter();

  // Validate email format
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  // Validate password strength
  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (isSignup) {
      if (password.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
      if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
      if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
    } else if (password.length < 1) {
      return 'Password is required';
    }
    return undefined;
  };

  // Validate name (for signup)
  const validateName = (name: string): string | undefined => {
    if (!name) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    return undefined;
  };

  // Handle field blur for validation
  const handleBlur = (field: 'email' | 'password' | 'name') => {
    setTouched(prev => ({ ...prev, [field]: true }));

    if (field === 'email') {
      const error = validateEmail(formData.email);
      setErrors(prev => ({ ...prev, email: error }));
    } else if (field === 'password') {
      const error = validatePassword(formData.password);
      setErrors(prev => ({ ...prev, password: error }));
    } else if (field === 'name') {
      const error = validateName(formData.name);
      setErrors(prev => ({ ...prev, name: error }));
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credential: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      // Save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      showToast(`Welcome ${data.user.name}!`, 'success');

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/adminDashboard');
      } else {
        router.push('/account');
      }
    } catch (error) {
      console.error('Google login error:', error);
      showToast('Google login failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time validation on change
  const handleChange = (field: 'email' | 'password' | 'name', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Check password requirements for display
  const getPasswordRequirementStatus = (regex: RegExp) => {
    return regex.test(formData.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate all fields
    const newErrors: { email?: string; password?: string; name?: string } = {};

    if (isSignup) {
      const nameError = validateName(formData.name);
      if (nameError) newErrors.name = nameError;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      showToast('Please fix the errors above', 'error');
      return;
    }

    try {
      if (isSignup) {
        const success = await signup(formData.name, formData.email, formData.password);
        if (success) {
          showToast("Account created successfully! Redirecting...", "success");
          router.push("/account");
        }
      } else {
        console.log('Attempting login with:', formData.email);
        const loggedInUser = await login(formData.email, formData.password);
        console.log('Logged in user:', loggedInUser);
        if (loggedInUser) {
          showToast("Welcome back!", "success");
          if (loggedInUser.role === 'admin') {
            console.log('Redirecting to adminDashboard');
            router.push('/adminDashboard');
          } else {
            console.log('Redirecting to account page');
            router.push('/account');
          }
        }
      }
    } catch (error) {
      const errorMessage = (error as Error).message || "Authentication failed. Please try again.";
      showToast(errorMessage, "error");
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] -z-10" />

      <div className="max-w-xl w-full">
        <div className="text-center mb-10 space-y-3 animate-in fade-in slide-in-from-top duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-primary mb-4">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Shaikh Jee Luxury</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            {isSignup ? "Start Your Journey" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground text-lg italic">
            {isSignup
              ? "Join the elite beauty community of Shaikh Jee"
              : "Signature beauty experiences await you"}
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 lg:p-12 shadow-2xl shadow-primary/5 border border-primary/10 animate-in fade-in zoom-in duration-500 delay-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-6 py-4 bg-muted border rounded-2xl focus:outline-none focus:bg-white transition-all text-sm ${errors.name && touched.name
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-transparent focus:border-primary'
                    }`}
                  placeholder="e.g. Jane Doe"
                  disabled={isSubmitting}
                />
                {errors.name && touched.name && (
                  <p className="text-sm text-red-500 flex items-center gap-2 mt-1">
                    <AlertCircle size={14} />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-6 py-4 bg-muted border rounded-2xl focus:outline-none focus:bg-white transition-all text-sm ${errors.email && touched.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-transparent focus:border-primary'
                  }`}
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
              {errors.email && touched.email && (
                <p className="text-sm text-red-500 flex items-center gap-2 mt-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-foreground">
                  Password
                </label>
                {!isSignup && (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-primary hover:underline uppercase tracking-tighter"
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-6 py-4 bg-muted border rounded-2xl focus:outline-none focus:bg-white transition-all text-sm ${errors.password && touched.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-transparent focus:border-primary'
                    }`}
                  placeholder="Minimum 8 characters"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-sm text-red-500 flex items-center gap-2 mt-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}

              {/* Password Strength Indicator for Signup */}
              {isSignup && (
                <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Password Requirements</p>
                  <div className="space-y-2">
                    {PASSWORD_REQUIREMENTS.map((req, index) => {
                      const isMet = getPasswordRequirementStatus(req.regex);
                      return (
                        <div key={index} className="flex items-center gap-2">
                          {isMet ? (
                            <Check size={14} className="text-green-500 shrink-0" />
                          ) : (
                            <X size={14} className="text-muted-foreground shrink-0" />
                          )}
                          <span className={`text-xs ${isMet ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {!isSignup && (
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border transition-all checked:bg-primary checked:border-primary"
                  />
                  <svg
                    className="pointer-events-none absolute h-3.5 w-3.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-white opacity-0 peer-checked:opacity-100"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">Keep me signed in</span>
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] group mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {isSignup ? "Register Account" : "Sign In to Shaikh Jee"}
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Google Login */}
          {!isSignup && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="px-6 bg-white text-muted-foreground">
                      Continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={() => showToast('Google login failed', 'error')}
                  />
                </div>
              </div>
            </>
          )}

          <div className="mt-8 text-center pt-8 border-t border-border">
            <p className="text-muted-foreground font-medium">
              {isSignup
                ? "Already part of the community?"
                : "New to Shaikh Jee?"}{" "}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary font-bold hover:underline transition-all"
              >
                {isSignup ? "Sign In Instead" : "Create Account Now"}
              </button>
            </p>
          </div>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="px-6 bg-white text-muted-foreground">
                  Or explore as
                </span>
              </div>
            </div>

            <Link
              href="/shop"
              className="mt-6 w-full py-4 border-2 border-border text-foreground font-bold rounded-full hover:bg-muted transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              Guest Explorer
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-muted-foreground font-bold tracking-widest uppercase leading-relaxed">
          Secure beauty transactions protected by <br />
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          &nbsp;&&nbsp;
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};
