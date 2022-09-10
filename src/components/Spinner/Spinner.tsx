import { useId, useRef, useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LanguageCode } from 'iso-639-1';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBookBible } from '@fortawesome/free-solid-svg-icons';
import { createPortal } from 'react-dom';
import styles from './Spinner.module.css';

const { container, spinner } = styles;
const flagsPath = '../../../node_modules/flag-icons/flags/1x1';

export default function Spinner() {
  const svgDefsPatternId = useId();
  const iconRef = useRef<SVGSVGElement | null>(null);
  const [fontAwesomeIconPathDAttribute, setFontAwesomeIconPathDAttribute] =
    useState<string>('');
  const { language } = useParams() as { language: LanguageCode };

  useLayoutEffect(() => {
    if (!iconRef.current?.firstChild) {
      return;
    }

    const iconPathElement = iconRef.current.firstChild as SVGPathElement;
    const [, dAttribute] = iconPathElement.attributes;

    if (!dAttribute.nodeValue) {
      return;
    }

    setFontAwesomeIconPathDAttribute(dAttribute.nodeValue);

    iconRef.current.removeChild(iconPathElement);
  }, []);

  return (
    <div className={container}>
      <Icon spin ref={iconRef} icon={faBookBible} className={spinner} />
      {iconRef.current &&
        createPortal(
          <>
            <defs>
              <pattern id={svgDefsPatternId} width="100%" height="100%">
                <image
                  xlinkHref={`${flagsPath}/${language}.svg`}
                  x="-12.5%"
                  y="-12.5%"
                  width="125%"
                  height="125%"
                />
              </pattern>
            </defs>
            <path
              fill={`url(#${svgDefsPatternId})`}
              d={fontAwesomeIconPathDAttribute}
            />
          </>,
          iconRef.current,
        )}
    </div>
  );
}
