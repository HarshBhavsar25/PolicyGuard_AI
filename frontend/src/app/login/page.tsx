"use client";

import { useActionState } from 'react';
import { login } from './actions';
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950 p-4">
            <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center mb-5 border border-zinc-800 shadow-inner">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">PolicyGuard AI</h1>
                    <p className="text-sm text-zinc-400 mt-2 text-center max-w-[250px]">
                        Please sign in with your admin credentials to access the dashboard.
                    </p>
                </div>

                <form action={formAction} className="space-y-5 relative z-10">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300" htmlFor="username">
                            Username
                        </label>
                        <input
                            required
                            id="username"
                            name="username"
                            type="text"
                            placeholder="e.g. Admin2425"
                            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-600 shadow-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300" htmlFor="password">
                            Password
                        </label>
                        <input
                            required
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-600 shadow-sm"
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <p className="text-sm text-red-400 font-medium">{state.error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-medium rounded-lg px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm flex items-center justify-center"
                    >
                        {isPending ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
