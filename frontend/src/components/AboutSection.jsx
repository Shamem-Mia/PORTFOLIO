import { useState, useEffect } from "react";
import {
  GraduationCap,
  FileText,
  Award,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";
import ProfileSection from "./ProfileSection";

// Available icons for philosophies
const availableIcons = {
  GraduationCap: GraduationCap,
  FileText: FileText,
  Award: Award,
};

const AboutSection = () => {
  const { authUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aboutData, setAboutData] = useState({
    about: "",
    philosophies: [],
    cvUrl: "",
  });

  useEffect(() => {
    fetchAboutInfo();
  }, []);

  const fetchAboutInfo = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/users/about");
      setAboutData({
        about: response.data.data.about || "",
        philosophies: response.data.data.philosophies || [],
        cvUrl: response.data.data.cvUrl || "",
      });
    } catch (error) {
      console.error("Error fetching about info:", error);
      toast.error("Failed to load about information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setAboutData({ ...aboutData, [field]: value });
  };

  const handlePhilosophyChange = (index, field, value) => {
    const updatedPhilosophies = [...aboutData.philosophies];
    updatedPhilosophies[index] = {
      ...updatedPhilosophies[index],
      [field]: value,
    };
    setAboutData({ ...aboutData, philosophies: updatedPhilosophies });
  };

  const addNewPhilosophy = () => {
    setAboutData({
      ...aboutData,
      philosophies: [
        ...aboutData.philosophies,
        {
          title: "",
          description: "",
          icon: "GraduationCap",
          order: aboutData.philosophies.length,
        },
      ],
    });
  };

  const removePhilosophy = (index) => {
    const updatedPhilosophies = aboutData.philosophies.filter(
      (_, i) => i !== index
    );
    setAboutData({ ...aboutData, philosophies: updatedPhilosophies });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.put("/users/about", aboutData);
      setIsEditing(false);
      toast.success("About information updated successfully");
    } catch (error) {
      console.error("Error saving about info:", error);
      toast.error("Failed to update about information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchAboutInfo();
    setIsEditing(false);
  };

  if (isLoading && !isEditing) {
    return (
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading about information...</p>
          </div>
        </div>
      </section>
    );
  }

  const IconComponent = ({ iconName, ...props }) => {
    const Icon = availableIcons[iconName] || GraduationCap;
    return <Icon {...props} />;
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900">About Me</h2>
          {authUser &&
            authUser?.role === "admin" &&
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

        {/* Two Column Layout with increased profile width */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - ABOUT ME and MY PHILOSOPHY */}
          <div className="lg:w-1/2 space-y-8">
            {/* About Me Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-blue-900">
                About Me
              </h3>
              {isEditing ? (
                <textarea
                  value={aboutData.about}
                  onChange={(e) => handleInputChange("about", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-40"
                  placeholder="Write about yourself, your background, interests, and goals..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-line">
                  {aboutData.about || "No about information available."}
                </p>
              )}
            </div>

            {/* My Philosophy Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-blue-900">
                  My Philosophy
                </h3>
                {isEditing && (
                  <button
                    onClick={addNewPhilosophy}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Plus size={16} className="mr-1" /> Add Philosophy
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {aboutData.philosophies.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {isEditing
                      ? "Click 'Add Philosophy' to add your first philosophy"
                      : "No philosophies added yet"}
                  </p>
                ) : (
                  aboutData.philosophies.map((philosophy, index) => (
                    <div key={index} className="flex items-start group">
                      <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                        <IconComponent
                          iconName={philosophy.icon}
                          className="text-blue-800"
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={philosophy.icon}
                                onChange={(e) =>
                                  handlePhilosophyChange(
                                    index,
                                    "icon",
                                    e.target.value
                                  )
                                }
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                              >
                                {Object.keys(availableIcons).map((icon) => (
                                  <option key={icon} value={icon}>
                                    {icon}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={philosophy.title}
                                onChange={(e) =>
                                  handlePhilosophyChange(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Philosophy title..."
                              />
                              <button
                                onClick={() => removePhilosophy(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Remove philosophy"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <textarea
                              value={philosophy.description}
                              onChange={(e) =>
                                handlePhilosophyChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Describe your philosophy..."
                              rows="3"
                            />
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold mb-1">
                              {philosophy.title}
                            </h4>
                            <p className="text-gray-700">
                              {philosophy.description}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - PROFILE (Increased Width) */}
          <div className="lg:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ProfileSection />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
