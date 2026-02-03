interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority';
}

const StatusBadge = ({ status, type = 'status' }: StatusBadgeProps) => {
  const getStyles = () => {
    if (type === 'priority') {
      switch (status) {
        case 'LOW':
          return 'bg-green-100 text-green-800';
        case 'MEDIUM':
          return 'bg-yellow-100 text-yellow-800';
        case 'HIGH':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    if (type === 'status') {
      switch (status) {
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800';
        case 'IN_PROGRESS':
          return 'bg-blue-100 text-blue-800';
        case 'DONE':
          return 'bg-green-100 text-green-800';
        case 'ACTIVE':
          return 'bg-green-100 text-green-800';
        case 'BROKEN':
          return 'bg-red-100 text-red-800';
        case 'UNDER_REPAIR':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStyles()}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
