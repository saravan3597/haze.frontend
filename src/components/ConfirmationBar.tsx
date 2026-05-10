import React, { useEffect, useState } from 'react';
import './ConfirmationBar.css';

interface Props {
  message: string | null;
}

const ConfirmationBar: React.FC<Props> = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setDisplayed(message);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!displayed) return null;

  return (
    <div className={`confirmation-bar${visible ? ' confirmation-bar--visible' : ''}`}>
      {displayed}
    </div>
  );
};

export default ConfirmationBar;
