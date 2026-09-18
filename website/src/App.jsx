// import React
import React,{ useState, useEffect, useRef, memo } from 'react';
import {BrowserRouter, Routes, Route, Outlet, useNavigate, Navigate} from 'react-router-dom';
import { Toaster } from "react-hot-toast";

// socket
import { connectSocket, disconnectSocket, getSocket } from "./socket";

// api
import api from './assets/api/axiosInstance';
import { authStore } from './assets/api/authStore';

// authContext
import { useAuth } from './assets/context/AuthContext';

// Style
import './assets/style/App.css';
import './assets/style/Main.css';
import './assets/style/Section.css';

//util
import { useBanStatus } from './assets/hooks/useBanStatus';

// Component Page
import Aside from './assets/components/Aside';
import Header from '../src/assets/components/Header'; 
import Home from './assets/page/Home';
import Login  from './assets/Authentication/Login';
import Register from './assets/Authentication/Register';
import { VerifyEmail } from './assets/Authentication/VerifyEmail';
import { ForgetPassword } from './assets/Authentication/ForgetPassword';
import { VerifyEmailForgetPassword } from './assets/Authentication/VerifyEmailForgetPassword';
import { NewPassword } from './assets/Authentication/NewPassword';
import Question from './assets/upload/Question';
import Confession from './assets/upload/Confession';
import Content from './assets/upload/Content';
import EditContentBody from './assets/upload/EditContentBody';
import PrivacyPolicy from './assets/page/Privatepolicy';


import Help from './assets/page/Help';

import UserAgreement from './modules/agreement/UserAgreement';
import Accessibility from './modules/accessibility/Accessibility';
import UnsolvedQA from './modules/brainstorm/UnsolvedQA';
import GifFeed from './modules/gif/GifFeed';
import Rule from './modules/rule/Rule';
import GifUpload from './modules/gif/GifUpload';
import FavoritesGif from './modules/gif/FavoriteGif';

import AboutPost from './assets/page/AboutPost';
import Search from './assets/page/Search';
import AnswerQa from './assets/page/AnswerQa';
import Comment from './assets/page/Comment';
import ReportComment from './assets/page/ReportComment';
import SetupAccount from './assets/Authentication/SetupAccount';
import HallOfFame from './modules/halloffame/HallOfFame';
import ReportHistory from './assets/page/ReportHistory';
import Chat from './assets/page/Chat';
import ReportConversation from './assets/page/ReportConversation';
import Accounts from './assets/page/Accounts';
import History from './assets/page/History';
import Favorite from './assets/page/Favorite';
import LikePost from './assets/page/LikePost';
import YourPosts from './assets/page/YourPosts';
import FeedbackForm from './modules/feedback/FeedbackForm';
import Trending from './assets/page/Trending';

import AllFriends from './assets/page/AllFriends';
import Notifications from './assets/page/Notifications';
import Spammy from './modules/ping/Nudge';
import EditAccount from './assets/page/EditAccount';
import ReportPost from './assets/page/ReportPost';
import ReportUser from './assets/page/ReportUser';
import SearchForm from './assets/page/SearchForm';
import OAuthCallback from './assets/page/OAuthCallback';

const App = () =>{
    return(
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Layout/>}>
              {/* Action Upload page */}
              <Route index element={<Home/>} />
              <Route path='/home' element={<Home/>}></Route>
              <Route path='/searchform' element={<SearchForm/>}></Route>

              {/* Report&FeedBack */}
              <Route path='/report-conversation' element={<ReportConversation/>}></Route>


              {/*Storage data*/}
              <Route path='/history' element={<History/>}></Route>
              <Route path='/favorite' element={<Favorite/>}></Route>
              <Route path='/likepost' element={<LikePost/>}></Route>
              <Route path='/yourpost' element={<YourPosts/>}></Route>

              {/* Account */}
              <Route path='/editaccount' element={<EditAccount/>}></Route>

              <Route path='/accounts' element={<Accounts/>}></Route>
              <Route path='/friends' element={<AllFriends/>}></Route>

              {/* Upload posts */}
              <Route path='/create/question' element={<Question/>}></Route>
              <Route path='/create/confession' element={<Confession/>}></Route>
              <Route path='/create/content' element={<Content/>}></Route>

              {/* post */}
              <Route path='/aboutpost/:id' element={<AboutPost/>}></Route>
              <Route path='/answer/:postId/:questionId/:questionType' element={<AnswerQa/>}></Route>
              <Route path='/comment' element={<Comment/>}></Route>
              <Route path ='/report' element={<ReportComment/>}></Route>
              <Route path ='/reportPost' element={<ReportPost/>}></Route>
              <Route path ='/reportUser' element={<ReportUser/>}></Route>

              <Route path='/edit/content' element={<EditContentBody/>}></Route>

              <Route path='/trending' element={<Trending/>}></Route>
              <Route path='/unslovedqa' element={<UnsolvedQA/>}></Route>
              <Route path='/nudge' element={<Spammy/>}></Route>

              {/* Hall of fame */}
              <Route path='/halloffame' element={<HallOfFame/>}></Route>

              {/* Gif */}
              <Route path='/gif' element={<GifFeed/>}></Route>
              <Route path='/upload/gif' element={<GifUpload/>}></Route>
              <Route path='/favorite/gif' element={<FavoritesGif/>}></Route>

              {/* User assistant */}
              <Route path='/help' element={<Help/>}></Route>
              
              {/* User Dashboard */}
              <Route path='/notifications' element={<Notifications/>}></Route>
              {/* feedback */}
              <Route path='/reporthistory' element={<ReportHistory/>}></Route> 
              <Route path='/feedback' element={<FeedbackForm/>}></Route> 

              {/* tool */}
              <Route path='/search' element={<Search />}></Route>
            </Route>

            {/* gossiper chat*/}
            <Route path='/chat' element={<Chat/>}></Route>

            {/* User assistant */}
            <Route path='/useragreement' element = {<UserAgreement/>} />
            <Route path='/nahidearule' element={<Rule/>} />
            <Route path='/privacypolicy' element={<PrivacyPolicy/>}></Route>
            <Route path='/accessibility' element={<Accessibility/>}></Route>

            {/* Authentication */}
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/register' element={<Register/>}></Route>
            <Route path='/verifyemail' element={<VerifyEmail/>}></Route>
            <Route path='/forgetpassword' element={<ForgetPassword/>}></Route>
            <Route path='/verifyemailforgetpassword' element={<VerifyEmailForgetPassword/>}></Route>
            <Route path='/newpassword' element={<NewPassword/>}></Route>
            <Route path='/setupaccount' element={<SetupAccount/>}></Route>
            <Route path="/oauth-callback" element={<OAuthCallback />} />



            {/* Not Found page */}
            <Route path='*' element={<NotFound/>}></Route>   
          </Routes>
        </BrowserRouter>
    )
};


const AuthRedirectListener = () => {
  const navigate = useNavigate();
  useEffect(() => {
    authStore.registerRedirectHandler(() => {
      navigate("/login", { replace: true });
    });
  }, [navigate]);
  return null;
};
 

const Layout = () => {

  const navigate = useNavigate();

  const { user, token, loading, logout, } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);



  // SOCKET
  useEffect(() => {

    if (!token || !user) return;

    const expiry = Number(
      localStorage.getItem("tokenExpiry")
    );

    if (!expiry || Date.now() > expiry) {
      return;
    }

    const socket = connectSocket({
      token,
      userId: user.id,
      username: user.username,
      avatar_url: user.avatar_url
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {

      socket.off("online-users");

      disconnectSocket();
    };

  }, [token, user]);

  useEffect(() => {
    if (!token) return;
    const handleTrackLogin = async () => {
      try {
        await api.post('/api/record-login');
      } catch (err) {
        console.error(err);
      }
    };
    handleTrackLogin();
  }, [token]);


  // ASIDE
  const [showMaxAside, setMaxAside] = useState(() => {
    return localStorage.getItem("maxAside") === "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "maxAside",
      showMaxAside
    );
  }, [showMaxAside]);

  const toggleAside = () => {
    setMaxAside(prev => !prev);
  };


  // THEME
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {

    document.body.classList.toggle(
      "dark-theme",
      darkMode
    );

    localStorage.setItem(
      "darkMode",
      darkMode
    );

  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // AFTER ALL HOOKS
  useEffect(() => {
      const isBlocked = !loading && (!token || !user);
      document.body.style.overflow = isBlocked ? "hidden" : "";
  }, [loading, token, user]);
  
    // inside Layout
  const banInfo = useBanStatus(token);

  const isBlockedByAuth = !loading && (!token || !user);
  const isBlockedByBan = banInfo.checked && banInfo.banned;
  const isBlocked = isBlockedByAuth || isBlockedByBan;
  useEffect(() => {
    document.body.style.overflow = isBlocked ? "hidden" : "";
  }, [isBlocked]);


  // ONLINE
  const isOnline = user?.id ? onlineUsers.includes(String(user.id)) : false;

  
  return (
    <>
      <Header onToggleAside={toggleAside} onToggleTheme={toggleTheme} currentTheme={darkMode} />
      <Toaster position="top-right" 
               toastOptions={{
                  style: {
                    background: darkMode ? "#1f1f1f" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#1f1f1f",
                  },
               }}
      />
      {/* <main aria-hidden={isBlocked} style={{ position: "relative",   pointerEvents: isBlocked ? "none" : "auto",
                    filter: isBlocked ? "blur(4px)" : "none",
                    userSelect: isBlocked ? "none" : "auto",}}> */}
        <main >
        <Aside append={showMaxAside} />
        <section>
          <Outlet
            context={{
              user,
              isOnline,
              onlineUsers
            }}
          />
        </section>
      </main>
      {/* {!loading && (!token || !user) && <AuthRequiredModal />}
      {!isBlockedByAuth && isBlockedByBan && (
        <BannedModal reason={banInfo.reason} bannedAt={banInfo.banned_at} />
      )} */}
    </>
  );

};

const NotFound = () =>{
    return(
        <h1>
            Not Found
        </h1>
    )
}

export default App;



