export default function Footer() {
  return (
    <footer className="p-4 text-xs text-gray-500 border-t flex justify-between fixed bottom-0 left-0 w-full bg-white z-50">
      <span>JMT Archery</span>
      <div className="flex gap-2">
        <span className="w-3 h-3 bg-gray-400 rounded-full" />
        <span className="w-3 h-3 bg-gray-400 rounded-full" />
        <span className="w-3 h-3 bg-gray-400 rounded-full" />
      </div>
    </footer>
  );
}