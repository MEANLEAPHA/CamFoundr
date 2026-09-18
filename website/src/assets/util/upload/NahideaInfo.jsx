import { useNavigate } from "react-router-dom";
export default function NahideaInfor(){
    const navigate = useNavigate();
    return(
        <div id="form-footer-2">
          <p onClick={()=>{navigate('/nahidearule')}} style={{cursor:"pointer"}}>Nahidea Rule</p>
          <p onClick={()=>{navigate('/privacypolicy')}} style={{cursor:"pointer"}}>Private Policy</p>
          <p onClick={()=>{navigate('/useragreement')}} style={{cursor:"pointer"}}>User Agreement</p>
          <p onClick={()=>{navigate('/accessibility')}} style={{cursor:"pointer"}}>Accessibility</p>
          <p onClick={()=>{navigate('/home')}} style={{cursor:"none"}}>Nahidea. © 2026. All rights reserved </p>
        </div> 
    )
}