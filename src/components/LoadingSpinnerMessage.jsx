// Creates a loading spinner message
export const LoadingSpinnerMessage = ({ energy }) => {
  return (
    <div
      className="fixed top-1/2 left-0 right-[140px] z-50"
      style={{ transform: "translateY(-50%)" }}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Spinner */}
        <div
          className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600"
          style={{ borderTopColor: "transparent" }}
        ></div>
        {/* Informative Message */}
        <p className="mt-4 text-lg font-medium text-gray-700 text-center">
          Running {energy || "the"} simulation, this may take a moment. Please
          wait for the results...
        </p>
      </div>
    </div>
  );
};
