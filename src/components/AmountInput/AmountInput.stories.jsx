import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import AmountInput from './AmountInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'ReactComponentLibrary/WrapInput',
  component: AmountInput,
  argTypes: { onChange: { action: 'changed' } },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
function Template(args) {
  return (
    <p>
      <AmountInput {...args} />
    </p>
  );
}

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'Nice amount',
  value: null,
};

export const NoPlaceholder = Template.bind({});
NoPlaceholder.args = {
  placeholder: null,
  value: null,
};
