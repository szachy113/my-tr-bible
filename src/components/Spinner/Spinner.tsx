import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './Spinner.module.css';

const { container, spinner } = styles;

export default function Spinner() {
  return (
    <div className={container}>
      <Icon icon={faSpinner} className={spinner} />
    </div>
  );
}
