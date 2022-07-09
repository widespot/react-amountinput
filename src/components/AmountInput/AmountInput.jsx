import React from 'react';
import Big from 'big.js';

import chunk from '../../utils/chunk';
import incrementAmount from '../../utils/incrementAmount';
import replaceAt from '../../utils/replaceAt';

const getAlternateThousandSeparator = (decimalSeparator) => (decimalSeparator === '.' ? ',' : '.');
const getAlternateDecimalSeparator = (thousandSeparator) => (thousandSeparator === '.' ? ',' : '.');

const DEFAULT_DECIMAL_SEP = new Intl.NumberFormat().format(10000.99).substr(6, 1);

const DEFAULT_THOUSAND_SEP = (() => {
  const c = new Intl.NumberFormat().format(10000.99).substr(2, 1);

  if (c === DEFAULT_DECIMAL_SEP || `${parseInt(c, 10)}` === c) {
    return getAlternateThousandSeparator(DEFAULT_DECIMAL_SEP);
  }

  return c;
})();

const amountToString = ({
  integer, decimal, decimalSeparator, thousandSeparator,
}) => {
  // Re-split integer parts and join using thousand separator
  const integerStr = chunk(integer, -3).join(thousandSeparator);
  // Build decimal part string, if any
  const decimalStr = decimalSeparator == null ? '' : `${decimalSeparator}${decimal || ''}`;

  return `${integerStr}${decimalStr}`;
};

// TODO forward ref
export default function AmountInput({
  onChange, onKeyDown, onKeyUp, onBlur, value, inputRef, ...props
}) {
  // ref to the input element
  const innerRef = React.useRef();
  // Last key down hit
  const keyDown = React.useRef();

  // Current decimal separator. Null if no decimal part at all (not even empty)
  const decimalSeparatorRef = React.useRef();
  // Current thousand separator. Always set, but never equal to decimal separator
  const thousandSeparatorRef = React.useRef(DEFAULT_THOUSAND_SEP);

  React.useEffect(() => {
    // Value change from the outside

    // 1. forget about last key down
    keyDown.current = null;

    // 2. set the element value
    if (typeof value === 'string' || value instanceof String) {
      innerRef.current.value = value;
    } else if (Number.isFinite(value)) {
      // Split number in string parts
      const integer = Number.isInteger(value) ? value : Math.trunc(value);
      const decimal = Number.isInteger(value) ? null : Big(value).minus(integer).toString().split('.')[1];

      // Adapt decimal separator
      if (decimal == null) decimalSeparatorRef.current = null;
      else decimalSeparatorRef.current ||= getAlternateDecimalSeparator(thousandSeparatorRef.current);

      // Query the current separators
      const [decimalSeparator, thousandSeparator] = [
        decimalSeparatorRef.current, thousandSeparatorRef.current,
      ];

      // Build the new value
      innerRef.current.value = amountToString({
        integer, decimal, decimalSeparator, thousandSeparator,
      });
    }
  }, [value]);

  const triggerOnChange = (event) => {
    if (!onChange) return;

    const [thousandSeparator, decimalSeparator] = [
      thousandSeparatorRef.current,
      decimalSeparatorRef.current,
    ];

    onChange({
      ...event,
      amountInput: {
        thousandSeparator,
        decimalSeparator,
      },
    });
  };

  // Forward KeyUp events
  const handleOnKeyUp = (e) => {
    onKeyUp && onKeyUp(e);
  };

  const handleOnBlur = (e) => {
    keyDown.current = null;
    // Forward Blur events
    onBlur && onBlur(e);
  };

  const handleOnChange = (e) => {
    const { target } = e;
    const { value, selectionDirection } = target;
    let { selectionStart } = target;

    const key = keyDown.current ? keyDown.current.key : null;

    // Find integer and decimal part of the number
    let integer;
    let decimal;
    if (['.', ','].includes(key)) {
      // A new decimal separator was entered

      // Record the new separator
      decimalSeparatorRef.current = key;
      thousandSeparatorRef.current = getAlternateThousandSeparator(key);

      // Split int and decimal where the caret currently stands
      [integer, decimal] = [
        value.slice(0, selectionStart - 1),
        value.slice(selectionStart),
      ];
    } else {
      // Use the previously recorded separator

      // split integer and decimal part at the first occurrence of the decimal separator
      [integer, decimal] = value.split(decimalSeparatorRef.current, 2);

      if (decimal == null) {
        // if there is no decimal part at all (not even empty),
        // also record that there is no more decimal separator
        decimalSeparatorRef.current = null;
      }
    }

    // Compute the caret position in the number, relative to the decimal part
    const decimalPosition = decimal == null ? value.length : integer.length;

    // Clean parts, removing non digits chars
    [integer, decimal] = [integer, decimal].map((i) => i && i.replaceAll(/[^0-9]/ig, ''));
    // Re-split integer parts and join using thousand separator
    const integerStr = chunk(integer, -3).join(thousandSeparatorRef.current);
    // Build decimal part string, if any
    const decimalStr = decimalSeparatorRef.current == null ? '' : `${decimalSeparatorRef.current}${decimal || ''}`;
    // Render amount
    const amountStr = `${integerStr}${decimalStr}`;

    // If the display is to be changed, set the value and compute new caret position
    if (value !== amountStr) {
      target.value = amountStr;

      let relativePosition = (decimalPosition) - selectionStart;
      if (relativePosition > 0) {
        const selectNonDigits = value.substr(selectionStart, relativePosition).match(/[^0-9]/g);
        relativePosition -= selectNonDigits ? selectNonDigits.length : 0;
      }

      selectionStart = relativePosition < 0
        ? integerStr.length - relativePosition
        : integerStr.length - relativePosition - (~~(relativePosition / 4));

      target.setSelectionRange(selectionStart, selectionStart, selectionDirection);
    }

    if (!keyDown.current || keyDown.current.value !== amountStr) {
      triggerOnChange(e);
    }
  };

  const handleArrows = (e) => {
    const { target, key } = e;
    const { value, selectionDirection } = target;
    let { selectionStart, selectionEnd } = target;

    const [integer, decimal] = value.split(decimalSeparatorRef.current);

    let amountSegment;
    let segmentPosition;

    if (selectionStart !== selectionEnd) {
      // Selection is a multi char selection
      segmentPosition = selectionStart;
      amountSegment = value.substr(selectionStart, selectionEnd - selectionStart);
    } else {
      // Selection is a caret position
      if (selectionStart === 0) {
        // Caret at the start of the input
        // => just add a digit to very beginning of the number
        segmentPosition = (integer.length - 3) % 4 === 0 ? -2 : -1;
        amountSegment = (integer.length - 3) % 4 === 0 ? `0${thousandSeparatorRef.current}` : '0';
        // move caret to the second position
        selectionStart = 1;
        selectionEnd = 1;
      } else if (selectionStart >= value.length && decimal != null) {
        // append a digit if we're at the end of the number, and there is a decimal part
        segmentPosition = value.length;
        amountSegment = '0';
      } else {
        const decimalPosition = decimal == null ? value.length : integer.length;
        const decimalRelativePosition = (decimalPosition) - selectionStart;

        segmentPosition = decimalRelativePosition >= 0 ? selectionStart - 1 : selectionStart;
        amountSegment = value.substr(segmentPosition, 1);
        if (!amountSegment.match(/[0-9]/)) {
          segmentPosition = decimalRelativePosition >= 0 ? selectionStart - 2 : selectionStart + 1;
          selectionStart = decimalRelativePosition >= 0 ? selectionStart - 1 : selectionStart + 1;
          selectionEnd = decimalRelativePosition >= 0 ? selectionEnd - 1 : selectionEnd + 1;
          amountSegment = value.substr(segmentPosition, 1);
        }
      }
    }

    amountSegment = incrementAmount(amountSegment, key === 'ArrowUp' ? 1 : -1);

    // eslint-disable-next-line no-param-reassign
    target.value = replaceAt(value, segmentPosition, amountSegment);
    target.setSelectionRange(selectionStart, selectionEnd, selectionDirection);

    triggerOnChange(e);
  };

  const handleOnKeyDown = (e) => {
    const { key } = e;

    if (['ArrowDown', 'ArrowUp'].includes(key)) {
      // Capture keyDown event and overwrite behaviour
      e.preventDefault();
      keyDown.current = null;

      handleArrows(e);
    } else {
      // capture target status at keyDown
      const {
        target: {
          value, selectionStart, selectionEnd, selectionDirection,
        },
      } = e;

      // Backup status to compare with later onChange if any
      keyDown.current = {
        value, key, selectionStart, selectionEnd, selectionDirection,
      };

      if (onKeyDown) onKeyDown(e);
    }
  };

  return (
    <input
      {...props}
      ref={(e) => {
        innerRef.current = e;
        if (inputRef && (typeof inputRef === 'function')) inputRef(e);
        if (inputRef && inputRef.hasOwnProperty('current')) inputRef.current = e;
      }}
      type="text"
      onKeyDown={handleOnKeyDown}
      onKeyUp={handleOnKeyUp}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  );
}
