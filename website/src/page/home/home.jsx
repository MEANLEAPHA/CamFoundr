import "../../modules/upload/postPreview.css";
import "./home.css";
import { faRocket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Bookmark, ChevronDown, ChevronRight, Heart, MessageCircle, MoreHorizontal } from "lucide-react";

const mockPosts = [
  {
    id: 1,
    username: "Maya Chen",
    avatar_url: "https://i.pravatar.cc/96?img=47",
    created_at: "12 min ago",
    post_type: "update",
    data: {
      type: "Milestone",
      text_body: "We crossed 1,000 customers today. Our first 100 came from simply asking people what they needed. Keep showing up and listening.",
      image_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    },
    likes_count: 248,
    comments_count: 36,
    is_liked: true,
    is_favorited: false,
  },
  {
    id: 2,
    username: "Jordan Ellis",
    avatar_url: "https://i.pravatar.cc/96?img=12",
    created_at: "38 min ago",
    post_type: "question",
    data: {
      type: "Founder question",
      text_body: "Founders who bootstrapped your first product: how did you find your first 10 beta testers? Looking for scrappy, repeatable ideas.",
    },
    likes_count: 84,
    comments_count: 19,
    answers_count: 12,
    is_liked: false,
    is_favorited: true,
  },
  {
    id: 3,
    username: "Amara Okafor",
    avatar_url: "https://i.pravatar.cc/96?img=44",
    created_at: "1 hr ago",
    post_type: "update",
    data: {
      type: "Behind the scenes",
      text_body: "The best ideas from today's planning session came after we put the laptops away and started sketching together.",
      image_url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
    },
    likes_count: 173,
    comments_count: 22,
    is_liked: false,
    is_favorited: false,
  },
  {
    id: 4,
    username: "Leo Martinez",
    avatar_url: "https://i.pravatar.cc/96?img=11",
    created_at: "2 hrs ago",
    post_type: "update",
    data: {
      type: "Founder note",
      text_body: "A reminder I needed today: your first version is allowed to be small. Solve one real problem for one real person, then build from there.",
    },
    likes_count: 312,
    comments_count: 41,
    is_liked: true,
    is_favorited: false,
  },
  {
    id: 5,
    username: "Priya Shah",
    avatar_url: "https://i.pravatar.cc/96?img=32",
    created_at: "3 hrs ago",
    post_type: "question",
    data: {
      type: "Seeking feedback",
      text_body: "We're testing a new way to help neighborhood shops reward regulars. What makes you choose a local shop over a big chain?",
      image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80",
    },
    likes_count: 96,
    comments_count: 28,
    answers_count: 7,
    is_liked: false,
    is_favorited: false,
  },
  {
    id: 6,
    username: "Noah Williams",
    avatar_url: "https://i.pravatar.cc/96?img=60",
    created_at: "5 hrs ago",
    post_type: "update",
    data: {
      type: "Community meetup",
      text_body: "We're meeting other climate-tech founders in Austin next Thursday. No pitches, just good conversation and a few tacos. Who's in?",
    },
    likes_count: 127,
    comments_count: 17,
    is_liked: true,
    is_favorited: true,
  },
];

export default function Home() {
   return (
      <>

         <div className='container-h1 conatiner-h'>
            <div className='main'></div>
            <div className='div-animation'> 
               <div className="orbit">
                     <div className="rocket">
                        <div className="window"></div>
                     </div>
               </div>
            </div> 
            <div id='welcoming-h'>
               <h2 id='camfoundr-title' style={{margin: 0, marginBottom: '15px'}}>
                  Camfoundr
               </h2>
               <p id='hook'>Dreamers become builders and builders become founders.<br />A startup ecosystem with a dedicated space for early-stage founders</p>
               <br />
               <div id='hook-btn'>
                  <button id='btn-explore'>Explore </button>
                  <button id='btn-c-startup'>Create Startup <FontAwesomeIcon icon={faRocket} style={{color:'red'}}/></button>
               </div>
               {/* <p id='hook-quote'> We believe early-stage founders are the backbone of our future. But while they’re busy solving society’s biggest problems, who’s solving the problems founders face! finding the right people,
                  building networks, and finding the right opportunities? That’s where we come in.- CamFoundr's team</p> */}
            </div>
            <ChevronDown id='scroll-down-icon'/>
            <div className='conatiner-a'>
               <div className="astronaut">
               <div className="tank center"></div>
               <div className="suit center">
                  <div className="helmet center"></div>
                  <div className="buttons center"></div>
                  <div className="hand-l"></div>
                  <div className="hand-r"></div>
                  <div className="leg-l"></div>
                  <div className="leg-r"></div>
                  <div className="pipe"></div>
               </div>
               </div>
            </div>
         </div>

         {/* blog & article */}
         <div className='container-h2 conatiner-h'>
            <h2 className='title-h'>One blog per a day will keep you moving</h2>
            <p className='p-h'>A moving person will one day meet his luck, the road favours a traveller</p>
            <div id='blog-container'>
               <div className='blog-con-child'>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
               </div>
               
               <div className='blog-con-child'>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
                  <button className='btn-read-more'>Read all our blogs <ChevronRight /></button>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
               </div>

               <div className='blog-con-child'>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
               </div>
            </div>
            
         </div>
         
         {/* people */}
         <div className='container-h3 conatiner-h'>
            <div className='con3-child'>
               <div className='foundr-con'>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2018/02/Foundr_Cover_Branson_Print_Final.jpg" className='foundr-poster'/>
                  </div>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2017/05/Foundr-50th-issue-Cover-Design-copy_001.jpg" className='foundr-poster'/>
                  </div>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2020/05/Issue56CoverPNG768_min1.jpg.webp" className='foundr-poster'/>
                  </div>
               </div>  
               <div className='foundr-con'>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2018/02/Foundr_Cover_Branson_Print_Final.jpg" className='foundr-poster'/>
                  </div>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2017/05/Foundr-50th-issue-Cover-Design-copy_001.jpg" className='foundr-poster'/>
                  </div>
               </div> 
             
            </div>
            <div className='con3-child con3-middle'>
               
               <p id='con3-title'>Entrenpreneur, Founder, Dreamer, Builder, Maker & Innovator stay in the same room with you.</p>
               <button className='btn-more-ins'>More inspiration <ChevronRight /></button>
            </div>
            <div className='con3-child'>
             
               <div className='foundr-con'>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2018/02/Foundr_Cover_Branson_Print_Final.jpg" className='foundr-poster'/>
                  </div>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2017/05/Foundr-50th-issue-Cover-Design-copy_001.jpg" className='foundr-poster'/>
                  </div>
               </div> 
               <div className='foundr-con'>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2018/02/Foundr_Cover_Branson_Print_Final.jpg" className='foundr-poster'/>
                  </div>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2017/05/Foundr-50th-issue-Cover-Design-copy_001.jpg" className='foundr-poster'/>
                  </div>
                  <div className='founder-div'>
                     <img src="https://foundr.com/wp-content/uploads/2020/05/Issue56CoverPNG768_min1.jpg.webp" className='foundr-poster'/>
                  </div>
               </div>   
            </div>
         </div>   
                  
         {/* feed */}
         {/* <div className='container-h4 conatiner-h'>
            <h2 className='title-h'>Stay connected with community</h2>
            <p className='p-h'>See what people are sharing on Camfoundr's feed</p>
            <div className='feed-x-scroll '>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
                  <div className='blog-div'>
                     <div className='blog-thumbnail-holder'>
                        <img className='blog-thumbnail' src="https://miro.medium.com/1*ZHNvdhLw94zbDByBRtPBeQ.jpeg"/>
                     </div>
                     <div className='blog-title-holder'>
                        <p className='blog-des'>13 free resources to help run an automaition e-commerce business online.</p>
                     </div>
                  </div>
            </div>
         </div> */}
      </>
    
   )
};







