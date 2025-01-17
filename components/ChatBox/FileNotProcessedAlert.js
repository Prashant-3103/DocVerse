
import toast from "react-hot-toast";
import { useState } from "react";

const PillButton = ({ func, disabled }) => (
  <button
    onClick={func}
    className={`ml-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs text-white font-bold py-1 px-3 rounded-full transition-all duration-300 ease-in-out disabled:from-orange-300 disabled:to-red-300 disabled:cursor-not-allowed`}
  >
    {disabled ? "Processing..." : "Process Files"}
  </button>
);

export default function FileNotProcessedAlert({ ids }) {
  console.log("--ids--", ids);
  const [processing, setProcessing] = useState(false);

  const trigger = async (ids) => {
    if (!ids || ids.length === 0) {
      toast.error("No file IDs to process.");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        body: JSON.stringify({ ids }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Files processed successfully.");
      } else {
        const error = await response.json();
        toast.error(error.message || "An error occurred while processing the files.");
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("An error occurred while processing the files.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="bg-gradient-to-r from-orange-50 to-orange-100 border-t-4 border-orange-500 rounded-lg text-orange-800 px-6 py-4 shadow-md flex items-start space-x-4"
      role="alert"
    >
      <div className="flex-shrink-0">
        <svg
          className="w-6 h-6 text-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 18.5c1.933 0 3.5-1.567 3.5-3.5S13.933 11.5 12 11.5 8.5 13.067 8.5 15s1.567 3.5 3.5 3.5z"
          />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-lg">Process Files</p>
        <p className="text-sm text-gray-700">
          Please process the files before starting to chat. Click the button below to process.
        </p>
        <div className="mt-2">
          <PillButton func={() => trigger(ids)} disabled={processing} />
        </div>
      </div>
    </div>
  );
}
