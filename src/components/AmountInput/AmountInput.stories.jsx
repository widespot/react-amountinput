import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import AmountInput from './AmountInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'ReactComponentLibrary/WrapInput',
  component: AmountInput,
  argTypes: {
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
function Template({ inputRef, ...args }) {
  return (
    <>
      <button onClick={() => console.log(inputRef)}>
        Log inputRef
      </button>
      <p>
        <AmountInput inputRef={inputRef} {...args} />
      </p>
    </>
  );
}

function ControlledTemplate(args) {
  const [value, setValue] = React.useState();
  const [acceptOnChange, setAcceptOnChange] = React.useState(true);

  return (
    <>
      <p>
        <input
          type="checkbox"
          checked={acceptOnChange}
          onChange={(e) => setAcceptOnChange(!!e.target.checked)}
        />
        {' '}
        accept on Change
      </p>
      <AmountInput
        {...args}
        value={value}
        onChange={(e) => {
          if (acceptOnChange) setValue(e.target.value);
        }}
      />
    </>
  );
}

function ControlTemplate(args) {
  const [inputValue, setInputValue] = React.useState('');
  const [value, setValue] = React.useState();

  return (
    <>
      <p>
        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <button onClick={() => setValue(inputValue)}>Send string</button>
        <button onClick={() => setValue(parseInt(inputValue, 10))}>Send Integer</button>
        <button onClick={() => setValue(parseFloat(inputValue))}>Send Float</button>
      </p>
      <p>
        <AmountInput
          value={value}
          {...args}
          onChange={(e) => {
            setValue(value);
            setInputValue(e.target.value);
          }}
        />
      </p>
    </>
  );
}

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'Nice amount',
  name: 'amount',
  value: '',
  inputRef: { current: undefined },
};

export const InputControl = ControlTemplate.bind({});
InputControl.args = {
  placeholder: 'amount...',
  name: 'amount',
};

export const ControlledValue = ControlledTemplate.bind({});
ControlledValue.args = {
  placeholder: 'amount...',
  name: 'amount',
};
