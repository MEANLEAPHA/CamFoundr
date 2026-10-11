import React, { useState, useEffect } from 'react';
import { Input, List, Image, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api from '../api/axiosInstance';

const GifPicker = ({ onSelect }) => {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchGifs = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get('/api/search-gif', { params: { q: query } });
      setGifs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs();
  }, []);

  const handleSearch = (value) => {
    fetchGifs(value);
  };

  return (
    <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
      <Input
        placeholder="Search GIFs..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => {
          const value = e.target.value;
          setSearch(value);
          handleSearch(value);
        }}
        style={{ marginBottom: 12 }}
      />
      {loading ? (
        <Spin style={{ display: 'block', margin: '20px auto',color: 'var(--primary-color)' }} />
      ) : gifs.length === 0 ? (
        <Empty description="No GIFs found" />
      ) : (
        <List
          grid={{ gutter: 8, column: 2 }}
          dataSource={gifs}
          renderItem={(gif) => (
            <List.Item>
              <Image
                src={gif.gif_url}
                width="100%"
                height={120}
                style={{ objectFit: 'cover', cursor: 'pointer', borderRadius: 8 }}
                onClick={() => onSelect(gif)}
                preview={false}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default GifPicker;
