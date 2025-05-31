export default function CourseCard({ title, level, image, onClick }){
  return(
    <div onClick={onClick} className="relative bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer">
      <img src={image} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">Level {level}</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        ▶️
      </div>
    </div>
  );
}