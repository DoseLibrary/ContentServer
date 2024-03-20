import { ReactNode } from 'react';
import { IconBaseProps, IconType } from 'react-icons/lib';

export type GridCardProps = {
  title: string;
  value: string;
  icon: IconType;
  color: string;
};

const GridCard = ({ title, value, icon, color }: GridCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-3">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-12 w-12 ${color}`}>
            {icon({ size: 24 })}
          </div>
          <div className="ml-5">
            <div className="text-sm font-medium text-gray-500 truncate">
              {title}
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GridCard;
