import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PostList = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.xl};
  max-width: 768px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.medium};
    gap: ${props => props.theme.spacing.large};
  }
`;

const PostCard = styled(Link)`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  text-decoration: none;
  color: ${props => props.theme.colors.text};
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadows.small};
  display: block;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
    border-color: ${props => props.theme.colors.accent};
    background: white;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.large};
  }
`;

const PostTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.title};
  font-size: ${props => props.theme.typography.subheaderSize};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  line-height: 1.4;
  letter-spacing: ${props => props.theme.typography.letterSpacing.tight};
`;

const PostDate = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: ${props => props.theme.spacing.small} 0;
  font-size: ${props => props.theme.typography.smallSize};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const PostDescription = styled.p`
  margin: ${props => props.theme.spacing.small} 0 0;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.bodySize};
  line-height: ${props => props.theme.typography.lineHeight};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.large};
  color: ${props => props.theme.colors.secondary};
  font-size: ${props => props.theme.typography.bodySize};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.large};
  color: ${props => props.theme.colors.accent};
`;

function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Fetch posts from index.json
        const response = await fetch('/posts/index.json');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        const sortedPosts = data.posts.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return <LoadingMessage>Loading posts...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (posts.length === 0) {
    return <LoadingMessage>No posts found. Add markdown files to the /public/posts directory.</LoadingMessage>;
  }

  return (
    <PostList>
      {posts.map(post => (
        <PostCard key={post.id} to={`/post/${post.id}`}>
          <PostTitle>{post.title}</PostTitle>
          <PostDate>{new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</PostDate>
          <PostDescription>{post.description}</PostDescription>
        </PostCard>
      ))}
    </PostList>
  );
}

export default BlogList;
