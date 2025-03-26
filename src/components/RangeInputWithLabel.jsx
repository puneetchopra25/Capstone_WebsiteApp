// Creates a range input with a label and value
export const RangeInputWithLabel = ({
  label,
  id,
  value,
  onChange,
  min,
  max,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <label htmlFor={id} className="block text-sm font-medium w-5/6">
        {label}
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full max-w-[60%] h-2 bg-gray-700 rounded-full cursor-pointer"
      />
      <span className="ml-3 text-sm font-medium">{value}</span>
    </div>
  );
};
