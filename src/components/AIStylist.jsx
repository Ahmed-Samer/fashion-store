import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Sparkles, Send, ShoppingBag } from 'lucide-react';
import { callGeminiAPI } from '../utils/gemini'; // استدعاء دالة الـ AI

const AIStylist = ({ products, addToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'أهلاً يا جميلة! 🌸 أنا الـ Stylist بتاعتك النهاردة. قوليلي عندك مناسبة إيه؟ وممكن كمان تكتبيلي طولك ووزنك عشان أقترحلك المقاس المناسب! 😉✨', suggestedLook: null }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input; setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    
    // تحضير بيانات المنتجات للـ AI
    const prodContext = products.map(p => `{id: "${p.id}", name: "${p.name}", cat: "${p.category}", price: "${p.price}", color: "${p.color || ''}", tags: "${p.tags || ''}"}`).join(',');
    
    const prompt = `
      You are a Personal Stylist for "Modern Style" (Women's Store).
      Inventory: [${prodContext}].
      User Request: "${userMsg}".
      
      GOAL: Create a FULL COORDINATED OUTFIT (Look) based on her request, product TAGS, and COLOR THEORY.
      
      Rules:
      1. Reply in friendly Egyptian Arabic (Girl-to-Girl tone, emojis: ✨💅🌸).
      2. Analyze User Input for HEIGHT (cm) and WEIGHT (kg). 
         - If found, ESTIMATE SIZE based on: S (<55kg), M (55-65kg), L (65-75kg), XL (75-85kg), XXL (>85kg).
         - Include the suggested size in the reply.
      3. Create a Mix & Match Outfit:
         - Try to pair different categories (e.g., Top + Pants + Shoes, or Dress + Accessories).
         - ENSURE COLORS MATCH (e.g., Beige pants + White Top, Black Abaya + Pink Scarf).
      4. If no full outfit matches, suggest best single item.
      
      Output JSON: 
      { 
        "reply": "friendly message here (include size suggestion if height/weight found)...", 
        "suggestedSize": "M", (or null if not found)
        "suggestedLook": {
          "title": "Name of Look (e.g., 'Casual Chic')",
          "productIds": ["id1", "id2", "id3"] (max 3 items that look good together)
        }
      }
    `;
    
    try {
      let res = await callGeminiAPI(prompt);
      if (res) {
        // تنظيف الرد من علامات الـ Markdown لو وجدت
        res = res.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(res);
        
        let lookData = null;
        if (parsed.suggestedLook && parsed.suggestedLook.productIds.length > 0) {
           const items = products.filter(p => parsed.suggestedLook.productIds.includes(p.id));
           if(items.length > 0) {
             lookData = { title: parsed.suggestedLook.title, items: items, size: parsed.suggestedSize };
           }
        }

        setMessages(prev => [...prev, { role: 'assistant', text: parsed.reply, suggestedLook: lookData }]);
      }
    } catch (e) { 
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', text: "النت بيقطع يا قمر، قوليلي تاني؟ ✨" }]); 
    }
    setIsLoading(false);
  };

  if (!isOpen) return <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:scale-110 transition z-50 animate-bounce-subtle group"><Bot size={24} className="group-hover:rotate-12 transition"/></button>;

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_10px_60px_rgba(0,0,0,0.15)] border border-white/50 z-50 flex flex-col h-[600px] animate-fade-in-up transform transition-all">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 rounded-t-3xl flex justify-between text-white shadow-sm">
        <div className="flex items-center gap-2"><Sparkles size={18} className="text-yellow-300"/> <span className="font-bold tracking-wide">AI Stylist</span></div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`} dir="auto">{m.text}</div>
            
            {m.suggestedLook && (
              <div className="mt-2 w-full bg-white rounded-2xl border border-violet-100 shadow-md overflow-hidden">
                <div className="bg-violet-50 px-3 py-2 border-b border-violet-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-500"/>
                    <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">{m.suggestedLook.title}</span>
                  </div>
                  {m.suggestedLook.size && <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-violet-600 border border-violet-200">Size: {m.suggestedLook.size}</span>}
                </div>
                <div className="p-3 flex gap-2 overflow-x-auto custom-scrollbar">
                  {m.suggestedLook.items.map(p => (
                    <div key={p.id} className="w-20 flex-shrink-0 group relative">
                       <div className="h-24 rounded-lg overflow-hidden border border-slate-100 relative">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                          {p.color && <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-[8px] text-white text-center py-0.5 truncate">{p.color}</div>}
                       </div>
                       <div className="text-[10px] truncate mt-1 text-slate-600 font-medium text-center">{p.price} EGP</div>
                    </div>
                  ))}
                </div>
                <div className="px-3 pb-3">
                    <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-700">
                        <span>Total Look:</span>
                        <span>{m.suggestedLook.items.reduce((s, x) => s + Number(x.price), 0)} EGP</span>
                    </div>
                    <button onClick={() => addToCart(m.suggestedLook.items)} className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm">
                        Add All to Bag <ShoppingBag size={12}/>
                    </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && <div className="text-violet-400 text-xs px-4 animate-pulse flex items-center gap-1"><Sparkles size={12}/> AI is matching colors & sizes...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-slate-100 flex gap-2 bg-white rounded-b-3xl">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-slate-100 text-slate-700 rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-violet-300 focus:bg-white transition" placeholder="Type info (e.g. 165cm, 60kg)..." dir="auto"/>
        <button onClick={handleSend} className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full transition shadow-md"><Send size={18} /></button>
      </div>
    </div>
  );
};

export default AIStylist;