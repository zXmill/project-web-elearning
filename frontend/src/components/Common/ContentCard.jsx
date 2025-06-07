import React from 'react';

// Placeholder image URL - replace with actual image paths or a default placeholder
const PLACEHOLDER_IMAGE_URL = "https://via.placeholder.com/400x225.png?text=TERAPLUS+Konten";

const ContentCard = ({
  imageSrc,
  title = "Judul Konten Default", // "Lorem ipsum dolor sit amet consectetur."
  category = "Kategori", 

  onViewClick, 
}) => {
  const effectiveImageSrc = imageSrc || PLACEHOLDER_IMAGE_URL;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-xl transition-shadow duration-300"
      onClick={onViewClick}
      style={{ cursor: 'pointer' }}
    >
      <img 
        src={effectiveImageSrc} 
        alt={title} 
        className="w-full h-40 sm:h-44 object-cover bg-gray-300" // Added bg-gray-300 for placeholder
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-3 flex-grow min-h-[2.5em]">
          {category} {/* Using category as the short description */}
        </p>
        <hr className="border-gray-200 my-2" />
      </div>
    </div>
  );
};

export default ContentCard;
