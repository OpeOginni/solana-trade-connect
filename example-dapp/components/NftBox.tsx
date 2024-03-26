export default function NFTBox({ index, label, onClick }: { index: number; label: string; onClick: (index: number, label: string) => void }) {
  return (
    <div
      key={index}
      className="flex justify-center items-center text-center aspect-[1] border border-gray-200 p-2"
      onClick={() => onClick(index, label)}
    >
      Junky {label + 1}
    </div>
  );
}
