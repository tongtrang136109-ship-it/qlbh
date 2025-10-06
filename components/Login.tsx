
import React, { useState } from 'react';
import { WrenchScrewdriverIcon } from './common/Icons';

interface LoginProps {
    onLogin: (username: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(username, password);
        if (!success) {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4 font-sans">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-8">
                <div className="flex flex-col items-center">
                    <div className="bg-sky-600 p-3 rounded-full mb-4">
                       <WrenchScrewdriverIcon className="w-8 h-8 text-white"/>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">MotoCare Pro</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Đăng nhập vào tài khoản của bạn</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số điện thoại đăng nhập</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-200"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                         <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-200"
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                    >
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;