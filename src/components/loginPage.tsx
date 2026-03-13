"use client"
import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/useToast";

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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const success = await signup(formData.name, formData.email, formData.password);
        if (success) {
          showToast("Account created successfully! Redirecting...", "success");
          router.push("/account"); // Redirect all new signups to the account page
        }
      } else {
        const loggedInUser = await login(formData.email, formData.password);
        if (loggedInUser) {
          showToast("Welcome back!", "success");
          if (loggedInUser.role === 'admin') {
            router.push('/adminDashboard');
          } else {
            router.push('/account');
          }
        }
      }
    } catch (error) {
      showToast((error as Error).message || "Authentication failed. Please try again.", "error");
      console.error("Authentication error:", error);
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all text-sm"
                  placeholder="e.g. Jane Doe"
                />
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-foreground">
                    Password
                </label>
                {!isSignup && (
                    <button
                        type="button"
                        className="text-xs font-bold text-primary hover:underline uppercase tracking-tighter"
                    >
                        Forgot?
                    </button>
                )}
              </div>
              <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                    setFormData({
                        ...formData,
                        password: e.target.value,
                    })
                    }
                    className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all text-sm"
                    placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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
              className="w-full py-5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] group mt-4"
            >
              {isSignup ? "Register Account" : "Sign In to Shaikh Jee"}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

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
