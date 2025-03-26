// Turbine Selector Component
export const TurbineSelector = ({
  turbineModels,
  onSelectTurbine,
  selectedTurbineDetailsIndex,
}) => (
  <div className="flex items-center space-x-3 justify-center mb-4">
    <label
      htmlFor="turbine-selector"
      className="block text-sm font-medium w-1/3"
    >
      Select Turbine:
    </label>
    <select
      id="turbine-selector"
      onChange={onSelectTurbine}
      value={selectedTurbineDetailsIndex}
      className="mt-1 w-2/3 p-2 border border-gray-700 rounded-3xl text-center bg-blue-500 text-white"
    >
      {turbineModels.map((turbine) => (
        <option key={turbine.id} value={turbine.id}>
          {turbine.name}
        </option>
      ))}
    </select>
  </div>
);
