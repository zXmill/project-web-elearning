import React from 'react';

// Placeholder image URL - replace with actual image paths or a default placeholder
const PLACEHOLDER_IMAGE_URL = "https://via.placeholder.com/400x225.png?text=TERAPLUS+Konten";

const ContentCard = ({
  imageSrc,
  title = "Judul Konten Default", // "Lorem ipsum dolor sit amet consectetur."
  category = "Kategori", // This will be used as the short description under "FREE"
  // We'll add a new prop for the author/info line if needed, or use category.
  // For now, the "FREE" and "Lorem ipsum urna fermentum" are static as per the design.
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
        <p className="text-sm font-medium text-gray-700 mb-1">FREE</p>
        <p className="text-xs text-gray-500 mb-3 flex-grow min-h-[2.5em]">
          {category} {/* Using category as the short description */}
        </p>
        <hr className="border-gray-200 my-2" />
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-gray-300 mr-2"></div> {/* Placeholder Avatar */}
          <p className="text-xs text-gray-500">Lorem ipsum urna fermentum</p>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
