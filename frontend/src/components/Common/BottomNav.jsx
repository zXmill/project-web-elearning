export default function BottomNav({ active }){
  return(
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2">
      {['Eksplor','Profil'].map(i=>
        <button key={i} className={i===active? 'text-orange-500':'text-gray-500'}>{i}</button>
      )}
    </nav>
  );
}