
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function MyFiles({ setActiveFiles, files }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelection = (file, isSelected) => {
    if (isSelected) {
      setSelectedFiles((prev) => [...prev, file]);
    } else {
      setSelectedFiles((prev) => prev.filter((f) => f._id !== file._id));
    }
  };

  const handleConfirmSelection = () => {
    setActiveFiles(selectedFiles);
  };

  return (
    <div className="bg-gray-100  p-2 text-center rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-gray-700 mb-4">My Files</h2>
      {files.length > 0 ? (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex  justify-between p-3 border rounded-lg transition duration-300 ${
                selectedFiles.some((f) => f._id === file._id)
                  ? "bg-blue-100 border-blue-500"
                  : "bg-white border-gray-300 hover:shadow-md"
              }`}
            >
              <label className="flex items-left text-left space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  onChange={(e) =>
                    handleFileSelection(file, e.target.checked)
                  }
                  checked={selectedFiles.some((f) => f._id === file._id)}
                />
                <span className="text-gray-700">
                  {index + 1}. {file.fileName}
                </span>
              </label>
              {selectedFiles.some((f) => f._id === file._id) && (
                <FaCheckCircle className="text-blue-500" />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleConfirmSelection}
            className={`w-full mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white shadow-md transition duration-300 ${
              selectedFiles.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 focus:outline-none"
            }`}
            disabled={selectedFiles.length === 0}
          >
            Confirm Selection
          </button>
        </div>
      ) : (
        <p className="p-4 text-center text-gray-500">
          No files found. Upload a drive link or file to start chatting.
        </p>
      )}
    </div>
  );
}
