
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import MyFiles from "@/components/MyFiles";
import Intro from "@/components/Intro";
import ChatBox from "@/components/ChatBox";
import useMyFiles from "@/apiHooks/useMyFiles";
import Head from "next/head";
import Guideline from "@/components/Guideline";

export default function Home() {
  const [activeFiles, setActiveFiles] = useState([]); // Support multiple files
  const [leftWidth, setLeftWidth] = useState(30); // Left section width percentage
  const [isUploadModalOpen, setUploadModalOpen] = useState(false); // Upload Modal visibility
  const [isManageModalOpen, setManageModalOpen] = useState(false); // Manage Modal visibility
  const { files, isError, isLoading, updateFile, deleteFile } = useMyFiles();

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent) => {
      const diffX = moveEvent.clientX - startX;
      const newLeftWidth = Math.min(Math.max(leftWidth + (diffX / window.innerWidth) * 100, 20), 70);
      setLeftWidth(newLeftWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>DocVerse - Chat with Documents</title>
      </Head>
      <main className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-teal-500 py-4 shadow-md">
          <h1 className="text-3xl font-bold text-white">DocVerse</h1>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:flex grow">
          {/* Left Section */}
          <div
            style={{ flex: `${leftWidth}%` }}
            className="flex flex-col bg-white border-r shadow-md overflow-hidden"
          >
            <div className="p-5 flex-shrink-0">
              <Intro />

              {leftWidth > 55 ? (
                <div className="flex mt-5 gap-5 flex-row">
                  <FileUpload />
                  <MyFiles
                    setActiveFiles={setActiveFiles}
                    files={files}
                    updateFile={updateFile}
                    deleteFile={deleteFile}
                  />

                </div>
              ) : (
                <div className="mt-5 bg-gradient-to-r from-blue-100 to-blue-200 shadow-md rounded-lg p-5">
                  <h2 className="text-lg text-center font-semibold text-blue-800 mb-4">
                    Manage Your Files
                  </h2>
                  <div className="flex gap-4 justify-center items-center">
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 transform transition-transform duration-300 hover:scale-105"
                    >
                      📤 Upload Files
                    </button>
                    <button
                      onClick={() => setManageModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 transform transition-transform duration-300 hover:scale-105"
                    >
                      📂 Manage Files
                    </button>
                  </div>
                  <Guideline/>
                </div>
              )}
            </div>
          </div>

          {/* Resizable Divider */}
          <div
            onMouseDown={handleMouseDown}
            className="cursor-col-resize w-2 bg-gray-300 hover:bg-gray-400"
          ></div>

          {/* Chat Section */}
          <div
            style={{ flex: `${100 - leftWidth}%` }}
            className="flex flex-col bg-white lg:overflow-hidden"
          >
            <div className="p-5">
              <ChatBox activeFiles={activeFiles} />
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden flex flex-col p-4">
          <Intro />
          <FileUpload />
          <MyFiles
            setActiveFiles={setActiveFiles}
            files={files}
            updateFile={updateFile}
            deleteFile={deleteFile}
          />
          <ChatBox activeFiles={activeFiles} />

        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-3/4 lg:w-1/2 max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 bg-blue-500 text-white">
                <h2 className="text-lg font-bold">Upload Files</h2>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="text-white font-bold text-xl hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <FileUpload />
              </div>
            </div>
          </div>
        )}

        {/* Manage Modal */}
        {isManageModalOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-3/4 lg:w-1/2 max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 bg-blue-500 text-white">
                <h2 className="text-lg font-bold">Manage Files</h2>
                <button
                  onClick={() => setManageModalOpen(false)}
                  className="text-white font-bold text-xl hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <MyFiles
                  setActiveFiles={setActiveFiles}
                  files={files}
                  updateFile={updateFile}
                  deleteFile={deleteFile}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
