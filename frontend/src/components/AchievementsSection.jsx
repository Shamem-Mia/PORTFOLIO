import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  Award,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Eye,
  ExternalLink,
  User,
  Target,
  Star,
} from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const AchievementsSection = () => {
  const { authUser } = useAuthStore();
  const [achievements, setAchievements] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    place: "",
    event: "",
    position: "",
    category: "academic",
    photo: null,
    // Detailed fields
    detailedDescription: "",
    skills: "",
    outcomes: "",
    link: "",
    teamMembers: "",
    technologies: "",
    challenges: "",
    impact: "",
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        "/researchAchievement/achievements"
      );
      setAchievements(response.data.data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      place: "",
      event: "",
      position: "",
      category: "academic",
      photo: null,
      detailedDescription: "",
      skills: "",
      outcomes: "",
      link: "",
      teamMembers: "",
      technologies: "",
      challenges: "",
      impact: "",
    });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.place ||
      !formData.event
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      if (editingIndex !== null) {
        await axiosInstance.put(
          `/researchAchievement/achievements/${achievements[editingIndex]._id}`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Achievement updated successfully");
      } else {
        await axiosInstance.post(
          "/researchAchievement/achievements",
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Achievement added successfully");
      }

      resetForm();
      fetchAchievements();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast.error("Failed to save achievement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (index) => {
    const achievement = achievements[index];
    setFormData({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date.split("T")[0],
      place: achievement.place,
      event: achievement.event,
      position: achievement.position,
      category: achievement.category,
      photo: null,
      detailedDescription: achievement.detailedDescription || "",
      skills: achievement.skills || "",
      outcomes: achievement.outcomes || "",
      link: achievement.link || "",
      teamMembers: achievement.teamMembers || "",
      technologies: achievement.technologies || "",
      challenges: achievement.challenges || "",
      impact: achievement.impact || "",
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement?"))
      return;

    setIsLoading(true);
    try {
      await axiosInstance.delete(`/researchAchievement/achievements/${id}`);
      toast.success("Achievement deleted successfully");
      fetchAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    } finally {
      setIsLoading(false);
    }
  };

  const openDetails = (achievement) => {
    setSelectedAchievement(achievement);
  };

  const closeDetails = () => {
    setSelectedAchievement(null);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "sports":
        return <Trophy className="text-green-600" size={20} />;
      case "cultural":
        return <Users className="text-purple-600" size={20} />;
      case "competition":
        return <Award className="text-yellow-600" size={20} />;
      default:
        return <Award className="text-blue-600" size={20} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "sports":
        return "bg-green-100 text-green-800";
      case "cultural":
        return "bg-purple-100 text-purple-800";
      case "competition":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading && !showForm) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading achievements...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Achievements
          </h2>
          {authUser && authUser.role === "admin" && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="mr-1" /> Add Achievement
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">
              {editingIndex !== null
                ? "Edit Achievement"
                : "Add New Achievement"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="competition">Competition</option>
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
                  placeholder="Brief overview of the achievement"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place *
                  </label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => handleInputChange("place", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event *
                  </label>
                  <input
                    type="text"
                    value={formData.event}
                    onChange={(e) => handleInputChange("event", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position/Rank
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1st Place, Runner-up"
                  />
                </div>
              </div>

              {/* Detailed Information Fields */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-3">
                  Detailed Information (Optional)
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detailed Description
                    </label>
                    <textarea
                      value={formData.detailedDescription}
                      onChange={(e) =>
                        handleInputChange("detailedDescription", e.target.value)
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Comprehensive description of the achievement, process, and significance"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Skills Used/Developed
                      </label>
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={(e) =>
                          handleInputChange("skills", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Leadership, Problem Solving, Technical Skills"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Technologies/Tools
                      </label>
                      <input
                        type="text"
                        value={formData.technologies}
                        onChange={(e) =>
                          handleInputChange("technologies", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., React, Node.js, Python"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Challenges Overcome
                      </label>
                      <input
                        type="text"
                        value={formData.challenges}
                        onChange={(e) =>
                          handleInputChange("challenges", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Technical limitations, Time constraints"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Impact & Outcomes
                      </label>
                      <input
                        type="text"
                        value={formData.impact}
                        onChange={(e) =>
                          handleInputChange("impact", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Published paper, Community impact, Personal growth"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Members
                      </label>
                      <input
                        type="text"
                        value={formData.teamMembers}
                        onChange={(e) =>
                          handleInputChange("teamMembers", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., John Doe, Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Related Link
                      </label>
                      <input
                        type="url"
                        value={formData.link}
                        onChange={(e) =>
                          handleInputChange("link", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

        {achievements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Award className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-500 text-lg">
              No achievements added yet
            </p>
            {authUser && authUser.role === "admin" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
              >
                <Plus size={18} className="mr-1" /> Add Your First Achievement
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={achievement._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {achievement.photo?.url && (
                  <img
                    src={achievement.photo.url}
                    alt={achievement.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {getCategoryIcon(achievement.category)}
                      <h3 className="font-semibold text-lg ml-2">
                        {achievement.title}
                      </h3>
                    </div>
                    {authUser && authUser.role === "admin" && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(achievement._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        achievement.category
                      )}`}
                    >
                      {achievement.category}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {achievement.description}
                  </p>

                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      {new Date(achievement.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2" />
                      {achievement.place}
                    </div>
                    <div className="flex items-center">
                      <Users size={14} className="mr-2" />
                      {achievement.event}
                    </div>
                    {achievement.position && (
                      <div className="flex items-center text-green-600 font-medium">
                        <Trophy size={14} className="mr-2" />
                        {achievement.position}
                      </div>
                    )}
                  </div>

                  {/* See Details Button */}
                  <button
                    onClick={() => openDetails(achievement)}
                    className="flex items-center justify-center w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Eye size={16} className="mr-2" />
                    See Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievement Details Modal */}
        {selectedAchievement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {selectedAchievement.photo?.url && (
                  <img
                    src={selectedAchievement.photo.url}
                    alt={selectedAchievement.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                )}
                <button
                  onClick={closeDetails}
                  className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedAchievement.title}
                    </h2>
                    <div className="flex items-center mt-2 space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                          selectedAchievement.category
                        )}`}
                      >
                        {getCategoryIcon(selectedAchievement.category)}
                        <span className="ml-1 capitalize">
                          {selectedAchievement.category}
                        </span>
                      </span>
                      {selectedAchievement.position && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Trophy size={14} className="mr-1" />
                          {selectedAchievement.position}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={18} className="mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p>
                          {new Date(
                            selectedAchievement.date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={18} className="mr-3 text-green-500" />
                      <div>
                        <p className="font-medium">Place</p>
                        <p>{selectedAchievement.place}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Users size={18} className="mr-3 text-purple-500" />
                      <div>
                        <p className="font-medium">Event</p>
                        <p>{selectedAchievement.event}</p>
                      </div>
                    </div>
                    {selectedAchievement.teamMembers && (
                      <div className="flex items-center text-gray-600">
                        <User size={18} className="mr-3 text-orange-500" />
                        <div>
                          <p className="font-medium">Team Members</p>
                          <p>{selectedAchievement.teamMembers}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600">
                      {selectedAchievement.description}
                    </p>
                  </div>

                  {selectedAchievement.detailedDescription && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Detailed Description
                      </h3>
                      <p className="text-gray-600">
                        {selectedAchievement.detailedDescription}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {selectedAchievement.skills && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                          <Star size={18} className="mr-2 text-yellow-500" />
                          Skills Developed
                        </h3>
                        <p className="text-gray-600">
                          {selectedAchievement.skills}
                        </p>
                      </div>
                    )}

                    {selectedAchievement.technologies && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                          <Target size={18} className="mr-2 text-red-500" />
                          Technologies Used
                        </h3>
                        <p className="text-gray-600">
                          {selectedAchievement.technologies}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedAchievement.challenges && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Challenges Overcome
                      </h3>
                      <p className="text-gray-600">
                        {selectedAchievement.challenges}
                      </p>
                    </div>
                  )}

                  {selectedAchievement.impact && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Impact & Outcomes
                      </h3>
                      <p className="text-gray-600">
                        {selectedAchievement.impact}
                      </p>
                    </div>
                  )}

                  {selectedAchievement.link && (
                    <div>
                      <a
                        href={selectedAchievement.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <ExternalLink size={18} className="mr-2" />
                        View Related Link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AchievementsSection;
