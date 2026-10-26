import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
        VerticalLeftOutlined,
        VerticalRightOutlined,
        } from '@ant-design/icons';
        
import { Newspaper,
         LandPlot,
         Home,
         PersonStanding,
         Handshake,
         ScrollText,
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
         Sprout,
         Sparkles,
         Lightbulb,
         CalendarDays
        } from 'lucide-react';

import { useAuth } from "../context/authContext";
import "../assets/style/aside.css";
import api from "../api/axiosInstance";

const Aside = (props) => {

    const { token, user } = useAuth();
    const [spamUnreadCount, setSpamUnreadCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    const fetchUnReadSpam = async () => {
        try{
            const res = await api.get(
                `/api/spam/unread-count`
            );
            setSpamUnreadCount( res.data.unread || 0 );
        }catch(err){
            console.log(err);
        }
    }
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
    }, [token, user?.id]);

        
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
    const [showMaxAside, setMaxAside] = useState( () =>
         {
            return localStorage.getItem("maxAside") === "true";
        })
        
        useEffect( ()=>
            {
                localStorage.setItem("maxAside", showMaxAside)
            },
            [showMaxAside]
        );
        
        const toggleAside = () =>{
                setMaxAside(prev => !prev)
        }

        const MaxAsideUl = () => {
            return(
                <ul className="max-ul">
                    <AppendMain
                        chatUnreadCount = { chatUnreadCount }
                        chatUnreadSpam = { spamUnreadCount }
                    />
                    <AppendSocial />
                    <AppendChallenge />
                    <AppendUserTool />
                    {/* <AppendExplore /> */}
                    <AppendMore />
                    <AppendRule />
                </ul>
            )
        }

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
                <button className="btn-col" onClick={toggleAside}>{showMaxAside ? <VerticalRightOutlined style={{color:"grey", fontSize:"large"}}/> : <VerticalLeftOutlined style={{color:"grey", fontSize:"large"}}/>} </button>
            </aside>
        );
    };

    const MinInfo = [
        {
            id:0, a: '/arena', icon: <LandPlot className='sub-icon'/>, label: 'Arena'
        },
        {
            id:1, a: '/feed', icon: <Rss className='sub-icon' />, label: 'Forum'
        }, 
        {
            id:2, a: '/blog', icon: <Newspaper className='sub-icon'/>, label: 'Blog'
        }, 
        {
            id:3, a: '/ping', icon: <CircleDotDashed className='sub-icon'/>, label: 'Ping'
        },
        {
            id:4, a: '/brainstorm', icon: <Lightbulb className='sub-icon'/>, label: 'Brainstorm'
        },
        {
            id:5, a: '/account', icon: <User className='sub-icon'/>, label:'You'
        },
        {
            id:6, a: '/explore', icon: <Shapes className='sub-icon'/>, label: 'Explore'
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
    )
    };

    const Mains= [
        { id:1, a: '/home', icon: <Home className='icon-aside'/>, label: <label>Home</label> },
        { id:3, a: '/blog',  icon: <Newspaper className='icon-aside'/>, label: <label>Blog</label> },
        { id:4, a: '/ping', icon: <Sparkles className='icon-aside'/>, label: <label>Collabration</label> },
        
    ];

    const Social = [
        { id:2, a: '/feed', icon: <Rss className='icon-aside'/>, label: <label>Forum</label>,  },
        { id:11, a: '/teams',  icon: <Users className='icon-aside'/>, label: <label>The People</label> },
        { id:15, a: '/halloffame',  icon: <Flame className='icon-aside'/>, label: <label>Hall of Fame</label>, classNameBtn: "btn-hall-of-fame" },
        { id:4, a: '/ping', icon: <Sparkles className='icon-aside'/>, label: <label>Spark</label> },
        
    ];

    const Challenges = [
        { id:6, a: '/event', icon: <CalendarDays className='icon-aside'/>, label: <label>Event</label> },
        { id:1, a: '/arena', icon: <LandPlot className='icon-aside'/>, label: <label>Arena</label> },
        { id:5, a: '/brainstorm',  icon: <Lightbulb className='icon-aside'/>, label: <label>Brainstorm</label> },
    ];

    const AppendChallenge = () => {
        return ( <>
            <label className='label-li' style={{cursor: 'pointer'}} onClick={() => navigate('account')}>Interactive <ChevronRight className='label-icon-aside'/></label>
            {
                  Challenges.map(item => (
        
                <Main
                key={item.id}
                {...item}
              

                />
            ))
            }
        </>
        )
    }
     const AppendSocial = () => {
        return ( <>
            <label className='label-li' style={{cursor: 'pointer'}} onClick={() => navigate('account')}>Community <ChevronRight className='label-icon-aside'/></label>
            {
                  Social.map(item => (
        
                <Main
                key={item.id}
                {...item}
              

                />
            ))
            }
        </>
        )
    }

    const AppendMain = ({ chatUnreadCount, chatUnreadSpam }) => {
    return Mains.map(item => (
        
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

    const UserTools= [
        { id:6, a: '/history',  icon: <TimerReset className='icon-aside'/>, label: <label>History</label> },
        { id:7, a: '/favorite',  icon: <Bookmark className='icon-aside icon-awesome'/>, label: <label>Favorite</label> },
        { id:8, a: '/like',  icon: <ThumbsUp className='icon-aside'/>, label: <label>Like Feed</label> },
        { id:9, a: '/ownfeed',  icon: <SquareText className='icon-aside icon-awesome'/>, label: <label>Your Feed</label> },
        { id:10, a: '/connections',  icon: <UserRoundPlus className='icon-aside' />, label: <label>Connections</label> },
    ];

    const AppendUserTool = () =>{
        const navigate = useNavigate()
        return(
            <>
                <label className='label-li' style={{cursor: 'pointer'}} onClick={() => navigate('account')}>You <ChevronRight className='label-icon-aside'/></label>
                {UserTools.map(item => (
                    <UserTool key={item.id} {...item} />
                ))}
            </>
        )
    };

    const UserTool = ({a, icon, label, classNameIcon})=> {
        return <Card a={a} icon={icon} label={label} classNameIcon={classNameIcon} />
    };

    const Explores = [
        { id:11, a: '/teams',  icon: <Users className='icon-aside'/>, label: <label>The People</label> },
        { id:15, a: '/halloffame',  icon: <Flame className='icon-aside'/>, label: <label>Hall of Fame</label>, classNameBtn: "btn-hall-of-fame" },
        { id:12, a: '/startups',  icon: <Sprout className='icon-aside'/>, label: <label>Startups</label> },
        { id:13, a: '/founders',  icon: <Sparkles  className='icon-aside'/>, label: <label>Founders</label> },
    ];

    const AppendExplore = () =>{
        const navigate = useNavigate();
        return(
            <>
                <label className='label-li' style={{cursor: 'pointer'}} onClick={() => navigate('explore')}> Explore <ChevronRight className='label-icon-aside'/></label>
                {Explores.map(item => (
                    <Explore key={item.id} {...item} />
                ))}
            </>
        )
    };
    const Explore = ({a, icon, label, classNameBtn})=> {
        return <Card a={a} icon={icon} label={label} classNameBtn={classNameBtn}/>
    };

    const Mores= [
        { id:17, a: '/feedback',  icon: <MessageSquareText className='icon-aside'/>, label: <label>Feedback </label>},
        { id:18, a: '/reporthistory',  icon: <Flag className='icon-aside'/>, label: <label>Report History</label> }
    ];

    const AppendMore = () =>{
        return(
            <>
                <hr className="aside-hr"/>
                {Mores.map(item => (
                    <More key={item.id} {...item} />
                ))}
            </>
        )
    };

    const More = ({a, icon, label, classNameIcon})=> {
        return <Card a={a} icon={icon} label={label} classNameIcon={classNameIcon} />
    };

    const Rules= [
        { id:19, a: '/camfoundrrule', icon: <Scale className='icon-aside'/>, label: <label>CDL Rule</label> },
        { id:20, a: '/privacypolicy',  icon: <ScrollText className='icon-aside'/>, label: <label>Private Policy</label> },
        { id:21, a: '/agreement',  icon: <Handshake className='icon-aside'/>, label: <label>User Agreement</label> },
        { id:22, a: '/accessibility',  icon: <PersonStanding className='icon-aside'/>, label: <label>Accessibility</label> },
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

export default React.memo(Aside);