import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import FormField from "./FormField";
import { addEvent, editEvent } from "../../services/api/api";
import { ToastContainer, toast } from "react-toastify";

export default function EventForm({
  setFormShow,
  eventData,
  setSelectedEventData,
}) {
  const [formData, setFormData] = useState({
    id: "",
    event_name: "",
    duration: "00:00",
    buffer: "",
    day_limit: "",
    availability: [],
  });

  const [errors, setErrors] = useState({});
  const [triggerAction, setTriggerAction] = useState(false); // Flag for `sortSlot` updates
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [duration, setDuration] = useState({});
  const [buffer, setBuffer] = useState({});

  const [slots, setSlots] = useState([]);
  const [removeSlots, setRemoveSlots] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventData) {
      // Set the formData first
      setFormData({
        id: eventData.id || "",
        event_name: eventData.event_name || "",
        duration: eventData.duration || "",
        buffer: eventData.buffer || "",
        day_limit: eventData.day_limit || "",
        availability: eventData.availability || [],
      });
      // Parse and set hours and minutes for duration and buffer
      const parsedDuration = parseTime(eventData.duration);

      setDuration({
        hours: parsedDuration.hours,
        minutes: parsedDuration.minutes,
      });
      setBuffer({
        value: timeStringToMinutes(eventData.buffer),
        unit: "minutes",
      });
      // setHours({

      const updatedSlots = weekdays.map((day) => {
        const matchingDay = Array.isArray(eventData?.availability)
          ? eventData?.availability.find((item) => item.day === day)
          : null;
        // If matching day exists in the availability data, use its times;
        // otherwise, create empty slots with start, end, and id.
        return {
          day,
          times:
            matchingDay && matchingDay.times.length > 0
              ? matchingDay.times
              : [
                  {
                    start: "",
                    end: "",
                    id: `${Date.now()}-${Math.random()
                      .toString(36)
                      .substring(2, 15)}`,
                  },
                ],
        };
      });

      setSlots(updatedSlots);
    } else {
      const slots = weekdays.map((day) => ({
        day,
        times: [
          {
            start: "",
            end: "",
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          },
        ],
      }));
      setSlots(slots);
    }
  }, [eventData]); // Only runs once on component mount

  const parseTime = (time) => {
    const [h, m] = time.split(":").map(Number);
    return { hours: h, minutes: m };
  };

  const handleAddSlot = (index) => {
    const newSlots = [...slots];
    let lastSlot = slots[index].times[slots[index].times.length - 1];
    const newSlot = lastSlot ? createTimeSlot(lastSlot.end) : createTimeSlot(); //if all slot deleted, create from unavailable if we give 8am it returns 9am

    if (lastSlot && lastSlot.end) {
      if (isBeforeMidnight(lastSlot.end)) {
        if (isBeforeMidnight(newSlot.end)) {
          newSlots[index].times.push(newSlot); // Empty slots for new entries
          setSlots(newSlots);
        } else {
          toast.error("Slot overlap with next day, can not able to create", {
            position: "top-right",
          });
        }
      } else {
        newSlots[index].times.push(newSlot); // Empty slots for new entries
        setSlots(newSlots);
      }
    } else {
      newSlots[index].times.push(newSlot); // Empty slots for new entries
      setSlots(newSlots);
    }
  };

  function createTimeSlot(time) {
    // Check if the input time is valid, if not, return an empty slot
    if (!time) {
      return {
        start: "",
        end: "",
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      };
    }

    // Create the new time slot object with start and end times
    let gapHourbetweenSlot = 0;
    let duration = formData.duration || "00:00";
    let endTimeCreation = addDurationinHour(time, duration);

    return {
      start: incrementHour(time, gapHourbetweenSlot), // Start time is 1 hour later
      end: incrementHour(endTimeCreation, gapHourbetweenSlot), // End time is 2 hours later
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    };
  }

  function incrementHour(time, hoursToAdd) {
    // Split the time into hours and minutes
    let [hour, minute] = time.split(":").map(Number);

    // Add the specified number of hours
    hour += hoursToAdd;

    // If the hour exceeds 23, reset it to fit within the 24-hour format
    if (hour >= 24) {
      hour -= 24;
    }

    // Return the time in 24-hour format
    return `${hour < 10 ? "0" : ""}${hour}:${minute < 10 ? "0" : ""}${minute}`;
  }

  function isBeforeMidnight(time) {
    // Split the input time into hours and minutes
    const [hour, minute] = time.split(":").map(Number);

    // Check if the time is before 12:00 AM (midnight)
    if (hour < 12 || (hour === 12 && minute === 0)) {
      return false; // It is before midnight
    } else {
      return true; // It is after or exactly at midnight
    }
  }

  const handleRemoveSlot = (dayIndex, slotIndex, slotId) => {
    const newSlots = [...slots];
    newSlots[dayIndex].times.splice(slotIndex, 1);
    setSlots(newSlots);

    setErrors((prevErrors) => {
      // Create a copy of the current errors state
      const updatedErrors = { ...prevErrors };

      // Check if the dayIndex exists in the slots object
      if (updatedErrors.slots?.[dayIndex]) {
        // Delete the specific time key from the slots object
        delete updatedErrors.slots[dayIndex][slotId];

        // If the dayIndex no longer has any slots, remove it from the slots object
        if (Object.keys(updatedErrors.slots[dayIndex]).length === 0) {
          delete updatedErrors.slots[dayIndex];
        }
      }

      // Return the updated errors object
      sortSlot();
      return updatedErrors;
    });

    setTriggerAction(true);
  };

  // const handleTimeChange = (dayIndex, slotIndex, field, value) => {
  //   console.log(slotIndex);
    
  //   const newSlots = [...slots];
  //   newSlots[dayIndex].times[slotIndex][field] = value;

  //   newSlots[dayIndex].times[slotIndex][field] = value;

  //   if (formData.duration) {
  //     if (value) {
  //       let formattedResult = addDurationinHour(value, formData.duration);
  //       newSlots[dayIndex].times[slotIndex]["end"] = formattedResult;
  //     }
  //   } else {
  //     if (value) {
  //       newSlots[dayIndex].times[slotIndex]["end"] = value;
  //     }
  //   }
  //   setSlots(newSlots);
  //   setErrors((prevErrors) => {
  //     const { availability, ...rest } = prevErrors; // Destructure and exclude 'availability'
  //     return rest; // Return the updated object without the 'availability' key
  //   });
  // };



  const handleTimeChange = (dayIndex, slotIndex, field, value) => {


    console.log(value);
    
    const newSlots = [...slots];
    newSlots[dayIndex].times[slotIndex][field] = value;

    if (formData.duration && field === "start" && value) {
      const formattedResult = addDurationinHour(value, formData.duration);
      newSlots[dayIndex].times[slotIndex]["end"] = formattedResult;
    } else if (field === "end" && value) {
      newSlots[dayIndex].times[slotIndex]["end"] = value;
    }

    console.log(newSlots);
    
  
    const startTime = newSlots[dayIndex].times[slotIndex]["start"];
    const endTime = newSlots[dayIndex].times[slotIndex]["end"];
  
    // Error handling for crossing into the next day
    if (startTime && endTime && isNextDay(startTime, endTime)) {
      toast.error("End time cannot cross into the next day.", {
        position: "top-right",
      });
  
      // Reset the invalid end time
      newSlots[dayIndex].times[slotIndex]["end"] = "";
      setSlots(newSlots);
      return; // Prevent further processing
    }
  
    setSlots(newSlots);
    setErrors((prevErrors) => {
      const { availability, ...rest } = prevErrors; // Exclude 'availability'
      return rest;
    });
  };
  
  // Helper function to check if the end time crosses into the next day
  const isNextDay = (start, end) => {
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
  
    return endTime < startTime; // Returns true if end time is earlier than start time
  };
  



  const addDurationinHour = (mainHour, hourtoAdd) => {
    const [hours1, minutes1] = mainHour.split(":").map(Number);
    const [hours2, minutes2] = hourtoAdd.split(":").map(Number);
    // Convert both times to total minutes
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;
    // Add the total minutes
    const totalMinutes = totalMinutes1 + totalMinutes2;
    // Convert back to hours and minutes
    const resultHours = Math.floor(totalMinutes / 60) % 24; // Mod 24 for a 24-hour format
    const resultMinutes = totalMinutes % 60;

    // Format the result in HH:MM format
    const formattedResult = `${String(resultHours).padStart(2, "0")}:${String(
      resultMinutes
    ).padStart(2, "0")}`;

    return formattedResult;
  };
  const handleSubmit = async (e) => {
    if (validateForm()) {
      // setFormShow(false); // Hide the form
      const filteredTimes = formData.availability.map((day) => {
        const validTimes = day.times.filter(
          (slot) => slot.start !== "" && slot.end !== ""
        );
        return {
          ...day,
          times: validTimes,
        };
      }); // Optional to remove empty days

      let finalData = {
        id: formData.id,
        event_name: formData.event_name,
        duration: formData.duration, // Example format
        buffer: formData.buffer, // Example format
        day_limit: formData.day_limit,
        availability: filteredTimes,
      };
      setLoading(true);
      if (finalData.id) {
        try {
          const response = await editEvent(finalData); // Call the API

          if (response.status) {
            Swal.fire({
              title: `${response.message}`,
              icon: "success",
              confirmButtonColor: "#dc3545",
              confirmButtonText: "Okay",
              customClass: {
                title: "swal2-title-custom",
                htmlContainer: "swal2-text-custom",
                confirmButton: "swal2-confirm-button-custom",
              },
            }).then((result) => {
              setFormShow(false);
              setSelectedEventData(null);
              setLoading(false);
            });
          } else {
            toast.error(response.message, {
              position: "top-right",
            });
            setLoading(false);
          }
        } catch (error) {
          toast.error(error.message, {
            position: "top-right",
          });
        }
      } else {
        try {
          const response = await addEvent(finalData); // Call the API
          if (response.status) {
            Swal.fire({
              title: `${response.message}`,
              icon: "success",
              confirmButtonColor: "#dc3545",
              confirmButtonText: "Okay",
              customClass: {
                title: "swal2-title-custom",
                htmlContainer: "swal2-text-custom",
                confirmButton: "swal2-confirm-button-custom",
              },
            }).then((result) => {
              setFormShow(false);
              setSelectedEventData(null);
              setLoading(false);
            });
          } else {
            toast.error(response.message, {
              position: "top-right",
            });
            setLoading(false);
          }
        } catch (error) {
          toast.error(error.message, {
            position: "top-right",
          });
        }
      }
    }
  };

  const validateForm = () => {
    console.log(formData);

    const areAllTimesEmpty = (slots) => {
      return slots.every(
        (day) => day.times.every((time) => !time.start || !time.end) // Both `start` and `end` must be empty
      );
    };

    // Conditionally assign slots or keep the existing availability
    formData.availability = !areAllTimesEmpty(slots) ? slots : [];

    // Initialize a new errors object
    const newErrors = {};

    if (errors.slots && Object.keys(errors.slots).length !== 0) {
      newErrors.slots = errors.slots;
    }

    // Validate other fields
    if (!formData.event_name) newErrors.event_name = "Event Name is required";
    if (formData.event_name && !/^[a-zA-Z].*$/.test(formData.event_name))
      newErrors.event_name = "Pleas enter valid name";

    if (!formData.duration || formData.duration === "00:00")
      newErrors.duration = "Duration is required";
    if (!formData.buffer) newErrors.buffer = "Buffer Time is required";
    if (formData.buffer) {
      const [hours, minutes, seconds] = formData.buffer.split(":").map(Number);
      let result =
        hours < 0 ||
        minutes < 0 ||
        seconds < 0 ||
        (hours === 0 && minutes === 0 && seconds === 0);

      if (result) {
        newErrors.buffer = "Enter valid buffer time";
      }
    }
    if (!formData.day_limit) newErrors.day_limit = "Schedule Days is required";
    if (
      formData.day_limit &&
      (!/^\d+$/.test(formData.day_limit) || formData.day_limit <= 0)
    ) {
      newErrors.day_limit = "Enter valid days";
    }

    if (formData.availability.length === 0)
      newErrors.availability = "availability is required";

    // Update errors state

    setErrors(newErrors);

    // Return whether the form is valid
    return Object.keys(newErrors).length === 0;
  };

  const confirmClose = () => {
    Swal.fire({
      title: "Are you sure you want to cancel!",
      text: "If you leaving before submiting your changes will be lost!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#28a745",
      confirmButtonText: "Yes, cancel Event creation",
      cancelButtonText: "Cancel",
      customClass: {
        title: "swal2-title-custom",
        htmlContainer: "swal2-text-custom",
        confirmButton: "swal2-confirm-button-custom",
        cancelButton: "swal2-cancel-button-custom",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setFormShow(false);
        setSelectedEventData(null);
      }
    });
  };

  const handleFieldChange = (field, type, value) => {
    if (field === "duration" && (type === "hours" || type === "minutes")) {
      setRemoveSlots(true);
    }

    // Update the specific state for text or time fields
    if (type === "text") {

      // Restrict day_limit to a maximum of 5 digits
      if (field === "day_limit") {
        value = value.replace(/[^0-9]/g, '').substring(0, 3);        
      }
      setFormData((prev) => ({ ...prev, [field]: value.trimStart() }));

    } else if (field === "duration") {
      // Update duration
      setDuration((prev) => {
        const updatedDuration = { ...prev, [type]: value };

        // Update formData with formatted duration
        setFormData((formPrev) => ({
          ...formPrev,
          duration: `${String(updatedDuration.hours || "00").padStart(2, "0")}:${String(updatedDuration.minutes || "00").padStart(2, "0")}`,
        }));

        return updatedDuration;
      });
    } else if (field === "buffer") {
      setBuffer((prev) => {
        let updatedBuffer = { ...prev };

        if (type === "value") {
          // Restrict the value to a maximum of 5 digits
          if (value.length > 5) return prev;
          updatedBuffer.value = value;
        } else if (type === "unit") {
          updatedBuffer.unit = value;
        }

        // Convert buffer value to HH:MM format
        const bufferInHHMM = convertToHHMM(
          updatedBuffer.value || 0,
          updatedBuffer.unit || "minutes"
        );

        // Update formData with the formatted buffer
        setFormData((formPrev) => ({
          ...formPrev,
          buffer: `${bufferInHHMM}`,
        }));

        return updatedBuffer;
      });
    }

    // Clear errors for the field if they exist
    if (errors[field]) {
      setErrors((prevErrors) => {
        const { [field]: _, ...rest } = prevErrors; // Exclude the specific error
        return rest; // Return the rest of the errors
      });
    }
  };

  function timeStringToMinutes(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
  }

  const convertToHHMM = (value, unit) => {
    // Parse value to ensure it's a number
    const numericValue = parseFloat(value);

    // Convert input to minutes based on the unit
    let totalMinutes;
    switch (unit.toLowerCase()) {
      case "minutes":
        totalMinutes = numericValue; // Already in minutes
        break;
      case "hours":
        totalMinutes = numericValue * 60; // Convert hours to minutes
        break;
      case "days":
        totalMinutes = numericValue * 1440; // Convert days to minutes (24 * 60)
        break;
    }

    // Handle fractional minutes
    const wholeMinutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - wholeMinutes) * 60);

    // Convert total minutes to HH:MM:SS format
    const hours = Math.floor(wholeMinutes / 60);
    const minutes = wholeMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const sortSlot = () => {
    setSlots((prevSlots) =>
      prevSlots.map((day) => {
        return {
          ...day,
          times: day.times.sort((a, b) => {
            const [hoursA, minutesA] = a.start.split(":").map(Number);
            const [hoursB, minutesB] = b.start.split(":").map(Number);
            return hoursA * 60 + minutesA - (hoursB * 60 + minutesB);
          }),
        };
      })
    );

    setTriggerAction(true);
  };

  useEffect(() => {
    if (triggerAction) {
      let newErrors = {};
      slots.map((day, dayIndex) => {
        if (day.times.length > 1) {
          day.times.map((data, slotIndex) => {
            if (slotIndex > 0) {
              if (
                !isTime1Greater(data.start, day.times[slotIndex - 1].end) &&
                data.start !== day.times[slotIndex - 1].end &&
                data.start !== ""
              ) {
                if (!newErrors[dayIndex]) {
                  newErrors[dayIndex] = {};
                }
                newErrors[dayIndex][day.times[slotIndex - 1].id] =
                  "Slot overlap to others";

                newErrors[dayIndex][day.times[slotIndex].id] =
                  "Slot overlap to others";
              }
            }
          });
        }
      });
      setErrors((prevError) => ({
        ...prevError, // Spread the previous state to retain other properties
        slots: newErrors, // Update or add the `slots` property
      }));
      setTriggerAction(false);
    }
  }, [triggerAction]); // Dependency array: triggers when formData.duration changes

  // Reusable function for generating options
  const generateOptions = (max, unit) => {
    return Array.from({ length: max + 1 }, (_, i) => (
      <option key={i} value={i}>
        {i} {unit}
        {i !== 1 && "s"}
      </option>
    ));
  };

  useEffect(() => {
    if (removeSlots) {
      const updatedData = weekdays.map((day) => ({
        day,
        times: [
          {
            start: "",
            end: "",
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          }, // Example default slots
        ],
      }));
      setSlots(updatedData);
      setRemoveSlots(false);
    }
  }, [removeSlots]); // Dependency array: triggers when formData.duration changes

  function isTime1Greater(time1, time2) {
    // Split the times into hours and minutes
    const [hours1, minutes1] = time1.split(":").map(Number);
    const [hours2, minutes2] = time2.split(":").map(Number);

    // Compare hours first, then minutes if hours are equal
    if (hours1 > hours2) {
      return true;
    } else if (hours1 === hours2) {
      return minutes1 > minutes2;
    } else {
      return false;
    }
  }

  return (
    <div className="form-container">
      <ToastContainer />
      <div className="form-container-head">
        <div className="mb-3 event-heading">
          {eventData ? eventData.event_name : "New Event"}
        </div>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={confirmClose}
        ></button>
      </div>

      <div className="row g-3">
        <FormField
          label="Event Name"
          type="text"
          value={formData.event_name}
          onChange={(e) =>
            handleFieldChange("event_name", "text", e.target.value)
          }
          error={errors.event_name}
        />

        <FormField label="Duration" type="select" error={errors.duration}>
          <select
            className="form-select"
            id="hours"
            value={duration.hours || 0}
            onChange={(e) =>
              handleFieldChange("duration", "hours", e.target.value)
            }
          >
            {generateOptions(23, "hour")}
          </select>

          <select
            className="form-select"
            id="minutes"
            value={duration.minutes || 0}
            onChange={(e) =>
              handleFieldChange("duration", "minutes", e.target.value)
            }
          >
            {generateOptions(59, "minute")}
          </select>
        </FormField>

        <div className="col-md-6">
          <label className="form-label fw-bold">Buffer Time </label>

          <div className={`input-group ${errors.buffer ? "error" : ""}`}>
            <input
              type="number"
              min={0}
              className="form-control"
              value={buffer.value || ""}
              onChange={(e) =>
                handleFieldChange("buffer", "value", e.target.value)
              }
            />
            <select
              className="form-select"
              value={buffer.unit}
              onChange={(e) =>
                handleFieldChange("buffer", "unit", e.target.value)
              }
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>

          {errors.buffer && <p className="error-message">{errors.buffer}</p>}
        </div>

        <FormField
          label="Schedule Days"
          type="text"
          value={formData.day_limit}
          onChange={(e) =>
            handleFieldChange("day_limit", "text", e.target.value)
          }
          error={errors.day_limit}
          spanData="Days"
        />

        <div className="col-12 col-md-12 ">
          <label className="form-label fw-bold">availability</label>
          {errors.availability && (
            <p className="error-message">{errors.availability}</p>
          )}
          <div className="row">
            {slots.map((slot, dayIndex) => (
              <div key={slot.day} className="col-12 mb-4">
                {/* Day Name */}
                <div className="fw-bold mb-2">{slot.day}</div>

                {/* Slot Time Rows */}
                {slot.times.length !== 0 ? (
                  slot.times.map((time, slotIndex) => {
                    const isLast = slotIndex === slot.times.length - 1; // Check if it's the last slot
                    return (
                      <div key={slotIndex} className="mb-3">
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          {/* Start Time Dropdown */}
                          <div
                            className="flex-grow-1"
                            style={{ flexBasis: "35%" }}
                          >
                            <input
                              type="time"
                              className="form-control time-input-custom"
                              value={time.start}
                              onChange={(e) => {
                                handleTimeChange(
                                  dayIndex,
                                  slotIndex,
                                  "start",
                                  e.target.value
                                );
                                // e.target.blur(); // Blur the input after change to remove the dropdown
                              }}
                              onBlur={sortSlot}
                            />
                          </div>

                          {/* End Time Dropdown */}
                          <div
                            className="flex-grow-1"
                            style={{ flexBasis: "35%" }}
                          >
                            <input
                              disabled={true}
                              type="time"
                              className="form-control time-input-custom"
                              value={time.end && time.end}
                            />
                          </div>

                          {/* Remove Slot Button */}
                          <div style={{ flexBasis: "10%" }}>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm w-100"
                              onClick={() =>
                                handleRemoveSlot(dayIndex, slotIndex, time.id)
                              }
                            >
                              ×
                            </button>
                          </div>

                          {/* Add New Slot Button (Only on the Last Slot) */}
                          {isLast && (
                            <div style={{ flexBasis: "10%" }}>
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm w-100"
                                onClick={() => handleAddSlot(dayIndex)}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>

                        {errors.slots?.[dayIndex]?.[time.id] && (
                          <p className="error-message">
                            {errors.slots[dayIndex][time.id]}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // No slots available
                  <div>
                    <div className="text-muted mb-2">Unavailable</div>
                    {/* Add New Slot Button */}
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleAddSlot(dayIndex)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="col-12">
          <button
            type="submit"
            className="btn btn-primary event-form-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {eventData ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
