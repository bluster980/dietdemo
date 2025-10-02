import React, { useState, useMemo } from "react";
// import dumbellchest from '../assets/situps.gif';
import AddPlus from "../assets/addplus.svg";
import toast from "react-hot-toast";

const WorkoutCard = ({
  exercise,
  addButton,
  mode = "select",
  isEditing = true,
  isSelectedForDay = false,
  onAdd,
  onRemove,
  onBeginEdit,
  viewMode = "trainer-select",
}) => {
  const [repsInput, setRepsInput] = useState("");
  const [setsInput, setSetsInput] = useState("");

  const isClientView = viewMode === "client-view";
  const isSelectAndEditing =
    mode === "select" && isEditing && !isSelectedForDay;

  const isValid = useMemo(() => {
    if (!isSelectAndEditing) return true;
    return (
      String(repsInput).trim().length > 0 && String(setsInput).trim().length > 0
    );
  }, [isSelectAndEditing, repsInput, setsInput]);

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!isSelectAndEditing) return;
    if (!isValid) {
      toast.error("Please fill Reps and Sets");
      return;
    }
    onAdd?.({
      ...exercise,
      reps: repsInput,
      sets: setsInput,
    });
    // clear local inputs after add to visually exit edit state
    setRepsInput("");
    setSetsInput("");
  };

  // Optional: inform parent to mark this card as editing when user engages
  const beginEdit = () => onBeginEdit?.();

  // Choose display values: when selected for day, show exercise.reps/sets (saved in parent)
   const repsDisplay = isClientView
    ? exercise.reps
    : isSelectAndEditing
      ? repsInput
      : exercise.reps ?? repsInput;

  const setsDisplay = isClientView
    ? exercise.sets
    : isSelectAndEditing
      ? setsInput
      : exercise.sets ?? setsInput;

  return (
    <div className="flex flex-col justify-center items-center mt-[12px]">
      <div
        className="flex justify-center items-center w-[385px] h-[160px] border border-[#E9ECEF] rounded-[10px] bg-white"
        style={{ boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.08)" }}
      >
        <div className="flex flex-col w-full ">
          <div className="flex flex-col ml-[20px] mt-[px]">
            <span className="text-[#2D3436] font-urbanist font-medium text-[22px]">
              {exercise.exercise_name}
            </span>
            <p className="flex mt-[5px]">
              <span className="text-[#6C757D] font-urbanist text-[16px]">
                {" "}
                Target:{" "}
              </span>
              <span className="text-[#2D3436] font-urbanist text-[16px] ml-[4px] font-medium">
                {exercise.target}
              </span>
            </p>
            {isClientView ? (
              <p className="flex">
                <span className="text-[#6C757D] font-urbanist text-[16px]"> Reps: </span>
                <span className="text-[#2D3436] font-urbanist text-[16px] ml-[4px] font-medium">
                  {repsDisplay}
                </span>
              </p>
            ) : isSelectAndEditing ? (
              <div className="flex items-center">
                <span className="text-[#6C757D] font-urbanist text-[16px]"> Reps: </span>
                <input
                  type="text"
                  className="ml-[6px] w-[70px] h-[24px] px-[6px] rounded-[6px] border border-[#E9ECEF] text-[#2D3436] font-urbanist text-[15px] font-medium outline-none"
                  placeholder={exercise.reps || "e.g. 10-12"}
                  value={repsInput}
                  onFocus={beginEdit}
                  onChange={(e) => setRepsInput(e.target.value)}
                />
              </div>
            ) : (
              <p className="flex">
                <span className="text-[#6C757D] font-urbanist text-[16px]"> Reps: </span>
                <span className="text-[#2D3436] font-urbanist text-[16px] ml-[4px] font-medium">
                  {repsDisplay}
                </span>
              </p>
            )}
            {isClientView ? (
              <p className="flex">
                <span className="text-[#6C757D] font-urbanist text-[16px]"> Sets: </span>
                <span className="text-[#2D3436] font-urbanist text-[16px] ml-[4px] font-medium">
                  {setsDisplay}
                </span>
              </p>
            ) : isSelectAndEditing ? (
              <div className="flex items-center">
                <span className="text-[#6C757D] font-urbanist text-[16px]"> Sets: </span>
                <input
                  type="number"
                  min="1"
                  className="ml-[6px] w-[60px] h-[24px] px-[6px] rounded-[6px] border border-[#E9ECEF] text-[#2D3436] font-urbanist text-[15px] font-medium outline-none"
                  placeholder={exercise.sets || "3"}
                  value={setsInput}
                  onFocus={beginEdit}
                  onChange={(e) => setSetsInput(e.target.value)}
                />
              </div>
            ) : (
              <p className="flex">
                <span className="text-[#6C757D] font-urbanist text-[16px]"> Sets: </span>
                <span className="text-[#2D3436] font-urbanist text-[16px] ml-[4px] font-medium">
                  {setsDisplay}
                </span>
              </p>
            )}
            <p className="flex">
              <span className="text-[#6C757D] font-urbanist text-[16px]">
                {" "}
                Rest:{" "}
              </span>
              <span className="text-[#2D3436] font-urbanist text-[16px] ml-[4px] font-medium">
                {exercise.rest}
              </span>
            </p>
          </div>
        </div>
        <div className="z-0 relative">
          <div className="mr-[10px]">
            <img
              src={`/gifs/${exercise.gif_url.replaceAll(" ", "")}.gif`}
              alt={exercise.exercise_name}
              className="w-[250px] h-[155px] rounded-[10px]"
            />
          </div>
          {!isClientView && addButton && (
            <div
              className="z-1 absolute top-[3px] right-[-5px] h-[20px] w-[20px] rounded-[10px] mt-[5px]"
              style={{
                boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.15)",
                opacity: mode === "select" && (!isSelectAndEditing || !isValid) ? 0.5 : 1,
                pointerEvents: mode === "select" && (!isSelectAndEditing || !isValid) ? "none" : "auto",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "select") return handleAddClick(e);
                return onRemove?.(e);
              }}
              aria-disabled={mode === "select" && (!isSelectAndEditing || !isValid)}
            >
              <AddPlus
                style={
                  addButton === "preview"
                    ? { transform: "rotate(45deg)", color: "#ff7675" }
                    : { color: "#ff7675" }
                }
              />
            </div>
          )}
        </div>
        <div className="w-[30px]"></div>
      </div>
    </div>
  );
};

export default WorkoutCard;
