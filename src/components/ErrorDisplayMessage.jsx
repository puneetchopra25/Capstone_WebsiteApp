import { AlertCircle } from "lucide-react";

export const ErrorDisplayMessage = ({ message }) => {
  return (
    <div
      className="fixed top-1/2 left-0 right-[140px] z-50"
      style={{ transform: "translateY(-50%)" }}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Error Icon */}
        <div className="bg-red-100 p-4 rounded-full mb-4 shadow-sm border">
          <AlertCircle className="text-red-800 h-16 w-16" />
        </div>
        
        {/* The Error Message */}
        <p className="mt-2 text-lg font-bold text-red-800 text-center px-4">
          Simulation Failed
        </p>
        <p className="mt-4 text-lg font-medium text-gray-700 text-center whitespace-pre-line">
          {message || "The server is currently unavailable. Please try again."}
        </p>
      </div>
    </div>
  );
};