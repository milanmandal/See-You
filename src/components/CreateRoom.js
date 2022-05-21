import React,{useState,useRef} from "react";
import io from "socket.io-client";
import './createRoom.css';
import { v1 as uuid } from "uuid";
import land from '../images/landing1.jpg';


const CreateRoom = (props) => {
    const [roomID, setRoomID] = useState('');
    const socketRef = useRef();

    const create =() =>{
        const id = uuid();
        props.history.push(`/room/${id}`);
    }

    const Joinroom = async()=>{  
        console.log("here");
        // socketRef.current = await io.connect("https://see-you-webrtc.herokuapp.com/"); //connection to server at heroku;
        socketRef.current = io.connect("/"); //connection to server at port 8000;
        socketRef.current.emit("join", roomID)
        socketRef.current.on("room full", flag => {
            if(flag)
            {
                window.alert("Room is full");
                window.location.href = "/";
            }
        });
        console.log(roomID);
        props.history.push(`/room/${roomID}`);
    }

    return (
        <div className="container ">
            <div className="landing">
                <div className="left">
                    <div className="left-wrapper">
                        <img alt="#" src={land}></img>
                        <h4>Group video chatting app made using ReactJS, NodeJS, Socket IO and Web-RTC <i className="fa-solid fa-video"></i> </h4>
                    </div>
                </div>
                <div className="right">
                    <div className="right-wrapper">
                        <p className="title">See You <img alt="#" className="icon" src="https://img.icons8.com/external-wanicon-flat-wanicon/64/000000/external-video-call-online-course-wanicon-flat-wanicon.png"/></p>
                        
                        <form className="input">
                            <input value = {roomID} type= "text" onChange={(e)=>{setRoomID(e.target.value);console.log(roomID)}} className="form-control" placeholder="Room ID" aria-label="First name"/>
                            <button onClick={Joinroom} className="btn btn-success">Join Room</button>
                        </form>

                        <h3>or</h3>
                        
                        <div className="input">    
                            <button onClick={create} type="button" className="btn btn-primary">Create Room</button>
                        </div>
                    </div>
                    <h4>Check out other projects <a href="https://github.com/milanmandal"><i className="fa-brands fa-github"></i></a></h4>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;

/* <div>
        <input type="text"/>
        <button onClick={create}>Create room</button>
        <input value = {roomID} type= "text" onChange={(e)=>{setRoomID(e.target.value)}}/>
        <button onClick={Joinroom}>Join room</button>
    </div> */