import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const convertTimeToHours = (timeStr: string) => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return Number((hours + minutes/60 + seconds/3600).toFixed(2));
};

const data = [
  { id: '6128', tempo: convertTimeToHours('04:39:40'), label: 'TRABALHANDO' },
  { id: '6129', tempo: convertTimeToHours('02:11:25'), label: 'TRABALHANDO' },
  { id: '6126', tempo: convertTimeToHours('03:11:17'), label: 'TRABALHANDO' },
];

export default function HorasTrabalhadasPlantadeira() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="id"
          tick={{ fontSize: 10 }}
        />
        <YAxis
          domain={[0, 6]}
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
          fill="#2E8B57"
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