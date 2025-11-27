import React from 'react';
import { motion } from 'framer-motion';

const animations = {
    initial: { opacity: 0, y: 20 },   // الصفحة تبدأ شفافة وتحت شوية (20 بيكسل)
    animate: { opacity: 1, y: 0 },    // تطلع لمكانها الطبيعي وتظهر
    exit: { opacity: 0, y: -20 }      // وهي خارجة تكمل طلوع لفوق وتختفي
};

const PageTransition = ({ children }) => {
    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }} // مدة أقصر سنة عشان تبقى Rhythmic
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;