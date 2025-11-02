import { useState, useEffect } from "react";
import { Mail, Clock, User, MessageSquare, Trash2 } from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";

const MessagesHandlePage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/users/messages");

      const receivedMessages = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setMessages(receivedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages. Please try again.");
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!messageId) return;

    try {
      setDeletingId(messageId);
      await axiosInstance.delete(`/users/messages/${messageId}`);
      setMessages(messages.filter((msg) => msg._id !== messageId));
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Received Messages</h1>
        <button
          onClick={fetchMessages}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center">
          <Mail className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Error loading messages
          </h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            No messages yet
          </h2>
          <p className="text-blue-700">
            Messages sent through your contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message._id || Math.random().toString(36).substring(2, 9)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 flex items-center mb-2">
                    <MessageSquare className="mr-2 text-blue-600" size={20} />
                    {message.subject || "No subject"}
                  </h3>
                  <p className="text-gray-600 flex items-center">
                    <User className="mr-2 text-blue-600" size={16} />
                    {message.name || "Anonymous"} •{" "}
                    {message.msgEmail || "No email"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="mr-1" size={16} />
                    {message.createdAt
                      ? formatDate(message.createdAt)
                      : "Unknown date"}
                  </span>
                  <button
                    onClick={() => handleDelete(message._id)}
                    disabled={deletingId === message._id}
                    className="text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-50"
                    title="Delete message"
                  >
                    {deletingId === message._id ? (
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-red-500 rounded-full"></div>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 rounded p-4 mt-4">
                <p className="text-gray-800 whitespace-pre-line">
                  {message.message || "No message content"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesHandlePage;
