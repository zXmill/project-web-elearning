export default function SearchBar({ placeholder, onSearch, variant = "default" }){
  const isHeroVariant = variant === "hero";

  const containerClasses = isHeroVariant 
    ? "flex items-center bg-white/20 border border-white/30 p-2 rounded-xl" // Semi-transparent white bg, light border
    : "flex items-center bg-white p-2 rounded-xl shadow";

  const inputClasses = isHeroVariant
    ? "flex-grow px-3 py-2 bg-transparent text-white placeholder-gray-300 focus:outline-none rounded-l-xl" // White text, light gray placeholder
    : "flex-grow px-3 py-2 rounded-l-xl focus:outline-none text-gray-700 placeholder-gray-400";
  
  const buttonClasses = isHeroVariant
    ? "p-2 text-gray-200 hover:text-white" // Light gray icon, white on hover
    : "p-2 text-gray-600";

  return(
    <div className={containerClasses}>
      <input 
        className={inputClasses} 
        placeholder={placeholder} 
        onChange={e => onSearch(e.target.value)} 
      />
      <button className={buttonClasses}>
        🔍
      </button>
    </div>
  );
}
