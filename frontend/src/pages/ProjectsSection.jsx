import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  Calendar,
  Users,
  Code,
  ExternalLink,
  Github,
  Filter,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const ProjectsSection = () => {
  const { authUser } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    detailedDescription: "",
    technologies: [],
    category: "Undergraduate",
    projectDate: "",
    teamMembers: [],
    githubLink: "",
    liveDemoLink: "",
    featured: false,
    images: [],
    newImages: [],
    existingImages: [],
  });

  const [techInput, setTechInput] = useState("");
  const [teamMemberInput, setTeamMemberInput] = useState({
    name: "",
    role: "",
  });

  const categories = [
    { value: "all", label: "All Projects" },
    { value: "Undergraduate", label: "Undergraduate" },
    { value: "personal", label: "Personal" },
    { value: "professional", label: "Professional" },
    { value: "research", label: "Research" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchProjects();
  }, [categoryFilter, currentPage]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/projects", {
        params: {
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          page: currentPage,
          limit: 9,
        },
      });
      setProjects(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectDetails = async (id) => {
    try {
      const response = await axiosInstance.get(`/projects/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to load project details");
      return null;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Array.isArray(value) ? value : [value],
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.error("Maximum 10 images allowed");
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

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const removeTechnology = (index) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const addTeamMember = () => {
    if (teamMemberInput.name.trim() && teamMemberInput.role.trim()) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { ...teamMemberInput }],
      }));
      setTeamMemberInput({ name: "", role: "" });
    }
  };

  const removeTeamMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      detailedDescription: "",
      technologies: [],
      category: "Undergraduate",
      projectDate: "",
      teamMembers: [],
      githubLink: "",
      liveDemoLink: "",
      featured: false,
      images: [],
      newImages: [],
      existingImages: [],
    });
    setTechInput("");
    setTeamMemberInput({ name: "", role: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.detailedDescription ||
      !formData.projectDate
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
        // Update existing project
        await axiosInstance.put(`/projects/${editingId}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project updated successfully");
      } else {
        // Create new project
        await axiosInstance.post("/projects", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project added successfully");
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      detailedDescription: project.detailedDescription,
      technologies: project.technologies || [],
      category: project.category,
      projectDate: project.projectDate.split("T")[0],
      teamMembers: project.teamMembers || [],
      githubLink: project.githubLink || "",
      liveDemoLink: project.liveDemoLink || "",
      featured: project.featured || false,
      images: project.images || [],
      newImages: [],
      existingImages: project.images || [],
    });
    setEditingId(project._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    setIsLoading(true);
    try {
      await axiosInstance.delete(`/projects/${id}`);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (project) => {
    const detailedProject = await fetchProjectDetails(project._id);
    if (detailedProject) {
      setSelectedProject(detailedProject);
      setShowDetails(true);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "personal":
        return "bg-green-100 text-green-800";
      case "professional":
        return "bg-purple-100 text-purple-800";
      case "research":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && !showForm && !showDetails) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Projects</h2>

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
                <Plus size={18} className="mr-1" /> Add Project
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Project" : "Add New Project"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
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
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="personal">Personal</option>
                    <option value="professional">Professional</option>
                    <option value="research">Research</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description for project cards..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) =>
                    handleInputChange("detailedDescription", e.target.value)
                  }
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Complete project details for the detailed view..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Date *
                  </label>
                  <input
                    type="date"
                    value={formData.projectDate}
                    onChange={(e) =>
                      handleInputChange("projectDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    Featured Project
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies Used
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(index)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTechnology())
                    }
                    placeholder="Add technology..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members
                </label>
                <div className="space-y-2 mb-2">
                  {formData.teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                    >
                      <span className="text-sm">
                        <strong>{member.name}</strong> - {member.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={teamMemberInput.name}
                    onChange={(e) =>
                      setTeamMemberInput((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Member name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={teamMemberInput.role}
                    onChange={(e) =>
                      setTeamMemberInput((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    placeholder="Role"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Add Team Member
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Link
                  </label>
                  <input
                    type="url"
                    value={formData.githubLink}
                    onChange={(e) =>
                      handleInputChange("githubLink", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    value={formData.liveDemoLink}
                    onChange={(e) =>
                      handleInputChange("liveDemoLink", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://your-project.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Images (Max 10)
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
                            alt={`Project ${index + 1}`}
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
                  You can select multiple images. Maximum 10 images allowed.
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

        {/* Project Details Modal */}
        {showDetails && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedProject.title}
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Image Gallery */}
                {selectedProject.images &&
                  selectedProject.images.length > 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedProject.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`${selectedProject.title} ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                          />
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
                        {selectedProject.detailedDescription}
                      </p>
                    </div>

                    {selectedProject.technologies &&
                      selectedProject.technologies.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">
                            Technologies Used
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.technologies.map((tech, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Project Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-500 mr-2" />
                          <span>
                            {new Date(
                              selectedProject.projectDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Code size={16} className="text-gray-500 mr-2" />
                          <span className="capitalize">
                            {selectedProject.category}
                          </span>
                        </div>
                        {selectedProject.featured && (
                          <div className="flex items-center text-yellow-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Featured Project
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedProject.teamMembers &&
                      selectedProject.teamMembers.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-700 mb-3">
                            Team Members
                          </h4>
                          <div className="space-y-2">
                            {selectedProject.teamMembers.map(
                              (member, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="font-medium">
                                    {member.name}
                                  </span>
                                  <span className="text-gray-600">
                                    {member.role}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {(selectedProject.githubLink ||
                      selectedProject.liveDemoLink) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Links
                        </h4>
                        <div className="space-y-2">
                          {selectedProject.githubLink && (
                            <a
                              href={selectedProject.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <Github size={16} className="mr-2" />
                              GitHub Repository
                            </a>
                          )}
                          {selectedProject.liveDemoLink && (
                            <a
                              href={selectedProject.liveDemoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink size={16} className="mr-2" />
                              Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Code className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-500 text-lg">No projects found</p>
            {authUser && authUser.role === "admin" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
              >
                <Plus size={18} className="mr-1" /> Add Your First Project
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {project.images && project.images.length > 0 && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={project.images[0].url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      {project.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          <ImageIcon size={12} className="inline mr-1" />
                          {project.images.length}
                        </div>
                      )}
                      {project.featured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                        {project.title}
                      </h3>
                      {authUser && authUser.role === "admin" && (
                        <div className="flex space-x-1 ml-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
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
                          project.category
                        )}`}
                      >
                        {project.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(project.projectDate).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.technologies
                            .slice(0, 3)
                            .map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                              +{project.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleViewDetails(project)}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye size={16} className="mr-1" />
                        See Details
                      </button>
                      <div className="flex space-x-2">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Github size={18} />
                          </a>
                        )}
                        {project.liveDemoLink && (
                          <a
                            href={project.liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
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

export default ProjectsSection;
