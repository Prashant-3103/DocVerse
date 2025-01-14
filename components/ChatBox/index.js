
import { MdSend } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ChooseFileAlert from "@/components/ChatBox/ChooseFileAlert";
import ReadyAlert from "@/components/ChatBox/ReadyAlert";
import Chat from "@/components/ChatBox/Chat";
import FileNotProcessedAlert from "@/components/ChatBox/FileNotProcessedAlert";

export default function ChatBox({ activeFiles }) {
  const divRef = useRef(null);
  const [chat, setChat] = useState([]);
  const [query, setQuery] = useState();
  const [loading, setLoading] = useState(false);

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.length]);

  // Add a new chat entry
  const addChat = (query, response) => {
    setChat((prevState) => [
      ...prevState,
      {
        query,
        response,
      },
    ]);

    setQuery(query);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = e.target.query.value.trim();

    if (!query) {
      toast.error("Query cannot be empty");
      return;
    }

    if (!activeFiles || activeFiles.length === 0) {
      toast.error("No files selected for querying.");
      return;
    }

    e.target.query.value = null;
    addChat(query, null);
  };

  // Update the last chat entry
  const updateLastChat = (query, response) => {
    const oldChats = [...chat];
    oldChats.pop();
    setChat([
      ...oldChats,
      {
        query,
        response,
      },
    ]);
  };

  // Fetch the chat response
  useEffect(() => {
    const fetchChatResponse = async () => {
      setLoading(true);
      try {
        const ids = activeFiles.map((file) => file._id); // Collect file IDs
        console.log("Sending IDs to query:", ids); // Log the IDs being sent

        const response = await fetch("/api/query", {
          method: "POST",
          body: JSON.stringify({
            query,
            ids, // Pass multiple file IDs
          }),
          headers: {
            "Content-type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          updateLastChat(query, data.response);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "An error occurred while fetching the response.");
        }
      } catch (error) {
        console.error("Error fetching chat response:", error);
        toast.error("An error occurred while processing your query.");
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchChatResponse();
    }
  }, [query]);

  return (
    <div className="border h-full flex flex-col">
      {/* File Header */}
      <div className="flex flex-col border text-center py-1 bg-[#ef8e38] text-white">
        {activeFiles && activeFiles.length > 0
          ? activeFiles.map((file) => file.fileName).join(", ")
          : "Choose files to start chatting"}
      </div>

      {/* Chat Area */}
      <div className="border p-3 grow flex flex-col justify-end h-[calc(100vh-270px)]">
        {activeFiles && activeFiles.length > 0 ? (
          activeFiles.some((file) => !file.isProcessed) ? (
            <FileNotProcessedAlert ids={activeFiles.map((file) => file._id)} />
          ) : chat.length > 0 ? (
            <div ref={divRef} className="overflow-auto">
              {chat.map(({ query, response }, index) => (
                <Chat
                  key={index}
                  query={query}
                  response={loading && index === chat.length - 1 && !response ? "Typing..." : response}
                />
              ))}
              <div ref={divRef} />
            </div>
          ) : (
            <ReadyAlert />
          )
        ) : (
          <ChooseFileAlert />
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="border p-3 flex justify-between items-center space-x-2">
          <input
            name="query"
            className="w-full m-0 outline-0"
            placeholder={loading ? "Typing..." : "Type here..."}
            disabled={loading}
          />
          <button
            type="submit"
            className="inline-block rounded-full p-1 text-primary-main outline-0"
            disabled={loading}
          >
            <MdSend size={24} />
          </button>
        </div>
      </form>
    </div>
  );
}
