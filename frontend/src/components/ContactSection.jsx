import { useState, useEffect } from "react";
import { Mail, Phone, Edit, Save, X, MapPin, Clock } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";

const ContactSection = () => {
  const { authUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contactData, setContactData] = useState({
    adminEmail: "",
    phone: "",
    officeLocation: {
      building: "",
      room: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
    officeHours: [],
  });
  const [messageForm, setMessageForm] = useState({
    name: "",
    msgEmail: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/users/contact");

      setContactData({
        adminEmail: response.data.data.adminEmail || "",
        phone: response.data.data.phone || "",
        officeLocation: response.data.data.officeLocation || {
          building: "",
          room: "",
          address: "",
          city: "",
          state: "",
          zip: "",
        },
        officeHours: Array.isArray(response.data.officeHours)
          ? response.data.officeHours
          : [],
      });
    } catch (error) {
      console.error("Error fetching contact info:", error);
      toast.error("Failed to load contact information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      officeLocation: {
        ...prev.officeLocation,
        [name]: value,
      },
    }));
  };

  const handleOfficeHourChange = (index, field, value) => {
    const updatedHours = [...contactData.officeHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setContactData((prev) => ({
      ...prev,
      officeHours: updatedHours,
    }));
  };

  const addOfficeHour = () => {
    setContactData((prev) => ({
      ...prev,
      officeHours: [
        ...prev.officeHours,
        { day: "", hours: "", byAppointment: false },
      ],
    }));
  };

  const removeOfficeHour = (index) => {
    const updatedHours = contactData.officeHours.filter((_, i) => i !== index);
    setContactData((prev) => ({
      ...prev,
      officeHours: updatedHours,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.put("/users/contact", contactData);
      setIsEditing(false);
      toast.success("Contact information updated successfully");
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast.error("Failed to update contact information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchContactInfo();
    setIsEditing(false);
  };

  const handleMessageChange = (e) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/users/messages", messageForm);
      setMessageForm({
        name: "",
        msgEmail: "",
        subject: "",
        message: "",
      });
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  if (isLoading && !isEditing) {
    return (
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading contact information...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-center">Get In Touch</h2>
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

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <div className="bg-blue-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-700 p-2 rounded-full mr-4">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    {isEditing ? (
                      <input
                        type="email"
                        name="adminEmail"
                        value={contactData.adminEmail}
                        onChange={handleInputChange}
                        className="w-full bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                        placeholder="email address"
                      />
                    ) : (
                      <p className="text-blue-200">
                        {contactData.adminEmail || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-700 p-2 rounded-full mr-4">
                    <Phone className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Phone</h4>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={contactData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                        placeholder="Phone number"
                      />
                    ) : (
                      <p className="text-blue-200">
                        {contactData.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-700 p-2 rounded-full mr-4">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Office Location</h4>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            name="building"
                            value={contactData.officeLocation.building}
                            onChange={handleLocationChange}
                            placeholder="Building"
                            className="bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                          />
                          <input
                            type="text"
                            name="room"
                            value={contactData.officeLocation.room}
                            onChange={handleLocationChange}
                            placeholder="Room"
                            className="bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                          />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={contactData.officeLocation.address}
                          onChange={handleLocationChange}
                          placeholder="Street Address"
                          className="w-full bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            name="city"
                            value={contactData.officeLocation.city}
                            onChange={handleLocationChange}
                            placeholder="City"
                            className="bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                          />
                          <input
                            type="text"
                            name="state"
                            value={contactData.officeLocation.state}
                            onChange={handleLocationChange}
                            placeholder="State"
                            className="bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                          />
                        </div>
                        <input
                          type="text"
                          name="zip"
                          value={contactData.officeLocation.zip}
                          onChange={handleLocationChange}
                          placeholder="ZIP Code"
                          className="w-full bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {contactData.officeLocation.building && (
                          <p className="text-blue-200">
                            {contactData.officeLocation.building}{" "}
                            {contactData.officeLocation.room &&
                              `Room ${contactData.officeLocation.room}`}
                          </p>
                        )}
                        {contactData.officeLocation.address && (
                          <p className="text-blue-200">
                            {contactData.officeLocation.address}
                          </p>
                        )}
                        {(contactData.officeLocation.city ||
                          contactData.officeLocation.state ||
                          contactData.officeLocation.zip) && (
                          <p className="text-blue-200">
                            {contactData.officeLocation.city}
                            {contactData.officeLocation.city &&
                              contactData.officeLocation.state &&
                              ", "}
                            {contactData.officeLocation.state}{" "}
                            {contactData.officeLocation.zip}
                          </p>
                        )}
                        {!contactData.officeLocation.building &&
                          !contactData.officeLocation.address &&
                          !contactData.officeLocation.city && (
                            <p className="text-blue-300">
                              No location specified
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center">
                    <Clock className="mr-2" size={18} /> Office Hours
                  </h4>
                  {isEditing && (
                    <button
                      onClick={addOfficeHour}
                      className="text-blue-300 hover:text-white text-sm flex items-center"
                    >
                      <span className="mr-1">+</span> Add Hours
                    </button>
                  )}
                </div>
                {contactData.officeHours.length === 0 && !isEditing ? (
                  <p className="text-blue-300">No office hours specified</p>
                ) : (
                  <ul className="space-y-3">
                    {contactData.officeHours.map((hour, index) => (
                      <li key={index} className="flex items-start">
                        {isEditing ? (
                          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                            <input
                              type="text"
                              value={hour.day}
                              onChange={(e) =>
                                handleOfficeHourChange(
                                  index,
                                  "day",
                                  e.target.value
                                )
                              }
                              placeholder="Day (e.g., Monday)"
                              className="flex-1 bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                            />
                            <input
                              type="text"
                              value={hour.hours}
                              onChange={(e) =>
                                handleOfficeHourChange(
                                  index,
                                  "hours",
                                  e.target.value
                                )
                              }
                              placeholder="Hours (e.g., 9:00 AM - 5:00 PM)"
                              className="flex-1 bg-blue-700 text-white border border-blue-600 rounded px-3 py-2"
                            />
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={hour.byAppointment || false}
                                onChange={(e) =>
                                  handleOfficeHourChange(
                                    index,
                                    "byAppointment",
                                    e.target.checked
                                  )
                                }
                                className="mr-2"
                                id={`appointment-${index}`}
                              />
                              <label
                                htmlFor={`appointment-${index}`}
                                className="text-sm text-blue-200"
                              >
                                Appointment only
                              </label>
                            </div>
                            <button
                              onClick={() => removeOfficeHour(index)}
                              className="text-red-400 hover:text-red-300 p-1"
                              aria-label="Remove office hour"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start w-full">
                            <span className="font-medium w-24">
                              {hour.day}:
                            </span>
                            <span className="flex-1">
                              {hour.hours}
                              {hour.byAppointment && " (Appointment only)"}
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md text-gray-800 h-full">
              <h3 className="text-2xl font-semibold mb-6 text-blue-900">
                Send a Message
              </h3>
              <form className="space-y-4" onSubmit={handleMessageSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1 text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={messageForm.name}
                    onChange={handleMessageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1 text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="msgEmail"
                    name="msgEmail"
                    value={messageForm.msgEmail}
                    onChange={handleMessageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your email"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-1 text-gray-700"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={messageForm.subject}
                    onChange={handleMessageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Subject"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-1 text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={messageForm.message}
                    onChange={handleMessageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your message"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-md transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
