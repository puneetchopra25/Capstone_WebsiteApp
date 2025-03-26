// Creates a popup with a message and a close button
export const Popup = ({ message, onClose }) => {
  return (
    // <div className="fixed top-[180px] right-12 w-42  bg-white font-bold p-3 rounded-lg shadow-lg flex justify-center items-cente">
    <div className="fixed top-[230px] right-[92px] flex justify-center items-center">
      <div className="bg-white font-bold p-3 rounded-2xl shadow-lg">
        <p className="mb-2">{message}</p>
        <button
          onClick={onClose}
          className="py-1 px-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition duration-200 mx-auto block"
        >
          Close
        </button>
      </div>
    </div>
  );
};
