// src/components/ChartWeight.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, ChartDataLabels);

const ChartWeight = ({ labels, dataPoints }) => {

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Weight (kg)',
        data: dataPoints,
        borderColor: '#FB923C',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(251, 146, 60, 0.2)');
          gradient.addColorStop(0.9, '#FFFFFF');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#FB923C',
        pointRadius: 5,
        categoryPercentage: 1.0,
        barPercentage: 1.0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 25, bottom: 0, left: 0, right: 0 },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        align: 'center',
        anchor: 'end',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderColor: '#D1D5DB',
        borderWidth: 1,
        color: '#00000080',
        font: { family: 'Manrope', weight: 'bold', size: 14 },
        formatter: (value) => value,
        padding: { top: 4, bottom: 4, left: 6, right: 6 },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { display: false },
        grid: { display: false, drawBorder: false },
        border: { display: false },
      },
      x: {
        ticks: {
          color: '#848A8D',
          font: { family: 'Mako', size: 12 },
          padding: 10,
          // make leftside padding 0
            // paddingLeft: 0,
        },
        grid: { display: false, drawBorder: false },
        border: { display: false },
        offset: false,
        //can we give some top padding to the x-axis labels?
        min: 0,
        max: labels.length-1,
      },
    },
  };

  return (
    <div className="overflow-x-auto hide-scrollbar mt-[5px]" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
      }}>
    <div className="border border-gray-300 border-[1.5px] rounded-[23px] w-[384px] h-[262px] ">
      <h1 className="mt-[5px] ml-[15px]">
        <span className="text-[#333333] font-mako text-[22px]">Weight in kg</span>
      </h1>
  
      <div className="flex justify-center ">
        <div className="w-[344px] overflow-x-auto hide-scrollbar">
          <div
          className="h-[220px] ml-[-3.5px]"
          style={{
            width: `${Math.max(labels.length, 6) * 60}px`, // dynamic width
          }}
        >
          <Line data={chartData} options={chartOptions} height={180} />
        </div>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default ChartWeight;
