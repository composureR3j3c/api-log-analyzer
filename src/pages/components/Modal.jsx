export default function Modal({ children, onClose, themeClasses }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`rounded-2xl p-6 w-full mx-4 max-w-2xl max-h-[80vh] overflow-y-auto overflow-x-hidden border ${themeClasses?.panel || 'bg-white'} ${themeClasses?.border || 'border-gray-300'}`}
        onClick={(e) => e.stopPropagation()}
      >

        {children}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-semibold transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}