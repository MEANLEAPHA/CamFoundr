import { useNavigate } from "react-router-dom";
export default function NahideaInfor(){
    const navigate = useNavigate();
    return(
        <div id="form-footer-2">
          <p onClick={()=>{navigate('/nahidearule')}} style={{cursor:"pointer"}}>CDL Rule</p>
          <p style={{opacity:0.3}}> - </p>
          <p onClick={()=>{navigate('/privacypolicy')}} style={{cursor:"pointer"}}>Private Policy</p>
          <p style={{opacity:0.3}}> - </p>
          <p onClick={()=>{navigate('/useragreement')}} style={{cursor:"pointer"}}>User Agreement</p>
          <p style={{opacity:0.3}}> - </p>
          <p onClick={()=>{navigate('/accessibility')}} style={{cursor:"pointer"}}>Accessibility</p>
          <p style={{opacity:0.3}}> - </p>
          <p onClick={()=>{navigate('/home')}} style={{cursor:"none"}}>CDL. © 2026. All rights reserved </p>
        </div> 
    )
}