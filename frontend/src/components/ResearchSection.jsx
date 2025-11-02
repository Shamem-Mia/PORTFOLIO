import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  FileText,
  Download,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const ResearchSection = () => {
  const { authUser } = useAuthStore();
  const [researchPapers, setResearchPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    publishedDate: "",
    publisher: "",
    authors: [""],
    doi: "",
    tags: [""],
    pdfFile: null,
  });

  useEffect(() => {
    fetchResearchPapers();
  }, []);

  const fetchResearchPapers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/researchAchievement/research");
      setResearchPapers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching research papers:", error);
      toast.error("Failed to load research papers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (field, index) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData({ ...formData, pdfFile: file });
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      publishedDate: "",
      publisher: "",
      authors: [""],
      doi: "",
      tags: [""],
      pdfFile: null,
    });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.publishedDate ||
      !formData.publisher
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!formData.pdfFile && editingIndex === null) {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "authors" || key === "tags") {
          formData[key].forEach((item, index) => {
            if (item.trim()) {
              submitData.append(`${key}[${index}]`, item);
            }
          });
        } else if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      if (editingIndex !== null) {
        await axiosInstance.put(
          `/researchAchievement/research/${researchPapers[editingIndex]._id}`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Research paper updated successfully");
      } else {
        await axiosInstance.post("/researchAchievement/research", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Research paper added successfully");
      }

      resetForm();
      fetchResearchPapers();
    } catch (error) {
      console.error("Error saving research paper:", error);
      toast.error("Failed to save research paper");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (index) => {
    const paper = researchPapers[index];
    setFormData({
      title: paper.title,
      description: paper.description,
      publishedDate: paper.publishedDate.split("T")[0],
      publisher: paper.publisher,
      authors: paper.authors.length > 0 ? paper.authors : [""],
      doi: paper.doi || "",
      tags: paper.tags.length > 0 ? paper.tags : [""],
      pdfFile: null,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this research paper?"))
      return;

    setIsLoading(true);
    try {
      await axiosInstance.delete(`/researchAchievement/research/${id}`);
      toast.success("Research paper deleted successfully");
      fetchResearchPapers();
    } catch (error) {
      console.error("Error deleting research paper:", error);
      toast.error("Failed to delete research paper");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (paper) => {
    try {
      // Use the download endpoint instead of direct Cloudinary URL
      const response = await axiosInstance.get(
        `/researchAchievement/research/${paper._id}/download`,
        {
          responseType: "blob", // Important for file downloads
        }
      );

      // Create blob URL
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${paper.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  if (isLoading && !showForm) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading research papers...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Research Publications
          </h2>
          {authUser && authUser.role === "admin" && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="mr-1" /> Add Research Paper
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">
              {editingIndex !== null
                ? "Edit Research Paper"
                : "Add New Research Paper"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Published Date *
                  </label>
                  <input
                    type="date"
                    value={formData.publishedDate}
                    onChange={(e) =>
                      handleInputChange("publishedDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publisher *
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) =>
                      handleInputChange("publisher", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authors
                </label>
                {formData.authors.map((author, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) =>
                        handleArrayChange("authors", index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Author ${index + 1}`}
                    />
                    {formData.authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("authors", index)}
                        className="ml-2 text-red-600 hover:text-red-800 px-3"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("authors")}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus size={14} className="mr-1" /> Add Author
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) =>
                        handleArrayChange("tags", index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Machine Learning, AI"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("tags", index)}
                        className="ml-2 text-red-600 hover:text-red-800 px-3"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("tags")}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus size={14} className="mr-1" /> Add Tag
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DOI
                </label>
                <input
                  type="text"
                  value={formData.doi}
                  onChange={(e) => handleInputChange("doi", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10.1000/182"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Research Paper (PDF) {editingIndex === null && "*"}
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {editingIndex === null
                    ? "Please upload your research paper in PDF format"
                    : "Leave empty to keep the current file"}
                </p>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
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
                  type="button"
                  onClick={resetForm}
                  className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <X size={18} className="mr-1" /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {researchPapers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FileText className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-500 text-lg">
              No research papers added yet
            </p>
            {authUser && authUser.role === "admin" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
              >
                <Plus size={18} className="mr-1" /> Add Your First Research
                Paper
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {researchPapers.map((paper, index) => (
              <div
                key={paper._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900 mb-2">
                      {paper.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{paper.description}</p>
                  </div>
                  {authUser && authUser.role === "admin" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(paper._id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      Published:{" "}
                      {new Date(paper.publishedDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User size={16} className="mr-2" />
                      Publisher: {paper.publisher}
                    </div>
                    {paper.doi && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText size={16} className="mr-2" />
                        DOI: {paper.doi}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {paper.authors.length > 0 && (
                      <div className="flex items-start text-sm text-gray-600">
                        <User size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>Authors: {paper.authors.join(", ")}</span>
                      </div>
                    )}
                    {paper.tags.length > 0 && (
                      <div className="flex items-start text-sm text-gray-600">
                        <Tag size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {paper.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {paper.pdfFile?.url && (
                  <button
                    onClick={() => handleDownload(paper)}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download size={18} className="mr-2" />
                    Download Research Paper
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ResearchSection;
