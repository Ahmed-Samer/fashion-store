import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, getAppId } from '../firebase';

const Contact = ({ user }) => {
    const appId = getAppId();
    const [msg, setMsg] = useState({ name: '', email: '', phone: '', content: '' });
    const [sent, setSent] = useState(false);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!user) {
          alert("Please login to send a message");
          return;
      }
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), { ...msg, createdAt: new Date().toISOString(), userId: user.uid });
      setSent(true); setMsg({ name: '', email: '', phone: '', content: '' });
    };

    return (
      <div className="max-w-xl mx-auto px-4 py-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-slate-800">Get in Touch <span className="inline-block animate-bounce">👋</span></h2>
        {sent ? (
          <div className="bg-green-50/80 backdrop-blur-md border border-green-200 p-8 rounded-3xl text-center shadow-lg">
            <CheckCircle size={56} className="mx-auto text-green-500 mb-4 drop-shadow-sm" />
            <h3 className="text-2xl font-bold text-green-700 mb-2">Message Received!</h3>
            <button onClick={() => setSent(false)} className="mt-8 px-6 py-2 bg-white text-green-600 rounded-full font-bold shadow-sm hover:shadow-md transition">Send another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.05)] space-y-5 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition duration-500">
            <div><label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Name</label><input required className="w-full bg-white/60 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-700 focus:border-violet-400 outline-none focus:ring-4 focus:ring-violet-100 transition" value={msg.name} onChange={e => setMsg({...msg, name: e.target.value})} placeholder="Your Name" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Email</label><input required type="email" className="w-full bg-white/60 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-700 focus:border-violet-400 outline-none focus:ring-4 focus:ring-violet-100 transition" value={msg.email} onChange={e => setMsg({...msg, email: e.target.value})} placeholder="hello@example.com" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Message</label><textarea required className="w-full bg-white/60 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-700 h-36 resize-none focus:border-violet-400 outline-none focus:ring-4 focus:ring-violet-100 transition" value={msg.content} onChange={e => setMsg({...msg, content: e.target.value})} /></div>
            <button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-1 active:scale-95"><Send size={20} /> Send Message</button>
          </form>
        )}
      </div>
    );
};

export default Contact;