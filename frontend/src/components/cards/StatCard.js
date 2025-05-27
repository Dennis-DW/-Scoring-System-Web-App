// StatCard.js
import PropTypes from 'prop-types';

const StatCard = ({ value, label, icon, subtext }) => (
  <div className="flex flex-col rounded-2xl border border-slate-200 bg-white">
    <div className="flex w-full grow items-center justify-between p-5 lg:p-6">
      <dl>
        <dt className="text-2xl font-bold">{value}</dt>
        <dd className="text-slate-600">{label}</dd>
      </dl>
      <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>
    </div>
    <div className="w-full border-t border-slate-100 px-5 py-3 text-xs font-medium text-slate-500 lg:px-6">
      <p>{subtext}</p>
    </div>
  </div>
);

StatCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  subtext: PropTypes.string.isRequired,
};

export default StatCard;