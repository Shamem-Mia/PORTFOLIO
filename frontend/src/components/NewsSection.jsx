import { useState, useEffect } from "react";
import { Calendar, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const NewsSection = () => {
  const { authUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const fetchNewsItems = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/users/news");
      setNewsItems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching news items:", error);
      toast.error(error.response?.data?.message || "Failed to load news items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedItems = [...newsItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewsItems(updatedItems);
  };

  const addNewItem = () => {
    setNewsItems([
      ...newsItems,
      {
        date: new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        title: "",
        description: "",
        link: "",
        isNew: true, // Mark as new for backend
      },
    ]);
  };

  const removeItem = async (index) => {
    const item = newsItems[index];
    // If item has an ID, we should probably mark it for deletion in backend
    if (item._id && !item.isNew) {
      try {
        setIsLoading(true);
        await axiosInstance.delete(`/users/news/${item._id}`);
        const updatedItems = newsItems.filter((_, i) => i !== index);
        setNewsItems(updatedItems);
        toast.success("News item deleted successfully");
      } catch (error) {
        console.error("Error deleting news item:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete news item"
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Just remove from local state if it was never saved
      const updatedItems = newsItems.filter((_, i) => i !== index);
      setNewsItems(updatedItems);
    }
  };

  const validateNewsItems = () => {
    for (const item of newsItems) {
      if (!item.title.trim() || !item.description.trim()) {
        toast.error("Title and description are required for all news items");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateNewsItems()) return;

    setIsLoading(true);
    try {
      await axiosInstance.put("/users/news", { newsItems });
      setIsEditing(false);
      fetchNewsItems(); // Refresh to get proper IDs if any
      toast.success("News items updated successfully");
    } catch (error) {
      console.error("Error saving news items:", error);
      toast.error(
        error.response?.data?.message || "Failed to update news items"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchNewsItems();
    setIsEditing(false);
  };

  if (isLoading && !isEditing) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading news items...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900">News & Updates</h2>
          {authUser?.role === "admin" &&
            (isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-1" /> Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <X size={18} className="mr-1" /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit size={18} className="mr-1" /> Edit
              </button>
            ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {newsItems.length === 0 && !isEditing ? (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No news items available</p>
              {authUser?.role === "admin" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 flex items-center justify-center mx-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} className="mr-1" /> Add News Item
                </button>
              )}
            </div>
          ) : (
            newsItems.map((news, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition h-full flex flex-col"
              >
                {isEditing ? (
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center">
                      <Calendar className="text-blue-800 mr-2" size={18} />
                      <input
                        value={news.date}
                        onChange={(e) =>
                          handleInputChange(index, "date", e.target.value)
                        }
                        className="text-sm font-medium text-blue-800 bg-transparent border-b border-blue-200 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        value={news.title}
                        onChange={(e) =>
                          handleInputChange(index, "title", e.target.value)
                        }
                        className="w-full text-xl font-semibold mb-2 text-blue-900 bg-transparent border-b border-blue-200 focus:border-blue-500 focus:outline-none"
                        placeholder="News title*"
                        required
                      />
                    </div>
                    <div className="flex-grow">
                      <textarea
                        value={news.description}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full h-full min-h-[100px] text-gray-700 bg-transparent border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none"
                        placeholder="News description*"
                        required
                      />
                    </div>
                    <div>
                      <input
                        value={news.link || ""}
                        onChange={(e) =>
                          handleInputChange(index, "link", e.target.value)
                        }
                        className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        placeholder="Link (optional)"
                        type="url"
                      />
                    </div>

                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center mt-2"
                    >
                      <Trash2 size={16} className="mr-1" /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-3">
                      <Calendar className="text-blue-800 mr-2" size={18} />
                      <span className="text-sm font-medium text-blue-800">
                        {news.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-blue-900">
                      {news.title}
                    </h3>
                    <p className="text-gray-700 mb-4 flex-grow">
                      {news.description}
                    </p>
                    {news.link && (
                      <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Read more →
                      </a>
                    )}
                  </>
                )}
              </div>
            ))
          )}
          {isEditing && (
            <div className="bg-blue-50 p-6 rounded-lg shadow-md border-2 border-dashed border-blue-200 flex items-center justify-center min-h-[300px]">
              <button
                onClick={addNewItem}
                className="text-blue-700 hover:text-blue-900 flex flex-col items-center"
              >
                <Plus size={24} className="mb-2" />
                <span>Add News Item</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
