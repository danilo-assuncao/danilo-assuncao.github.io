import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import Header from './components/Header';

const GlobalStyle = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  font-family: ${props => props.theme.typography.fontFamily};
  color: ${props => props.theme.colors.text};
`;

function App() {
  return (
    <Router>
      <GlobalStyle>
        <AppContainer>
          <Header />
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/post/:id" element={<BlogPost />} />
          </Routes>
        </AppContainer>
      </GlobalStyle>
    </Router>
  );
}

export default App;
