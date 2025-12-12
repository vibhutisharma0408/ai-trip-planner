interface Props {
  title: string;
  value: string;
  helper?: string;
}

export default function DashboardCard({ title, value, helper }: Props) {
  return (
    <div className="card p-4">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {helper && <p className="text-sm text-slate-500">{helper}</p>}
    </div>
  );
}

