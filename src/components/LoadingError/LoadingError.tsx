import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import styles from './LoadingError.module.css';

export interface LoadingErrorMessageProps {
  message: string;
}

const {
  'outer-container': outerContainer,
  'inner-container': innerContainer,
  icon: iconStyle,
  heading,
  message: messageStyle,
} = styles;

function renderMessage(message: string): JSX.Element {
  // TODO: README.
  const READMELink = '#';
  const messageToRender: (JSX.Element | string)[] = message
    .split(' ')
    .map((word) =>
      word === 'link' ? (
        <span key={word}>
          <a href={READMELink}>{word}</a>{' '}
        </span>
      ) : (
        `${word} `
      ),
    );

  return <p className={messageStyle}>{messageToRender}</p>;
}

export default function LoadingError({ message }: LoadingErrorMessageProps) {
  return (
    <div className={outerContainer}>
      <div className={innerContainer}>
        <div>
          <Icon icon={faBug} className={iconStyle} />
          <h2 className={heading}>Loading Error</h2>
        </div>
        {renderMessage(message)}
      </div>
    </div>
  );
}
