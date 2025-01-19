
import { useState } from "react";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

export default function MyFiles({ setActiveFiles, files, updateFile, deleteFile }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, file: null });

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

  const handleEditName = async (file) => {
    if (!editName.trim()) {
      toast.error("File name cannot be empty.");
      return;
    }

    try {
      const response = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "edit",
          id: file._id,
          newName: editName,
        }),
      });

      if (response.ok) {
        toast.success("File name updated successfully!");
        updateFile(file._id, editName);
        setIsEditing(null);
        setEditName("");
      } else {
        const { message } = await response.json();
        toast.error(`Failed to update file: ${message}`);
      }
    } catch (error) {
      toast.error("An error occurred while updating the file.");
      console.error(error);
    }
  };

  const confirmDeleteFile = (file) => {
    setDeleteModal({ show: true, file });
  };

  const handleDeleteFile = async () => {
    const file = deleteModal.file;
    if (!file) return;

    setDeleteModal({ show: false, file: null });
    setIsDeleting(true);

    try {
      const response = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          id: file._id,
        }),
      });

      if (response.ok) {
        toast.success("File deleted successfully!");
        deleteFile(file._id);
      } else {
        const { message } = await response.json();
        toast.error(`Failed to delete file: ${message}`);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the file.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg text-center">
      <h2 className="text-lg font-bold text-gray-700 mb-4">My Files</h2>
      {files.length > 0 ? (
        <div className="space-y-4">
          {files.map((file, index) => (
            <div
              key={file._id}
              className={`flex items-center justify-between p-3 border rounded-lg transition duration-300 ${
                selectedFiles.some((f) => f._id === file._id)
                  ? "bg-blue-100 border-blue-500"
                  : "bg-white border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  onChange={(e) => handleFileSelection(file, e.target.checked)}
                  checked={selectedFiles.some((f) => f._id === file._id)}
                />
                {isEditing === file._id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                      placeholder="Enter new name"
                    />
                    <button
                      onClick={() => handleEditName(file)}
                      className="text-sm bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(null);
                        setEditName("");
                      }}
                      className="text-sm bg-gray-300 px-2 py-1 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-700">
                    {index + 1}. {file.fileName}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(file._id);
                        setEditName(file.fileName);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => confirmDeleteFile(file)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
                {selectedFiles.some((f) => f._id === file._id) && (
                  <FaCheckCircle className="text-blue-500" />
                )}
              </div>
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

      {/* Progress Bar */}
      {isDeleting && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <p className="text-gray-700 font-semibold">Deleting file...</p>
            <div className="w-full bg-gray-200 rounded-full mt-2">
              <div
                className="bg-blue-500 text-xs leading-none py-1 text-center text-white rounded-full"
                style={{ width: "100%" }}
              >
                Loading...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-700">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-bold text-red-500">
                {deleteModal.file?.fileName}
              </span>
              ?
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, file: null })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFile}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
