import { useState, useEffect } from "react";
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  GraduationCap,
  School,
  BookOpen,
} from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const ProfileSection = () => {
  const { authUser } = useAuthStore();
  const [profile, setProfile] = useState({
    education: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/users/academic-profile");
      setProfile(
        response.data.data || {
          education: [],
        }
      );
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedEducation = [...profile.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setProfile({ ...profile, education: updatedEducation });
  };

  const addNewEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...profile.education,
        { degree: "", institution: "", year: "", type: "school" },
      ],
    });
  };

  const removeEducation = (index) => {
    const updatedEducation = profile.education.filter((_, i) => i !== index);
    setProfile({ ...profile, education: updatedEducation });
  };

  const validateEducation = () => {
    for (const edu of profile.education) {
      if (!edu.degree.trim() || !edu.institution.trim() || !edu.year.trim()) {
        toast.error(
          "All education entries must have degree, institution, and year"
        );
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateEducation()) return;

    setIsLoading(true);
    try {
      await axiosInstance.put("/users/academic-profile", {
        education: profile.education,
      });
      setIsEditing(false);
      toast.success("Education updated successfully");
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error(
        error.response?.data?.message || "Failed to update education"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
  };

  const getEducationIcon = (type) => {
    switch (type) {
      case "college":
        return <GraduationCap className="text-purple-600" size={18} />;
      case "university":
        return <School className="text-blue-600" size={18} />;
      default:
        return <BookOpen className="text-green-600" size={18} />;
    }
  };

  const getEducationText = (edu) => {
    const institution = edu.institution;
    const degree = edu.degree;
    const year = edu.year;

    if (edu.type === "school") {
      return `Went to ${institution}`;
    } else if (edu.type === "college") {
      return `Studied ${degree} at ${institution}`;
    } else {
      return `Studied ${degree} at ${institution}`;
    }
  };

  if (isLoading && !isEditing) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Loading education...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Education</h2>
          {authUser &&
            authUser.role === "admin" &&
            (isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-70 text-sm"
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
                      <Save size={16} className="mr-1" /> Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <X size={16} className="mr-1" /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Edit size={16} className="mr-1" /> Edit
              </button>
            ))}
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center p-4 border-b border-gray-100">
            <GraduationCap className="text-blue-600 mr-3" size={20} />
            <h3 className="text-lg font-medium text-gray-800">Education</h3>
            {isEditing && (
              <button
                onClick={addNewEducation}
                className="ml-auto flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors text-xs"
              >
                <Plus size={14} className="mr-1" /> Add
              </button>
            )}
          </div>

          <div className="p-4">
            {profile.education.length === 0 ? (
              <div className="text-center py-6">
                <GraduationCap
                  className="mx-auto text-gray-400 mb-2"
                  size={32}
                />
                <p className="text-gray-500 text-sm">
                  {isEditing
                    ? "Add your education history"
                    : "No education information available"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.education.map((edu, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      isEditing
                        ? "bg-gray-50 border border-gray-200"
                        : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={edu.type || "school"}
                              onChange={(e) =>
                                handleInputChange(index, "type", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="school">School</option>
                              <option value="college">College</option>
                              <option value="university">University</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Year*
                            </label>
                            <input
                              value={edu.year}
                              onChange={(e) =>
                                handleInputChange(index, "year", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., 2015-2019"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Institution*
                          </label>
                          <input
                            value={edu.institution}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "institution",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., University Name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Degree/Description*
                          </label>
                          <input
                            value={edu.degree}
                            onChange={(e) =>
                              handleInputChange(index, "degree", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., BSc in Computer Science"
                            required
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-red-600 hover:text-red-800 flex items-center bg-red-50 px-2 py-1.5 rounded text-xs"
                          >
                            <Trash2 size={14} className="mr-1" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getEducationIcon(edu.type || "school")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm font-normal leading-5">
                            {getEducationText(edu)}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {edu.year}
                          </p>
                          {edu.degree &&
                            (edu.type === "college" ||
                              edu.type === "university") && (
                              <p className="text-gray-600 text-xs mt-1">
                                {edu.degree}
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Example Preview */}
        {!isEditing && profile.education.length === 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              How it will look:
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <BookOpen className="text-green-600 mt-0.5" size={18} />
                <div>
                  <p className="text-gray-900 text-sm font-normal">
                    Went to Shombhugonj UC School
                  </p>
                  <p className="text-gray-500 text-xs">2010-2015</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BookOpen className="text-green-600 mt-0.5" size={18} />
                <div>
                  <p className="text-gray-900 text-sm font-normal">
                    Went to Shombhugonj Degree College
                  </p>
                  <p className="text-gray-500 text-xs">2015-2017</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <GraduationCap className="text-purple-600 mt-0.5" size={18} />
                <div>
                  <p className="text-gray-900 text-sm font-normal">
                    Studied BSc in Computer Science at University of Example
                  </p>
                  <p className="text-gray-500 text-xs">2017-2021</p>
                  <p className="text-gray-600 text-xs mt-1">
                    BSc in Computer Science
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileSection;
