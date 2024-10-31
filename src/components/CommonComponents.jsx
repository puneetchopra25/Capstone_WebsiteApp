import React from "react";

// Creates a horizontal line as a section divider
export const SectionDivider = () => (
  <div className="my-6 border-t-2 border-gray-700"></div>
);

// Creates a section title with a shadow and background color
export const SectionTitle = ({ title }) => (
  <h2 className="text-xl font-semibold mb-4 shadow-sm p-3 rounded bg-gray-300 text-black">
    {title}
  </h2> // Shadow and background color for segmentation
);

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

// Creates an input with a label and value
export const InputWithLabel = ({ label, id, value, onChange, error }) => (
  <div className="flex items-center space-x-3">
    <label htmlFor={id} className="block text-sm font-medium w-1/3">
      {label}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-2/3 h-15 p-2 border border-gray-700 rounded-3xl text-center"
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

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
