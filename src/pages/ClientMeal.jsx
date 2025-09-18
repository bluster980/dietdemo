import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import oatmeal from "../assets/oatmeal.png";
import ProfileEditPen from "../assets/profileeditpen.svg";
import Search from "../assets/search.svg";
import ClientDietCard from "../components/ClientDietCard";

const meal = {
  mealName: "Grilled Salad",
  calories: 350,
  protein: 30,
  carbs: 10,
  fat: 15,
};

const meal1 = {
  mealName: "Grilled Chicken Salad",
  calories: 350,
  protein: 10,
  carbs: 10,
  fat: 35,
};

const meal2 = {
  mealName: "Oatmeal with milk",
  calories: 350,
  protein: 10,
  carbs: 20,
  fat: 15,
};

const meal3 = {
  mealName: "Chicken Salad",
  calories: 350,
  protein: 30,
  carbs: 10,
  fat: 15,
};

const meal4 = {
  mealName: "Boiled Egg Whites",
  calories: 350,
  protein: 30,
  carbs: 10,
  fat: 15,
};

const meal5 = {
  mealName: "Rice With chicken",
  calories: 350,
  protein: 30,
  carbs: 10,
  fat: 15,
};

const meal6 = {
  mealName: "Sabji And Roti",
  calories: 350,
  protein: 30,
  carbs: 10,
  fat: 15,
};

const allMeals = [meal, meal1, meal2, meal3, meal4, meal5, meal6];

const ClientMeal = () => {
  const navigate = useNavigate();
  const [isActiveTime, setActiveTime] = useState("Snacks");
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMeals = allMeals.filter((mealObj) =>
    mealObj.mealName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [timeMeals, setTimeMeals] = useState({
    Breakfast: [],
    Lunch: [],
    Snacks: [],
    Dinner: [],
  });

  function handlePreviewClick() {
    setIsPreviewEnabled(!isPreviewEnabled);
  }

  const addMeal = (mealToAdd) => {
    setTimeMeals((prev) => {
      const isDuplicate = prev[isActiveTime].some(
        (ex) => ex.mealName === mealToAdd.mealName
      );
      if (isDuplicate) return prev;
      return {
        ...prev,
        [isActiveTime]: [...prev[isActiveTime], mealToAdd], // mealToAdd now includes qty
      };
    });
  };

  const removeMeal = (mealToRemove) => {
    setTimeMeals((prev) => ({
      ...prev,
      [isActiveTime]: prev[isActiveTime].filter(
        (ex) => ex.mealName !== mealToRemove.mealName
      ),
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
          <div className="flex justify-start items-center h-full">
            <img
              src={oatmeal}
              className="h-[35px] w-[35px] ml-[3px] text-[15px]"
              alt="No img available"
            />
            <p className="text-[20px] font-urbanist font-semibold text-[#2D3436] ml-[8px]">
              <span>Nilvana Lara</span>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center items-center gap-x-[5px] mt-[8px]">
        {["Breakfast", "Lunch", "Snacks", "Dinner"].map((time, index) => (
          <div
            key={index}
            className={`w-[22%] h-[54px]  rounded-[8px] ${
              isActiveTime === time
                ? "bg-[#E6FCF5] border border-[#4ECDC4]"
                : "bg-white border border-[#E9ECEF]"
            }`}
          >
            <p
              className={`flex justify-center items-center h-full text-[20px] font-urbanist ${
                isActiveTime === time ? "text-[#2D3436]" : "text-[#6C757D]"
              } ${isActiveTime === time ? "font-semibold" : "font-medium"}`}
              onClick={() => {
                console.log(time);
                setActiveTime(time);
              }}
            >
              {time}
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
            {timeMeals[isActiveTime].length}
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
          {filteredMeals.map((mealObj) => (
            <ClientDietCard
              key={mealObj.mealName}
              meal={mealObj}
              addButton={true}
              mode="select"
              onAdd={(mealWithQty) => addMeal(mealWithQty)}
            />
          ))}
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
              {timeMeals[isActiveTime].map((meal) => (
                <ClientDietCard
                  key={`${isActiveTime}-${meal.mealName}`}
                  meal={meal}
                  addButton={"preview"}
                  mode="preview"
                  onRemove={(e) => { e?.stopPropagation?.(); removeMeal(meal); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMeal;
