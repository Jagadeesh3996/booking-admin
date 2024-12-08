import React, { useState, useEffect } from "react";
import "./Event.css";
import EventForm from "./EventForm";
import { getEvents, deleteEvent } from "../../services/api/api";
import "primeicons/primeicons.css";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";

export default function Event() {
  const [formShow, setFormShow] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState(null); // Tracks selected event ID
  const [events, setEvents] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null); // Manage dropdown visibility
  const [deleteRender, setDeleteRender] = useState(false);
  const [popupData, setPopupData] = useState()


  // Fetch events
  useEffect(() => {
    
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        toast.error(error.message, {
          position: "top-right",
        });
      }
    };
    if (!formShow) {
      fetchEvents();
    }
  }, [formShow, deleteRender]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown on outside click
      if (!event.target.closest(".dropdown-menu-layer")) {
        setDropdownVisible(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown visibility for a specific card
  const toggleDropdown = (id) => {
    setDropdownVisible(dropdownVisible === id ? null : id);
  };

  // Handle form show logic
  const handleFormShow = (eventData) => {
    if (formShow) {
      Swal.fire({
        title: "Are you sure you want to cancel?",
        text: "If you leave, your changes will be lost!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#28a745",
        confirmButtonText: "Yes, cancel",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedEventData(eventData);
          setFormShow(true);
        }
      });
    } else {
      setSelectedEventData(eventData);
      setFormShow(true);
    }
  };

  // Handle delete logic
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure you want to delete!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#28a745",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      customClass: {
        title: "swal2-title-custom",
        htmlContainer: "swal2-text-custom",
        confirmButton: "swal2-confirm-button-custom",
        cancelButton: "swal2-cancel-button-custom",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteEvent(id); // Call the API
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
            }).then( () => {
                setDeleteRender(!deleteRender)
            });
  
          } else {
            toast.error(response.message, {
              position: "top-right",
            });
          }
        } catch (error) {
          toast.error(error.message, {
            position: "top-right",
          });
        }
  
      }
    });
  };

  const handleCardClick = (data) => {
    setPopupData(data);
  };
  
  return (
    <div className="event-container">
      <ToastContainer />

      <div className="event-head">
        <div>
          <div>Livin Interiors</div>
          <a href="https://bookingform.bharatmakers.com/" target="_blank" className="booking-url">
            https://bookingform.bharatmakers.com/
          </a>
        </div>

        <div>
          <button
            type="button"
            disabled={formShow}
            className="btn btn-outline-primary create-btn-custom"
            onClick={() => handleFormShow(null)}
          >
            Create New Event
          </button>
        </div>
      </div>

      <div className="event-body">
        {formShow && (
          <EventForm
            setFormShow={setFormShow}
            eventData={selectedEventData}
            setSelectedEventData={setSelectedEventData}
          />
        )}

        {!formShow && (
          <div className="event-section">
            <div className="event-heading">Events List</div>

            <div className="events-container">
              {events.data ?
                events.data.map((card) => (
                  <div
                    className="card event-card"
                    key={card.id}
                  
   
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">{card.event_name}</h5>
                      <div className="position-relative">
                        <button
                          className="btn card-setting-btn"
                          onClick={() => {
                            toggleDropdown(card.id);
                          }}
                        >
                          <i className="pi pi-cog"></i>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownVisible === card.id && (
                          <div
                            className="dropdown-menu-layer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ul className="list-unstyled mb-0">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleFormShow(card);
                                  }}
                                >
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => {
                                    handleDelete(card.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-body">
                      <p className="card-text"><strong>Duration : </strong>{card.duration} Hrs</p>
                      <p className="card-text"><strong>Buffer : </strong>{card.buffer} Hrs</p>


                      <div className="card-footer-custom">
                      <a
                        href="https://bookingform.bharatmakers.com/"
                        className="text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                     
                      >
                        View booking page
                      </a>
                      <button
                          className="btn btn-view btn-outline-secondary"
                          data-bs-toggle="modal"
                          aria-hidden="true"
        data-bs-target="#exampleModal"
                          onClick={() => {
                            handleCardClick(card);
                          }}
                        > View
                          <i className="pi pi-eye"></i>
                        </button>

                      </div>

                      
                    </div>
                  </div>
                )): <div className="noevent">There no events created  yet!</div>
              
              }
            </div>
          </div>
        )}

         
<div
        className="modal fade"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                {popupData ? popupData.event_name : "Modal Title"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body custom-card-body">

              <p><strong>Event Name : </strong>{popupData && popupData.event_name}</p>
              <p><strong>Duration : </strong>{popupData && popupData.duration} Hrs</p>
              <p><strong>Buffer Time : </strong>{popupData && popupData.buffer} Hrs</p>
              <p><strong>Maximum Schedule Days : </strong>{popupData && popupData.day_limit} Days</p>

              <p><strong>Availability</strong></p>
  {popupData?.availability?.length > 0 ? (
    <table className="table">
      <thead>
        <tr>
          <th>Day</th>
          <th>Time Slots</th>
        </tr>
      </thead>
      <tbody>
        {popupData.availability.map((day) => (
          <tr key={day.day}>
            <td>{day.day}</td>
            <td>
              {day.times.length > 0 ? (
                day.times.map((time, index) => (
                  <div key={index}>
                    {time.start} - {time.end}
                  </div>
                ))
              ) : (
                <span>No Time Slots</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No availability provided.</p>
  )}

           


              

              
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
          
            </div>
          </div>
        </div>
      </div>


      </div>
    </div>
  );
}
