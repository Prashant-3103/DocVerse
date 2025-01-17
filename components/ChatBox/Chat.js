
import AnimatedEllipsis from "@/components/AnimatedEllipsis";

export default function Chat({ query, response }) {
  return (
    <div className="space-y-4">
      {query && (
        <div className="w-full p-3 border-b flex items-center space-x-3 bg-blue-50 rounded-lg shadow-sm">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
            Q
          </div>
          <div className="text-gray-800 text-sm font-medium">{query}</div>
        </div>
      )}
      {response && (
        <div className="w-full p-3 border-b flex items-center justify-end space-x-3 bg-purple-50 rounded-lg shadow-sm">
          <div className="text-gray-800 text-sm font-medium text-right">
            {response ? response : <AnimatedEllipsis />}
          </div>
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      )}
    </div>
  );
}
