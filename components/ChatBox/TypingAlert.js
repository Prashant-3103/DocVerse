export default function TypingAlert() {
    return (
      <div
        className="bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 shadow-md"
        role="alert"
      >
        <p className="font-bold">Typing...</p>
        <p className="text-sm">Please wait while we generate the response.</p>
      </div>
    );
  }
