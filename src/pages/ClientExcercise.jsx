import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileEditPen from "../assets/profileeditpen.svg";
import oatmeal from "../assets/oatmeal.png";
import BackArrow from "../assets/backarrow.svg";
import Search from "../assets/search.svg";
import WorkoutCard from "../components/WorkoutCard";

const exercise = {
  exercise_name: "Incline Bench Press",
  target: "Chest",
  reps: "10-15",
  sets: "3",
  rest: "1 min",
  gif_url: "Incline Bench Press",
};
const exercise1 = {
  exercise_name: "Decline Cable Fly",
  target: "Chest",
  reps: "10-15",
  sets: "3",
  rest: "1 min",
  gif_url: "Decline Cable Fly",
};
const exercise2 = {
  exercise_name: "Cable Fly",
  target: "Chest",
  reps: "10-15",
  sets: "3",
  rest: "1 min",
  gif_url: "Cable Fly",
};
const exercise3 = {
  exercise_name: "Pec Dec Fly",
  target: "Chest",
  reps: "10-15",
  sets: "3",
  rest: "1 min",
  gif_url: "Pec Dec Fly",
};
const exercise4 = {
  exercise_name: "Incline Dumbell Fly",
  target: "Chest",
  reps: "10-15",
  sets: "3",
  rest: "1 min",
  gif_url: "Incline Dumbell Fly",
};

const allExercises = [exercise, exercise1, exercise2, exercise3, exercise4];

const ClientExcercise = () => {
  // Replace your existing state with this
  const navigate = useNavigate();
  const [isActiveDay, setActiveDay] = useState("FRI");
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState({});

  const filteredMeals = allExercises.filter((exObj) =>
    exObj.exercise_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [dayExercises, setDayExercises] = useState({
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
    SAT: [],
    SUN: [],
  });

  const selectedNamesForDay = new Set(
    dayExercises[isActiveDay].map((ex) => ex.exercise_name)
  );
  function handlePreviewClick() {
    setIsPreviewEnabled(!isPreviewEnabled);
  }

  // Add for specific day, block duplicates within that day only
  const addExerciseForDay = (day, exerciseToAdd) => {
    setDayExercises((prev) => {
      const already = prev[day].some(
        (ex) => ex.exercise_name === exerciseToAdd.exercise_name
      );
      if (already) return prev;
      return {
        ...prev,
        [day]: [...prev[day], exerciseToAdd],
      };
    });
  };

  const removeExercise = (exerciseToRemove) => {
    setDayExercises((prev) => ({
      ...prev,
      [isActiveDay]: prev[isActiveDay].filter(
        (ex) => ex.exercise_name !== exerciseToRemove.exercise_name
      ),
    }));
    setEditing((m) => ({
      ...m,
      [`${isActiveDay}:${exerciseToRemove.exercise_name}`]: true,
    }));
  };

  return (
    <div
      className="relative flex flex-col justify-between items-center"
      style={{
        background: "#FFFFFF",
      }}
    >
      <div className="flex flex-col">
        <BackArrow
          alt="back arrow"
          onClick={() => navigate(-1)}
          style={{
            width: "30px",
            height: "30px",
            position: "absolute",
            display: "flex",
            top: "30px",
            left: "5px",
            zIndex: 1,
          }}
        />
      </div>
      <div className="w-[92%] flex justify-end mt-[50px]">
        <div className="flex justify-center items-center w-[56px] h-[23px] rounded-[8px] bg-white border border-[#E9ECEF]">
          <ProfileEditPen className="h-[15px] w-[15px] ml-[px]" />
          <button className="z-1 h-full mb-[2px] ml-[2px] justify-center items-center text-[#6C757D] font-urbanist font-semibold text-[14px]">
            Save
          </button>
        </div>
      </div>
      <div className="w-full flex justify-center items-center mt-[5px]">
        <div className="w-[92%] h-[45px] border border-[#E9ECEF] bg-white rounded-[10px] justify-start items-center">
          <div className="flex items-center h-full">
            <img
              src={oatmeal}
              className="h-[35px] w-[35px] ml-[3px] text-[15px]"
              alt="No img available"
            />
            <p className="text-[20px] font-urbanist font-semibold text-[#333333] ml-[8px]">
              <span>Nilvana Lara</span>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center items-center gap-x-[10px] mt-[8px]">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, index) => (
          <div
            key={index}
            className={`w-[11%] h-[54px] rounded-[8px] ${
              isActiveDay === day
                ? "bg-[#E6FCF5] border border-[#4ECDC4]"
                : "bg-white border border-[#E9ECEF]"
            }`}
          >
            <p
              className={`flex justify-center items-center h-full text-[15px] font-urbanist ${
                isActiveDay === day ? "text-[#2D3436]" : "text-[#6C757D]"
              } ${isActiveDay === day ? "font-bold" : "font-medium"}`}
              onClick={() => {
                console.log(day);
                setActiveDay(day);
              }}
            >
              {day}
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center mt-[10px] gap-x-[5px] w-full">
        <div className="gap-x-[10px] flex items-center justify-start w-[82%] h-[43px] border border-[#E9ECEF] rounded-[50px] bg-white">
          <Search className="ml-[12px]" />
          <p className="flex text-center text-[20px] font-urbanist text-[#565656]">
            <input
              className="w-full h-full text-[20px] font-urbanist text-[#565656]"
              placeholder="Search Excercise Name"
              style={{ outline: "none", border: "none" }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </p>
        </div>
        <div
          className="flex items-center justify-center h-[43px] w-[43px] rounded-[100%] border border-[#E9ECEF] bg-white"
          onClick={handlePreviewClick}
          style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" }}
        >
          <p className="font-urbanist font-bold text-[20px] text-[#2D3436]">
            {dayExercises[isActiveDay].length}
          </p>
        </div>
      </div>
      <div className="w-full mt-[10px]">
        <div className="justify-between items-center h-[1px] bg-[#F1F3F5]"></div>
      </div>
      <div
        className="flex h-[72vh] overflow-y-scroll"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        }}
      >
        <div className="flex flex-col items-center">
          {filteredMeals.map((exObj) => {
            const selected = selectedNamesForDay.has(exObj.exercise_name);
            const editKey = `${isActiveDay}:${exObj.exercise_name}`;
            const isEditing = selected ? false : editing[editKey] ?? true;
            return (
              <WorkoutCard
                key={`${exObj.exercise_name}-${isActiveDay}`}
                exercise={exObj}
                addButton
                mode="select"
                isEditing={isEditing} // locked if already selected
                isSelectedForDay={selected} // NEW
                onBeginEdit={() =>
                  setEditing((m) => ({ ...m, [editKey]: true }))
                }
                onAdd={(exWithVals) => {
                  addExerciseForDay(isActiveDay, exWithVals);
                  setEditing((m) => ({ ...m, [editKey]: false })); // lock after add
                }}
              />
            );
          })}
        </div>
      </div>

      {isPreviewEnabled && (
        <div className="fixed w-full h-[75%] mt-[250px] flex items-center justify-center bg-black bg-opacity-70">
          <div
            className="h-full overflow-y-scroll"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent",
            }}
          >
            <div className="flex flex-col justify-center items-center">
              {dayExercises[isActiveDay].map((exercise) => (
                <WorkoutCard
                  key={`${isActiveDay}-${exercise.exercise_name}`}
                  exercise={exercise}
                  addButton={"preview"}
                  mode="preview"
                  isEditing={false}
                  onRemove={(e) => {
                    e?.stopPropagation?.();
                    removeExercise(exercise);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientExcercise;
