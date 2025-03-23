// rate-repository-app/src/__tests__/components/SignIn.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SignInContainer } from '../../components/SignIn';
import React from 'react';

describe('SignIn', () => {
  describe('SignInContainer', () => {
    it('calls onSubmit function with correct arguments when a valid form is submitted', async () => {
      // Create a mock function for onSubmit
      const onSubmit = jest.fn();
      
      // Render the SignInContainer component
      render(<SignInContainer onSubmit={onSubmit} />);
      
      // Fill the username field
      fireEvent.changeText(screen.getByTestId('usernameField'), 'kalle');
      
      // Fill the password field
      fireEvent.changeText(screen.getByTestId('passwordField'), 'password');
      
      // Press the submit button
      fireEvent.press(screen.getByTestId('submitButton'));
      
      // Wait for the form submission to complete
      await waitFor(() => {
        // Check that onSubmit has been called once
        expect(onSubmit).toHaveBeenCalledTimes(1);
        
        // Check that onSubmit was called with correct arguments
        expect(onSubmit.mock.calls[0][0]).toEqual({
          username: 'kalle',
          password: 'password',
        });
      });
    });
  });
});