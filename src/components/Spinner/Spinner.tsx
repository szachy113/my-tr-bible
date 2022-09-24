import { useId, useRef, useState, useEffect } from 'react';
import { LanguageCode } from 'iso-639-1';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBookBible } from '@fortawesome/free-solid-svg-icons';
import { createPortal } from 'react-dom';
import styles from './Spinner.module.css';

interface SpinnerProps {
  language: LanguageCode;
}

const { spinner } = styles;
const flagsPath = '/assets/flags';

function useFontAwesomeIconPathDAttribute(
  iconRef: React.MutableRefObject<SVGSVGElement | null>,
): string {
  const [fontAwesomeIconPathDAttribute, setFontAwesomeIconPathDAttribute] =
    useState<string>('');

  useEffect(() => {
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
  }, [iconRef]);

  return fontAwesomeIconPathDAttribute;
}

export default function Spinner({ language }: SpinnerProps) {
  const svgDefsPatternId = useId();
  const iconRef = useRef<SVGSVGElement | null>(null);
  const fontAwesomeIconPathDAttribute =
    useFontAwesomeIconPathDAttribute(iconRef);

  return (
    <div>
      <Icon spin ref={iconRef} icon={faBookBible} className={spinner} />
      {iconRef.current &&
        createPortal(
          <>
            <defs>
              <pattern id={svgDefsPatternId} width="100%" height="100%">
                <image
                  xlinkHref={`${flagsPath}/${
                    language === 'en' ? 'gb' : language
                  }.svg`}
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
