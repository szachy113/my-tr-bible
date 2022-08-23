import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBookBible } from '@fortawesome/free-solid-svg-icons';
import styles from './Spinner.module.css';

const { container, spinner } = styles;

export default function Spinner() {
  return (
    <div className={container}>
      <Icon icon={faBookBible} className={spinner} />
    </div>
  );
}
