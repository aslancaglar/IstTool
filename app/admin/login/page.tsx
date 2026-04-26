"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';
import { Lock } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAdminAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(username, password);

            if (success) {
                router.push('/admin');
            } else {
                setError('Nom d\'utilisateur ou mot de passe invalide. Assurez-vous d\'avoir exécuté seed:createAdminUser.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Erreur de connexion. Veuillez vérifier que Convex est en cours d\'exécution.');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-slate-900 p-4 rounded-full">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
                    Connexion Admin
                </h1>
                <p className="text-center text-slate-600 mb-4">
                    Entrez vos identifiants pour accéder au tableau de bord
                </p>

                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-6">
                    <p className="font-semibold mb-1">Première configuration ?</p>
                    <p>Exécutez <code className="bg-blue-100 px-1 rounded">seed:createAdminUser</code> dans le tableau de bord Convex, puis utilisez :</p>
                    <p className="mt-1">Nom d'utilisateur : <strong>admin</strong> | Mot de passe : <strong>admin123</strong></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                            Nom d'utilisateur
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition"
                            placeholder="Entrez votre nom d'utilisateur"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition"
                            placeholder="Entrez votre mot de passe"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}
