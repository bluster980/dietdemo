import React, { useRef, useEffect } from "react";

const Ruler = ({onChange}) => {
    const rulerStart = 16;
    const rulerEnd = 160;
    const scrollRef = useRef(null);
    const tickRef = useRef(null);

    const renderTicks = () => {
        const ticks = [];
        for (let i = rulerStart; i <= rulerEnd; i++) {
            let barHeight = 15;
            let showLabel = false;

            if (i % 8 === 0) {
                barHeight = 85;
                showLabel = true;
            } else if ((i - 2) % 4 === 0) {
                barHeight = 42;
            } else if (i % 2 !== 0) {
                barHeight = 28;
            } else if ((i - 4) % 8 === 0) {
                barHeight = 60;
            }

            ticks.push(
                <div
                    key={i}
                    ref={i === rulerStart ? tickRef : null}
                    className="inline-block left-[-150px] w-[10px] h-[130px] relative"
                    >
                    <div
                        className="absolute bottom-0 left-1/2 bg-gray-400"
                        style={{
                            height: `${barHeight}px`,
                            width: "2.5px",
                            transform: "translateX(-50%)",
                            opacity: 0.9, // Decreased opacity for transparency
                        }}
                    />
                    {showLabel && (
                        <div
                            className="absolute bottom-[100px] text-[25px] text-gray-500 left-1/2 transform -translate-x-1/2"
                            style={{ fontFamily: "JetBrains Mono, monospace", marginBottom: "-8px", fontWeight: "bold" }}
                        >
                            {i}
                        </div>
                    )}
                </div>
            );
        }
        return ticks;
    };

    const handleScroll = () => {
        if (scrollRef.current && tickRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const containerWidth = scrollRef.current.clientWidth;
    
            const tickRect = tickRef.current.getBoundingClientRect();
            const tickWidth = tickRect.width;
    
            const centerOffset = scrollLeft + containerWidth / 2;
            const currentValue = Math.round(centerOffset / tickWidth) + rulerStart - 1;
    
            onChange(currentValue);
        }
    };

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    return (
        <div className="relative w-full mt-[0px]">
            {/* Fixed orange pointer */}
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 z-10">
                <div className="mt-[62px] w-[4px] h-[50px] bg-orange-500 mx-auto"></div>
                <div className="mt-[-2px] w-0 h-0 border-l-[20px] border-r-[20px] border-b-[20px] border-l-transparent border-r-transparent border-b-orange-500 mx-auto"></div>
            </div>

            {/* Scrollable Ruler */}
            <div
                ref={scrollRef}
                className="overflow-x-scroll scrollbar-hide"
                style={{
                    scrollbarWidth: "none", // For Firefox
                    msOverflowStyle: "none", // For IE and Edge
                }}
            >
                <div className="h-[130px] whitespace-nowrap px-[50vw]">
                    {renderTicks()}
                </div>
            </div>
        </div>
    );
};

export default Ruler;
