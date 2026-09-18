import React,{ useState, useEffect, useRef, memo } from 'react';
import "../style/page/Search.css";
import SearchForm from './SearchForm';
import{SearchBars} from '../components/SearchBar';

const Search = () => {
    return (
        <SearchBars />
    );
};

export default Search;