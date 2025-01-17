
export default function ChooseFileAlert() {
	return (
	  <div
		className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-4 border-blue-500 rounded-lg text-blue-800 px-6 py-4 shadow-md flex items-start space-x-3"
		role="alert"
	  >
		<div className="flex-shrink-0">
		  <svg
			className="w-6 h-6 text-blue-500"
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
		  <p className="font-semibold text-lg">Select a File</p>
		  <p className="text-sm text-gray-700">
			Please select a file to start chatting with your document.
		  </p>
		</div>
	  </div>
	);
  }
