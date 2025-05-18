// Creates a label with a message
export const LabelWithMessage = ({ label, message }) => (
  <div className="flex flex-col space-y-3">
    <div className="flex items-center space-x-3">
      <label className="block text-sm font-medium w-5/6">{label}</label>
    </div>
    <p className="text-sm text-gray-500 mt-1">{message}</p>
  </div>
);
