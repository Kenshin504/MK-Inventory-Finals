import React from "react";
import {
  LineChart, 
  Line, 
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/charts.css";

const LineCharts = ({ salesData }) => {

  return (
    <section className="chart-container">
      <h1 className="chart-title">Sales Movement</h1>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={salesData}>
          <XAxis dataKey="period" />
          <YAxis /> {/* Y-axis for total sales amount */}
          <Tooltip />

           <Line
            type="monotone" 
            dataKey="totalSalesAmount" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default LineCharts;