import { useState, useEffect } from "react";
import { Edit, Save, X, Plus, Trash2, BookOpen } from "lucide-react";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const SubjectsSection = () => {
  const { authUser } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/users/courses");
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error.response?.data?.message || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    setCourses(updatedCourses);
  };

  const addNewCourse = () => {
    setCourses([
      ...courses,
      {
        title: "",
        platform: "",
        category: "Technical",
        skillsLearned: "",
        completionDate: "",
        certificateLink: "",
        isNew: true,
      },
    ]);
  };

  const removeCourse = async (index) => {
    const course = courses[index];
    if (course._id && !course.isNew) {
      try {
        setIsLoading(true);
        await axiosInstance.delete(`/users/courses/${course._id}`);
        const updatedCourses = courses.filter((_, i) => i !== index);
        setCourses(updatedCourses);
        toast.success("Course removed successfully");
      } catch (error) {
        console.error("Error deleting course:", error);
        toast.error(error.response?.data?.message || "Failed to remove course");
      } finally {
        setIsLoading(false);
      }
    } else {
      const updatedCourses = courses.filter((_, i) => i !== index);
      setCourses(updatedCourses);
    }
  };

  const validateCourses = () => {
    for (const course of courses) {
      if (!course.title.trim() || !course.platform.trim()) {
        toast.error("Course title and platform are required");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateCourses()) return;

    setIsLoading(true);
    try {
      await axiosInstance.put("/users/courses", { courses });
      setIsEditing(false);
      fetchCourses();
      toast.success("Courses updated successfully");
    } catch (error) {
      console.error("Error saving courses:", error);
      toast.error(error.response?.data?.message || "Failed to update courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchCourses();
    setIsEditing(false);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Technical":
        return "bg-blue-100 text-blue-800";
      case "Soft Skills":
        return "bg-green-100 text-green-800";
      case "Creative":
        return "bg-purple-100 text-purple-800";
      case "Business":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && !isEditing) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading completed courses...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center">
            <BookOpen className="text-blue-600 mr-3" size={32} />
            <h2 className="text-3xl font-bold text-blue-900">
              Completed Courses
            </h2>
          </div>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 && !isEditing ? (
            <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg mb-4">
                No completed courses added yet
              </p>
              {authUser?.role === "admin" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center mx-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} className="mr-1" /> Add Your First Course
                </button>
              )}
            </div>
          ) : (
            courses.map((course, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
              >
                {isEditing ? (
                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <select
                        value={course.category}
                        onChange={(e) =>
                          handleInputChange(index, "category", e.target.value)
                        }
                        className={`text-sm font-semibold px-3 py-1 rounded ${getCategoryColor(
                          course.category
                        )}`}
                      >
                        <option value="Technical">Technical</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Creative">Creative</option>
                        <option value="Business">Business</option>
                      </select>
                      <button
                        onClick={() => removeCourse(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <input
                      value={course.title}
                      onChange={(e) =>
                        handleInputChange(index, "title", e.target.value)
                      }
                      className="w-full text-lg font-semibold mb-2 text-blue-900 bg-transparent border-b border-blue-200 focus:border-blue-500 focus:outline-none"
                      placeholder="Course Title*"
                      required
                    />

                    <div className="space-y-2">
                      <input
                        value={course.platform}
                        onChange={(e) =>
                          handleInputChange(index, "platform", e.target.value)
                        }
                        className="w-full text-gray-700 bg-transparent border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="Platform (e.g., Coursera, Udemy, YouTube)*"
                        required
                      />

                      <input
                        type="month"
                        value={course.completionDate}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "completionDate",
                            e.target.value
                          )
                        }
                        className="w-full text-gray-700 bg-transparent border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="Completion Date"
                      />

                      <input
                        value={course.certificateLink}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "certificateLink",
                            e.target.value
                          )
                        }
                        className="w-full text-gray-700 bg-transparent border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="Certificate Link (optional)"
                      />
                    </div>

                    <textarea
                      value={course.skillsLearned}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "skillsLearned",
                          e.target.value
                        )
                      }
                      className="w-full flex-grow min-h-[80px] text-gray-700 bg-transparent border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none text-sm"
                      placeholder="Skills learned (separate with commas)"
                      rows="2"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded ${getCategoryColor(
                          course.category
                        )}`}
                      >
                        {course.category}
                      </span>
                      {course.completionDate && (
                        <span className="text-sm text-gray-500">
                          {new Date(course.completionDate).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-2 text-blue-900 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3">
                      {course.platform}
                    </p>

                    {course.skillsLearned && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          <span className="font-medium">Skills:</span>{" "}
                          {course.skillsLearned}
                        </p>
                      </div>
                    )}

                    {course.certificateLink && (
                      <a
                        href={course.certificateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center mt-auto"
                      >
                        View Certificate
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    )}
                  </>
                )}
              </div>
            ))
          )}

          {isEditing && (
            <div className="bg-blue-50 p-6 rounded-lg shadow-md border-2 border-dashed border-blue-200 flex items-center justify-center min-h-[300px] hover:bg-blue-100 transition-colors cursor-pointer">
              <button
                onClick={addNewCourse}
                className="text-blue-700 hover:text-blue-900 flex flex-col items-center"
              >
                <Plus size={32} className="mb-2" />
                <span className="font-medium">Add Course</span>
                <span className="text-sm text-blue-600 mt-1">
                  Skill development courses
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SubjectsSection;
