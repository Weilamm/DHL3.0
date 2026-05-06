import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const login = (username, password) => api.post('/login', { username, password });
export const getArticles = () => api.get('/articles');
export const createArticle = (rawText, creator) => api.post('/articles', { rawText, creator });
export const updateArticle = (id, data) => api.put(`/articles/${id}`, data);
export const updateArticleStatus = (id, status) => api.patch(`/articles/${id}/status`, { status });
export const deleteArticle = (id) => api.delete(`/articles/${id}`);
