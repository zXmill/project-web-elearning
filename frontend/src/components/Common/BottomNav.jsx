import { useNavigate } from 'react-router-dom';

export default function BottomNav({ active }){
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return(
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2">
      {['Eksplor','Profil'].map(i=>
        <button key={i} className={i===active? 'text-orange-500':'text-gray-500'}>{i}</button>
      )}
      <button onClick={handleLogout} className="text-red-500 font-semibold">Logout</button>
    </nav>
  );
}