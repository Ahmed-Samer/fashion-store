import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ setIsAdmin }) => {
    const [pin, setPin] = useState('');
    const navigate = useNavigate();

    // هنا بنجيب الباسورد من الملف السري
    const SECRET_PIN = import.meta.env.VITE_ADMIN_PIN;

    const login = (e) => { 
        e.preventDefault(); 
        // المقارنة بقت مع المتغير السري
        if(pin === SECRET_PIN) { 
            setIsAdmin(true); 
            navigate('/admin'); 
        } else {
            alert("Wrong PIN!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <form onSubmit={login} className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] w-full max-w-md border border-white/60 shadow-2xl text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-800">Admin Access</h2>
                <input 
                    type="password" 
                    value={pin} 
                    onChange={e => setPin(e.target.value)} 
                    className="w-full p-3 md:p-4 text-center bg-slate-50 border border-slate-200 rounded-2xl mb-6 text-2xl md:text-3xl tracking-[0.5em] font-bold outline-none" 
                    placeholder="••••" 
                    autoFocus
                />
                <button className="w-full bg-violet-600 text-white py-3 md:py-4 rounded-2xl font-bold text-lg hover:bg-violet-700 transition shadow-lg">Login Dashboard</button>
                <button type="button" onClick={() => navigate('/')} className="w-full mt-6 text-slate-400 hover:text-violet-600 text-sm font-bold">Return to Store</button>
            </form>
        </div>
    );
};

export default AdminLogin;