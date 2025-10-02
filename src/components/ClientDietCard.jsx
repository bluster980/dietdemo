import React, { useMemo, useState } from "react";
import oatmeal from "../assets/oatmeal.png";
import Dietfire from "../assets/dietfire.svg";
import AddPlus from "../assets/addplus.svg";
import toast from "react-hot-toast";

const ClientDietCard = ({
  meal,
  addButton,
  mode = "select",
  onAdd,
  onRemove,
}) => {
  const [qty, setQty] = useState(""); // grams input as string so it can be empty

  const isScaled = meal?.isScaled === true;
  const effectiveQty =
    mode === "preview" ? Number(meal?.qty) || 0 : Number(qty) || NaN;

  // Baseline per 100g
  const p100 = Number(meal.protein) || 0;
  const c100 = Number(meal.carbs) || 0;
  const f100 = Number(meal.fat) || 0;
  const kcal100 = Number(meal?.calories) || 0;

  const hasQty =
    mode === "preview"
      ? effectiveQty > 0
      : qty !== "" && !Number.isNaN(effectiveQty) && effectiveQty > 0;
  const factor = isScaled ? 1 : (hasQty ? effectiveQty / 100 : 1);

  // Scaled macros: if qty empty or NaN, show per-100g; else scale by qty/100
  const p = +(p100 * factor).toFixed(1);
  const c = +(c100 * factor).toFixed(1);
  const f = +(f100 * factor).toFixed(1);
  const kcal = Math.round(kcal100 * factor);

  // Heights relative to the largest macro, to visualize proportions
  const { hp, hc, hf } = useMemo(() => {
    const maxVal = Math.max(p, c, f, 1);
    return {
      hp: Math.round((p / maxVal) * 100),
      hc: Math.round((c / maxVal) * 100),
      hf: Math.round((f / maxVal) * 100),
    };
  }, [p, c, f]);

  // Optional minimum height so tiny values remain visible
  const minPct = 6;
  const pct = (x) => `${Math.max(x, p || c || f ? minPct : 0)}%`;

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (mode !== "select") return;
    const q = Number(qty);
    if (!qty || Number.isNaN(q) || q <= 0) {
      toast.error("Please select quantity"); // toast
      return;
    }
    onAdd?.({
      ...meal,
      qty: q, // persist qty in parent
      // Option A: also persist scaled numbers to freeze snapshot:
      calories: kcal,
      protein: p,
      carbs: c,
      fat: f,
      isScaled: true,
    });
    setQty("");
  };

  return (
    <div className="w-full flex justify-center items-center mt-[8px]">
      <div className="relative flex w-[385px] h-[113px] border border-[#E9ECEF] rounded-[10px] bg-white">
        <img
          src={oatmeal}
          className="w-[84px] h-[84px] rounded-[50px] mt-[6px] ml-[8px] text-[15px]"
          alt="No img available"
          style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.25)" }}
        />
        <div className="flex flex-col ml-[12px] mt-[5px]">
          <div className="text-[18px] font-urbanist  w-[90%] h-[35px]">
            <span className="font-semibold text-[#2D3436]">
              {meal.meal_name}
            </span>
            <div className="flex items-center gap-x-[5px]">
              <Dietfire />
              <p className="text-[15px] font-urbanist">
                <span className="text-[#6a6a6a] font-semibold">{kcal}</span>
                <span className="ml-[5px] text-[#6C757D] font-regular">
                  kcal
                </span>
              </p>
            </div>
          </div>
          <div className="flex jutify-center items-center w-full gap-x-[10px] mt-[12px]">
            <div className="w-[8px] h-[40px] bg-[#F8F9FA] rounded-[10px] mt-[1px] overflow-hidden flex items-end">
              <div
                className="h-[60%] w-full bg-[#FFA8A6] rounded-[10px]"
                style={{ height: pct(hp) }}
              ></div>
            </div>
            <div className="text-[15px] font-urbanist text-[#6a6a6a] flex flex-col">
              <div className="flex font-semibold">
                <span>{Math.round(p)}</span>
                <span className="ml-[0px]">g</span>
              </div>
              <div className="flex text-[#6C757D] font-regular">
                <span>Protein</span>
              </div>
            </div>
            <div className="w-[8px] h-[40px] bg-[#F8F9FA] rounded-[10px] mt-[1px] overflow-hidden flex items-end">
              <div
                className="h-[60%] w-full bg-[#c7fceb] rounded-[10px]"
                style={{ height: pct(hc) }}
              ></div>
            </div>
            <div className="text-[15px] font-urbanist text-[#6a6a6a] flex flex-col">
              <div className="flex font-semibold">
                <span>{Math.round(c)}</span>
                <span className="ml-[0px]">g</span>
              </div>
              <div className="flex text-[#6C757D] font-regular">
                <span>Carbs</span>
              </div>
            </div>
            <div className="w-[8px] h-[40px] bg-[#F8F9FA] rounded-[10px] mt-[1px] overflow-hidden flex items-end">
              <div
                className="h-[60%] w-full bg-[#ffe28c] rounded-[10px]"
                style={{ height: pct(hf) }}
              ></div>
            </div>
            <div className="text-[15px] font-urbanist text-[#6a6a6a] flex flex-col">
              <div className="flex font-semibold">
                <span>{Math.round(f)}</span>
                <span className="ml-[0px]">g</span>
              </div>
              <div className="flex text-[#6C757D] font-regular">
                <span>Fats</span>
              </div>
            </div>
            <div className="w-[8px] h-[40px] bg-[#F8F9FA] rounded-[10px] mt-[1px] overflow-hidden flex items-end">
              <div className="h-[60%] w-full bg-[#97c1fc] rounded-[10px]"></div>
            </div>
            {mode === "select" ? (
              <div className="text-[15px] font-urbanist text-[#6a6a6a] flex flex-col">
                <div className="flex items-center font-semibold w-[53px] h-[25px] rounded-[5px] outline-none border border-[#E9ECEF]">
                  <input
                    type="number"
                    className="w-[35px] h-[20px] rounded-[5px] outline-none text-start ml-[6px]"
                    placeholder="100"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                  <span className="ml-[-5px]">g</span>
                </div>
                <div className="flex text-[#6C757D] font-regular">
                  <span>Quantity</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col text-[15px] font-urbanist text-[#6a6a6a] flex">
                <span className="flex font-semibold" >
                  {meal?.qty ?? 0}g
                </span>
                <span className="flex text-[#6C757D] font-regular">Quantity</span>
              </div>
            )}
          </div>
        </div>
        {addButton && (
          <div
            className="z-1 absolute top-[4px] right-[8px] h-[20px] w-[20px] rounded-[10px] mt-[5px]"
            style={{ boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.15)" }}
            onClick={mode === "select" ? handleAddClick : onRemove}
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
    </div>
  );
};

export default ClientDietCard;
