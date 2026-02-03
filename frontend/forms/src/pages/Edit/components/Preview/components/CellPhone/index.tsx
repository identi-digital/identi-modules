import React from 'react';
import './styles.css';

type CellPhoneProps = {
  children: React.ReactNode;
};

const CellPhone: React.FC<CellPhoneProps> = ({ children }) => {
  return (
    <div className="smartphone">
      <div className="content">{children}</div>
    </div>
  );
};

export default CellPhone;
