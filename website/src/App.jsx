import {BrowserRouter, Routes, Route} from 'react-router-dom';

// Style
import './assets/style/app.css';
import './assets/style/main.css';
import './assets/style/section.css';

// Component & Page
import Home from './page/home/home';
import Login  from './modules/authentication/Login';
import Register from './modules/authentication/register';
import SetupAccount from './modules/authentication/setupAccount';
import { VerifyEmail } from './modules/authentication/verifyEmail';
import { ForgetPassword } from './modules/authentication/forgetPassword';
import { VerifyEmailForgetPassword } from './modules/authentication/verifyEmailForgetPassword';
import { NewPassword } from './modules/authentication/newPassword';
import OAuthCallback from './modules/authentication/oAuthCallback';
import Agreement from './modules/agreement/agreement';
import Accessibility from './modules/accessibility/accessibility';
import PrivacyPolicy from './modules/policy/privatePolicy';
import Rule from './modules/rule/rule';
import Question from './modules/upload/Question';
import Confession from './modules/upload/confession';
import Content from './modules/upload/content';
import EditContentBody from './modules/upload/EditContentBody';
import UploadGif from './modules/gif/upload';
import Account from './modules/user/account';
import History from './modules/user/history';
import Favorite from './modules/user/favorite';
import Like from './modules/user/like';
import Edit from './modules/user/edit';
import OwnFeed from './modules/user/ownFeed';
import Connection from './modules/user/connection';
import Trending from './modules/feed/trending';
import Comment from './modules/feed/comment';
import AboutPost from './modules/feed/aboutPost';
import Brainstorm from './modules/brainstorm/brainstorm';
import AnswerQa from './modules/brainstorm/answerQa';
import FeedbackForm from './modules/feedback/feedback';
import ReportPost from './modules/report/reportPost';
import ReportUser from './modules/report/reportUser';
import ReportComment from './modules/report/reportComment';
import ReportHistory from './modules/report/reportHistory';
import ReportConversation from './modules/report/reportConversation';
import HallOfFame from './modules/halloffame/hallOfFame';
import GifFeed from './modules/gif/gif';
import FavoritesGif from './modules/gif/favorite';
import SearchForm from './page/explore/searchForm';
import Search from './util/search';
import Notification from './modules/notification/notification';
import Chat from './modules/chat/chat';
import Ping from './modules/ping/ping';
import Feed from './modules/feed/feed';
import Blog from './modules/blog/blog';
import { BlogDetail } from './modules/blog/blog';
import Team from './modules/team/team';
import Startup, { StartupDetail } from './modules/startup/startup';
import Founder, { FounderDetail } from './modules/founder/founder';
import NotFound from './page/notfound/notFound';
import Layout from './layout/layout';
import Explore from './page/explore/explore';

export default function App () {
    return(
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Layout/>}>
             
              {/* Home & index */}
              <Route index element={<Home/>} />
              <Route path='/home' element={<Home/>}></Route>

              {/* Feed */}
              <Route path='feed' element={<Feed />}></Route>
              <Route path='/aboutpost/:id' element={<AboutPost/>}></Route>
              <Route path='/answer/:postId/:questionId/:questionType' element={<AnswerQa/>}></Route>
              <Route path='/comment' element={<Comment/>}></Route>
              <Route path='/edit/content' element={<EditContentBody/>}></Route>

              {/* Blog */}
              <Route path='blog' element={<Blog />}></Route>
              <Route path='blog/:slug' element={<BlogDetail />}></Route>

              {/* Ping */}
              <Route path='/ping' element={<Ping/>}></Route>

              {/* Brainstorm */}
              <Route path='/brainstorm' element={<Brainstorm/>}></Route>

              {/* Personalization */}
              <Route path='/account' element={<Account/>}></Route>
              <Route path='/editaccount' element={<Edit/>}></Route>
              <Route path='/history' element={<History/>}></Route>
              <Route path='/favorite' element={<Favorite/>}></Route>
              <Route path='/like' element={<Like/>}></Route>
              <Route path='/ownfeed' element={<OwnFeed/>}></Route>
              <Route path='/connections' element={<Connection/>}></Route>

              {/* Explore */}
              <Route path='/explore' element={<Explore />}></Route>
              <Route path='/teams' element={<Team />}></Route>
              <Route path='/startups' element={<Startup />}></Route>
              <Route path='/startups/:slug' element={<StartupDetail />}></Route>
              <Route path='/founders' element={<Founder/>}></Route>
              <Route path='/founders/:slug' element={<FounderDetail/>}></Route>
              <Route path='/trending' element={<Trending/>}></Route>
              <Route path='/halloffame' element={<HallOfFame/>}></Route>
              <Route path='/gif' element={<GifFeed/>}></Route>
              <Route path='/upload/gif' element={<UploadGif/>}></Route>
              <Route path='/favorite/gif' element={<FavoritesGif/>}></Route>

              {/* Report & FeedBack */}
              <Route path='/report-conversation' element={<ReportConversation/>}></Route>
              <Route path ='/report' element={<ReportComment/>}></Route>
              <Route path ='/reportPost' element={<ReportPost/>}></Route>
              <Route path ='/reportUser' element={<ReportUser/>}></Route>
              <Route path='/reporthistory' element={<ReportHistory/>}></Route> 
              <Route path='/feedback' element={<FeedbackForm/>}></Route> 

              {/* Law firm */}
              <Route path='/agreement' element = {<Agreement/>} />
              <Route path='/accessibility' element={<Accessibility/>}></Route>
              <Route path='/camfoundrrule' element={<Rule/>} />
              <Route path='/privacypolicy' element={<PrivacyPolicy/>}></Route>

              {/* Upload*/}
              <Route path='/create/question' element={<Question/>}></Route>
              <Route path='/create/confession' element={<Confession/>}></Route>
              <Route path='/create/content' element={<Content/>}></Route>

              {/* Notification*/}
              <Route path='/notification' element={<Notification/>}></Route>
              
              {/* search */}
              <Route path='/search' element={<Search />}></Route>
              <Route path='/searchform' element={<SearchForm/>}></Route>

              {/*chat*/}
              <Route path='/chat' element={<Chat/>}></Route>

            </Route>

            {/* Authentication */}
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/register' element={<Register/>}></Route>
            <Route path='/verifyemail' element={<VerifyEmail/>}></Route>
            <Route path='/forgetpassword' element={<ForgetPassword/>}></Route>
            <Route path='/verifyemailforgetpassword' element={<VerifyEmailForgetPassword/>}></Route>
            <Route path='/newpassword' element={<NewPassword/>}></Route>
            <Route path='/setupaccount' element={<SetupAccount/>}></Route>
            <Route path="/oauth-callback" element={<OAuthCallback />} />

            {/* Not Found 404 */}
            <Route path='*' element={<NotFound/>}></Route>

          </Routes>
        </BrowserRouter>
    )
};

 






