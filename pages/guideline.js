import Link from 'next/link';

export default function Guidelines() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 flex flex-col items-center justify-center px-4 sm:px-8 sm:p-4 lg:p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 lg:p-10 max-w-3xl w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-6 tracking-wide">
          Welcome to <span className="text-teal-600">DocVerse</span>
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
          Seamlessly upload, manage, and interact with your documents in an intelligent and efficient way. Here's how you can get started:
        </p>
        <ol className="text-left text-gray-700 text-sm sm:text-base space-y-6 mb-8">
          <li className="flex items-start">

            <p>
              <span className="font-semibold text-blue-600">Upload your documents:</span> Use the <span className="font-semibold text-teal-500">"Upload Files"</span> button to upload PDFs, images, spreadsheets (CSV, Excel), either directly or via a drive link.
            </p>
          </li>
          <li className="flex items-start">

            <p>
              <span className="font-semibold text-blue-600">Manage your files:</span> Select files to process, edit or delete them as needed. Only processed files can be queried.
            </p>
          </li>
          <li className="flex items-start">

            <p>
              <span className="font-semibold text-blue-600">Process files:</span> To query a document, select it from the list and click the <span className="font-semibold text-teal-500">"Process"</span> button in the chat section. Once processed, you can start interacting with your document.
            </p>
          </li>
          <li className="flex items-start">

            <p>
              <span className="font-semibold text-blue-600">Query and chat:</span> Ask intelligent questions about your documents and get instant, meaningful insights through the chat interface.
            </p>
          </li>
          <li className="flex items-start">
           
            <p>
              <span className="font-semibold text-blue-600">Enjoy the experience:</span> Discover the power of seamless interaction with your files!
            </p>
          </li>
        </ol>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
