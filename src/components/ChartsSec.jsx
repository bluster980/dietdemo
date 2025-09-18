
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";


const data = [
  { date: '20/3', value: 72 },
  { date: '21/3', value: 76 },
  { date: '22/3', value: 68 },
//   { date: '23/3', value: 79 },
//   { date: '24/3', value: 74 },
//   { date: '25/3', value: 68 },
//   { date: '26/3', value: 74 },
//   { date: '27/3', value: 81 },
//   { date: '28/3', value: 74 },
  // add/remove items to test scroll
];

const ChartsSec = () => {
  const slotWidth = 68; // fixed spacing between data points
  const visibleSlots = 6;
  const chartWidth = Math.max(data.length * slotWidth, visibleSlots * slotWidth);
// const chartWidth = data.length * slotWidth;
  const gradientId = "orangeGradient";
  const paddedData = [...data];

  while (paddedData.length < visibleSlots) {
  paddedData.push({
    date: `${paddedData.length + 20}/3`, // fake date
    value: null // this will break the line
  });
}

  return (
    <div className="w-full overflow-x-auto flex justify-center">
      <div style={{ width: `${chartWidth}px`, minHeight: "220px" }}>
        <AreaChart
          width={chartWidth}
          height={220}
          data={paddedData}
          margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFA500" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#FFA500" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* X-axis */}
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
            tick={{ fontSize: 12 }}
          />

          {/* Y-axis */}
          <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />

          {/* Grid */}
          <CartesianGrid vertical={false} strokeDasharray="3 3" />

          {/* Tooltip */}
          <Tooltip />

          {/* Area and Line */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FFA500"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ stroke: '#FFA500', strokeWidth: 2, fill: '#fff', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </div>
    </div>
  );
};


export default ChartsSec;