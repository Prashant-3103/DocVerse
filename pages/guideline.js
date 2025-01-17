export default function Guidelines() {
    return (
      <div className="h-screen bg-blue-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white shadow-md rounded-lg p-10 max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">How to Use TalkwithDoc</h1>
          <p className="text-gray-700 text-lg mb-6">
            1. Upload your documents using the "Upload Files" button.<br />
            2. Manage your files easily by selecting or deselecting them.<br />
            3. Start chatting by asking queries about the uploaded documents.<br />
            4. Enjoy seamless interaction and get instant insights from your files!
          </p>
          <a href="/" className="text-blue-500 hover:underline font-semibold">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }
