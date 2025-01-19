import React from 'react'
import Link from 'next/link'
const Guideline = () => {
  return (
    <div className="mt-6 flex justify-center items-center border-t pt-4">

    <button
      className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-400"
    >
<Link href="/guideline" className="text-blue-600 font-semibold hover:underline">
      📘 Guidelines
    </Link>
    </button>
  </div>
  )
}

export default Guideline
