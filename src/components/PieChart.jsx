import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "../styles/charts.css";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
  "#A28DFF", "#FF6B6B", "#5AD8A6", "#8884D8",
  "#82CA9D", "#FFC658", "#8DD1E1", "#A4DE6C"
];

const PieCharts = ({ stockData }) => {
  return (
    <section className="chart-container">
      <h1 className="chart-title">Sales Distribution by Category</h1>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={stockData}
            dataKey="quantity_sold"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            fill="#8884d8"
            paddingAngle={2}
          >
            {stockData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [
              `${value} units`,
              name
            ]}
          />
          <Legend 
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{
              paddingLeft: '20px',
              fontSize: '11px'
            }}
            formatter={(value) => (
              <span style={{ color: '#333' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
};

export default PieCharts;