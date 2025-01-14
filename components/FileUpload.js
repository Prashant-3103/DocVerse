// import { useState } from 'react';
// import toast from "react-hot-toast";

// export default function FileUpload() {
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     // Allowed file types
//     const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
//     if (!allowedTypes.includes(selectedFile.type)) {
//       toast.error("Only PDF, Excel (.xlsx), and CSV files are allowed.");
//       e.target.value = null;
//       return;
//     }

//     setFile(selectedFile);
//   };

//   const handleUploadClick = async () => {
//     if (!file) {
//       toast.error("No file selected");
//       return;
//     }

//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success(data.message);
//       } else {
//         const errorData = await response.json();
//         toast.error(errorData.error || "An error occurred during upload.");
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       toast.error("An error occurred while uploading the file.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="mb-3">
//       <label
//         htmlFor="fileInput"
//         className="block text-sm font-medium text-gray-700"
//       >
//         Upload a File (PDF, Excel, or CSV)
//       </label>
//       <input
//         type="file"
//         id="fileInput"
//         onChange={handleFileChange}
//         className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
//       />
//       <button
//         type="button"
//         onClick={handleUploadClick}
//         disabled={uploading}
//         className="mt-4 inline-block rounded bg-blue-500 px-6 py-2 text-xs font-medium text-white shadow-md hover:bg-blue-600 focus:bg-blue-600 focus:outline-none active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
//       >
//         {uploading ? "Uploading..." : "Upload"}
//       </button>
//     </div>
//   );
// }


import { useState } from 'react';
import toast from "react-hot-toast";

export default function FileUpload() {
  const [uploadMethod, setUploadMethod] = useState("file");
  const [file, setFile] = useState(null);
  const [driveLink, setDriveLink] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only PDF, Excel (.xlsx), and CSV files are allowed.");
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
    setDriveLink('');
  };

  const handleUploadClick = async () => {
    if ((uploadMethod === "file" && !file) || (uploadMethod === "drive" && !driveLink)) {
      toast.error("Please provide a file or a Google Drive link.");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    if (uploadMethod === "file") {
      formData.append('file', file);
    } else {
      formData.append('driveLink', driveLink);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
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
    <div className="mb-3">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Choose Upload Method:
        </label>
        <div className="flex space-x-4 mt-2">
          <label>
            <input
              type="radio"
              name="uploadMethod"
              value="file"
              checked={uploadMethod === "file"}
              onChange={() => setUploadMethod("file")}
              className="mr-2"
            />
            File Upload
          </label>
          <label>
            <input
              type="radio"
              name="uploadMethod"
              value="drive"
              checked={uploadMethod === "drive"}
              onChange={() => setUploadMethod("drive")}
              className="mr-2"
            />
            Google Drive Link
          </label>
        </div>
      </div>

      {uploadMethod === "file" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload a File (PDF, Excel, or CSV)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>
      )}

      {uploadMethod === "drive" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Google Drive Link
          </label>
          <input
            type="text"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleUploadClick}
        disabled={uploading}
        className="mt-4 inline-block rounded bg-blue-500 px-6 py-2 text-xs font-medium text-white shadow-md hover:bg-blue-600 focus:bg-blue-600 focus:outline-none active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
