// Creates a display with a label and value
export const DisplayWithLabel = ({ label, value }) => (
  <div className="flex items-center space-x-3 mb-4">
    {" "}
    {/* Add some margin-bottom for spacing */}
    <label className="block text-sm font-medium w-1/3">{label}</label>
    <span className="w-2/3 h-1/15 p-2 bg-gray-100 rounded-3xl flex items-center justify-center text-black">
      {value}
    </span>{" "}
    {/* Changed to bg-gray-100 for a distinct look */}
  </div>
);
