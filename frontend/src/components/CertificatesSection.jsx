import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  Calendar,
  Building,
  Award,
  ExternalLink,
  Filter,
  Eye,
  Image as ImageIcon,
  Clock,
  Hash,
} from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const CertificatesSection = () => {
  const { authUser } = useAuthStore();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issuingOrganization: "",
    issueDate: "",
    expirationDate: "",
    category: "professional",
    skills: [],
    credentialId: "",
    credentialUrl: "",
    featured: false,
    images: [],
    newImages: [],
    existingImages: [],
  });

  const [skillInput, setSkillInput] = useState("");

  const categories = [
    { value: "all", label: "All Certificates" },
    { value: "academic", label: "Academic" },
    { value: "professional", label: "Professional" },
    { value: "online-course", label: "Online Course" },
    { value: "workshop", label: "Workshop" },
    { value: "competition", label: "Competition" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchCertificates();
  }, [categoryFilter, currentPage]);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/certificates", {
        params: {
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          page: currentPage,
          limit: 12,
        },
      });
      setCertificates(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCertificateDetails = async (id) => {
    try {
      const response = await axiosInstance.get(`/certificates/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      toast.error("Failed to load certificate details");
      return null;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      newImages: files,
    }));
  };

  const removeImage = (index, isNew = false) => {
    if (isNew) {
      setFormData((prev) => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
      }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      issuingOrganization: "",
      issueDate: "",
      expirationDate: "",
      category: "professional",
      skills: [],
      credentialId: "",
      credentialUrl: "",
      featured: false,
      images: [],
      newImages: [],
      existingImages: [],
    });
    setSkillInput("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.issuingOrganization ||
      !formData.issueDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();

      // Append basic fields
      Object.keys(formData).forEach((key) => {
        if (
          key !== "newImages" &&
          key !== "existingImages" &&
          key !== "images"
        ) {
          if (Array.isArray(formData[key])) {
            submitData.append(key, JSON.stringify(formData[key]));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Append existing images for update
      if (editingId) {
        submitData.append(
          "existingImages",
          JSON.stringify(formData.existingImages)
        );
      }

      // Append new images
      formData.newImages.forEach((file) => {
        submitData.append("images", file);
      });

      if (editingId) {
        // Update existing certificate
        await axiosInstance.put(`/certificates/${editingId}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Certificate updated successfully");
      } else {
        // Create new certificate
        await axiosInstance.post("/certificates", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Certificate added successfully");
      }

      resetForm();
      fetchCertificates();
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast.error("Failed to save certificate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (certificate) => {
    setFormData({
      title: certificate.title,
      description: certificate.description,
      issuingOrganization: certificate.issuingOrganization,
      issueDate: certificate.issueDate.split("T")[0],
      expirationDate: certificate.expirationDate
        ? certificate.expirationDate.split("T")[0]
        : "",
      category: certificate.category,
      skills: certificate.skills || [],
      credentialId: certificate.credentialId || "",
      credentialUrl: certificate.credentialUrl || "",
      featured: certificate.featured || false,
      images: certificate.images || [],
      newImages: [],
      existingImages: certificate.images || [],
    });
    setEditingId(certificate._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this certificate?"))
      return;

    setIsLoading(true);
    try {
      await axiosInstance.delete(`/certificates/${id}`);
      toast.success("Certificate deleted successfully");
      fetchCertificates();
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Failed to delete certificate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (certificate) => {
    const detailedCertificate = await fetchCertificateDetails(certificate._id);
    if (detailedCertificate) {
      setSelectedCertificate(detailedCertificate);
      setShowDetails(true);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "professional":
        return "bg-green-100 text-green-800";
      case "online-course":
        return "bg-purple-100 text-purple-800";
      case "workshop":
        return "bg-orange-100 text-orange-800";
      case "competition":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const getStatusColor = (certificate) => {
    if (!certificate.expirationDate) return "text-green-600";
    return isExpired(certificate.expirationDate)
      ? "text-red-600"
      : "text-green-600";
  };

  const getStatusText = (certificate) => {
    if (!certificate.expirationDate) return "No Expiry";
    return isExpired(certificate.expirationDate) ? "Expired" : "Valid";
  };

  if (isLoading && !showForm && !showDetails) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading certificates...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Courses and Certificates
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-300">
              <Filter size={18} className="text-gray-500 mr-2" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none focus:outline-none focus:ring-0"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {authUser && authUser.role === "admin" && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} className="mr-1" /> Add Certificate
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Certificate" : "Add New Certificate"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificate Title *
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
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.issuingOrganization}
                    onChange={(e) =>
                      handleInputChange("issuingOrganization", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
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
                  placeholder="Describe what this certificate represents and what you learned..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      handleInputChange("expirationDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="academic">Academic</option>
                    <option value="online-course">Online Course</option>
                    <option value="workshop">Workshop</option>
                    <option value="competition">Competition</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={formData.credentialId}
                    onChange={(e) =>
                      handleInputChange("credentialId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ABC123XYZ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credential URL
                  </label>
                  <input
                    type="url"
                    value={formData.credentialUrl}
                    onChange={(e) =>
                      handleInputChange("credentialUrl", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/verify/credential"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Technologies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                    placeholder="Add skill or technology..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    handleInputChange("featured", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Featured Certificate
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Images (Max 5)
                </label>

                {/* Existing Images */}
                {formData.existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Current Images:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {formData.existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Certificate ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, false)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {formData.newImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      New Images to Upload:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {formData.newImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, true)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can select multiple images. Maximum 5 images allowed.
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
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
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

        {/* Certificate Details Modal */}
        {showDetails && selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedCertificate.title}
                    </h3>
                    <p className="text-lg text-gray-600 mt-1">
                      {selectedCertificate.issuingOrganization}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Image Gallery */}
                {selectedCertificate.images &&
                  selectedCertificate.images.length > 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCertificate.images.map((image, index) => (
                          <div key={index} className="text-center">
                            <img
                              src={image.url}
                              alt={`${selectedCertificate.title} ${index + 1}`}
                              className="w-full h-auto max-h-96 object-contain rounded-lg border"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              Page {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Description
                      </h4>
                      <p className="text-gray-600 whitespace-pre-line">
                        {selectedCertificate.description}
                      </p>
                    </div>

                    {selectedCertificate.skills &&
                      selectedCertificate.skills.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">
                            Skills & Technologies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCertificate.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Certificate Details
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-500 mr-2" />
                          <div>
                            <div>
                              Issued:{" "}
                              {new Date(
                                selectedCertificate.issueDate
                              ).toLocaleDateString()}
                            </div>
                            {selectedCertificate.expirationDate && (
                              <div
                                className={`mt-1 ${getStatusColor(
                                  selectedCertificate
                                )}`}
                              >
                                Expires:{" "}
                                {new Date(
                                  selectedCertificate.expirationDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Building size={16} className="text-gray-500 mr-2" />
                          <span>{selectedCertificate.issuingOrganization}</span>
                        </div>
                        <div className="flex items-center">
                          <Award size={16} className="text-gray-500 mr-2" />
                          <span className="capitalize">
                            {selectedCertificate.category}
                          </span>
                        </div>
                        {selectedCertificate.credentialId && (
                          <div className="flex items-center">
                            <Hash size={16} className="text-gray-500 mr-2" />
                            <span>ID: {selectedCertificate.credentialId}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock
                            size={16}
                            className={`mr-2 ${getStatusColor(
                              selectedCertificate
                            )}`}
                          />
                          <span className={getStatusColor(selectedCertificate)}>
                            Status: {getStatusText(selectedCertificate)}
                          </span>
                        </div>
                        {selectedCertificate.featured && (
                          <div className="flex items-center text-yellow-600">
                            <Award size={16} className="mr-2" />
                            Featured Certificate
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedCertificate.credentialUrl && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Verification
                        </h4>
                        <a
                          href={selectedCertificate.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Verify Certificate
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {certificates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Award className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-500 text-lg">No certificates found</p>
            {authUser && authUser.role === "admin" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
              >
                <Plus size={18} className="mr-1" /> Add Your First Certificate
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {certificates.map((certificate) => (
                <div
                  key={certificate._id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {certificate.images && certificate.images.length > 0 && (
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={certificate.images[0].url}
                        alt={certificate.title}
                        className="w-full h-full object-contain p-2"
                      />
                      {certificate.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          <ImageIcon size={12} className="inline mr-1" />
                          {certificate.images.length}
                        </div>
                      )}
                      {certificate.featured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Featured
                        </div>
                      )}
                      <div
                        className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          certificate
                        )}`}
                      >
                        {getStatusText(certificate)}
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">
                        {certificate.title}
                      </h3>
                      {authUser && authUser.role === "admin" && (
                        <div className="flex space-x-1 ml-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(certificate)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(certificate._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          certificate.category
                        )}`}
                      >
                        {certificate.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {certificate.issuingOrganization}
                    </p>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {certificate.description}
                    </p>

                    {certificate.skills && certificate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {certificate.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {certificate.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            +{certificate.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleViewDetails(certificate)}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <Eye size={16} className="mr-1" />
                        View Details
                      </button>
                      {certificate.credentialUrl && (
                        <a
                          href={certificate.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800"
                          title="Verify Certificate"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CertificatesSection;
