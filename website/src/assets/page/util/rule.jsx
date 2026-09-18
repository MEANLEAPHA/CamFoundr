import React from "react";
import { useNavigate } from "react-router-dom";
const Rule = () => {
    const navigate = useNavigate();
    return (
        <div className='rule-absolute'>   
            <p onClick={()=>{navigate('/nahidearule')}}>Nahidea Rule</p>     
            <p onClick={()=>{navigate('/privacypolicy')}}>Private Policy</p>
            <p onClick={()=>{navigate('/useragreement')}}>User Agreement</p>
            <p onClick={()=>{navigate('/accessibility')}}>Accessibility</p>
            <div>
                <p>Nahidea. © 2026. All rights reserved. v0.9.0-beta</p> 
            </div>
        </div>
    );
};
export default Rule;