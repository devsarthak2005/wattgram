import { useState } from 'react'

const initialBlogs = [
  {
    id: 1,
    title: 'The Art of Minimalist UI Design',
    preview: 'Exploring how less can be more in modern web interfaces, focusing on typography and whitespace.',
    author: 'Eleanor Shellstrop',
    date: 'Oct 12, 2023',
    content: 'Lorem ipsum dolor sit amet. Exploring how less can be more in modern web interfaces...',
    category: 'Design'
  },
  {
    id: 2,
    title: 'Understanding React Components',
    preview: 'A deep dive into the building blocks of any modern single page application using React.',
    author: 'Chidi Anagonye',
    date: 'Nov 05, 2023',
    content: 'React components let you split the UI into independent, reusable pieces...',
    category: 'Development'
  },
  {
    id: 3,
    title: 'Why Typography Matters',
    preview: 'Good typography is like a good voice; it makes listening easier. Here is how to choose the right font.',
    author: 'Tahani Al-Jamil',
    date: 'Dec 01, 2023',
    content: 'Typography is the art and technique of arranging type to make written language legible, readable, and appealing...',
    category: 'Typography'
  }
];

export const MockBlogData = initialBlogs;
