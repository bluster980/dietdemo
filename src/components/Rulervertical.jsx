import React, { useRef, useEffect } from "react";

const Rulervertical = ({onChange}) => {
    const rulerStart = 112;
    const rulerEnd = 232;
    const scrollRef = useRef(null);
    const tickRef = useRef(null);         // 🔹 Ref to measure real tick height
    const tickHeightRef = useRef(10); 

    const renderTicks = () => {
        const ticks = [];
        for (let i = rulerStart; i <= rulerEnd; i++) {
            let barWidth = 15;
            let showLabel = false;

            if (i % 8 === 0) {
                barWidth = 85;
                showLabel = true;
            } else if ((i - 2) % 4 === 0) {
                barWidth = 42;
            } else if (i % 2 !== 0) {
                barWidth = 28;
            } else if ((i - 4) % 8 === 0) {
                barWidth = 60;
            }

            ticks.push(
                <div
                    key={i}
                    ref={i === rulerStart ? tickRef : null}  // 🔹 Ref added only to first tick
                    className="inline-block relative h-[10px] w-full"
                >
                    <div
                        className="absolute right-10 top-1/2 bg-gray-400 mr-[0px]"
                        style={{
                            width: `${barWidth}px`,
                            height: "2.5px",
                            transform: "translateY(-50%)",
                            opacity: 0.9,
                        }}
                    />
                    {showLabel && (
                        <div
                            className="absolute right-[110px] text-[25px] text-gray-500 top-1/2 transform -translate-y-1/2 rotate-270"
                            style={{
                                fontFamily: "JetBrains Mono, monospace",
                                fontWeight: "bold",
                            }}
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
        if (scrollRef.current) {
            const scrollTop = scrollRef.current.scrollTop;
            const containerHeight = scrollRef.current.clientHeight;
            const tickHeight = tickHeightRef.current;

            const centerOffset = scrollTop + containerHeight / 2;
            const currentValue = Math.round(centerOffset / tickHeight) + rulerStart - 1;

            onChange(currentValue);
        }
    };
    

    useEffect(() => {
        const scrollElement = scrollRef.current;

        // 🔹 Measure spacing between first two ticks
        if (tickRef.current && tickRef.current.nextSibling) {
            const first = tickRef.current.getBoundingClientRect();
            const second = tickRef.current.nextSibling.getBoundingClientRect();
            const measured = second.top - first.top;
            if (measured > 0) {
                tickHeightRef.current = measured;
            }
        }

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
        <div className="relative h-[500px] w-full">
            {/* Fixed orange pointer */}
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
                <div className="mr-[20px] h-[4px] w-[50px] bg-orange-500 mx-auto"></div>
                <div className="mr-[2px] mt-[-22px] w-0 h-0 border-b-[20px] border-t-[20px] border-r-[20px] border-t-transparent border-b-transparent border-r-orange-500 mx-auto"></div>
            </div>

            {/* Scrollable Ruler */}
            <div
                ref={scrollRef}
                className="overflow-y-scroll h-full scrollbar-hide"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                <div className="w-full py-[3vh]">{renderTicks()}</div>
            </div>
        </div>
    );
};

export default Rulervertical;
