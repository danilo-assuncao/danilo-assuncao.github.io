import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  padding: ${props => props.theme.spacing.large} ${props => props.theme.spacing.xl};
  background: linear-gradient(to right, ${props => props.theme.colors.title}, ${props => props.theme.colors.accent});
  color: white;
  margin-bottom: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.medium};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.medium};
  }
`;

const Nav = styled.nav`
  max-width: 768px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled(Link)`
  font-size: ${props => props.theme.typography.headerSize};
  color: white;
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  letter-spacing: -0.5px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.medium};
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: ${props => props.theme.typography.bodySize};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius.medium};
  transition: all 0.2s ease;
  letter-spacing: ${props => props.theme.typography.letterSpacing.wide};
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
`;

function Header() {
  return (
    <HeaderContainer>
      <Nav>
        <Title to="/">My Markdown Blog</Title>
        <NavLinks>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/post/markdown-guide">Guide</NavLink>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
}

export default Header;
