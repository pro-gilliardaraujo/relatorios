import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const convertTimeToHours = (timeStr: string) => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return Number((hours + minutes/60 + seconds/3600).toFixed(2));
};

const data = [
  {
    operacao: 'PLANTIO',
    ocioso: convertTimeToHours('02:30:00'),
    trabalhando: convertTimeToHours('05:45:00'),
  },
  {
    operacao: 'PULVERIZAÇÃO',
    ocioso: convertTimeToHours('01:15:00'),
    trabalhando: convertTimeToHours('06:30:00'),
  },
  {
    operacao: 'COLHEITA',
    ocioso: convertTimeToHours('03:00:00'),
    trabalhando: convertTimeToHours('04:45:00'),
  },
];

export default function MotorOciosoPorOperacao() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
        barSize={35}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="operacao"
          tick={{ fontSize: 10 }}
        />
        <YAxis
          domain={[0, 8]}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${Math.floor(value)}h${Math.round((value % 1) * 60)}m`,
            name === 'ocioso' ? 'Tempo Ocioso' : 'Tempo Trabalhando'
          ]}
          labelStyle={{ fontSize: 10 }}
        />
        <Legend />
        <Bar
          dataKey="ocioso"
          name="Tempo Ocioso"
          stackId="a"
          fill="#FF0000"
          label={{
            position: 'center',
            formatter: (value: number) => `${value.toFixed(1)}h`,
            fontSize: 10,
            fill: '#FFFFFF'
          }}
        />
        <Bar
          dataKey="trabalhando"
          name="Tempo Trabalhando"
          stackId="a"
          fill="#2E8B57"
          label={{
            position: 'center',
            formatter: (value: number) => `${value.toFixed(1)}h`,
            fontSize: 10,
            fill: '#FFFFFF'
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 