import React from 'react';
import { render } from '@testing-library/react';

import AmountInput from './AmountInput';

describe('AmountInput', () => {
  test('renders the Button component', () => {
    render(<AmountInput />);
  });
});
