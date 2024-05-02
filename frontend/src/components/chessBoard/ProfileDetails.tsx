
export default function ProfileDetails({ name }: { name: string }) {
  return (
    <div className="w-[512px] h-12 flex justify-between ">
      <div className="flex items-center justify-center">
        <div className="h-10 w-10 bg-black"></div>
        <p className="text-xl ml-2">{name}</p>
      </div>
      <div className="w-40 h-10 bg-black">time</div>
    </div>
  )
}
