
import { useState } from "react";

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
    <div className="border">
      <div className="bg-[#108dc7] text-primary-contrastText p-1 px-3">
        My Files
      </div>
      {files.length > 0 ? (
        <div>
          {files.map((file, index) => (
            <label
              key={index}
              className="block border-b w-full cursor-pointer rounded-lg p-2 text-left transition duration-500 hover:bg-neutral-100 hover:text-neutral-500"
            >
              <input
                type="checkbox"
                className="mr-2"
                onChange={(e) => handleFileSelection(file, e.target.checked)}
              />
              {index + 1}. {file.fileName}
            </label>
          ))}
          <button
            type="button"
            onClick={handleConfirmSelection}
            className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md hover:bg-blue-600 focus:bg-blue-600 focus:outline-none active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={selectedFiles.length === 0}
          >
            Confirm Selection
          </button>
        </div>
      ) : (
        <p className="p-2 text-center text-gray-500">
          No files found. Upload a drive link or file to start chatting.
        </p>
      )}
    </div>
  );
}
