import React from "react";
import {
  BarChart,
  Bar,
  XAxis, 
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import "../styles/charts.css";

const SalesBarCharts = ({ stockData }) => {
  return (
    <section className="chart-container">
      <h1 className="chart-title">Total Quantity Sold by Product (Period)</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={stockData}
          margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
        >
           <XAxis dataKey="name" tick={false} axisLine={true} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantity_sold" fill="#8884d8">
            <LabelList dataKey="quantity_sold" position="top" fill="#333" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default SalesBarCharts;