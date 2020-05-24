import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import AuthChecker from './AuthChecker';
import store from './common/store';
import theme from './common/theme';
import Router from './Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthChecker>
          <ToastContainer />
          <Router />
        </AuthChecker>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
