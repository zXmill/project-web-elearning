export default function SearchBar({ placeholder, onSearch }){
  return(
    <div className="flex items-center bg-white p-2 rounded-xl shadow">
      <input className="flex-grow px-3 py-2 rounded-l-xl focus:outline-none" placeholder={placeholder} onChange={e=>onSearch(e.target.value)} />
      <button className="p-2">
        🔍
      </button>
    </div>
  );
}