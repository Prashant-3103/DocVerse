// import toast from "react-hot-toast";
// import {useState} from "react";

// const PillButton = ({func, disabled}) => (
// 	<button onClick={func}
// 					className="ml-2 bg-blue-500 hover:bg-primary-main text-xs text-white font-bold py-1 px-2 rounded-full disabled:bg-primary-light disabled:cursor-not-allowed">
// 		{disabled ? "Processing file.." : "Process File"}
// 	</button>
// )

// export default function FileNotProcessedAlert({id}) {
// 	console.log("--id--", id)
// 	const [processing, setProcessing] = useState(false)

// 	const trigger = async (id) => {
// 		setProcessing(true)
// 		let response = await fetch("/api/process", {
// 			method: 'POST',
// 			body: JSON.stringify({id}),
// 			headers: {
// 				'Content-type': 'application/json'
// 			}
// 		})

// 		if (response.ok) {
// 			response = await response.json()
// 			toast.success(response.message)
// 		} else {
// 			response = await response.json()
// 			toast.error(response.message)
// 		}
// 		setProcessing(false)
// 	}

// 	return (
// 		<div className="bg-orange-100 border-t-4 border-orange-500 rounded-b text-orange-900 px-4 py-3 shadow-md" role="alert">
// 			<p className="font-bold">Process File</p>
// 			<p>Please process the file before starting to chat. Click button to process
// 				<PillButton func={() => trigger(id)} disabled={processing}/>
// 			</p>
// 		</div>
// 	)
// }

import toast from "react-hot-toast";
import { useState } from "react";

const PillButton = ({ func, disabled }) => (
  <button
    onClick={func}
    className="ml-2 bg-blue-500 hover:bg-primary-main text-xs text-white font-bold py-1 px-2 rounded-full disabled:bg-primary-light disabled:cursor-not-allowed"
  >
    {disabled ? "Processing files..." : "Process Files"}
  </button>
);

export default function FileNotProcessedAlert({ ids }) {
  console.log("--ids--", ids);
  const [processing, setProcessing] = useState(false);

  const trigger = async (ids) => {
    if (!ids || ids.length === 0) {
      toast.error("No file IDs to process.");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        body: JSON.stringify({ ids }),
        headers: {
          "Content-type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Files processed successfully.");
      } else {
        const error = await response.json();
        toast.error(error.message || "An error occurred while processing the files.");
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("An error occurred while processing the files.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="bg-orange-100 border-t-4 border-orange-500 rounded-b text-orange-900 px-4 py-3 shadow-md"
      role="alert"
    >
      <p className="font-bold">Process Files</p>
      <p>
        Please process the files before starting to chat. Click the button to process.
        <PillButton func={() => trigger(ids)} disabled={processing} />
      </p>
    </div>
  );
}
