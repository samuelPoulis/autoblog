import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();


export default async function get_keywords(wpBaseUrl) {
  try {
    const response = await axios.get(`${wpBaseUrl}wp-json/custom/v1/rank-math-keywords`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Rank Math keywords:', error.message);
    return [];
  }
}
