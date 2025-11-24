import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title} | Modern Style</title>
      <meta name="description" content={description || "Modern Style - Best Fashion Store in Egypt"} />
      {/* تأكد إن المسار ده مطابق لاسم الصورة اللي هتحطها في public */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </Helmet>
  );
};

export default SEO;