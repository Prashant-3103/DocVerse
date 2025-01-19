
import useSWR, { mutate } from "swr";

const url = "/api/my-files";

export default function useMyFiles() {
  const { data, error } = useSWR(url);

  // Add methods to update the file list dynamically
  const updateFile = (fileId, newName) => {
    mutate(
      url,
      (files) =>
        files.map((file) =>
          file._id === fileId ? { ...file, fileName: newName } : file
        ),
      false // Do not re-fetch from the server immediately
    );
  };

  const deleteFile = (fileId) => {
    mutate(
      url,
      (files) => files.filter((file) => file._id !== fileId),
      false // Do not re-fetch from the server immediately
    );
  };

  return {
    files: data,
    isLoading: !error && !data,
    isError: error,
    updateFile, // Function to update a file's name
    deleteFile, // Function to delete a file from the list
  };
}
