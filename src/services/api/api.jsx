
import { url } from "./baseurl";
import axios from "axios";

// user API
export const loginCheck = async (email, password) => {
  try {
    const response = await axios.post(url + "/login", { email, password });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const getUser = async (token) => {
  try {
    const response = await axios.get(url + "/getUser", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch data");
  }
};

// showrooms API
export const getShowrooms = async () => {
  try {
    const response = await axios.post(url + "/showroom", {action : 'getShowrooms'});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const addShowroom = async (data) => {
  try {
    const response = await axios.post(url + "/showroom", {action : 'addShowroom', data});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const editShowroom = async (data) => {
  try {
    const response = await axios.post(url + "/showroom", {action : 'editShowroom', data});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const deleteShowroom = async (id) => {
  try {
    const response = await axios.post(url + "/showroom", {action : 'deleteShowroom', id});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

// Team API
export const getTeams = async () => {
  try {
    const response = await axios.post(url + "/teams", {action : 'getTeams'});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const addTeam = async (data) => {
  try {
    const response = await axios.post(url + "/teams", {action : 'addTeam', data});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const editTeam = async (data) => {
  try {
    const response = await axios.post(url + "/teams", {action : 'editTeam', data});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const deleteTeam = async (id) => {
  try {
    const response = await axios.post(url + "/teams", {action : 'deleteTeam', id});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

// Schedule API
export const getUpcomingSchedule = async (team) => {
  try {
    const response = await axios.post(url + "/schedule", {action : 'getUpcomingSchedule', team});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const getFinishedSchedule = async (team) => {
  try {
    const response = await axios.post(url + "/schedule", {action : 'getFinishedSchedule', team});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const deleteSchedule = async (id) => {
  try {
    const response = await axios.post(url + "/schedule", {action : 'deleteSchedule', id});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};


// Events API
export const getEvents = async () => {
  try {
    const response = await axios.post(url + "/events", {action : 'getEvents'});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const addEvent = async (data) => {
  try {
    const response = await axios.post(url + "/events", {action : 'addEvent', data});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const editEvent = async (data) => {
  try {
    const response = await axios.post(url + "/events", {action : 'editEvent', data});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axios.post(url + "/events", {action : 'deleteEvent', id});
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send data: ${error.message}`);
  }
};