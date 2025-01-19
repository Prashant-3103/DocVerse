
export default function Intro() {
	return (
	  <div
		className="pb-5 border-b mb-5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 text-gray-800 p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-102"
	  >
		<h1 className="text-2xl font-bold mb-2 text-blue-700">
		  Welcome to <span className="text-blue-600">DocVerse</span>
		</h1>
		<p className="text-base font-medium">
		  Upload your <b>PDF, Excel or CSV files</b> and start chatting with your documents effortlessly!
		</p>
		<p className="mt-3 text-sm text-gray-600">
		  Unlock insights hidden in your files – <span className="text-blue-400 font-semibold">upload and chat</span> now!
		</p>
	  </div>
	);
  }
