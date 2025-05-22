import React from "react";
import {
  BarChart,
  Bar, 
  XAxis, 
  YAxis,
  Tooltip,
  Legend, 
  ResponsiveContainer,
} from "recharts";
import "../styles/charts.css";

const StockBarCharts = ({ stockData }) => {

  return (
    <section className="chart-container">
      <h1 className="chart-title">Current Stock Status</h1> {/* Updated title */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stockData}>          <XAxis dataKey="name" tick={false} axisLine={true} /> 

              <YAxis /> 
              <Tooltip />
              <Legend /> 
              <Bar
                dataKey="current_stock" 
                fill="#4682B4" 
              />
            </BarChart>
          </ResponsiveContainer>
        </section>
      );
    };

export default StockBarCharts;