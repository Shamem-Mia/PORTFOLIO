import { useState, useEffect } from "react";
import { Upload, Edit, Save, X } from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import { useAuthStore } from "../stores/useAuthStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const HeroSection = () => {
  const { authUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    position: "",
    profilePicture: { url: "" },
  });

  const [editedData, setEditedData] = useState({
    fullName: "",
    bio: "",
    position: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/users/profile-data");
        if (response.data?.data) {
          setProfileData(response.data.data);
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error loading profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setIsUploading(true);
      const response = await axiosInstance.post(
        "/users/upload-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedData({
        fullName: profileData.name,
        bio: profileData.bio,
        position: profileData.position,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axiosInstance.put(
        "/users/update-profile",
        editedData
      );

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <section className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-blue-900 text-white py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center md:justify-start">
          <div className="relative w-40 h-40">
            <img
              src={profileData.profilePicture?.url || "/default-profile.png"}
              alt={`Profile picture of ${profileData.fullName || "user"}`}
              className="w-full h-full rounded-full border-4 border-yellow-500 object-cover"
              onError={(e) => {
                e.target.src = "/default-profile.png";
              }}
            />

            {authUser?.role === "admin" && (
              <label
                htmlFor="profile-upload"
                className="absolute bottom-1 right-1 bg-yellow-500 text-blue-900 p-1.5 rounded-full cursor-pointer hover:bg-yellow-600 transition"
                aria-label="Upload profile picture"
              >
                <Upload size={16} />
                <input
                  id="profile-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-2/3 text-center md:text-left">
          <div className="flex justify-between items-start">
            <div className="w-full">
              {isEditing ? (
                <div className="mb-2">
                  <input
                    type="text"
                    name="fullName"
                    value={editedData.fullName}
                    onChange={handleInputChange}
                    className="text-3xl md:text-4xl font-bold bg-blue-800 border border-yellow-300 px-2 py-1 w-full text-white"
                    placeholder="Enter your name"
                  />
                </div>
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {profileData.fullName || "No name provided"}
                </h1>
              )}

              {isEditing ? (
                <div className="mb-4">
                  <input
                    type="text"
                    name="position"
                    value={editedData.position}
                    onChange={handleInputChange}
                    className="text-xl md:text-2xl bg-blue-800 border border-yellow-300 px-2 py-1 w-full text-yellow-300"
                    placeholder="Enter your position"
                  />
                </div>
              ) : (
                <h2 className="text-xl md:text-2xl text-yellow-300 mb-4">
                  {profileData.position || "No position specified"}
                </h2>
              )}
            </div>

            {authUser?.role === "admin" && (
              <div className="flex">
                <button
                  onClick={isEditing ? handleSaveProfile : handleEditToggle}
                  className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 p-1.5 rounded-lg transition"
                  aria-label={isEditing ? "Save changes" : "Edit profile"}
                >
                  {isEditing ? <Save size={18} /> : <Edit size={18} />}
                </button>

                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition ml-2"
                    aria-label="Cancel editing"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mb-4">
              <textarea
                name="bio"
                value={editedData.bio}
                onChange={handleInputChange}
                className="text-base w-full bg-blue-800 border border-yellow-300 px-2 py-1 h-24 text-white"
                placeholder="Enter your bio"
              />
            </div>
          ) : (
            <p className="text-base mb-4">
              {profileData.bio || "No biography available"}
            </p>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Link
              to="/contact"
              className="bg-transparent hover:bg-blue-800 text-white font-bold py-2 px-4 border-2 border-white rounded-lg transition text-sm"
            >
              Message Me
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
