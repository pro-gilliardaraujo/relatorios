import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const convertTimeToHours = (timeStr: string) => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return Number((hours + minutes/60 + seconds/3600).toFixed(2));
};

const data = [
  { name: 'TROCA DE TURNO', tempo: convertTimeToHours('8:49:29'), percentual: 25.6 },
  { name: 'SEM OPERADOR', tempo: convertTimeToHours('8:30:59'), percentual: 23.7 },
  { name: 'MANUTENÇÃO MECÂNICA', tempo: convertTimeToHours('8:10:46'), percentual: 22.2 },
  { name: 'ABASTECIMENTO DE INSUMOS', tempo: convertTimeToHours('6:47:29'), percentual: 18.0 },
  { name: 'ABASTECIMENTO DE CAIXA PLANTADEIRA', tempo: convertTimeToHours('3:34:41'), percentual: 10.0 },
];

export default function TopOfensores() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 40, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={60}
          interval={0}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(value: number) => [
            `${Math.floor(value)}h${Math.round((value % 1) * 60)}m`,
            'Tempo'
          ]}
          labelStyle={{ fontSize: 10 }}
        />
        <Bar
          dataKey="tempo"
          fill="#FF0000"
          label={{ 
            position: 'top',
            formatter: (value: number) => `${value.toFixed(1)}h`,
            fontSize: 10
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 