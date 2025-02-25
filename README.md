# Markdown Blog

A simple and customizable blog system built with React that renders Markdown files.

## Features

- React-based blog system
- Markdown support with syntax highlighting
- Customizable theming system
- Responsive design
- Clean and intuitive interface

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Create new blog posts by adding Markdown files to the `src/posts` directory.

## Customization

### Theme

The blog's appearance can be customized by modifying the theme configuration in `src/theme.js`. You can change:

- Colors
- Typography
- Spacing
- Breakpoints

### Adding Posts

1. Create a new `.md` file in the `src/posts` directory
2. Add the post metadata to the `posts` array in `src/components/BlogList.js`

## Dependencies

- React
- React Router
- React Markdown
- Styled Components

## Project Structure

```
markdown-blog/
├── src/
│   ├── components/
│   │   ├── BlogList.js
│   │   ├── BlogPost.js
│   │   └── Header.js
│   ├── posts/
│   │   └── welcome.md
│   ├── App.js
│   ├── index.js
│   └── theme.js
└── package.json
```
