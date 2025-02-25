import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const PostContainer = styled.article`
  padding: ${props => props.theme.spacing.xl};
  max-width: 768px;
  margin: 0 auto;
  font-size: ${props => props.theme.typography.bodySize};
  line-height: ${props => props.theme.typography.lineHeight};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.medium};
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.colors.primary};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin: ${props => props.theme.spacing.xl} 0 ${props => props.theme.spacing.medium};
    line-height: 1.4;
  }

  h1 {
    font-size: ${props => props.theme.typography.headerSize};
    margin-top: 0;
  }

  h2 {
    font-size: ${props => props.theme.typography.subheaderSize};
  }

  p {
    margin: ${props => props.theme.spacing.medium} 0;
  }

  a {
    color: ${props => props.theme.colors.accent};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
      color: ${props => props.theme.colors.hover};
    }
  }

  code {
    background: ${props => props.theme.colors.surface};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.small};
    border-radius: ${props => props.theme.borderRadius.small};
    font-family: monospace;
  }

  pre {
    background: ${props => props.theme.colors.surface};
    padding: ${props => props.theme.spacing.medium};
    border-radius: ${props => props.theme.borderRadius.medium};
    overflow-x: auto;
    border: 1px solid ${props => props.theme.colors.border};

    code {
      background: none;
      padding: 0;
      border-radius: 0;
    }
  }

  blockquote {
    margin: ${props => props.theme.spacing.medium} 0;
    padding: ${props => props.theme.spacing.medium} ${props => props.theme.spacing.large};
    border-left: 4px solid ${props => props.theme.colors.accent};
    background: ${props => props.theme.colors.surface};
    font-style: italic;
  }

  ul, ol {
    padding-left: ${props => props.theme.spacing.xl};
    margin: ${props => props.theme.spacing.medium} 0;
  }

  li {
    margin: ${props => props.theme.spacing.small} 0;
  }

  hr {
    border: none;
    border-top: 1px solid ${props => props.theme.colors.border};
    margin: ${props => props.theme.spacing.large} 0;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: ${props => props.theme.borderRadius.medium};
    margin: ${props => props.theme.spacing.medium} 0;
  }

  code {
    background-color: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  pre {
    background-color: #f5f5f5;
    padding: ${props => props.theme.spacing.medium};
    border-radius: 4px;
    overflow-x: auto;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  blockquote {
    border-left: 4px solid ${props => props.theme.colors.secondary};
    margin: 0;
    padding-left: ${props => props.theme.spacing.medium};
    color: #666;
  }
`;

const PostHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.large};
`;

const PostTitle = styled.h1`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.small};
`;

const PostDate = styled.div`
  color: ${props => props.theme.colors.secondary};
  font-size: 0.9rem;
`;

const PostDescription = styled.div`
  color: ${props => props.theme.colors.text};
  font-style: italic;
  margin-top: ${props => props.theme.spacing.small};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.bodySize};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.highlight};
  font-size: ${props => props.theme.typography.bodySize};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

function BlogPost() {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/posts/${id}.md`);
        if (!response.ok) {
          throw new Error('Failed to load post');
        }
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Error loading post:', error);
        setError('Failed to load the post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <LoadingMessage>Loading post...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <PostContainer>
      <ReactMarkdown>{content}</ReactMarkdown>
    </PostContainer>
  );
}

export default BlogPost;
