  <Bar dataKey="valor" fill={color}>
    {chartData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={entry.valor >= meta ? "green.500" : entry.valor >= meta * 0.8 ? "yellow.500" : "red.500"}
      />
    ))}
    <LabelList 
      dataKey="valor" 
      position="top" 
      formatter={(value: number) => formatValue(value)}
      style={{ 
        fill: (value: number) => value >= meta ? "#48BB78" : value >= meta * 0.8 ? "#ECC94B" : "#E53E3E",
        fontSize: "10px",
        fontWeight: "bold"
      }}
    />
  </Bar> 