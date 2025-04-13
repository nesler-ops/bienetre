import axios from "axios";

const API_URL = "https://exercisedb.p.rapidapi.com/exercises";
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export const getAllExercises = async () => {
  const response = await axios.get(API_URL, {
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
    },
  });

  return response.data;
};

export const getBodyParts = async () => {
  const response = await axios.get(
    "https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
    {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  return response.data;
};

export const getExercisesByBodyPart = async (bodyPart: string) => {
  const response = await axios.get(
    `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
    {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  return response.data;
};

export const getExercisesByEquipment = async (equipment: string) => {
  const response = await axios.get(
    `https://exercisedb.p.rapidapi.com/exercises/equipment/${equipment}`,
    {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  return response.data;
};

export const getExercisesByName = async (name: string) => {
  const response = await axios.get(
    `https://exercisedb.p.rapidapi.com/exercises/name/${name}`,
    {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  return response.data;
};

export const getEquipmentList = async () => {
  const response = await axios.get(
    "https://exercisedb.p.rapidapi.com/exercises/equipmentList",
    {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  return response.data;
};
