import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();
export default async function get_titles() {
  let allTitles = [];
  let page = 1;
  const perPage = 100; // maximum posts per page

  while (true) {
    try {
      const response = await axios.get(`${process.env.base_url}wp-json/wp/v2/posts`, {
        params: {
          _fields: 'title', // only return the title field
          per_page: perPage,
          page: page
        }
      });

      // The API returns an array of post titles
      const posts = response.data;

      // If no posts are returned, we've reached the end.
      if (posts.length === 0) {
        break;
      }

      // Extract the rendered title from each post and add to our list.
      const titles = posts.map(post => post.title.rendered);
      allTitles = allTitles.concat(titles);

      // Optionally, check the headers for total pages:
      // const totalPages = response.headers['x-wp-totalpages'];
      // if (page >= totalPages) break;

      page++; // Move to the next page
    } catch (error) {
      // If there's an error (for example, a 400 error when page exceeds available pages), exit the loop.
      if (error.response && error.response.status === 400) {
        break;
      }
      console.error('Error fetching posts:', error.message);
      break;
    }
  }

  return allTitles;
}
