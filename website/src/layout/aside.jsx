import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Newspaper,
         LandPlot,
         Home,
         PersonStanding,
         Scale,
         Flag,
         MessageSquareText,
         Users,
         TimerReset,
         Bookmark,
         ThumbsUp,
         SquareText,
         UserRoundPlus,
         Flame,
         CircleDotDashed,
         Rss,
         User,
         ChevronRight,
         Shapes,
         Sparkles,
         Lightbulb,
         CalendarDays,
         ShieldCheck,
         HeartHandshake,
         PanelRightClose,
         PanelRightOpen,
         FolderUsers,
         UserGroup,
         FileChartColumn,
         Shield,
         Zap,
       
   
        } from 'lucide-react';
 
import { useAuth } from "../context/authContext";
import "../assets/style/aside.css";
import api from "../api/axiosInstance";

const Aside = (props) => {

    const { token, user } = useAuth();
    const [spamUnreadCount, setSpamUnreadCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    // Unread Spam Noti
    const fetchUnReadSpam = async () => {
        try{
            const res = await api.get(
                `/api/spam/unread-count`
            );
            setSpamUnreadCount( res.data.unread || 0 );
        }catch(err){
            console.log(err);
        }
    };

    // Unread Chat
    const fetchUnreadCount = async () => {
        try {
            const res = await api.get(
                `/api/chat/unread-count`
            );
            setChatUnreadCount( res.data.unreadCounts || 0 );
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!token || !user) {
            setSpamUnreadCount(0);
            setChatUnreadCount(0);
            return;
        }

        fetchUnreadCount();
        fetchUnReadSpam();

        const intervalChat = setInterval(fetchUnreadCount, 100000);
        const intervalSpam = setInterval(fetchUnReadSpam, 100000);

        return () => {
            clearInterval(intervalChat);
            clearInterval(intervalSpam);
        };
        }, [token, user?.id]
    );

    // Mobile responsive on Aside
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Aside Collapse
    const [showMaxAside, setMaxAside] = useState( () => {
        return localStorage.getItem("maxAside") === "true";
    })
    
    useEffect( () => { 
        localStorage.setItem("maxAside", showMaxAside)
        }, [showMaxAside]
    );
    
    const toggleAside = () =>{
            setMaxAside(prev => !prev)
    }

    // Max Aside
    const MaxAsideUl = () => {
        return(
            <ul className="max-ul">
                <AppendPrimary chatUnreadCount = { chatUnreadCount } chatUnreadSpam = { spamUnreadCount } />
                <AppendCommunity />
                <AppendInteractive />
                <AppendUserFeed />
                <AppendFnR />
                <AppendRule />
            </ul>
        )
    }

    // Small Aside
    const SmallAsideUl = () => {
        return (
            <ul className="min-ul">
            <AppendMinAside
                chatUnreadCount = { chatUnreadCount }
                chatUnreadSpam = { spamUnreadCount }
            />
            </ul>
        );
    };

    // MOBILE: only MaxAside (display block/none)
    if (isMobile) {
        return (
            <aside style={{ display: props.append ? "block" : "none" }} className='max-aside'>
                <MaxAsideUl />
            </aside>
        );
    }

    return (
        <aside className={showMaxAside ? "max-aside" : "min-aside"}>
            {showMaxAside ? <MaxAsideUl /> : <SmallAsideUl />}
            <button className="btn-col" onClick={toggleAside}>{showMaxAside ? <PanelRightOpen style={{color:"grey", fontSize:"large"}} className='CP-icon'/> : <PanelRightClose style={{color:"grey", fontSize:"large"}} className='CP-icon'/>} </button>
        </aside>
    );
};

const MinInfo = [
    {
        id:0, a: '/home', icon: <Home className='sub-icon'/>, label: 'Home'
    },
    {
        id:1, a: '/community', icon: <UserGroup className='sub-icon' />, label: 'Community'
    }, 
    {
        id:2, a: '/interactive', icon: <Zap className='sub-icon'/>, label: 'Interactive'
    }, 
    {
        id:3, a: '/user', icon: <User className='sub-icon'/>, label: 'User'
    },
    {
        id:4, a: '/recommendation', icon: <FileChartColumn className='sub-icon'/>, label: 'Recommendation'
    },
    {
        id:5, a: '/legal', icon: <ShieldCheck className='sub-icon'/>, label:'Legal'
    },
];

const MinCard = ({a, icon, unreadCount, unreadSpam, label}) => {
    const navigate = useNavigate();
    return(
        <li className="nav-item" title={label}>
            <button onClick={() => navigate(a)}>
                {unreadCount > 0 && (
                    <span className="chat-aside-badge">
                        {unreadCount}
                    </span>
                )}
                {unreadSpam > 0 && (
                    <span className="chat-aside-badge">
                        {unreadSpam}
                    </span>
                )}
                {icon}
            </button>
        </li>
    )
};

const AppendMinAside = ({
    chatUnreadCount, chatUnreadSpam
    }) => {
    return MinInfo.map(item => (
        <MinAside
        key={item.id}
        {...item}
        unreadCount = {
            item.a === "/chat"
            ? chatUnreadCount
            : 0
        }
        unreadSpam = {  
            item.a === "/ping"
            ? chatUnreadSpam 
            : 0
        }
        />
    ));
};

const MinAside = ({  a, icon, unreadCount, unreadSpam, label }) => {  
    return (
        <MinCard
            a = { a }
            icon = { icon }
            unreadCount = { unreadCount }
            unreadSpam = { unreadSpam }  
            label = { label }
        />
    );
};

// Primary
const Primarys= [
    { id:1, a: '/home', icon: <Home className='icon-aside'/>, label: <label>Home</label> },
    { id:2, a: '/blog',  icon: <Newspaper className='icon-aside'/>, label: <label>Blog</label> },
    { id:3, a: '/collabration', icon: <Sparkles className='icon-aside'/>, label: <label>Collabration</label> },
    
];
const AppendPrimary = ({ chatUnreadCount, chatUnreadSpam }) => {
return Primarys.map(item => (
<Main
    key={item.id}
    {...item}
    unreadCount={
        item.a === "/chat"
        ? chatUnreadCount
        : 0
    }
    unreadSpam = {
        item.a === "/ping"
        ? chatUnreadSpam
        : 0
    }

    />
));
};
const Main = ({
    a,
    icon,
    label,
    classNameBtn,
    unreadCount,
    unreadSpam
}) => {
return (
    <Card
        a={a}
        icon={icon}
        label={label}
        classNameBtn={classNameBtn}
        unreadCount={unreadCount}
        unreadSpam = {unreadSpam}
    />
);
};

// Community
const Community = [
    { id:4, a: '/forum', icon: <Rss className='icon-aside'/>, label: <label>Forum</label>,  },
    { id:5, a: '/members',  icon: <Users className='icon-aside'/>, label: <label>The People</label> },
    { id:6, a: '/halloffame',  icon: <Flame className='icon-aside'/>, label: <label>Hall of Fame</label>, classNameBtn: "btn-hall-of-fame" },
    { id:7, a: '/spark', icon: <Sparkles className='icon-aside'/>, label: <label>Spark</label> },
    
];
const AppendCommunity = () => {
    return ( <>
        <label className='label-li' style={{cursor: 'pointer'}} onClick={() => navigate('account')}>Community <ChevronRight className='label-icon-aside'/></label>
        {
                Community.map(item => (
    
            <Main
            key={item.id}
            {...item}
            

            />
        ))
        }
    </>
    )
};

// Interactive
const Interactives = [
    { id:8, a: '/event', icon: <CalendarDays className='icon-aside'/>, label: <label>Event</label> },
    { id:9, a: '/arena', icon: <LandPlot className='icon-aside'/>, label: <label>Arena</label> },
    { id:10, a: '/brainstorm',  icon: <Lightbulb className='icon-aside'/>, label: <label>Brainstorm</label> },
];
const AppendInteractive = () => {
    return ( <>
        <label className='label-li' style={{cursor: 'pointer'}} onClick={() => navigate('account')}>Interactive <ChevronRight className='label-icon-aside'/></label>
        {
            Interactives.map(item => (
            <Main
            key={item.id}
            {...item}
            />
        ))
        }
    </>
    )
};

// User Feeds
const UserFeeds= [
    { id:11, a: '/history',  icon: <TimerReset className='icon-aside'/>, label: <label>History</label> },
    { id:12, a: '/favorite',  icon: <Bookmark className='icon-aside icon-awesome'/>, label: <label>Favorite</label> },
    { id:13, a: '/like',  icon: <ThumbsUp className='icon-aside'/>, label: <label>Like Feed</label> },
    { id:14, a: '/ownfeed',  icon: <SquareText className='icon-aside icon-awesome'/>, label: <label>Your Feed</label> },
    { id:15, a: '/connections',  icon: <UserRoundPlus className='icon-aside' />, label: <label>Connections</label> },
];
const AppendUserFeed = () =>{
    const navigate = useNavigate()
    return(
        <>
            <label className='label-li' style={{cursor: 'pointer'}} onClick={() => navigate('account')}>You <ChevronRight className='label-icon-aside'/></label>
            {UserFeeds.map(item => (
                <UserFeed key={item.id} {...item} />
            ))}
        </>
    )
};
const UserFeed = ({a, icon, label, classNameIcon})=> {
    return <Card a={a} icon={icon} label={label} classNameIcon={classNameIcon} />
};

// Feedback And Report
const FnR = [
    { id:16, a: '/feedback',  icon: <MessageSquareText className='icon-aside'/>, label: <label>Feedback </label>},
    { id:17, a: '/reporthistory',  icon: <Flag className='icon-aside'/>, label: <label>Report History</label> }
];
const AppendFnR = () =>{
    return(
        <>
            <hr className="aside-hr"/>
            {FnR.map(item => (
                <FnRc key={item.id} {...item} />
            ))}
        </>
    )
};
const FnRc = ({a, icon, label, classNameIcon})=> {
    return <Card a={a} icon={icon} label={label} classNameIcon={classNameIcon} />
};

// Rule
const Rules= [
    { id:18, a: '/cdlrule', icon: <Scale className='icon-aside'/>, label: <label>CDL Rule</label> },
    { id:19, a: '/privacypolicy',  icon: <ShieldCheck className='icon-aside'/>, label: <label>Private Policy</label> },
    { id:20, a: '/agreement',  icon: <HeartHandshake className='icon-aside'/>, label: <label>User Agreement</label> },
    { id:21, a: '/accessibility',  icon: <PersonStanding className='icon-aside'/>, label: <label>Accessibility</label> },
];
const AppendRule = () =>{
    return(
        <>
            <hr className="aside-hr"/>
            {Rules.map(item => (
                <Rule key={item.id} {...item} />
            ))}
        </>
    )
};
const Rule = ({a, icon, label, classNameIcon})=> {
    return <Card a={a} icon={icon} label={label} classNameIcon={classNameIcon} />
};

// Card - Util
const Card = ({
    a,
    icon,
    label,
    classNameBtn,
    unreadCount,
    unreadSpam
}) => {
const navigate = useNavigate();
return(
    <li className="max-li">
        <button
            onClick={() => navigate(a)}
            className={classNameBtn}
            style={{ position: "relative" }}
        >
            {unreadCount > 0 && (
                <span className="chat-aside-badge">
                {unreadCount}
                </span>
            )}
            {unreadSpam > 0 && (
                <span className="chat-aside-badge">
                {unreadSpam}
                </span>
            )}
            <div>
                {icon} 
            </div>
            <div>
                {label}
            </div>
        </button>
    </li>
)};

export default React.memo(Aside);