// Creates an input with a label and value
export const InputWithLabel = ({
  label,
  id,
  value,
  onChange,
  step,
  error,
  min,
  max,
}) => (
  <div className="flex flex-col">
    <div className="flex items-center space-x-3">
      <label htmlFor={id} className="block text-sm font-medium w-1/3">
        {label}
      </label>
      <input
        type="number"
        id={id}
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={onChange}
        className="mt-1 block w-full max-w-[65%] h-15 p-2 border border-gray-700 rounded-3xl text-center"
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1 ml-[35%]">{error}</p>}
  </div>
);
