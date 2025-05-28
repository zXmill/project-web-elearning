export default function GradientHeader({ title, subtitle }){
  return(
    <div className="bg-gradient-to-br from-pink-500 to-orange-400 p-6 rounded-b-3xl">
      <h1 className="text-white text-2xl font-bold">{title}</h1>
      <p className="text-white mt-1">{subtitle}</p>
    </div>
  );
}