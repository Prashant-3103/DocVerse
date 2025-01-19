
import { useState } from "react";
import toast from "react-hot-toast";
import { FaFileUpload, FaGoogleDrive, FaCheckCircle } from "react-icons/fa";

export default function FileUpload() {
  const [uploadMethod, setUploadMethod] = useState("file");
  const [file, setFile] = useState(null);
  const [driveLink, setDriveLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastUploaded, setLastUploaded] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only PDF, Excel (.xlsx), and CSV files are allowed.");
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
    setDriveLink("");
    setLastUploaded(null);
  };

  const handleUploadClick = async () => {
    if ((uploadMethod === "file" && !file) || (uploadMethod === "drive" && !driveLink)) {
      toast.error("Please provide a file or a Google Drive link.");
      return;
    }

    setUploading(true);
    setProgress(0);
    const formData = new FormData();

    if (uploadMethod === "file") {
      formData.append("file", file);
    } else {
      formData.append("driveLink", driveLink);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setProgress(100);

        if (uploadMethod === "file") {
          setLastUploaded(file.name);
        } else {
          setLastUploaded("File Via Drive Link");
        }

        setFile(null);
        setDriveLink("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "An error occurred during upload.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("An error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4 bg-gray-100 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-lg font-bold text-gray-700">Upload a File</h2>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">Choose Upload Method:</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setUploadMethod("file")}
            className={`flex items-center px-4 py-2 rounded-lg shadow-md text-sm ${
              uploadMethod === "file" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <FaFileUpload className="mr-2" /> File Upload
          </button>
          <button
            onClick={() => setUploadMethod("drive")}
            className={`flex items-center px-4 py-2 rounded-lg shadow-md text-sm ${
              uploadMethod === "drive" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <FaGoogleDrive className="mr-2" /> Google Drive Link
          </button>
        </div>
      </div>

      {uploadMethod === "file" && (
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select a File:</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:outline-none"
          />
        </div>
      )}

      {uploadMethod === "drive" && (
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive Link:</label>
          <input
            type="text"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:outline-none"
          />
        </div>
      )}

      <button
        onClick={handleUploadClick}
        disabled={uploading}
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium shadow-md ${
          uploading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {uploading
          ? "Uploading..."
          : lastUploaded
          ? "Your previous upload was successful, choose again to upload"
          : "Upload"}
      </button>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {lastUploaded && (
        <div className="flex items-center space-x-2 text-sm text-green-600 mt-2">
          <FaCheckCircle />
          <span>Last upload: {lastUploaded}</span>
        </div>
      )}
    </div>
  );
}
